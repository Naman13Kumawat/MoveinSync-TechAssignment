const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// proccure googleSheet method
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

//posts data to cell
app.post("/postSheetData", async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);
  const { number, fname } = req.body;
  await googleSheet.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[number, fname]],
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

app.listen(PORT, (req, res) => {
  console.log("Server running on port " + PORT);
});
