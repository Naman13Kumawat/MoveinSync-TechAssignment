import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Step2 from "./pages/Step2";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import UserContextProvider from "./context/User.js";
import Admin from "./pages/Admin";
import PayoutPage from "./pages/PayoutPage";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <UserContextProvider>
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
