import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

const SiteLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <NavBar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SiteLayout;
