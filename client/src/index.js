import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-7boifksy6n785z3p.us.auth0.com"
      clientId="XAS4p6MMakeliqMnh5I9ad0pdLvYkdTM"
      authorizationParams={{
        redirect_uri: "http://localhost:3000/steptwo",
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
