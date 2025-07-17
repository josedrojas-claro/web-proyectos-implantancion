import React from "react";
import "./PaginadorNumerado.css";

function getPages(page, totalPages) {
  // page: 1-based (primera página es 1)
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  // Primera página
  pages.push(1);

  // ¿Insertar puntos antes del bloque dinámico?
  if (page > 4) pages.push("...");

  // Rango dinámico, máximo 3 páginas centrales
  let start = Math.max(2, page - 1);
  let end = Math.min(totalPages - 1, page + 1);

  // Si está cerca del inicio
  if (page <= 4) {
    start = 2;
    end = 4;
  }
  // Si está cerca del final
  if (page >= totalPages - 3) {
    start = totalPages - 3;
    end = totalPages - 1;
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // ¿Insertar puntos después del bloque dinámico?
  if (page < totalPages - 3) pages.push("...");

  // Última página
  pages.push(totalPages);

  return pages;
}

export default function PaginadorClaro({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  rowsPerPageOptions = [10, 20, 50, 100],
}) {
  const totalPages = Math.ceil(count / rowsPerPage);

  const goTo = (p) => {
    if (p >= 0 && p < totalPages) onChangePage(p);
  };

  const pages = getPages(page + 1, totalPages);

  return (
    <div className="claro-paginador">
      <button className="claro-btn" onClick={() => goTo(0)} disabled={page === 0}>
        «
      </button>
      <button className="claro-btn" onClick={() => goTo(page - 1)} disabled={page === 0}>
        ‹
      </button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span className="claro-dots" key={`dots-${idx}`}>
            ...
          </span>
        ) : (
          <button
            className={`claro-btn claro-page${p - 1 === page ? " active" : ""}`}
            key={`page-${p}`}
            onClick={() => goTo(p - 1)}
          >
            {p}
          </button>
        )
      )}

      <button className="claro-btn" onClick={() => goTo(page + 1)} disabled={page >= totalPages - 1}>
        ›
      </button>
      <button className="claro-btn" onClick={() => goTo(totalPages - 1)} disabled={page >= totalPages - 1}>
        »
      </button>
      <select
        className="claro-select"
        value={rowsPerPage}
        onChange={(e) => {
          onChangeRowsPerPage(Number(e.target.value));
          goTo(0);
        }}
      >
        {rowsPerPageOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt} / página
          </option>
        ))}
      </select>
    </div>
  );
}
