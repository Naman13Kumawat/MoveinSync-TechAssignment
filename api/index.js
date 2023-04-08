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
const e = require("express");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const spreadsheetId = process.env.REACT_APP_SPREADSHEET_ID;

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "secrets.json",
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
  const auth = getAuth();
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
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  const getMetaData = await googleSheet.spreadsheets.get({
    auth,
    spreadsheetId,
  });
  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1",
  });

  const rows = getSheetData.data.values;
  rows.shift();
  // const headers = rows.shift();
  // const data = rows.map((row, idx) => {
  //   const obj = {};
  //   headers.forEach((header, index) => {
  //     obj[header] = row[index];
  //   });
  //   obj.id = idx + 1;
  //   return obj;
  // });

  const data = await arrToObj(rows);

  //   console.log(data);
  res.status(200).json({
    success: true,
    metaData: getMetaData,
    data,
  });
});

// Get sheet row with row id
app.get("/getSheetData/row/:id", async (req, res) => {
  const id = Number(req.params.id);
  const auth = getAuth();
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
  const auth = getAuth();
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
  const auth = getAuth();
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

// deletes cell data
app.post("/deleteSheetData", async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);
  await googleSheet.spreadsheets.values.clear({
    auth,
    spreadsheetId,
    range: "Sheet1!A5:B5",
  });

  res.send("Deleted Successfully");
});

// update cell data
app.post("/updateSheetData", async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  const { action, id, toUpdate } = req.body;
  console.log(action, id, toUpdate);
  let col = "";
  let val;
  let payoutLink;
  if (toUpdate == "AppNPay") {
    col = "F";
    if (action === "Approved") {
      payoutLink = `/payout/${id}`;
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

// Razorpay APIs
// RazorpayX Composite Payout
app.post("/payout", async (req, res) => {
  const fund_account = req.body;
  const mode = "NEFT";
  // console.log(req.body);

  const data = {
    account_number: process.env.REACT_APP_RAZORPAY_TEST_ACC_NO,
    amount: Number(process.env.REACT_APP_RAZORPAY_AMOUNT),
    currency: "INR",
    mode,
    purpose: "payout",
    fund_account,
    queue_if_low_balance: true,
    //   narration: `Payout for ${forMonth}, ${forYear} of ${fund_account.contact.contact}`,
  };

  const url = "https://api.razorpay.com/v1/payouts";
  const config = {
    headers: {
      Authorization: `Basic ${process.env.REACT_APP_RAZORPAY_ENCODED}`,
      // "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(url, data, config);
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, (req, res) => {
  console.log("Server running on port " + PORT);
});
