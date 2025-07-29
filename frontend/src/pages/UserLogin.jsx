import { useState } from "react";
import { Form } from "react-router-dom";
import { userLogin } from "../api/authAPI";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const UserLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userLogin(form);
      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          firstName: response.data.firstname,
          lastName: response.data.lastname,
          email: form.email,
        })
      );

      Swal.fire({
        position: "center",
        icon: "success",
        title: "You successfully logged in",
        showConfirmButton: false,
        timer: 1500,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1000);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Incorrect Email or Password",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter Email"
          type="Email"
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter Password"
          type="password"
        />
        <button type="submit">Login</button>
        <p className="text-center pt-4">
          Not signed up?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Click here to register!
          </Link>
        </p>
      </form>
    </>
  );
};

export default UserLogin;
