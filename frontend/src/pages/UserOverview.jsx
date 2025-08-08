import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { getAllTimeRegistrations } from "../api/authAPI";
import { GetTimeRegistrationsForUser } from "../api/authAPI";
import Swal from "sweetalert2";

ModuleRegistry.registerModules([AllCommunityModule]);

const UserOverview = () => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles =
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        const isAdmin = Array.isArray(roles)
          ? roles.includes("Admin")
          : roles === "Admin";

        const response = isAdmin
          ? await getAllTimeRegistrations()
          : await GetTimeRegistrationsForUser();

        setRowData(response.data);
      } catch (err) {
        console.error("Failed to fetch time registrations", err);
        Swal.fire("Error", "Could not load data", "error");
      }
    };
    fetchData();
  }, []);

  const columnDefs = useMemo(() => {
    return [
      { field: "id", headerName: "ID", sortable: true, filter: true },
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
        editable: true,
      },
    ];
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{ resizable: true, flex: 1 }}
      />
    </div>
  );
};

export default UserOverview;
