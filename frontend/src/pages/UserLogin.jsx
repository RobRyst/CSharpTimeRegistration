import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { userLogin } from "../api/authAPI";

const UserLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      setTimeout(() => navigate("/"), 1000);
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
            <h1 className="text-2xl font-semibold">Sign in</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-white">
                Email
              </label>
              <input
                id="email"
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
                htmlFor="password"
                className="mb-1 block text-sm text-white"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              {success ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-sm text-zinc-400 pt-2">
              Not signed up?{" "}
              <Link
                to="/register"
                className="font-medium text-zinc-200 underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default UserLogin;
