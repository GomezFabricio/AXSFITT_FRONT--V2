import React, { useEffect } from "react";
import PropTypes from "prop-types";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

if (typeof window !== "undefined") {
  window.jQuery = $;
  window.$ = $;
}

const Table = ({ columns, data, options = {} }) => {
  useEffect(() => {
    const table = $("#datatable").DataTable({
      data,
      columns,
      responsive: true,
      ...options,
    });

    return () => {
      table.destroy(true);
    };
  }, [columns, data, options]);

  return (
    <div className="py-6">
      <div className="rounded-lg shadow bg-white p-4 w-[90%] mx-auto">
        <table id="datatable" className="display">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.title}</th>
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
