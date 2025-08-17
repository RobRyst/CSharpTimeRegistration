import { useEffect, useMemo, useState, useCallback } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  getAllTimeRegistrations,
  GetTimeRegistrationsForUser,
  updateTimeStatus,
  exportProjectsPdf,
  updateTimeRegistration,
} from "../api/authAPI";
import Swal from "sweetalert2";

ModuleRegistry.registerModules([AllCommunityModule]);

const UserOverview = () => {
  const [rowData, setRowData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

    const d = new Date(row.date);
    const today = new Date();
    const toUTCDate = (dt) =>
      Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.abs(
      Math.floor((toUTCDate(today) - toUTCDate(d)) / (24 * 60 * 60 * 1000))
    );
    if (diffDays > 30) return false;

    return true;
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
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
    const cols = [
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
        suppressMenu: true,
      },
    ];
    return cols;
  }, [isAdmin, currentUserId]);

  const exportPdf = async (status) => {
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

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
      {isAdmin && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => exportPdf()}
            className="px-3 py-2 rounded bg-slate-700 text-white"
          >
            Export PDF (All)
          </button>
          <button
            onClick={() => exportPdf("Ongoing")}
            className="px-3 py-2 rounded bg-indigo-600 text-white"
          >
            Export PDF (Ongoing)
          </button>
        </div>
      )}
      <AgGridReact
        rowData={rowData}
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
  );
};

export default UserOverview;
