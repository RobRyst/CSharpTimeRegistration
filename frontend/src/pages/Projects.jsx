import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  GetAllProjects,
  createProject,
  updateProject,
  deleteProjectById,
} from "../api/authAPI";
import Swal from "sweetalert2";

const Projects = () => {
  const [rowData, setRowData] = useState([]);
  const [selected, setSelected] = useState(null);
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
        // ignore
      }
    }

    const fetchData = async () => {
      try {
        // ✅ everyone uses /Project/all
        const response = await GetAllProjects();
        setRowData(response.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        Swal.fire("Error", "Could not load projects", "error");
      }
    };
    fetchData();
  }, []);

  const columnDefs = useMemo(
    () => [
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
    ],
    []
  );

  const defaultColDef = useMemo(() => ({ resizable: true, flex: 1 }), []);

  const onSelectionChanged = (e) => {
    const rows = e.api.getSelectedRows();
    setSelected(rows?.[0] ?? null);
  };

  const reload = async () => {
    const response = await GetAllProjects();
    setRowData(response.data);
    setSelected(null);
  };

  const onAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add Project",
      html: `
        <input id="p-name" class="swal2-input" placeholder="Name" />
        <input id="p-desc" class="swal2-input" placeholder="Description" />
        <input id="p-status" class="swal2-input" placeholder="Status (optional)" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("p-name").value.trim();
        const description = document.getElementById("p-desc").value.trim();
        // const status = document.getElementById("p-status").value.trim();
        if (!name) {
          Swal.showValidationMessage("Name is required");
          return;
        }
        return { name, description /*, status: status || null */ };
      },
      confirmButtonText: "Create",
      showCancelButton: true,
    });
    if (!formValues) return;

    try {
      await createProject({
        name: formValues.name,
        description: formValues.description || null,
        // include status only if your CreateProjectDto supports it
      });
      await reload();
      Swal.fire("Created", "Project created successfully", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create project", "error");
    }
  };

  const onEdit = async () => {
    if (!selected) {
      Swal.fire("Select a row", "Choose a project to edit", "info");
      return;
    }
    const { value: formValues } = await Swal.fire({
      title: "Edit Project",
      html: `
        <input id="p-name" class="swal2-input" placeholder="Name" value="${
          selected.name ?? ""
        }" />
        <input id="p-desc" class="swal2-input" placeholder="Description" value="${
          selected.description ?? ""
        }" />
        <input id="p-status" class="swal2-input" placeholder="Status (optional)" value="${
          selected.status ?? ""
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
      await updateProject(selected.id, {
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
  };

  const onDelete = async () => {
    if (!selected) {
      Swal.fire("Select a row", "Choose a project to delete", "info");
      return;
    }
    const res = await Swal.fire({
      title: "Delete project?",
      text: `This will remove "${selected.name}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await deleteProjectById(selected.id);
      await reload();
      Swal.fire("Deleted", "Project removed", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete project", "error");
    }
  };

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            Add
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded bg-amber-600 text-white"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      )}

      {/* ✅ AG Grid needs a themed container with an explicit height */}
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          // ✅ new selection API; no column checkboxSelection props needed
          rowSelection={
            isAdmin ? { mode: "single", checkboxes: true } : undefined
          }
          onSelectionChanged={isAdmin ? onSelectionChanged : undefined}
        />
      </div>
    </div>
  );
};

export default Projects;
