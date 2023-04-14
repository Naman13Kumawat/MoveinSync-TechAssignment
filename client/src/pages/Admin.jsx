import styled from "@emotion/styled";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  tableCellClasses,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

export default function Admin() {
  const [alignment, setAlignment] = useState("all");
  const [sheetData, setSD] = useState([]);
  const [filteredData, setFD] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const config = {
        method: "get",
        url: "http://localhost:4000/getSheetData",
      };
      try {
        const res = await axios.get(config.url);
        if (res.data.success) {
          const reverseData = res.data.data.reverse();
          setSD(reverseData);
          setFD(reverseData);
          setIsLoaded(true);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  console.log("SD", sheetData);

  const updateApproval = async (action, id) => {
    const data = {
      action: action,
      id: id,
      toUpdate: "AppNPay",
    };

    const config = {
      url: "http://localhost:4000/updateSheetData",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const { data } = await axios.post(config.url, config.data);
      if (data.success) {
        console.log(data.message);
        toast.success(`Entry ${action}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filterFunc = (value) => {
    console.log("value", value);
    if (value) {
      setFD(
        sheetData.filter((entry) => {
          return entry.Approval === value;
        })
      );
    } else {
      setFD(sheetData);
    }
  };

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

  const handleFilterChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h1>Welcome Admin</h1>
      <h2>Approval Filters:</h2>
      <ToggleButtonGroup
        color="primary"
        value={alignment}
        exclusive
        onChange={handleFilterChange}
        aria-label="Platform"
        className="admin_filters"
      >
        <ToggleButton
          onClick={() => {
            filterFunc();
          }}
          value="all"
        >
          All
        </ToggleButton>
        <ToggleButton
          onClick={() => {
            filterFunc("Pending");
          }}
          value="Pending"
        >
          Pending
        </ToggleButton>
        <ToggleButton
          onClick={() => {
            filterFunc("Approved");
          }}
          value="Approved"
        >
          Approved
        </ToggleButton>
        <ToggleButton
          onClick={() => {
            filterFunc("Rejected");
          }}
          value="Rejected"
        >
          Rejected
        </ToggleButton>
      </ToggleButtonGroup>
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
            {isLoaded ? (
              filteredData.length === 0 ? (
                <tr>
                  <td>No data available</td>
                </tr>
              ) : (
                filteredData.map((element, index) => {
                  return (
                    <StyledTableRow
                      key={element.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
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
                        <div className="admin_td_box">
                          <p> {element.Approval}</p>
                          {element.Approval === "Pending" ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() =>
                                  updateApproval("Approved", element.id)
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                color="error"
                                variant="contained"
                                onClick={() =>
                                  updateApproval("Rejected", element.id)
                                }
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {element.Approval === "Approved" &&
                        element.PayoutLink !== "Claimed" ? (
                          <p>Payout link sent</p>
                        ) : (
                          <p>{element.PayoutLink}</p>
                        )}
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })
              )
            ) : (
              <tr>
                <td>Loading...</td>
              </tr>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* {filteredData.map((element) => {
        return (
          <div key={element.id}>
            <hr />
            <p>{element.id}</p>
            <p>{element.Number}</p>
            <p>{element.Name}</p>
            <div>
              <span>{element.Approval}</span>
              {element.Approval === "Pending" ? (
                <>
                  <button
                    onClick={() => updateApproval("Approved", element.id)}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateApproval("Rejected", element.id)}
                  >
                    Reject
                  </button>
                </>
              ) : null}
            </div>
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
              <p>Payout link sent</p>
            ) : (
              <p>{element.PayoutLink}</p>
            )}

            <hr />
          </div>
        );
      })} */}
    </div>
  );
}
