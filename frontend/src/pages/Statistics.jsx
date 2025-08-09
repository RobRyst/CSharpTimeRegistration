import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  getProjectTotals,
  getUserTotalsForProject,
  getSingleUserProjectHours,
  GetAllProjects,
} from "../api/authAPI";

const Statistics = () => {
  const [projectTotals, setProjectTotals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersForProject, setUsersForProject] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [singleUserHours, setSingleUserHours] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [totalsRes, projectsRes] = await Promise.all([
        getProjectTotals(),
        GetAllProjects(),
      ]);
      setProjectTotals(totalsRes.data || []);
      setProjects(projectsRes.data || []);
    };
    load().catch(console.error);
  }, []);

  useEffect(() => {
    setSelectedUserId("");
    setSingleUserHours(null);
    if (!selectedProjectId) {
      setUsersForProject([]);
      return;
    }
    getUserTotalsForProject(selectedProjectId)
      .then((res) => setUsersForProject(res.data || []))
      .catch(console.error);
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId || !selectedUserId) {
      setSingleUserHours(null);
      return;
    }
    getSingleUserProjectHours(selectedProjectId, selectedUserId)
      .then((res) => setSingleUserHours(res.data ?? 0))
      .catch(console.error);
  }, [selectedProjectId, selectedUserId]);

  const totalsChartOptions = useMemo(
    () => ({
      data: projectTotals,
      series: [
        {
          type: "bar",
          xKey: "projectName",
          yKey: "totalHours",
          tooltip: { enabled: true },
        },
      ],
      axes: [
        { type: "category", position: "bottom", label: { rotation: 0 } },
        { type: "number", position: "left", title: { text: "Hours" } },
      ],
      title: { text: "Total Hours per Project (All Users)" },
    }),
    [projectTotals]
  );

  const usersChartOptions = useMemo(
    () => ({
      data: usersForProject.map((u) => ({
        userName: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.userId,
        totalHours: u.totalHours,
      })),
      series: [
        {
          type: "bar",
          xKey: "userName",
          yKey: "totalHours",
          tooltip: { enabled: true },
        },
      ],
      axes: [
        { type: "category", position: "bottom" },
        { type: "number", position: "left", title: { text: "Hours" } },
      ],
      title: { text: "Hours per User (Selected Project)" },
    }),
    [usersForProject]
  );

  return (
    <div className="space-y-8">
      <section className="bg-white p-4 rounded-xl shadow">
        <AgCharts options={totalsChartOptions} />
      </section>

      <section className="bg-white p-4 rounded-xl shadow flex gap-4 items-end">
        <div>
          <label className="block text-sm mb-1">Project</label>
          <select
            className="border rounded px-3 py-2"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">User (within project)</label>
          <select
            className="border rounded px-3 py-2"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={!selectedProjectId}
          >
            <option value="">All users</option>
            {usersForProject.map((u) => (
              <option key={u.userId} value={u.userId}>
                {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.userId}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow">
        {selectedProjectId ? (
          usersForProject.length ? (
            <AgCharts options={usersChartOptions} />
          ) : (
            <p className="text-gray-500">No hours yet for this project.</p>
          )
        ) : (
          <p className="text-gray-500">
            Select a project to view user breakdown.
          </p>
        )}
      </section>

      {selectedProjectId && selectedUserId && (
        <section className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Selected user total</h3>
          <p className="text-2xl">{singleUserHours?.toFixed(2) ?? "0.00"} h</p>
        </section>
      )}
    </div>
  );
};

export default Statistics;
