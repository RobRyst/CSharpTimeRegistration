import { NavLink } from "react-router-dom";
import LogoutBtn from "./Logoutbtn";
import { useEffect, useState } from "react";

const NavBar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      setIsAdmin(
        Array.isArray(roles) ? roles.includes("Admin") : roles === "Admin"
      );
    } catch (err) {
      console.error("Failed to decode token", err);
      setIsAdmin(false);
    }
  }, []);

  const linkClass =
    "text-zinc-200 hover:text-white transition font-medium text-base";

  return (
    <header className="bg-zinc-800 shadow-md">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-30 items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            <NavLink to="/" className="hover:text-zinc-300 transition">
              Time Registration
            </NavLink>
          </h1>

          <nav className="flex items-center gap-10">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            {isAdmin && (
              <>
                <NavLink to="/projects" className={linkClass}>
                  Projects
                </NavLink>
                <NavLink to="/statistics" className={linkClass}>
                  Statistics
                </NavLink>
              </>
            )}
            <NavLink to="/overview" className={linkClass}>
              Overview
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <LogoutBtn />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
