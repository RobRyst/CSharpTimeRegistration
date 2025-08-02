import { NavLink } from "react-router";
import LogoutBtn from "./Logoutbtn";

const NavBar = () => {
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
            <NavLink to="/projects" className="text-white">
              Projects
            </NavLink>
            <NavLink to="/overview" className="text-white">
              Overview
            </NavLink>
            <NavLink to="/statistics" className="text-white">
              Statistics
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
