import "./pagesStyles.css";
// import { useAuth0 } from "@auth0/auth0-react";
import { Button, InputAdornment, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/User";

export default function Login() {
  // const { loginWithRedirect } = useAuth0();
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEOtp] = useState("");
  const [number, setNumber] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const verifyUser = async () => {
    try {
      const res = await axios.get(
        `/getSheetData?sheetNo=2&num=${"91" + number}`
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
      } else {
        console.log(res);
        setUser({
          Name: res.data.data[0].Name,
          Number: res.data.data[0].Number,
        });
        getOTP();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getOTP = () => {
    if (number.length !== 10) {
      setIsInvalid(true);
    } else {
      toast.success(`OTP sent to ${number}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setOtp("1234");
    }
  };

  const verifyOtp = () => {
    if (enteredOtp.length !== 4) {
      toast.error(`Enter 4 digit OTP!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      if (enteredOtp === otp) {
        localStorage.setItem("currUser", JSON.stringify(user));
        navigate("/dashboard");
        console.log(user);
      } else {
        toast.error(`Incorrect OTP!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };
  return (
    <div className="login_container">
      <div className="login_logo">
        <img src="/images/moveinsyncsqr.png" alt="moveinsyncLogo" />
      </div>
      <div className="login_form">
        <span>
          <TextField
            error={isInvalid}
            label="Enter phone number"
            id="outlined-start-adornment"
            onChange={(e) => {
              setNumber(e.target.value);
              setIsInvalid(false);
            }}
            helperText={isInvalid ? "Invalid phone number" : null}
            sx={{ m: 1, width: "25ch" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">+91</InputAdornment>
              ),
              readOnly: otp.length ? true : false,
            }}
          />
          {otp.length !== 0 ? (
            <EditIcon
              onClick={() => {
                setOtp("");
              }}
            />
          ) : null}
        </span>
        <span>
          {otp.length === 0 ? (
            <Button onClick={verifyUser} color="success" variant="contained">
              GET OTP
            </Button>
          ) : null}
        </span>
        {otp.length !== 0 ? (
          <>
            <span>
              <TextField
                id="outlined-number"
                label="OTP"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  setEOtp(e.target.value);
                }}
                placeholder="0000"
              />
            </span>
            <span>
              <Button onClick={verifyOtp} color="success" variant="contained">
                VERIFY
              </Button>
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
