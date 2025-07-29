import "./App.css";
import Homepage from "./pages/HomePage";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import UserRegistration from "./pages/UserRegistration";
import Statistics from "./pages/Statistics";
import UserOverview from "./pages/UserOverview";
import PrivateRoute from "./components/PrivateRoute";
import SiteLayout from "./layouts/SiteLayout";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegistration />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <SiteLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Homepage />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="overview" element={<UserOverview />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
