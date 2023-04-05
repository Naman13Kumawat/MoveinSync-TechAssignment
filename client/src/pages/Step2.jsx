import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const handleSumbit = (fname, navigate, user) => {
  const data = JSON.stringify({
    number: user.nickname.slice(1),
    fname: fname,
  });

  const config = {
    method: "post",
    url: "http://localhost:4000/postSheetData",
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
      <p>Number: {user?.name} (Verified)</p>
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
