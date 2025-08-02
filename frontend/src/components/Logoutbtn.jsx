import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const LogoutBtn = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Log out! ",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        Swal.fire({
          title: "Logged out!",
          text: "You're now logged out",
          icon: "success",
        });
        navigate("/login");
      }
    });
  };

  return (
    <button className="text-white" onClick={handleLogout}>
      Logout &gt;
    </button>
  );
};

export default LogoutBtn;
