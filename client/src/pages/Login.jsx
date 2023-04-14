import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button } from "@mui/material";
import "./pagesStyles.css";

export default function Login() {
  const { loginWithRedirect } = useAuth0();
  return (
    <Box
      sx={{
        padding: "25vh 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div className="login_logo">
        <img src="/images/moveinsyncsqr.png" alt="moveinsyncLogo" />
      </div>

      <Button
        variant="contained"
        color="success"
        onClick={() => loginWithRedirect()}
      >
        Log In
      </Button>
    </Box>
  );
}
