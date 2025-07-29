import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo, useState } from "react";
ModuleRegistry.registerModules([AllCommunityModule]);

const UserOverview = () => {
  const [rowData, setRowData] = useState([]);

  const columnDefs = useMemo(() => {
    const onDeleteSuccess = (deletedId) => {
      setRowData((prev) => prev.filter((row) => row.id !== deletedId));
    };

    return [
      { field: "id", headerName: "Id", sortable: true, filter: true },
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
      { field: "status", headerName: "Status", sortable: true, filter: true },
      {
        headerName: "Actions",
        cellRenderer: "actionCellRenderer",
        maxWidth: 160,
        flex: 0,
        cellRendererParams: { onDeleteSuccess },
        sortable: false,
        filter: false,
      },
    ];
  }, []);

  return (
    <>
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, flex: 1 }}
        />
      </div>
    </>
  );
};

export default UserOverview;
