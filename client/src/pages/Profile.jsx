import { useAuth0 } from "@auth0/auth0-react";
import Login from "./Login";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/User";

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
          setSD(res.data);
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
    return <div>Loading ...</div>;
  }

  return isAuthenticated ? (
    <div>
      <h1>Profile</h1>
      <p>Welcome {user.Name}</p>
      {/* <Logout /> */}
      {notUploaded ? (
        <p>
          Upload photos for {mntName} &nbsp;
          <Link to="/upload">Upload</Link>
        </p>
      ) : (
        <p>Photos uploaded for {mntName}</p>
      )}
      <div>
        <h3>Payroll History</h3>
        {!isLoading && sheetData ? (
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
                <p>{element.Payoutlink}</p>
                <hr />
              </div>
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
