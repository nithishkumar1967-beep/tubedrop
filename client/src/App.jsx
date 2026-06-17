import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: "100vh", background: "#0a0a0c", color: "#f0f0f0" }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#18181f",
              color: "#f0f0f0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 14,
              fontFamily: "DM Sans, sans-serif",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#18181f" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#18181f" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
