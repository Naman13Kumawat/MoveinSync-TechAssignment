import { useAuth0 } from "@auth0/auth0-react";
import Login from "./Login";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [sheetData, setSD] = useState([]);
  useEffect(() => {
    const config = {
      method: "get",
      url: "http://localhost:4000/api",
      headers: {},
    };
    axios(config)
      .then(function (response) {
        const data = response && response.data.values;
        setSD(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);
  console.log(sheetData);
  if (isLoading) {
    return <div>Loading ...</div>;
  }

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

  return isAuthenticated ? (
    <div>
      <h1>Profile</h1>
      <p>Welcome {user.name}</p>
      {/* <Logout /> */}
      <p>
        Upload photos for {mntName} &nbsp;
        <Link to="/upload">Upload</Link>
      </p>
    </div>
  ) : (
    <div>
      <p>Please login first</p>
      <Login />
    </div>
  );
}
