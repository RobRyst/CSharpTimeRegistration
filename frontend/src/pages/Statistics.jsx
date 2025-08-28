import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  getProjectTotals,
  getProjectTotalsMonthly,
  getProjectTotalsWeekly,
  getUserTotalsForProject,
  getSingleUserProjectHours,
  GetAllProjects,
} from "../api/authAPI";

const toValidDate = (v) => {
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d) ? null : d;
};

const getCurrentIsoWeekBounds = () => {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const toISO = (d) => d.toISOString().slice(0, 10);
  return { from: toISO(monday), to: toISO(sunday) };
};

const formatWeekLabel = (start) => {
  const d = toValidDate(start);
  if (!d) return String(start ?? "");
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  const fmt = (x) => x.toLocaleDateString("en-GB");
  return `${fmt(d)} – ${fmt(end)}`;
};

const formatMonthStart_ddmmyyyy = (year, month) => {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-GB");
};

const Statistics = () => {
  const [projectTotals, setProjectTotals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersForProject, setUsersForProject] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [singleUserHours, setSingleUserHours] = useState(null);

  const [timeline, setTimeline] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (timeline !== "all") {
      setFrom("");
      setTo("");
    }
  }, [timeline]);

  const buildParams = () => {
    if (timeline === "weekly") {
      return getCurrentIsoWeekBounds();
    }
    if (timeline === "all") {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      return params;
    }
    return {};
  };

  useEffect(() => {
    const load = async () => {
      const [projectsRes] = await Promise.all([GetAllProjects()]);
      setProjects(projectsRes.data || []);

      const params = buildParams();
      let totalsRes;
      if (timeline === "monthly") {
        totalsRes = await getProjectTotalsMonthly(params);
      } else if (timeline === "weekly") {
        totalsRes = await getProjectTotalsWeekly(params);
      } else {
        totalsRes = await getProjectTotals(params);
      }
      setProjectTotals(totalsRes.data || []);
    };
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline, from, to]);

  useEffect(() => {
    setSelectedUserId("");
    setSingleUserHours(null);
    if (!selectedProjectId) {
      setUsersForProject([]);
      return;
    }
    const params = buildParams();
    getUserTotalsForProject(selectedProjectId, params)
      .then((res) => setUsersForProject(res.data || []))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, timeline, from, to]);

  useEffect(() => {
    if (!selectedProjectId || !selectedUserId) {
      setSingleUserHours(null);
      return;
    }
    const params = buildParams();
    getSingleUserProjectHours(selectedProjectId, selectedUserId, params)
      .then((res) => setSingleUserHours(res.data ?? 0))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, selectedUserId, timeline, from, to]);

  const totalsChartOptions = useMemo(() => {
    if (timeline === "monthly") {
      return {
        data: projectTotals.map((x) => ({
          label: `${x.projectName} ${formatMonthStart_ddmmyyyy(
            x.year,
            x.month
          )}`,
          totalHours: x.totalHours,
        })),
        series: [
          {
            type: "bar",
            xKey: "label",
            yKey: "totalHours",
            tooltip: { enabled: true },
          },
        ],
        axes: [
          { type: "category", position: "bottom" },
          { type: "number", position: "left", title: { text: "Hours" } },
        ],
        title: { text: "Monthly Hours per Project" },
      };
    }
    if (timeline === "weekly") {
      return {
        data: projectTotals.map((x) => ({
          label: `${x.projectName} ${formatWeekLabel(x.weekStart)}`,
          totalHours: x.totalHours,
        })),
        series: [
          {
            type: "bar",
            xKey: "label",
            yKey: "totalHours",
            tooltip: { enabled: true },
          },
        ],
        axes: [
          { type: "category", position: "bottom" },
          { type: "number", position: "left", title: { text: "Hours" } },
        ],
        title: { text: "Weekly Hours per Project" },
      };
    }
    return {
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
        { type: "category", position: "bottom" },
        { type: "number", position: "left", title: { text: "Hours" } },
      ],
      title: { text: "Total Hours per Project (All Time)" },
    };
  }, [projectTotals, timeline]);

  const usersChartOptions = useMemo(() => {
    const list = selectedUserId
      ? usersForProject.filter((u) => u.userId === selectedUserId)
      : usersForProject;

    return {
      data: list.map((u) => ({
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
    };
  }, [usersForProject, selectedUserId]);

  return (
    <div className="space-y-8">
      <section className="bg-white p-4 rounded-xl shadow flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm mb-1">Timeline</label>
          <select
            className="border rounded px-3 py-2"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {timeline === "all" && (
          <>
            <div>
              <label className="block text-sm mb-1">From</label>
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">To</label>
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="text-sm text-zinc-500">
              (Leave dates empty for full range)
            </div>
          </>
        )}
      </section>

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
            <p className="text-zinc-500">
              No hours yet for this project (with current filters).
            </p>
          )
        ) : (
          <p className="text-zinc-500">
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
