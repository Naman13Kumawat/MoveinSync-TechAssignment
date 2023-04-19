import { useAuth0 } from "@auth0/auth0-react";
import Login from "./Login";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { UserContext } from "../context/User";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import PayrollCard from "../components/PayrollCard";

export default function Profile() {
  const { user: authUser, isLoading, isAuthenticated } = useAuth0();
  const { user, setUser } = useContext(UserContext);
  const [verified, setVerified] = useState(false);
  const [notUploaded, setNotUploaded] = useState(true);
  const { logout } = useAuth0();
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

  // Verify if user is registered
  useEffect(() => {
    if (authUser) {
      (async () => {
        try {
          const res = await axios.get(
            `/getSheetData?sheetNo=2&num=${authUser?.name.slice(1)}`
          );
          if (res.data.error === 404) {
            console.log(res.data.errorMessage);
            toast.error(res.data.errorMessage, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            logout();
          } else {
            setUser({
              Name: res.data.data[0].Name,
              Number: res.data.data[0].Number,
            });
            setVerified(true);
          }
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [authUser]);

  useEffect(() => {
    if (!isLoading && verified) {
      localStorage.setItem("currUser", JSON.stringify(user));
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
  if (isLoading || !verified || !sheetLoaded) {
    return (
      <div className="step2_loading">
        <CircularProgress color="success" />
      </div>
    );
  }
  return isAuthenticated ? (
    <div>
      <div className="profile_dashboard">
        <h1>Dashboard</h1>
        <p>Welcome {user.Name}</p>
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
      </div>
      <div className="profile_payroll">
        <h3>Payroll History</h3>
        {sheetData ? (
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
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  ) : (
    <div>
      <p>Please login first</p>
      <Login />
    </div>
  );
}
