import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get("http://localhost:5196/User/profile", {
          headers,
        });
        setUser(userRes.data);

        const timeRes = await axios.get(
          "http://localhost:5196/TimeRegistration",
          { headers }
        );
        const data = timeRes.data;

        const grouped = data.reduce((acc, item) => {
          const projectName =
            item.projectName || item.project?.name || "Unassigned";
          if (!acc[projectName]) {
            acc[projectName] = { hours: 0, entries: [] };
          }
          acc[projectName].hours += item.hours;
          acc[projectName].entries.push(item);
          return acc;
        }, {});

        const projectSummary = Object.entries(grouped).map(
          ([name, { hours }]) => ({
            name,
            hours,
          })
        );

        setProjects(projectSummary);
      } catch (err) {
        console.error("Failed to load profile", err);
        Swal.fire("Error", "Could not load profile data", "error");
      }
    };

    fetchProfile();
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-64 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-52 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="mt-8 h-4 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="mt-4 space-y-2">
            <div className="h-10 animate-pulse rounded-xl bg-zinc-800" />
            <div className="h-10 animate-pulse rounded-xl bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }
  const totalHours =
    projects.reduce(
      (sum, p) => sum + (Number.isFinite(p.hours) ? p.hours : 0),
      0
    ) || 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-white">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl ring-1 ring-black/5">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-lg font-semibold">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-white">{user.email}</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm">
            <span className="text-white">Total hours:&nbsp;</span>
            <span className="font-semibold">{totalHours.toFixed(2)}h</span>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-base font-semibold text-white">
            Projects Worked On
          </h2>

          {projects.length === 0 ? (
            <p className="mt-3 text-sm text-white">
              No project hours registered.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/40">
              {projects.map((project, idx) => {
                const pct = Math.min(
                  100,
                  Math.round(((project.hours || 0) / totalHours) * 100)
                );

                return (
                  <li
                    key={idx}
                    className="p-4 sm:p-5 hover:bg-zinc-900/70 transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-zinc-400">
                          {project.hours.toFixed(2)}h
                        </p>
                      </div>
                      <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-white">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-zinc-600"
                        style={{ width: `${pct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
