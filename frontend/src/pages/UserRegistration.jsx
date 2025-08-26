import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { userRegistration } from "../api/authAPI";

const UserRegistration = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      setTimeout(() => navigate("/login"), 1000);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Incorrect Email or Password",
      });
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Create account</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm text-white"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm text-white"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="mb-1 block text-sm text-white"
              >
                Email
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600"
                required
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="mb-1 block text-sm text-white"
              >
                Password
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              {success ? "Creating..." : "Create account"}
            </button>

            <p className="text-center text-sm text-zinc-400 pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-zinc-200 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default UserRegistration;
