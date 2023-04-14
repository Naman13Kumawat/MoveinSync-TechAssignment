import { useAuth0 } from "@auth0/auth0-react";
import Login from "./Login";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { UserContext } from "../context/User";
import { toast, ToastContainer } from "react-toastify";
import { CircularProgress } from "@mui/material";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import styled from "@emotion/styled";

export default function Profile() {
  const { isLoading, isAuthenticated } = useAuth0();
  const { user, setUser } = useContext(UserContext);
  const [notUploaded, setNotUploaded] = useState(true);
  const [sheetData, setSD] = useState([]);
  console.log("Context", user);
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const d = new Date();
  let mntName = month[d.getMonth()];

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("currUser"));
    if (items) {
      setUser(items);
    }
  }, []);

  useEffect(() => {
    if (!!user.Number) {
      (async () => {
        const config = {
          method: "get",
          url: `http://localhost:4000/getSheetData/${user.Number}`,
        };
        try {
          const res = await axios.get(config.url);
          setSD(res.data.reverse());
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [user]);

  console.log("Filtered data", sheetData);

  useEffect(() => {
    sheetData?.forEach((entry) => {
      const uploadYear = entry.UploadDateTime.split(" ")[3];
      if (
        entry.UploadMonth === mntName &&
        uploadYear === d.getFullYear().toString()
      ) {
        console.log("Already Uploaded");
        setNotUploaded(false);
      }
    });
  }, [sheetData]);
  if (isLoading) {
    return (
      <div className="step2_loading">
        <CircularProgress color="success" />
      </div>
    );
  }

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: "#171717",
      color: "#FFF",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: "#e8e8e8",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  return isAuthenticated ? (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {user.Name}</p>
      {/* <Logout /> */}
      {notUploaded ? (
        <p>
          Upload photos for {mntName} &nbsp;
          <Link to="/upload">
            <Button variant="contained">Upload</Button>
          </Link>
        </p>
      ) : (
        <p>Photos uploaded for {mntName}</p>
      )}
      <div>
        <h3>Payroll History</h3>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Number</StyledTableCell>
                <StyledTableCell align="right">Name</StyledTableCell>
                <StyledTableCell align="right">Upload Month</StyledTableCell>
                <StyledTableCell align="right">
                  Upload Date & Time
                </StyledTableCell>
                <StyledTableCell align="right">Links</StyledTableCell>
                <StyledTableCell align="right">Approval</StyledTableCell>
                <StyledTableCell align="right">Payout Link</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading && sheetData ? (
                sheetData.length === 0 ? (
                  <tr>
                    <td>No data available</td>
                  </tr>
                ) : (
                  sheetData.map((element, index) => {
                    return (
                      <StyledTableRow
                        key={element.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTableCell component="th" scope="element">
                          {element.Number}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {element.Name}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {element.UploadMonth}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {element.UploadDateTime}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {element.Links.split(",").map((link, index) => {
                            return (
                              <p key={index}>
                                <a href={link}>{`Photo ${index + 1} link`}</a>
                              </p>
                            );
                          })}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {element.Approval}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {element.Approval === "Approved" &&
                          element.PayoutLink !== "Claimed" ? (
                            <Link to={element.PayoutLink}>Payout Link</Link>
                          ) : (
                            <p>{element.PayoutLink}</p>
                          )}
                          {element.PayoutLink === "Not approved" &&
                          element.UploadMonth === mntName &&
                          index === 0 ? (
                            <Link to="/upload">
                              <Button variant="contained">Upload Again</Button>
                            </Link>
                          ) : null}
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })
                )
              ) : (
                <p>Loading...</p>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* {!isLoading && sheetData ? (
          sheetData.map((element) => {
            return (
              <div key={element.id}>
                <p>{element.id}</p>
                <p>{element.Number}</p>
                <p>{element.Name}</p>
                <p>{element.Approval}</p>
                <p>{element.UploadMonth}</p>
                <p>{element.UploadDateTime}</p>
                {element.Links.split(",").map((link, index) => {
                  return (
                    <p key={index}>
                      <a href={link}>{`Photo ${index + 1} link`}</a>
                    </p>
                  );
                })}
                {element.Approval === "Approved" &&
                element.PayoutLink !== "Claimed" ? (
                  <Link to={element.PayoutLink}>Payout Link</Link>
                ) : (
                  <p>{element.PayoutLink}</p>
                )}
                {element.PayoutLink === "Not approved" &&
                element.UploadMonth === mntName &&
                element.id === maxId ? (
                  <Link to="/upload">
                    <Button variant="contained">Upload Again</Button>
                  </Link>
                ) : null}
                <hr />
              </div>
            );
          })
        ) : (
          <p>Loading...</p>
        )} */}
      </div>
    </div>
  ) : (
    <div>
      <p>Please login first</p>
      <Login />
    </div>
  );
}
