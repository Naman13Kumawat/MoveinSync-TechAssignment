import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const handleSumbit = (fname, navigate, user) => {
  console.log(fname, user.nickname);
  if (user) user.name = fname;
  const data = JSON.stringify({
    fname: user.name,
    number: user.nickname,
  });

  const config = {
    method: "post",
    url: "http://localhost:4000/api",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(response.data);
      navigate("/dashboard");
    })
    .catch(function (error) {
      console.log(error);
    });
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();
  // const [sheetData, setSD] = useState([]);

  // useEffect(() => {
  //   const config = {
  //     method: "get",
  //     url: "http://localhost:4000/api",
  //     headers: {},
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       const data = response && response.data.values;
  //       setSD(data);
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  // }, []);
  // sheetData.forEach((entry) => {
  //   console.log(entry[1], user?.nickname.slice(1));
  //   if (entry[1] === user?.nickname) {
  //     navigate("/dashboard");
  //   }
  // });
  const [fname, setfname] = useState("");
  if (isLoading) {
    return <div>Loading ...</div>;
  }
  return isAuthenticated ? (
    <div>
      <label>
        Name:&nbsp;
        <input
          type="text"
          name="fname"
          placeholder="Name"
          onChange={(e) => {
            setfname(e.target.value);
          }}
        />
      </label>
      <p>Number: {user?.name}</p>
      <button
        onClick={() => {
          handleSumbit(fname, navigate, user);
        }}
      >
        Continue
      </button>
    </div>
  ) : (
    <div>
      <p>Not Authenticated</p>
    </div>
  );
}
