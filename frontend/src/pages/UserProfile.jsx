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

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>User Profile</h1>
      <p>
        <strong>Full Name:</strong> {user.firstName} {user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <h2>Projects Worked On</h2>
      {projects.length === 0 ? (
        <p>No project hours registered.</p>
      ) : (
        <ul>
          {projects.map((project, index) => (
            <li key={index}>
              <strong>{project.name}</strong>: {project.hours.toFixed(2)}h
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserProfile;
