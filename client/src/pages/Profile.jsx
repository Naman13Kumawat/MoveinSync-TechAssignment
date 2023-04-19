// import { useAuth0 } from "@auth0/auth0-react";
// import Login from "./Login";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { UserContext } from "../context/User";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import PayrollCard from "../components/PayrollCard";

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [notUploaded, setNotUploaded] = useState(true);
  const [sheetData, setSD] = useState([]);
  const [sheetLoaded, setSheetLoaded] = useState(false);
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
    } else {
      // If no localstorage found
      toast.error("Current User not found!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (!!user.Number) {
      (async () => {
        const endPoint = `/getSheetData/${user.Number}`;
        try {
          const res = await axios.get(endPoint);
          setSD(res.data.reverse());
          setSheetLoaded(true);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [user]);

  console.log("Filtered data", sheetData);

  useEffect(() => {
    sheetData?.forEach((entry) => {
      if (entry.UploadMonth === mntName) {
        console.log("Already Uploaded");
        setNotUploaded(false);
      }
    });
    // console.log("first");
    // if (sheetData.length) {
    //   const entry = sheetData[0];
    //   if (entry.UploadMonth !== mntName) {
    //     console.log("Not Uploaded");
    //     setNotUploaded(true);
    //   } else console.log("Already");
    // }
  }, [sheetData]);
  // if (!sheetLoaded) {
  //   return (
  //     <div className="step2_loading">
  //       <CircularProgress color="success" />
  //     </div>
  //   );
  // }
  return (
    <div>
      <div className="profile_dashboard">
        <h1>Dashboard</h1>
        <p>Welcome {user.Name}</p>

        {sheetLoaded ? (
          notUploaded ? (
            <p>
              Upload photos for {mntName} &nbsp;
              <Link to="/upload">
                <Button variant="contained">Upload</Button>
              </Link>
            </p>
          ) : (
            <p>Photos uploaded for {mntName}</p>
          )
        ) : null}
      </div>

      <div className="profile_payroll">
        <h3>Payroll History</h3>
        {sheetLoaded ? (
          sheetData.length === 0 ? (
            <p>No data available</p>
          ) : (
            sheetData.map((element, index) => {
              return (
                <PayrollCard
                  element={element}
                  key={element.id}
                  index={index}
                  mntName={mntName}
                />
              );
            })
          )
        ) : (
          <div className="loading">
            <CircularProgress color="success" />
          </div>
        )}
      </div>
    </div>
  );
}
