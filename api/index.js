const express = require("express");
const { google } = require("googleapis");
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

// app.get("/api", async (req, res) => {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: process.env.REACT_APP_GOOGLE_APP_CREADENTIALS,
//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });

//   //   Create client instance for auth
//   const client = await auth.getClient();

//   // Instance of Google Sheet API
//   const googleSheets = google.sheets({ version: "v4", auth: client });

//   const spreadsheetId = process.env.REACT_APP_SPREADSHEET_ID;
//   //   const metaData = await googleSheets.spreadsheets.get({
//   //     auth,
//   //     spreadsheetId,
//   //   });

//   //   Read Rows from Spreadsheets
//   const getRows = await googleSheets.spreadsheets.values.get({
//     auth,
//     spreadsheetId,
//     range: "Sheet1!A2:E",
//   });
//   res.send(getRows.data);
// });

// app.post("/api", async (req, res) => {
//   const { fname, number } = req.body;
//   const auth = new google.auth.GoogleAuth({
//     keyFile: process.env.REACT_APP_GOOGLE_APP_CREADENTIALS,
//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });

//   //   Create client instance for auth
//   const client = await auth.getClient();

//   // Instance of Google Sheet API
//   const googleSheets = google.sheets({ version: "v4", auth: client });

//   const spreadsheetId = process.env.REACT_APP_SPREADSHEET_ID;

//   // Write row(s) to spreadsheet
//   await googleSheets.spreadsheets.values.append({
//     auth,
//     spreadsheetId,
//     range: "Sheet1!A:B",
//     valueInputOption: "USER_ENTERED",
//     resource: {
//       values: [[number, fname]],
//     },
//   });
//   res.send(`Row Added with name: ${fname} and number: ${number}`);
// });

// crud for google sheets

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
    //   range: 'Sheet1!A2:B',
    range: "Sheet1",
  });

  const rows = getSheetData.data.values;
  const headers = rows.shift();
  const data = rows.map((row, idx) => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header === "active") {
        obj[header] = row[index] === "TRUE";
      } else {
        obj[header] = row[index];
      }
    });
    obj.id = idx + 1;
    return obj;
  });

  //   console.log(data);
  res.status(200).json({
    success: true,
    metaData: getMetaData,
    // data: getSheetData.data.values,
    data,
  });
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
  const headers = rows.shift();
  const data = rows.map((row, idx) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    obj.id = idx + 1;
    return obj;
  });

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

  const { number, fname, id } = req.body;

  await googleSheet.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: `Sheet1!A${id + 1}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[number, fname]],
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

app.listen(PORT, (req, res) => {
  console.log("Server running on port " + PORT);
});
