import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

const SiteLayout = () => {
  return (
    <div className="flex flex-col md:flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 bg-gray-100 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default SiteLayout;
