import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import MainPage from "./pages/MainPage";
import { Toaster } from "./components/ui/toaster";
import { useAuthContext } from "./hooks/useAuthContext";
import Test from "./pages/Test";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import AdminPanel from "./pages/Admin";
import ComparePage from "./pages/ComparePage";

export default function App() {
  const { user } = useAuthContext();

  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          <Routes>
            <Route path="/mainpage" element={user ? <MainPage /> : <Home />} />
          </Routes>
          <Routes>
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
          <Routes>
            <Route
              path="/admin"
              element={
                user && user.role === "admin" ? <AdminPanel /> : <Home />
              }
            />
          </Routes>
          <Routes>
            <Route
              path="/admin/compare_img"
              element={
                user && user.role === "admin" ? <ComparePage /> : <Home />
              }
            />
          </Routes>
          <Routes>
            <Route path="/projects" element={user ? <Projects /> : <Home />} />
          </Routes>
          <Routes>
            <Route path="/test" element={<Test />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}
