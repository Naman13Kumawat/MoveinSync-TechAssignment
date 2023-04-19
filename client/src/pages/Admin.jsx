import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPayrollCard from "../components/AdminPayrollCard";

export default function Admin() {
  const [alignment, setAlignment] = useState("all");
  const [sheetData, setSD] = useState([]);
  const [filteredData, setFD] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appPending, setAppPending] = useState(false);

  const getData = async () => {
    const endPoint = "/getSheetData";
    try {
      const res = await axios.get(endPoint);
      if (res.data.success) {
        const reverseData = res.data.data.reverse();
        setSD(reverseData);
        setFD(reverseData);
        setIsLoaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const sendCashgram = async (id) => {
    setAppPending(true);
    // Get user
    try {
      const res = await axios.get(`/getSheetData/row/${id}`);
      if (res.status === 200) {
        // Send CashGram
        const data = {
          userName: res.data.Name,
          contact: res.data.Number,
        };
        console.log(data);
        try {
          const response = await axios.post("/createcashgram", data);
          if (response.data.status === "SUCCESS") {
            // console.log(response.data);
            updateApproval("Approved", id, response.data.data.cashgramLink);
          } else {
            toast.error(response.data.message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            setAppPending(false);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateApproval = async (action, id, cgLink) => {
    const data = {
      action: action,
      id: id,
      toUpdate: "AppNPay",
      link: cgLink,
    };

    const config = {
      url: "/updateSheetData",
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
        getData();
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

  const handleFilterChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  return (
    <div>
      <div className="admin_top">
        <h1>Welcome Admin</h1>
      </div>
      <div className="admin_filters">
        <h1>Approval Filters:</h1>
        <ToggleButtonGroup
          color="primary"
          value={alignment}
          exclusive
          onChange={handleFilterChange}
          aria-label="Platform"
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
      </div>

      <div className="admin_container">
        {isLoaded ? (
          filteredData.length === 0 ? (
            <p>No data available</p>
          ) : (
            filteredData.map((element) => {
              return (
                <AdminPayrollCard
                  element={element}
                  key={element.id}
                  updateApproval={updateApproval}
                  sendCashgram={sendCashgram}
                  appPending={appPending}
                />
              );
            })
          )
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
