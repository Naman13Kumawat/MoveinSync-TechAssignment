import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Step2 from "./pages/Step2";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/steptwo" element={<Step2 />} />
        <Route path="/dashboard" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}
