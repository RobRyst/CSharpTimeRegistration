import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  GetAllProjects,
  createProject,
  updateProject,
  deleteProjectById,
} from "../api/authAPI";
import Swal from "sweetalert2";

const ActionButtons = memo((props) => {
  const { data, context } = props;
  if (!context?.isAdmin) return null;

  return (
    <div className="flex gap-2">
      <button
        className="px-2 py-1 text-xs rounded bg-amber-600 text-white"
        onClick={() => context.onEditRow(data)}
      >
        Edit
      </button>
      <button
        className="px-2 py-1 text-xs rounded bg-red-600 text-white"
        onClick={() => context.onDeleteRow(data)}
      >
        Delete
      </button>
    </div>
  );
});

const Projects = () => {
  const [rowData, setRowData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles =
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        setIsAdmin(
          Array.isArray(roles) ? roles.includes("Admin") : roles === "Admin"
        );
      } catch {
        console.log("Error");
      }
    }

    (async () => {
      try {
        const response = await GetAllProjects();
        setRowData(response.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        Swal.fire("Error", "Could not load projects", "error");
      }
    })();
  }, []);

  const reload = useCallback(async () => {
    const response = await GetAllProjects();
    setRowData(response.data);
  }, []);

  const onAdd = useCallback(async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add Project",
      html: `
        <input id="p-name" class="swal2-input" placeholder="Name" />
        <input id="p-desc" class="swal2-input" placeholder="Description" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("p-name").value.trim();
        const description = document.getElementById("p-desc").value.trim();
        if (!name) {
          Swal.showValidationMessage("Name is required");
          return;
        }
        return { name, description };
      },
      confirmButtonText: "Create",
      showCancelButton: true,
    });
    if (!formValues) return;

    try {
      await createProject({
        name: formValues.name,
        description: formValues.description || null,
      });
      await reload();
      Swal.fire("Created", "Project created successfully", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create project", "error");
    }
  }, [reload]);

  const onEditRow = useCallback(
    async (row) => {
      const { value: formValues } = await Swal.fire({
        title: "Edit Project",
        html: `
          <input id="p-name" class="swal2-input" placeholder="Name" value="${
            row.name ?? ""
          }" />
          <input id="p-desc" class="swal2-input" placeholder="Description" value="${
            row.description ?? ""
          }" />
          <input id="p-status" class="swal2-input" placeholder="Status (Pending/Ongoing/Completed/Cancelled)" value="${
            row.status ?? ""
          }" />
        `,
        focusConfirm: false,
        preConfirm: () => {
          const name = document.getElementById("p-name").value.trim();
          const description = document.getElementById("p-desc").value.trim();
          const status = document.getElementById("p-status").value.trim();
          if (!name) {
            Swal.showValidationMessage("Name is required");
            return;
          }
          return { name, description, status: status || null };
        },
        confirmButtonText: "Save",
        showCancelButton: true,
      });
      if (!formValues) return;

      try {
        await updateProject(row.id, {
          name: formValues.name,
          description: formValues.description,
          status: formValues.status,
        });
        await reload();
        Swal.fire("Saved", "Project updated", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to update project", "error");
      }
    },
    [reload]
  );

  const onDeleteRow = useCallback(
    async (row) => {
      const res = await Swal.fire({
        title: "Delete project?",
        text: `This will remove "${row.name}".`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
      });
      if (!res.isConfirmed) return;

      try {
        await deleteProjectById(row.id);
        await reload();
        Swal.fire("Deleted", "Project removed", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete project", "error");
      }
    },
    [reload]
  );

  const columnDefs = useMemo(() => {
    const base = [
      {
        field: "id",
        headerName: "ID",
        sortable: true,
        filter: true,
        maxWidth: 110,
      },
      {
        field: "name",
        headerName: "Project Name",
        sortable: true,
        filter: true,
      },
      {
        field: "description",
        headerName: "Description",
        sortable: true,
        filter: true,
      },
      { field: "status", headerName: "Status", sortable: true, filter: true },
    ];
    if (isAdmin) {
      base.push({
        headerName: "Actions",
        field: "actions",
        sortable: false,
        filter: false,
        cellRenderer: ActionButtons,
        pinned: "right",
        width: 160,
        suppressMenu: true,
      });
    }
    return base;
  }, [isAdmin]);

  const defaultColDef = useMemo(() => ({ resizable: true, flex: 1 }), []);

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            Add Project
          </button>
        </div>
      )}

      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          context={{ isAdmin, onEditRow, onDeleteRow }}
          rowSelection={undefined}
          suppressRowClickSelection={true}
          getRowId={(p) => String(p.data.id)}
        />
      </div>
    </div>
  );
};

export default Projects;
