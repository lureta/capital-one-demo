
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

const cognitoAuthConfig = {
  authority:
    "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_71o99WmqJ",
  client_id: "12nlo0ctilrhlgg3ajjpmupvtv",
  redirect_uri: window.location.origin + "/",
  response_type: "code",
  scope: "openid email",
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
