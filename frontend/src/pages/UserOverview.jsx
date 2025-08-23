import { useCallback, useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  getAllTimeRegistrations,
  GetTimeRegistrationsForUser,
  updateTimeStatus,
  exportProjectsPdf,
  exportTimeRegistrationsPdf,
  updateTimeRegistration,
} from "../api/authAPI";
import Swal from "sweetalert2";

ModuleRegistry.registerModules([AllCommunityModule]);

const toDateOnlyUTC = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
};
const toISODate = (d) => toDateOnlyUTC(d).toISOString().slice(0, 10);

const getCurrentIsoWeekBounds = () => {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    from: toDateOnlyUTC(monday),
    to: toDateOnlyUTC(sunday),
  };
};

const getCurrentMonthBounds = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
  return { from: start, to: end };
};

const isInRangeInclusive = (dateLike, from, to) => {
  const d = toDateOnlyUTC(dateLike);
  return (!from || d >= from) && (!to || d <= to);
};

const UserOverview = () => {
  const [rowData, setRowData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Filters
  const [timeline, setTimeline] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");

  const extractUserIdFromToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return { userId: null, isAdmin: false };

    const payload = JSON.parse(atob(token.split(".")[1]));
    const rolesClaim =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const isAdmin = Array.isArray(rolesClaim)
      ? rolesClaim.includes("Admin")
      : rolesClaim === "Admin";

    const userId =
      payload.sub ||
      payload.nameid ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload[
        "http://schemas.microsoft.com/identity/claims/objectidentifier"
      ] ||
      null;

    return { userId, isAdmin };
  }, []);

  const load = useCallback(async () => {
    const { userId, isAdmin } = extractUserIdFromToken();
    if (!userId) throw new Error("Missing token / user id");

    setCurrentUserId(userId);
    setIsAdmin(isAdmin);

    const response = isAdmin
      ? await getAllTimeRegistrations()
      : await GetTimeRegistrationsForUser();
    setRowData(response.data || []);
  }, [extractUserIdFromToken]);

  useEffect(() => {
    load().catch((err) => {
      console.error("Failed to fetch time registrations", err);
      Swal.fire("Error", "Could not load data", "error");
    });
  }, [load]);

  const people = useMemo(() => {
    const map = new Map();
    for (const r of rowData || []) {
      const uid = r.userId || "";
      const label =
        `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || uid || "Unknown";
      if (uid && !map.has(uid)) map.set(uid, label);
    }
    return Array.from(map.entries())
      .map(([userId, label]) => ({ userId, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rowData]);

  const filteredRows = useMemo(() => {
    let rows = Array.isArray(rowData) ? rowData : [];
    if (selectedUserId) {
      rows = rows.filter((r) => r.userId === selectedUserId);
    }
    if (timeline === "weekly") {
      const { from, to } = getCurrentIsoWeekBounds();
      rows = rows.filter((r) => isInRangeInclusive(r.date, from, to));
    } else if (timeline === "monthly") {
      const { from, to } = getCurrentMonthBounds();
      rows = rows.filter((r) => isInRangeInclusive(r.date, from, to));
    }

    return rows;
  }, [rowData, timeline, selectedUserId]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateTimeStatus(id, status);
      setRowData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      Swal.fire("Updated", `Status set to ${status}`, "success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  const StatusCell = (p) => {
    const status = p.value ?? "Pending";
    if (!isAdmin) return <span>{status}</span>;
    return (
      <div className="flex gap-2 items-center">
        <span className="px-2 py-0.5 rounded bg-zinc-100">{status}</span>
        <button
          className="px-2 py-1 rounded text-white bg-emerald-600"
          onClick={() => handleUpdateStatus(p.data.id, "Accepted")}
        >
          Accept
        </button>
        <button
          className="px-2 py-1 rounded text-white bg-rose-600"
          onClick={() => handleUpdateStatus(p.data.id, "Declined")}
        >
          Decline
        </button>
      </div>
    );
  };

  const canEdit = (row) => {
    if (!currentUserId) return false;
    if (row.userId !== currentUserId) return false;
    const d = toDateOnlyUTC(row.date);
    const today = toDateOnlyUTC(new Date());
    const diffDays = Math.abs(
      Math.floor((today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000))
    );
    return diffDays <= 30;
  };

  const onEditOwn = async (row) => {
    const pad = (n) => String(n).padStart(2, "0");
    const toHHMM = (ts) => {
      const parts = String(ts).split(":");
      const h = pad(parts[0] ?? "00");
      const m = pad(parts[1] ?? "00");
      return `${h}:${m}`;
    };

    const { value: formValues } = await Swal.fire({
      title: "Edit Time Entry",
      html: `
        <div style="text-align:left">
          <label>Date</label>
          <input id="f-date" type="date" value="${
            row.date?.slice(0, 10) || ""
          }" class="swal2-input" style="width:100%"/>
          <label>Start</label>
          <input id="f-start" type="time" value="${toHHMM(
            row.startTime
          )}" class="swal2-input" style="width:100%"/>
          <label>End</label>
          <input id="f-end" type="time" value="${toHHMM(
            row.endTime
          )}" class="swal2-input" style="width:100%"/>
          <label>Comment</label>
          <input id="f-comment" type="text" value="${
            row.comment ?? ""
          }" class="swal2-input" style="width:100%"/>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const dateStr = document.getElementById("f-date").value;
        const start = document.getElementById("f-start").value;
        const end = document.getElementById("f-end").value;
        const comment = document.getElementById("f-comment").value;

        if (!dateStr || !start || !end) {
          Swal.showValidationMessage("Date, start and end are required");
          return;
        }

        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const durationMinutes = eh * 60 + em - (sh * 60 + sm);
        if (durationMinutes <= 0) {
          Swal.showValidationMessage("End time must be after start time");
          return;
        }

        const today = toDateOnlyUTC(new Date());
        const d = toDateOnlyUTC(dateStr);
        const days = Math.abs((today - d) / (24 * 60 * 60 * 1000));
        if (days > 30) {
          Swal.showValidationMessage(
            "Only entries within ±30 days can be edited"
          );
          return;
        }

        return {
          date: dateStr,
          startTime: `${start}:00`,
          endTime: `${end}:00`,
          comment,
        };
      },
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (!formValues) return;

    try {
      const payload = {
        projectId: row.projectId ?? null,
        date: formValues.date,
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        comment: formValues.comment,
      };

      const res = await updateTimeRegistration(row.id, payload);
      const updated = res.data;

      setRowData((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                date: updated.date,
                startTime: updated.startTime,
                endTime: updated.endTime,
                hours: updated.hours,
                comment: updated.comment,
                status: updated.status,
              }
            : r
        )
      );

      Swal.fire("Saved", "Time entry updated", "success");
    } catch (e) {
      console.error(e);
      Swal.fire(
        "Error",
        e?.response?.data ?? "Could not update time entry",
        "error"
      );
    }
  };

  const ActionsCell = (p) => {
    const row = p.data;
    return canEdit(row) ? (
      <button
        className="px-2 py-1 rounded text-white bg-sky-600"
        onClick={() => onEditOwn(row)}
      >
        Edit
      </button>
    ) : null;
  };

  const columnDefs = useMemo(() => {
    return [
      {
        field: "id",
        headerName: "ID",
        sortable: true,
        filter: true,
        maxWidth: 100,
      },
      { field: "userId", headerName: "User ID", sortable: true, filter: true },
      {
        field: "firstName",
        headerName: "First Name",
        sortable: true,
        filter: true,
      },
      {
        field: "lastName",
        headerName: "Last Name",
        sortable: true,
        filter: true,
      },
      {
        field: "projectName",
        headerName: "Project",
        sortable: true,
        filter: true,
      },
      { field: "date", headerName: "Date", sortable: true, filter: true },
      { field: "startTime", headerName: "Start Time", sortable: true },
      { field: "endTime", headerName: "End Time", sortable: true },
      { field: "hours", headerName: "Hours", sortable: true },
      { field: "comment", headerName: "Comment", sortable: true },
      {
        field: "status",
        headerName: "Status",
        sortable: true,
        filter: true,
        cellRenderer: StatusCell,
      },
      {
        headerName: "My Actions",
        field: "myActions",
        sortable: false,
        filter: false,
        cellRenderer: ActionsCell,
        width: 120,
        pinned: "right",
        suppressHeaderMenuButton: true,
        suppressHeaderContextMenu: true,
      },
    ];
  }, [isAdmin, currentUserId]);

  const exportPdfAll = async (status) => {
    try {
      const res = await exportProjectsPdf(status);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projects-overview-${status || "all"}-${new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[:T]/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Could not export PDF", "error");
    }
  };

  const exportPdfCurrentView = async () => {
    if (!isAdmin) {
      Swal.fire("Unavailable", "Only admins can export the PDF.", "info");
      return;
    }

    const params = {};
    if (selectedUserId) params.userId = selectedUserId;

    if (timeline === "weekly") {
      const { from, to } = getCurrentIsoWeekBounds();
      params.from = toISODate(from);
      params.to = toISODate(to);
    } else if (timeline === "monthly") {
      const { from, to } = getCurrentMonthBounds();
      params.from = toISODate(from);
      params.to = toISODate(to);
    }

    try {
      const res = await exportTimeRegistrationsPdf(params);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const userPart = selectedUserId ? `user-${selectedUserId}-` : "";
      a.href = url;
      a.download = `time-registrations-${userPart}${timeline}-${new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[:T]/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Could not export filtered PDF", "error");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div>
          <label className="block text-sm mb-1">Timeline</label>
          <select
            className="border rounded px-3 py-2"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="monthly">This month</option>
            <option value="weekly">This week (Mon–Sun)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Person</label>
          <select
            className="border rounded px-3 py-2 min-w-[220px]"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">All people</option>
            {people.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => exportPdfAll()}
              className="px-3 py-2 rounded bg-slate-700 text-white"
            >
              Export PDF (All)
            </button>
            <button
              onClick={() => exportPdfAll("Ongoing")}
              className="px-3 py-2 rounded bg-indigo-600 text-white"
            >
              Export PDF (Ongoing)
            </button>

            <button
              onClick={exportPdfCurrentView}
              className="px-3 py-2 rounded bg-emerald-600 text-white"
              title="Downloads a PDF based on the current timeline and selected person"
            >
              Export PDF (Current View)
            </button>
          </div>
        )}
      </div>

      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={filteredRows}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, flex: 1 }}
          getRowClass={(p) =>
            p.data?.status === "Declined"
              ? "bg-red-50"
              : p.data?.status === "Accepted"
              ? "bg-green-50"
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default UserOverview;
