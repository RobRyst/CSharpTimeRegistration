import { NavLink } from "react-router";
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

  return (
    <>
      <div className="flex flex-row justify-between items-center bg-zinc-800">
        <div>
          <h1 className="text-6xl text-white p-5">
            <NavLink to="/">Time</NavLink>
          </h1>
        </div>
        <div>
          <nav className="flex gap-10 px-5">
            <NavLink to="/" className="text-white">
              Home
            </NavLink>
            {isAdmin && (
              <>
                <NavLink to="/projects" className="text-white">
                  Projects
                </NavLink>
                <NavLink to="/statistics" className="text-white">
                  Statistics
                </NavLink>
              </>
            )}
            <NavLink to="/overview" className="text-white">
              Overview
            </NavLink>
            <NavLink to="/profile" className="text-white">
              Profile
            </NavLink>
            <LogoutBtn />
          </nav>
        </div>
      </div>
    </>
  );
};

export default NavBar;
