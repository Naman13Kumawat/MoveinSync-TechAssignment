const express = require("express");
const { google } = require("googleapis");
const axios = require("axios");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
app.use(cors());

const Buffer = require("buffer/").Buffer;

const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//require CashfreeSDK
const cfSdk = require("cashfree-sdk");
const spreadsheetId = process.env.SPREADSHEET_ID;

// function getAuth() {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: "secrets.json",

//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });
//   return auth;
// }

function newGetAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  return auth;
}

async function getGoogleSheet(auth) {
  const client = await auth.getClient();
  const googleSheet = google.sheets({ version: "v4", auth: client });
  return googleSheet;
}

const arrToObj = async (rows) => {
  const auth = newGetAuth();
  const googleSheet = await getGoogleSheet(auth);

  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!1:1",
  });
  const [headers] = getSheetData.data.values;
  const data = rows.map((row, idx) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    obj.id = idx + 1;
    return obj;
  });

  return data;
};

app.get("/getSheetData", async (req, res) => {
  const sheetNumber = req.query.sheetNo || "1";
  const num = req.query.num;
  const range = `Sheet${sheetNumber}`;
  const auth = newGetAuth();
  const googleSheet = await getGoogleSheet(auth);

  // const getMetaData = await googleSheet.spreadsheets.get({
  //   auth,
  //   spreadsheetId,
  // });
  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  const rows = getSheetData.data.values;
  rows.shift();
  const data = await arrToObj(rows);

  if (num) {
    const filteredArr = data.filter((entry) => {
      return entry.Number === num;
    });
    if (filteredArr.length) {
      res.status(200).json({
        success: true,
        data: filteredArr,
      });
    } else {
      res.json({
        error: 404,
        errorMessage: "User not registered!",
      });
    }
  } else {
    res.status(200).json({
      success: true,
      data,
    });
  }
});

// Get sheet row with row id
app.get("/getSheetData/row/:id", async (req, res) => {
  const id = Number(req.params.id);
  const auth = newGetAuth();
  const googleSheet = await getGoogleSheet(auth);

  const getMetaData = await googleSheet.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `Sheet1!${id + 1}:${id + 1}`,
  });

  const row = getSheetData.data.values;
  if (!row) {
    res.status(404).json({
      errorStatus: 404,
      error: `No data found with id: ${id}`,
    });
  } else {
    const [data] = await arrToObj(row);
    data.id = id;
    res.status(200).json(data);
  }
});

// Get sheet data with number
app.get("/getSheetData/:number", async (req, res) => {
  const num = req.params.number;
  const auth = newGetAuth();
  const googleSheet = await getGoogleSheet(auth);

  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    //   range: 'Sheet1!A2:B',
    range: "Sheet1",
  });

  // For changing array of array to array of objects
  const rows = getSheetData.data.values;
  rows.shift();
  const data = await arrToObj(rows);
  const filteredArr = data.filter((entry) => {
    return entry.Number === num;
  });

  res.status(200).json(filteredArr);
});

//posts data to cell
app.post("/postSheetData", async (req, res) => {
  const auth = newGetAuth();
  const googleSheet = await getGoogleSheet(auth);
  const {
    Approval,
    Links,
    Name,
    Number,
    PayoutLink,
    UploadDateTime,
    UploadMonth,
  } = req.body;

  const StringLinks = Links?.toString();
  await googleSheet.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [
        [
          Number,
          Name,
          UploadMonth,
          UploadDateTime,
          StringLinks,
          Approval,
          PayoutLink,
        ],
      ],
    },
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully Submitted",
  });
});

// // deletes cell data
// app.post("/deleteSheetData", async (req, res) => {
//   const auth = getAuth();
//   const googleSheet = await getGoogleSheet(auth);
//   await googleSheet.spreadsheets.values.clear({
//     auth,
//     spreadsheetId,
//     range: "Sheet1!A5:B5",
//   });

//   res.send("Deleted Successfully");
// });

// update cell data
app.post("/updateSheetData", async (req, res) => {
  const auth = newGetAuth();
  const googleSheet = await getGoogleSheet(auth);

  const { action, id, toUpdate, link } = req.body;
  console.log(action, id, toUpdate);
  let col = "";
  let val;
  let payoutLink;
  if (toUpdate == "AppNPay") {
    col = "F";
    if (action === "Approved") {
      payoutLink = link;
    } else {
      payoutLink = "Not approved";
    }
    val = [action, payoutLink];
  } else if (toUpdate === "pay") {
    col = "G";
    payoutLink = "Claimed";
    val = [payoutLink];
  }

  await googleSheet.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: `Sheet1!${col}${Number(id) + 1}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [val],
    },
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully Updated",
  });
});

// AWS S3 Services
app.post("/upload", (req, res) => {
  const { image, fileName } = req.body;
  const base64String = image.replace(/^data:image\/\w+;base64,/, "");
  const buff = new Buffer(base64String, "base64");
  // Set the S3 key and parameters
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buff,
    "Content-Type": "image/jpeg",
    ACL: "public-read",
  };

  // Upload the file to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error uploading file");
    }
    console.log(`File uploaded successfully. ${data.Location}`);
    res.status(200).send(data);
  });
});

app.post("/createcashgram", async (req, res) => {
  const { userName, contact, approvalDate } = req.body;
  const currentUnixTimestamp = Math.floor(Date.now() / 1000).toString();
  const cgId = `${userName.toLowerCase()}-${contact.slice(
    8
  )}-${currentUnixTimestamp}`;
  const inDateApprovalDate = new Date(approvalDate);
  // Here link will be expired after 3 days
  const expDate = new Date(
    inDateApprovalDate.setDate(inDateApprovalDate.getDate() + 4)
  );
  const { Payouts } = cfSdk;
  const { Cashgram } = Payouts;
  const config = {
    Payouts: {
      ClientID: process.env.CASHFREE_CLIENT_ID,
      ClientSecret: process.env.CASHFREE_CLIENT_SECRET,
      ENV: "TEST",
    },
  };

  const yyyy = expDate.getFullYear();
  const mm = expDate.getMonth() + 1;
  const dd = expDate.getDate();
  const expYYYYMMDD = `${yyyy}/${mm < 10 ? "0" + mm : mm}/${dd}`;
  console.log(expYYYYMMDD);

  const cashgram = {
    cashgramId: cgId,
    amount: process.env.CASHFREE_CASHGRAM_AMT,
    name: userName,
    phone: contact.slice(2),
    linkExpiry: expYYYYMMDD,
    remarks: `payout`,
    notifyCustomer: 1,
  };
  //   init
  Payouts.Init(config.Payouts);

  const handleResponse = (response) => {
    if (response.status === "ERROR") {
      throw { name: "handle response error", message: "error returned" };
    }
  };
  //create cashgram

  try {
    const response = await Cashgram.CreateCashgram(cashgram);
    console.log("create cashgram response");
    res.status(200).send(response);
    console.log(response);
    handleResponse(response);
  } catch (err) {
    console.log("Err caught in creating cashgram:");
    console.log(err);
    return;
  }
});

app.listen(PORT, (req, res) => {
  console.log("Server running on port " + PORT);
});
