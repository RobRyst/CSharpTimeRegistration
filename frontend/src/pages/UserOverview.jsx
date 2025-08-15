import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  getAllTimeRegistrations,
  GetTimeRegistrationsForUser,
  updateTimeStatus,
  exportProjectsPdf,
} from "../api/authAPI";
import Swal from "sweetalert2";

ModuleRegistry.registerModules([AllCommunityModule]);

const UserOverview = () => {
  const [rowData, setRowData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Missing token");

    const payload = JSON.parse(atob(token.split(".")[1]));
    const roles =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const admin = Array.isArray(roles)
      ? roles.includes("Admin")
      : roles === "Admin";
    setIsAdmin(admin);

    const response = admin
      ? await getAllTimeRegistrations()
      : await GetTimeRegistrationsForUser();
    setRowData(response.data);
  };

  useEffect(() => {
    load().catch((err) => {
      console.error("Failed to fetch time registrations", err);
      Swal.fire("Error", "Could not load data", "error");
    });
  }, []);

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
    if (!isAdmin) {
      return <span>{status}</span>;
    }
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

  const columnDefs = useMemo(
    () => [
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
        cellRenderer: StatusCell, // read-only for users, actions for admin
      },
    ],
    [isAdmin]
  );
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
        <div className="flex gap-2">
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
