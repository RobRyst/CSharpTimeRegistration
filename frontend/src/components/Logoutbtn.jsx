import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const LogoutBtn = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    Swal.fire("Logged out", "You have been signed out", "success");
    navigate("/login");
  };

  return (
    <button className="text-white" onClick={handleLogout}>
      Logout &gt;
    </button>
  );
};

export default LogoutBtn;
