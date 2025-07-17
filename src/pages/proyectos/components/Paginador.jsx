// src/components/Paginador.jsx
import React from "react";
import "./Paginador.css";

export default function Paginador({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  rowsPerPageOptions = [10, 20, 50, 100],
}) {
  const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);

  return (
    <div className="pag-root">
      <button className="pag-btn" onClick={() => onChangePage(0)} disabled={page === 0} title="Primera página">
        «
      </button>
      <button className="pag-btn" onClick={() => onChangePage(page - 1)} disabled={page === 0} title="Anterior">
        ‹
      </button>
      <span className="pag-info">
        {from}-{to} de {count}
      </span>
      <button className="pag-btn" onClick={() => onChangePage(page + 1)} disabled={page >= lastPage} title="Siguiente">
        ›
      </button>
      <button
        className="pag-btn"
        onClick={() => onChangePage(lastPage)}
        disabled={page >= lastPage}
        title="Última página"
      >
        »
      </button>
      <select className="pag-select" value={rowsPerPage} onChange={(e) => onChangeRowsPerPage(Number(e.target.value))}>
        {rowsPerPageOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt} por página
          </option>
        ))}
      </select>
    </div>
  );
}
