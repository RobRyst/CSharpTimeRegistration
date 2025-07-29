import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { userRegistration } from "../api/authAPI";

const UserRegistration = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await userRegistration(form);
      localStorage.setItem("token", response.data.token);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "You successfully registered your account",
        showConfirmButton: false,
        timer: 1500,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Incorrect Email or Password",
      });
    }
  };
  return (
    <>
      <h1>Hi! This is Registration</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          type="text"
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          type="text"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter Email"
          type="email"
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter Password"
          type="password"
        />
        <button type="submit">Register</button>
      </form>
      <p className="text-center pt-4">
        Already got an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Click here to sign in
        </Link>
      </p>
    </>
  );
};

export default UserRegistration;
