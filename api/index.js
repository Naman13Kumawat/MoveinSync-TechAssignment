const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");

app.use(cors()); // Use this after the variable declaration

// Middleware
// app.use("/api/spreadsheet", sheetRoute);
// app.use((err, req, res, next) => {
//     const errorStatus = err.status || 500;
//     const errorMessage = err.message || "something went wrong";
//     return res.status(errorStatus). ({
//       success: false,
//       status: errorStatus,
//       message: errorMessage,
//       stack: err.stack,
//     });
//   })
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api", async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.REACT_APP_GOOGLE_APP_CREADENTIALS,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  //   Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheet API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.REACT_APP_SPREADSHEET_ID;
  //   const metaData = await googleSheets.spreadsheets.get({
  //     auth,
  //     spreadsheetId,
  //   });

  //   Read Rows from Spreadsheets
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A:B",
  });

  //   // Write row(s) to spreadsheet
  //   await googleSheets.spreadsheets.values.append({
  //     auth,
  //     spreadsheetId,
  //     range: "Sheet1!A:B",
  //     valueInputOption: "USER_ENTERED",
  //     resource: {
  //       values: [["Hardik", 10]],
  //     },
  //   });
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(getRows.data);
});

app.post("/api", async (req, res) => {
  console.log(req.body);
  const { fname, number } = req.body;
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.REACT_APP_GOOGLE_APP_CREADENTIALS,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  //   Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheet API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.REACT_APP_SPREADSHEET_ID;

  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1!A:B",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[fname, number]],
    },
  });
  res.send(`Row Added with name: ${fname} and number: ${number}`);
});

app.listen(PORT, (req, res) => {
  console.log("Server running on port " + PORT);
});
