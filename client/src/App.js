import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import UserContextProvider from "./context/User.js";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export default function App() {
  console.log(process.env.NODE_ENV, typeof process.env.NODE_ENV);
  axios.defaults.baseURL =
    process.env.NODE_ENV === "production"
      ? "https://sync-up.vercel.app"
      : "http://localhost:4000";
  return (
    <UserContextProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/admin_dashboard" element={<Admin />} />
          <Route path="/*" element={<NotFound />}></Route>
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}
