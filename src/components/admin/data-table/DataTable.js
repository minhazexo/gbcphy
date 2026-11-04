import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaSearch,
  FaSortUp,
  FaSortDown,
  FaEllipsisV,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaTimes
} from "react-icons/fa";
import Button from "../ui/Button.js";
import Input from "../ui/Input.js";
import Select from "../ui/Select.js";
import Skeleton from "../ui/Skeleton.js";
import EmptyState from "../ui/EmptyState.js";
import Dropdown from "../ui/Dropdown.js";
import Separator from "../ui/Separator.js";
import Checkbox from "../ui/Checkbox.js";
import "./DataTable.scss";

const PAGE_SIZES = [10, 25, 50, 100];
const DEBOUNCE_MS = 300;
const MAX_ENUM_VALUES = 15;
const SKELETON_ROWS = 5;

const DataTable = ({
  columns,
  data,
  loading = false,
  pageSize: initialPageSize = 10,
  searchable = true,
  filterable = true,
  sortable = true,
  paginatable = true,
  rowActions,
  bulkActions,
  emptyState,
  className,
  onRowClick,
  selectable = false,
  onSelectionChange,
  itemId = "id",
  "aria-label": ariaLabel = "Data table"
}) => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeRowId, setActiveRowId] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    onSelectionChange?.([]);
  }, [data, columns, onSelectionChange]);

  const searchableColumns = useMemo(
    () => columns.filter((column) => column.searchable !== false),
    [columns]
  );

  const filterControls = useMemo(() => {
    const map = {};
    columns.forEach((column) => {
      if (!filterable || column.filterable === false) return;
      if (column.filterOptions) {
        map[column.key] = { type: "select", options: column.filterOptions };
        return;
      }
      const values = new Set();
      data.forEach((row) => {
        const value = row[column.key];
        if (value !== undefined && value !== null && value !== "") {
          values.add(String(value));
        }
      });
      map[column.key] =
        values.size > 0 && values.size <= MAX_ENUM_VALUES
          ? { type: "select", options: [...values] }
          : { type: "input" };
    });
    return map;
  }, [data, columns, filterable]);

  const filteredData = useMemo(() => {
    let result = data;
    const query = debouncedSearch.trim().toLowerCase();
    if (query && searchable) {
      result = result.filter((row) =>
        searchableColumns.some((column) => {
          const value = row[column.key];
          return value != null && String(value).toLowerCase().includes(query);
        })
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value === "" || value == null) return;
      const control = filterControls[key] ?? {};
      result = result.filter((row) => {
        const cell = row[key];
        if (cell == null) return false;
        if (control.type === "select") {
          return String(cell) === String(value);
        }
        return String(cell).toLowerCase().includes(String(value).toLowerCase());
      });
    });
    return result;
  }, [data, debouncedSearch, filters, searchable, searchableColumns, filterControls]);

  const sortedData = useMemo(() => {
    if (!sortable || !sort.key) return filteredData;
    const column = columns.find((c) => c.key === sort.key);
    const key = column && column.sortBy ? column.sortBy : sort.key;
    return [...filteredData].sort((a, b) => {
      let av = a[key] ?? "";
      let bv = b[key] ?? "";
      if (typeof av === "string" || typeof bv === "string") {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return sort.direction === "asc" ? -1 : 1;
      if (av > bv) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortable, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const paginated = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = sortedData.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, sortedData.length);

  const isSelected = (id) => selectedIds.has(id);
  const selectedRows = data.filter((row) => isSelected(row[itemId]));
  const allPageSelected =
    selectable && paginated.length > 0 && paginated.every((row) => isSelected(row[itemId]));
  const somePageSelected = selectable && paginated.some((row) => isSelected(row[itemId]));
  const hasSelection = selectedIds.size > 0;

  const toggleSelection = useCallback((id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      onSelectionChange?.([...next]);
      return next;
    });
  }, [onSelectionChange]);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paginated.forEach((row) => next.delete(row[itemId]));
      } else {
        paginated.forEach((row) => next.add(row[itemId]));
      }
      onSelectionChange?.([...next]);
      return next;
    });
  }, [allPageSelected, paginated, itemId, onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const handleSort = useCallback((key) => {
    setPage(1);
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" };
    });
  }, []);

  const handleRowClick = useCallback((row, event) => {
    if (
      event.target.closest(
        "button, a, input, select, textarea, [role='menu'], [role='checkbox'], .data-table__row-actions"
      )
    ) {
      return;
    }
    setActiveRowId(row[itemId]);
    onRowClick?.(row);
  }, [onRowClick, itemId]);

  const handleTableKeyDown = useCallback((event) => {
    if (!paginated.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedRowIndex((index) => Math.min(index + 1, paginated.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedRowIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const row = paginated[focusedRowIndex];
      if (row) handleRowClick(row, event);
    }
  }, [paginated, focusedRowIndex, handleRowClick]);

  const goToPage = useCallback(
    (nextPage) => setPage(Math.min(Math.max(nextPage, 1), totalPages)),
    [totalPages]
  );

  const renderPageButtons = useCallback(() => {
    const buttons = [];
    let previous = 0;
    const push = (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      if (buttons.length && pageNumber - previous > 1) {
        buttons.push(
          <span
            key="ellipsis"
            className="data-table__pagination-ellipsis"
            aria-hidden="true"
          >
            &hellip;
          </span>
        );
      }
      buttons.push(
        <Button
          key={pageNumber}
          size="sm"
          variant={currentPage === pageNumber ? "primary" : "outline"}
          onClick={() => goToPage(pageNumber)}
          aria-label={`Page ${pageNumber}`}
          aria-current={currentPage === pageNumber ? "page" : undefined}
        >
          {pageNumber}
        </Button>
      );
      previous = pageNumber;
    };
    push(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p += 1) push(p);
    push(totalPages);
    return buttons;
  }, [currentPage, totalPages, goToPage]);

  const renderCell = useCallback((row, column, index) => {
    if (column.render) {
      return column.render(row, { row, index });
    }
    const value = row[column.key];
    if (value == null) return <span className="data-table__cell-placeholder">—</span>;
    return <span className="data-table__cell-value">{value}</span>;
  }, []);

  const classes = [
    "data-table",
    isMobile && "data-table--mobile",
    className || ""
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} ref={containerRef} role="region" aria-label={ariaLabel}>
      <div className="data-table__header">
        <div className="data-table__search">
          {searchable && (
            <Input
              leftIcon={<FaSearch />}
              placeholder="Search records…"
              value={searchText}
              onChange={(value) => {
                setSearchText(value);
                setPage(1);
              }}
              size="sm"
              aria-label="Search table data"
              helper={debouncedSearch ? `${filteredData.length} matching record(s)` : undefined}
            />
          )}
          {Object.keys(filters).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
              aria-label="Clear filters"
            >
              <FaTimes /> Clear filters
            </Button>
          )}
        </div>
        <div className="data-table__filters">
          {filterable &&
            Object.entries(filterControls).map(([key, control]) => {
              const column = columns.find((c) => c.key === key);
              if (!column) return null;
              const current = filters[key] ?? "";
              return (
                <div key={key} className="data-table__filter-control" style={{ minWidth: 150 }}>
                  {control.type === "select" ? (
                    <Select
                      label={column.label}
                      value={current}
                      onChange={(value) => {
                        setFilters((prev) => ({ ...prev, [key]: value }));
                        setPage(1);
                      }}
                      options={control.options.map((option) => ({ label: option, value: option }))}
                      placeholder={`Filter by ${column.label}`}
                      size="sm"
                      aria-label={`Filter by ${column.label}`}
                    />
                  ) : (
                    <Input
                      label={column.label}
                      value={current}
                      onChange={(value) => {
                        setFilters((prev) => ({ ...prev, [key]: value }));
                        setPage(1);
                      }}
                      placeholder={`Filter by ${column.label}`}
                      size="sm"
                      aria-label={`Filter by ${column.label}`}
                    />
                  )}
                </div>
              );
            })}
        </div>
        <div className="data-table__actions">
          {selectable && hasSelection && (
            <span className="data-table__selected-summary">{selectedIds.size} selected</span>
          )}
          {selectable && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={!hasSelection}
              aria-label="Clear selection"
            >
              Clear selection
            </Button>
          )}
          {selectable && hasSelection && <Separator orientation="vertical" />}
          <Button variant="primary" size="sm" icon={<FaPlus />}>
            Add record
          </Button>
        </div>
      </div>

      {!loading && sortedData.length === 0 ? (
        <div className="data-table__empty" role="region" aria-label={emptyState?.title || "No records found"}>
          <EmptyState
            icon={emptyState?.icon}
            title={emptyState?.title || "No records found"}
            description={emptyState?.description}
            action={emptyState?.action}
          />
        </div>
      ) : (
        <div className="data-table__table">
          <table role="table" aria-label={ariaLabel} cellPadding={0} cellSpacing={0}>
            <thead className="data-table__thead">
              <tr className="data-table__thead-row">
                {selectable && (
                  <th className="data-table__thead-cell" style={{ width: 44 }} scope="col">
                    <Checkbox
                      id="data-table-select-all"
                      checked={allPageSelected}
                      indeterminate={somePageSelected && !allPageSelected}
                      onChange={(event) => {
                        event.stopPropagation();
                        toggleSelectAll();
                      }}
                      aria-label="Select all rows on this page"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={[
                      "data-table__thead-cell",
                      column.sortable !== false && sortable && "data-table__thead-cell--sortable",
                      sort.key === column.key && `data-table__thead-cell--sorted--${sort.direction}`,
                      column.align && `data-table__thead-cell--align-${column.align}`
                    ].filter(Boolean).join(" ")}
                    scope="col"
                    style={{ width: column.width, textAlign: column.align }}
                    role={column.sortable !== false && sortable ? "button" : undefined}
                    tabIndex={column.sortable !== false && sortable ? 0 : undefined}
                    aria-sort={
                      sort.key === column.key
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    aria-label={`Sort by ${column.label}`}
                    onClick={column.sortable !== false && sortable ? () => handleSort(column.key) : undefined}
                    onKeyDown={(event) => {
                      if (!sortable || column.sortable === false) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSort(column.key);
                      }
                    }}
                  >
                    <span className="data-table__cell-label">{column.label}</span>
                    {sort.key === column.key && (
                      <span className="data-table__sort-indicator" aria-hidden="true">
                        {sort.direction === "asc" ? <FaSortUp /> : <FaSortDown />}
                      </span>
                    )}
                  </th>
                ))}
                {rowActions && (
                  <th className="data-table__thead-cell" scope="col" style={{ width: 120 }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={currentPage}
                className="data-table__tbody"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onKeyDown={handleTableKeyDown}
                role="rowgroup"
              >
                {loading ? (
                  [...Array(SKELETON_ROWS)].map((_, index) => (
                    <motion.tr
                      key={`skeleton-${index}`}
                      className="data-table__tbody-row data-table__skeleton-row"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {selectable && (
                        <td className="data-table__tbody-cell data-table__tbody-cell--check">
                          <div className="data-table__skeleton"><Skeleton width="40%" height="1rem" /></div>
                        </td>
                      )}
                      {columns.map((_, colIndex) => (
                        <td key={colIndex} className="data-table__tbody-cell">
                          <div className="data-table__skeleton"><Skeleton width="100%" height="1rem" /></div>
                        </td>
                      ))}
                      {rowActions && (
                        <td className="data-table__tbody-cell data-table__tbody-cell--actions">
                          <div className="data-table__skeleton" style={{ width: 80 }}>
                            <Skeleton width="100%" height="1rem" />
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                ) : (
                  paginated.map((row, index) => {
                    const id = row[itemId];
                    const checked = isSelected(id);
                    const active = activeRowId === id;
                    return (
                      <motion.tr
                        key={id}
                        className={[
                          "data-table__tbody-row",
                          selectable && "data-table__tbody-row--selectable",
                          active && "data-table__tbody-row--active",
                          checked && "data-table__tbody-row--selected"
                        ].filter(Boolean).join(" ")}
                        role="row"
                        tabIndex={focusedRowIndex === index ? 0 : -1}
                        aria-rowindex={index + 1}
                        aria-selected={selectable ? checked : undefined}
                        whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.06)" }}
                        whileTap={{ opacity: 0.9 }}
                        transition={{ duration: 0.15 }}
                        onClick={(event) => handleRowClick(row, event)}
                      >
                        {selectable && (
                          <td className="data-table__tbody-cell data-table__tbody-cell--check">
                            <Checkbox
                              id={`data-table-row-${id}`}
                              checked={checked}
                              onChange={(event) => {
                                event.stopPropagation();
                                toggleSelection(id, event.target.checked);
                              }}
                              aria-label={`Select row ${String(id)}`}
                            />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className="data-table__tbody-cell"
                            data-label={column.label}
                            style={{ textAlign: column.align }}
                          >
                            {renderCell(row, column, index)}
                          </td>
                        ))}
                        {rowActions && (
                          <td className="data-table__tbody-cell data-table__tbody-cell--actions">
                            <div className="data-table__row-actions">
                              <Dropdown
                                trigger={
                                  <Button variant="ghost" size="sm" aria-label={`Actions for row ${index + 1}`}>
                                    <FaEllipsisV />
                                  </Button>
                                }
                                align="end"
                              >
                                {rowActions.map((action, actionIndex) => {
                                  const visible =
                                    typeof action.visible === "function"
                                      ? action.visible(row)
                                      : action.visible !== false;
                                  if (!visible) return null;
                                  return (
                                    <Button
                                      key={`${action.label}-${actionIndex}`}
                                      type="button"
                                      variant={action.variant || "ghost"}
                                      size="sm"
                                      fullWidth
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        action.onClick?.(row, event);
                                      }}
                                    >
                                      {action.icon && (
                                        <span className="data-table__row-action-icon" aria-hidden="true">
                                          {action.icon}
                                        </span>
                                      )}
                                      {action.label}
                                    </Button>
                                  );
                                })}
                              </Dropdown>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      )}

      {selectable && hasSelection && (
        <div className="data-table__bulk-toolbar">
          <span className="data-table__bulk-count">
            {selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
          </span>
          {bulkActions?.map((action) => (
            <Button
              key={action.label}
              variant="primary"
              size="sm"
              onClick={() => {
                action.onClick?.(selectedRows);
                clearSelection();
              }}
            >
              {action.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear selection
          </Button>
        </div>
      )}

      {paginatable && sortedData.length > 0 && (
        <div className="data-table__pagination">
          <div className="data-table__pagination-info">
            {startIndex}&ndash;{endIndex} of {sortedData.length}
          </div>
          <div className="data-table__pagination-controls">
            <Button
              size="sm"
              variant="outline"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              First
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <FaArrowLeft />
            </Button>
            {renderPageButtons()}
            <Button
              size="sm"
              variant="outline"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <FaArrowRight />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              Last
            </Button>
            <Separator orientation="vertical" />
            <span className="data-table__pagination-label">Rows per page</span>
            <Select
              value={String(pageSize)}
              onChange={(value) => {
                setPageSize(Number(value) || 10);
                setPage(1);
              }}
              options={PAGE_SIZES.map((size) => ({ label: `${size} / page`, value: String(size) }))}
              placeholder="10 per page"
              size="sm"
              aria-label="Rows per page"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;



