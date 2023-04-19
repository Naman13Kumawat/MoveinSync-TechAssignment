import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_CLIENT_ID}
      authorizationParams={{
        redirect_uri:
          process.env.NODE_ENV === "production"
            ? "https://sync-up-client.vercel.app/dashboard"
            : "http://localhost:4000/dashboard",
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
