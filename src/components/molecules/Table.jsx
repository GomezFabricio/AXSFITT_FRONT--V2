import React, { useEffect } from "react";
import PropTypes from "prop-types";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

// Estilos extra para mejorar la apariencia
const customTableStyles = `
  #datatable {
    border-radius: 12px !important;
    overflow: hidden;
    background: #f8fafc;
  }
  #datatable thead th {
    background: #ede9fe !important;
    color: #7c3aed !important;
    font-weight: 700;
    font-size: 1rem;
    border-bottom: 2px solid #a5b4fc !important;
    padding: 12px 8px !important;
  }
  #datatable tbody td {
    background: #fff;
    color: #444;
    font-size: 0.98rem;
    padding: 10px 8px !important;
    border-bottom: 1px solid #e5e7eb !important;
  }
  #datatable tbody tr:hover td {
    background: #f3f4f6 !important;
    transition: background 0.2s;
  }
  #datatable_wrapper .dataTables_paginate .paginate_button {
    background: #ede9fe !important;
    color: #7c3aed !important;
    border-radius: 6px !important;
    margin: 0 2px !important;
    border: none !important;
  }
  #datatable_wrapper .dataTables_paginate .paginate_button.current {
    background: #7c3aed !important;
    color: #fff !important;
  }
  #datatable_wrapper .dataTables_filter input {
    border-radius: 6px;
    border: 1px solid #a5b4fc;
    padding: 4px 8px;
    margin-left: 6px;
  }
`;

if (typeof window !== "undefined") {
  window.jQuery = $;
  window.$ = $;
}

const Table = ({ columns, data, options = {} }) => {
  useEffect(() => {
    // Inyecta los estilos personalizados solo una vez
    if (!document.getElementById("custom-dt-styles")) {
      const style = document.createElement("style");
      style.id = "custom-dt-styles";
      style.innerHTML = customTableStyles;
      document.head.appendChild(style);
    }

    const table = $("#datatable").DataTable({
      data,
      columns,
      responsive: true,
      ...options,
      columnDefs: [
        { targets: "_all", className: "dt-center" },
        ...(options.columnDefs || [])
      ]
    });

    return () => {
      table.destroy(true);
    };
  }, [columns, data, options]);

  return (
    <div className="py-6">
      <div className="rounded-xl shadow-lg bg-white p-6 w-[95%] mx-auto border border-violet-200">
        <table id="datatable" className="display" style={{ width: "100%" }}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ textAlign: "center" }}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  options: PropTypes.object,
};

export default Table;