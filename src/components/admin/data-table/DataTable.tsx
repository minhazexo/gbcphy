// Admin UI - DataTable

import React, { useMemo, useState } from "react";
import "./DataTable.scss";

interface DataTableColumn {
  key: string;
  label: string;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: string;
  render?: (row: any) => React.ReactNode | null;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  pageSize?: number;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginatable?: boolean;
  rowActions?: {
    label: string;
    icon: React.ReactNode;
    variant?: string;
    onClick: (row: any) => void;
  }[] | null;
  itemId?: string;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  className?: string;
  "aria-label"?: string;
}

const DataTable = ({
  columns,
  data,
  loading = false,
  pageSize = 10,
  searchable = true,
  sortable = true,
  paginatable = true,
  rowActions = null,
  itemId = "id",
  emptyState,
  className = "",
  "aria-label": ariaLabel = "Data table"
}: DataTableProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const searchableColumns = columns.filter((c) => c.searchable !== false);

  const filteredData = useMemo(() => {
    let result = data;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter((row) =>
        searchableColumns.some((col) => {
          const val = col.render ? col.render(row) : row[col.key];
          return String(val ?? "").toLowerCase().includes(term);
        })
      );
    }
    if (sort) {
      result = [...result].sort((a, b) => {
        const av = sort.key && (a as any)[sort.key];
        const bv = sort.key && (b as any)[sort.key];
        if (av < bv) return sort.dir === "asc" ? -1 : 1;
        if (av > bv) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, search, sort, searchableColumns]);

  const totalPages = Math.max(Math.ceil(filteredData.length / pageSize), 1);
  const currentPageData = paginatable
    ? filteredData.slice((page - 1) * pageSize, page * pageSize)
    : filteredData;

  const classes = ["admin-data-table", className].filter(Boolean).join(" ");

  if (loading) {
    return (
      <div className={classes}>
        <div className="admin-data-table__loading">Loading...</div>
      </div>
    );
  }

  if (filteredData.length === 0 && emptyState) {
    return (
      <div className={classes}>
        <div className="admin-data-table__empty">
          {emptyState.icon && <div className="admin-data-table__empty-icon">{emptyState.icon}</div>}
          <h3 className="admin-data-table__empty-title">{emptyState.title}</h3>
          {emptyState.description && <p className="admin-data-table__empty-desc">{emptyState.description}</p>}
          {emptyState.action && <div className="admin-data-table__empty-action">{emptyState.action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={classes} aria-label={ariaLabel}>
      {searchable && (
        <div className="admin-data-table__search">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-data-table__search-input"
          />
        </div>
      )}
      <table className="admin-data-table__table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`admin-data-table__th ${col.align ? `admin-data-table__th--${col.align}` : ""}`}
                onClick={col.sortable !== false && sortable ? () => {
                  setSort((prev) => {
                    if (prev?.key === col.key) {
                      return { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" };
                    }
                    return { key: col.key, dir: "asc" };
                  });
                } : undefined}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
                {col.sortable !== false && sortable && (
                  <span className="admin-data-table__sort-indicator">
                    {sort?.key === col.key ? (sort.dir === "asc" ? "\u25B2" : "\u25BC") : ""}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentPageData.map((row) => {
            const rowId = itemId && row[itemId] ? String(row[itemId]) : Math.random().toString();
            return (
              <tr key={rowId} className="admin-data-table__tr">
                {columns.map((col) => {
                  const cellContent = col.render ? col.render(row) : row[col.key];
                  return (
                    <td
                      key={col.key}
                      className={`admin-data-table__td ${col.align ? `admin-data-table__td--${col.align}` : ""}`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
                {rowActions && (
                  <td className="admin-data-table__td admin-data-table__td--actions">
                    <div className="admin-data-table__actions">
                      {rowActions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          className={`admin-data-table__action-btn admin-data-table__action--${action.variant || "ghost"}`}
                          onClick={() => action.onClick(row)}
                          aria-label={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {paginatable && totalPages > 1 && (
        <div className="admin-data-table__pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="admin-data-table__page-btn"
          >
            Prev
          </button>
          <span className="admin-data-table__page-info">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="admin-data-table__page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
