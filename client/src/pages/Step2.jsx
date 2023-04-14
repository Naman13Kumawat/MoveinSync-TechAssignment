import { useAuth0 } from "@auth0/auth0-react";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/User";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading) {
      setUser({ ...user, Number: authUser?.nickname.slice(1) });
    }
  }, [isLoading]);

  console.log(user);
  const handleSumbit = () => {
    localStorage.setItem("currUser", JSON.stringify(user));
    navigate("/dashboard");
  };
  if (isLoading) {
    return (
      <div className="step2_loading">
        <CircularProgress color="success" />
      </div>
    );
  }
  return isAuthenticated ? (
    <Box
      component="form"
      sx={{
        "& > :not(style)": { m: 1, width: "80vw" },
      }}
      autoComplete="off"
      className="step2_container"
    >
      <TextField
        id="fname"
        label="Full Name"
        variant="filled"
        onChange={(e) => {
          setUser({ ...user, Name: e.target.value });
        }}
      />
      <p className="step2_para">
        Number: {user?.Number} <VerifiedIcon style={{ color: "green" }} />
      </p>
      <Button variant="contained" color="success" onClick={handleSumbit}>
        Continue
      </Button>
    </Box>
  ) : (
    <div className="step2_container">
      <p className="step2_para">Not Authenticated</p>
      <Link to="/">
        <Button variant="contained" color="success">
          {" "}
          Back to Login{" "}
        </Button>
      </Link>
    </div>
  );
}
