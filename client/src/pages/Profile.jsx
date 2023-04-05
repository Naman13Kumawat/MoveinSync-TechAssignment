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
      url: "http://localhost:4000/getSheetData",
      headers: {},
    };
    axios(config)
      .then(function (response) {
        const data = response && response.data.data;
        setSD(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);
  console.log(sheetData);
  const filteredarr =
    !isLoading &&
    sheetData.filter((entry) => {
      return entry.Number === user.name.slice(1);
    });
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
      <p>Welcome.</p>
      {/* <Logout /> */}
      <p>
        Upload photos for {mntName} &nbsp;
        <Link to="/upload">Upload</Link>
      </p>
      <div>
        <h3>Payroll History</h3>
        {filteredarr.map((element) => {
          return (
            <div key={element.id}>
              <p>{element.id}</p>
              <p>{element.Number}</p>
              <p>{element.Name}</p>
              <p>{element.Approval}</p>
              <p>{element.UploadMonth}</p>
              <p>{element.UploadDateTime}</p>
              {element.Links.split(",").map((link, index) => {
                return <p key={index}>{`Photo ${index + 1} link: ${link}`}</p>;
              })}
              <p>{element.Payoutlink}</p>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div>
      <p>Please login first</p>
      <Login />
    </div>
  );
}
