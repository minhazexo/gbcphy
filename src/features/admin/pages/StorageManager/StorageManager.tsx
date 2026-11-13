import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaCopy,
  FaDownload,
  FaEye,
  FaFileAlt,
  FaFileImage,
  FaFilePdf,
  FaFolder,
  FaFolderPlus,
  FaList,
  FaPen,
  FaSearch,
  FaSyncAlt,
  FaThLarge,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import AdminLayout, { useToast } from "../../../../layouts/AdminLayout";
import Button from "../../../../components/common/Button/Button.tsx";
import Modal from "../../../../components/common/Modal/Modal.tsx";
import { StorageApiError, r2StorageService } from "../../../../services/storage/r2.service.ts";
import type { StorageItem } from "../../../../services/storage/r2.types.ts";
import "./storage-manager.scss";

type ModalKind = "folder" | "rename" | "move" | "replace" | "delete" | "details" | "preview";
type UploadState = "queued" | "uploading" | "done" | "error";
interface UploadEntry {
  id: string;
  name: string;
  state: UploadState;
  error?: string;
}

const formatSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unit]}`;
};

const fileKind = (item: StorageItem): "pdf" | "image" | "other" => {
  if (item.contentType === "application/pdf" || item.name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (item.contentType.startsWith("image/")) return "image";
  return "other";
};

const fileIcon = (item: StorageItem) => {
  const kind = fileKind(item);
  if (kind === "pdf") return <FaFilePdf />;
  if (kind === "image") return <FaFileImage />;
  return <FaFileAlt />;
};

const parentPrefix = (key: string) => {
  const position = key.lastIndexOf("/");
  return position < 0 ? "" : key.slice(0, position + 1);
};

const basename = (key: string) => key.split("/").pop() || key;

export default function StorageManager() {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<StorageItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [prefix, setPrefix] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pdf" | "image" | "other">("all");
  const [sortBy, setSortBy] = useState<"name" | "size" | "modified">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<"grid" | "list">("list");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ kind: ModalKind; item?: StorageItem } | null>(null);
  const [modalValue, setModalValue] = useState("");
  const [working, setWorking] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadEntry[]>([]);

  const loadEntries = useCallback(async (nextCursor?: string | null, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const response = query.trim()
        ? await r2StorageService.searchFiles(query.trim(), prefix, nextCursor)
        : await r2StorageService.listFiles(prefix, nextCursor, 50);
      setItems((previous) => append ? [...previous, ...response.items] : response.items);
      setFolders(
        "prefixes" in response && Array.isArray(response.prefixes)
          ? response.prefixes as string[]
          : [],
      );
      setCursor(response.cursor);
      setHasMore(response.truncated);
    } catch (cause) {
      const message = cause instanceof StorageApiError
        ? cause.message
        : "Could not load the R2 bucket. Check the Worker configuration and try again.";
      setError(message);
      if (!append) {
        setItems([]);
        setFolders([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [prefix, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCursor(null);
      void loadEntries(null, false);
    }, query.trim() ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [loadEntries, query]);

  useEffect(() => {
    document.title = "Storage Manager | Department of Physics";
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => filter === "all" || fileKind(item) === filter);
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "size") comparison = a.size - b.size;
      else if (sortBy === "modified") comparison = Date.parse(a.lastModified) - Date.parse(b.lastModified);
      else comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [items, filter, sortBy, sortDirection]);

  const openModal = (kind: ModalKind, item?: StorageItem) => {
    setModal({ kind, item });
    setModalValue(kind === "rename" && item ? basename(item.key) : "");
  };

  const closeModal = () => {
    setModal(null);
    setModalValue("");
    setWorking(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const openPreview = async (item: StorageItem) => {
    if (fileKind(item) === "other") {
      openModal("details", item);
      return;
    }
    setWorking(true);
    try {
      const result = await r2StorageService.previewFile(item.key);
      setPreviewUrl(URL.createObjectURL(result.blob));
      setModal({ kind: "preview", item });
    } catch (cause) {
      addToast({ type: "error", title: "Preview failed", message: cause instanceof Error ? cause.message : "Could not preview this file." });
    } finally {
      setWorking(false);
    }
  };

  const download = async (item: StorageItem) => {
    try {
      const result = await r2StorageService.downloadFile(item.key);
      const blobUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = result.fileName || item.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (cause) {
      addToast({ type: "error", title: "Download failed", message: cause instanceof Error ? cause.message : "Could not download this file." });
    }
  };

  const copyUrl = async (item: StorageItem) => {
    if (!item.publicUrl) {
      addToast({ type: "warning", title: "Public URL unavailable", message: "A public base URL has not been enabled for this Worker." });
      return;
    }
    try {
      await navigator.clipboard.writeText(item.publicUrl);
      addToast({ type: "success", title: "URL copied", message: "The public file URL is on your clipboard." });
    } catch {
      addToast({ type: "error", title: "Copy failed", message: "Clipboard access was blocked by the browser." });
    }
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    const jobs = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      state: "queued" as UploadState,
    }));
    setUploadQueue((current) => [...jobs, ...current].slice(0, 20));

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const job = jobs[index];
      setUploadQueue((current) => current.map((entry) => entry.id === job.id ? { ...entry, state: "uploading" } : entry));
      try {
        await r2StorageService.uploadFile(file, `${prefix}${file.name}`);
        setUploadQueue((current) => current.map((entry) => entry.id === job.id ? { ...entry, state: "done" } : entry));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Upload failed.";
        setUploadQueue((current) => current.map((entry) => entry.id === job.id ? { ...entry, state: "error", error: message } : entry));
      }
    }
    await loadEntries(null, false);
  };

  const handleReplaceInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const target = modal?.kind === "replace" ? modal.item : null;
    if (!file || !target) return;

    setWorking(true);
    try {
      await r2StorageService.uploadFile(file, target.key, { overwrite: true, etag: target.etag });
      addToast({ type: "success", title: "File replaced", message: target.name });
      closeModal();
      await loadEntries(null, false);
    } catch (cause) {
      addToast({ type: "error", title: "Replace failed", message: cause instanceof Error ? cause.message : "Please try again." });
      setWorking(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void processFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void processFiles(event.dataTransfer.files);
  };

  const saveModal = async () => {
    if (!modal) return;
    setWorking(true);
    try {
      if (modal.kind === "folder") {
        const name = modalValue.trim().replace(/^\/+|\/+$/g, "");
        if (!name || name.includes("..") || name.includes("\\")) throw new Error("Enter a valid folder name.");
        await r2StorageService.createFolder(`${prefix}${name}/`);
        addToast({ type: "success", title: "Folder created", message: name });
      } else if ((modal.kind === "rename" || modal.kind === "move") && modal.item) {
        const destination = modal.kind === "rename"
          ? `${parentPrefix(modal.item.key)}${modalValue.trim()}`
          : modalValue.trim();
        if (!destination || destination.endsWith("/")) throw new Error("Enter a valid destination key.");
        if (modal.kind === "rename") await r2StorageService.renameFile(modal.item.key, destination);
        else await r2StorageService.moveFile(modal.item.key, destination);
        addToast({ type: "success", title: modal.kind === "rename" ? "File renamed" : "File moved", message: basename(destination) });
      }
      closeModal();
      await loadEntries(null, false);
    } catch (cause) {
      addToast({ type: "error", title: "Operation failed", message: cause instanceof Error ? cause.message : "Please try again." });
      setWorking(false);
    }
  };

  const confirmDelete = async () => {
    if (!modal?.item) return;
    setWorking(true);
    try {
      await r2StorageService.deleteFile(modal.item.key);
      addToast({ type: "success", title: "File deleted", message: modal.item.name });
      closeModal();
      await loadEntries(null, false);
    } catch (cause) {
      addToast({ type: "error", title: "Delete failed", message: cause instanceof Error ? cause.message : "Please try again." });
      setWorking(false);
    }
  };

  const changePrefix = (next: string) => {
    setPrefix(next);
    setQuery("");
    setFilter("all");
  };

  const breadcrumbs = prefix.split("/").filter(Boolean);

  const renderFileActions = (item: StorageItem) => {
    const canMutate = item.key.startsWith("Admin Uploads/");
    const protectedTitle = "Protected object: destructive actions are limited to Admin Uploads/";
    return (
    <div className="storage-manager__actions">
      <button type="button" title="Preview / details" aria-label={`Preview ${item.name}`} onClick={() => void openPreview(item)}><FaEye /></button>
      <button type="button" title="Download" aria-label={`Download ${item.name}`} onClick={() => void download(item)}><FaDownload /></button>
      <button type="button" title="Copy public URL" aria-label={`Copy URL for ${item.name}`} onClick={() => void copyUrl(item)}><FaCopy /></button>
      <button type="button" disabled={!canMutate} title={canMutate ? "Replace" : protectedTitle} aria-label={`Replace ${item.name}`} onClick={() => openModal("replace", item)}><FaSyncAlt /></button>
      <button type="button" disabled={!canMutate} title={canMutate ? "Rename" : protectedTitle} aria-label={`Rename ${item.name}`} onClick={() => openModal("rename", item)}><FaPen /></button>
      <button type="button" disabled={!canMutate} title={canMutate ? "Move" : protectedTitle} aria-label={`Move ${item.name}`} onClick={() => openModal("move", item)}><FaArrowLeft /></button>
      <button type="button" disabled={!canMutate} title={canMutate ? "Delete" : protectedTitle} aria-label={`Delete ${item.name}`} onClick={() => openModal("delete", item)}><FaTrash /></button>
    </div>
    );
  };

  return (
    <AdminLayout>
      <section className="storage-manager" aria-labelledby="storage-manager-title">
        <div className="storage-manager__header">
          <div>
            <p className="storage-manager__eyebrow">ADMINISTRATION / STORAGE</p>
            <h1 id="storage-manager-title">Storage Manager</h1>
            <p>Browse and manage files in the existing Cloudflare R2 bucket.</p>
          </div>
          <div className="storage-manager__header-actions">
            <Button variant="outline" size="sm" onClick={() => openModal("folder")} icon={<FaFolderPlus />}>New folder</Button>
            <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()} icon={<FaCloudUploadAlt />}>Upload files</Button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.gif" hidden onChange={handleFileInput} />
            <input ref={replaceFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif" hidden onChange={handleReplaceInput} />
          </div>
        </div>

        <div className="storage-manager__notice">
          <strong>Protected storage:</strong> Existing academic resources are read-only here. Rename, move, replace, and delete are limited to the dedicated <code>Admin Uploads/</code> folder until a shared reference index exists.
        </div>

        <div
          className={`storage-manager__dropzone ${dragging ? "is-dragging" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <FaCloudUploadAlt aria-hidden="true" />
          <div><strong>Drag files here to upload</strong><span>PDF, JPG, PNG, WebP, GIF · Maximum 50 MiB per file</span></div>
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>Browse files</Button>
        </div>

        {uploadQueue.length > 0 && (
          <div className="storage-manager__upload-queue">
            <div className="storage-manager__section-heading">
              <h2>Upload queue</h2>
              <button type="button" onClick={() => setUploadQueue([])}>Clear queue</button>
            </div>
            {uploadQueue.slice(0, 6).map((job) => (
              <div className="storage-manager__upload-job" key={job.id}>
                <span className="storage-manager__upload-job-icon"><FaFileAlt /></span>
                <span className="storage-manager__upload-job-name">{job.name}{job.error && <small>{job.error}</small>}</span>
                <span className={`storage-manager__upload-status is-${job.state}`}>{job.state === "uploading" ? "Uploading…" : job.state}</span>
              </div>
            ))}
          </div>
        )}

        <div className="storage-manager__toolbar">
          <div className="storage-manager__breadcrumbs" aria-label="Storage location">
            <button type="button" onClick={() => changePrefix("")}>Bucket root</button>
            {breadcrumbs.map((segment, index) => {
              const target = `${breadcrumbs.slice(0, index + 1).join("/")}/`;
              return <span key={target}><b>/</b><button type="button" onClick={() => changePrefix(target)}>{segment}</button></span>;
            })}
          </div>
          <div className="storage-manager__tools">
            <label className="storage-manager__search">
              <FaSearch aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files…" aria-label="Search files" />
              {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><FaTimes /></button>}
            </label>
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} aria-label="Filter file type">
              <option value="all">All types</option><option value="pdf">PDF</option><option value="image">Images</option><option value="other">Other</option>
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} aria-label="Sort files">
              <option value="name">Name</option><option value="size">Size</option><option value="modified">Modified</option>
            </select>
            <button className="storage-manager__sort-direction" type="button" onClick={() => setSortDirection((value) => value === "asc" ? "desc" : "asc")} aria-label="Toggle sort direction">{sortDirection === "asc" ? "↑" : "↓"}</button>
            <div className="storage-manager__view-toggle">
              <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><FaList /></button>
              <button type="button" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><FaThLarge /></button>
            </div>
          </div>
        </div>

        {error && <div className="storage-manager__error" role="alert"><strong>Storage unavailable</strong><span>{error}</span><Button size="sm" variant="outline" onClick={() => void loadEntries(null, false)}>Retry</Button></div>}

        {loading ? (
          <div className="storage-manager__loading"><span /><span /><span /></div>
        ) : (
          <>
            <div className="storage-manager__summary">
              <span>{folders.length} folders · {visibleItems.length} files shown</span>
              {hasMore && <span>More items are available</span>}
            </div>

            {folders.length === 0 && visibleItems.length === 0 ? (
              <div className="storage-manager__empty">
                <FaFolder aria-hidden="true" />
                <h2>{query ? "No matching files" : "This folder is empty"}</h2>
                <p>{query ? "Try another search term or clear the filters." : "Upload a file or create a folder to get started."}</p>
                {!query && <Button size="sm" onClick={() => fileInputRef.current?.click()} icon={<FaCloudUploadAlt />}>Upload files</Button>}
              </div>
            ) : (
              <div className={`storage-manager__file-area is-${view}`}>
                {folders.map((folder) => (
                  <button className="storage-manager__folder" type="button" key={folder} onClick={() => changePrefix(folder)}>
                    <FaFolder aria-hidden="true" /><span>{folder.slice(prefix.length).replace(/\/$/, "")}</span><small>Folder</small>
                  </button>
                ))}
                {visibleItems.map((item) => (
                  <article className="storage-manager__file" key={item.key}>
                    <button className="storage-manager__file-main" type="button" onClick={() => void openPreview(item)}>
                      <span className="storage-manager__file-icon">{fileIcon(item)}</span>
                      <span className="storage-manager__file-info"><strong title={item.name}>{item.name}</strong><small>{formatSize(item.size)} · {item.contentType}</small></span>
                    </button>
                    <span className="storage-manager__file-date">{new Date(item.lastModified).toLocaleDateString()}</span>
                    {renderFileActions(item)}
                  </article>
                ))}
              </div>
            )}

            {hasMore && <div className="storage-manager__load-more"><Button variant="outline" size="sm" loading={loadingMore} onClick={() => void loadEntries(cursor, true)}>Load more</Button></div>}
          </>
        )}
      </section>

      <Modal
        isOpen={Boolean(modal)}
        onClose={closeModal}
        title={
          modal?.kind === "folder" ? "Create folder" :
          modal?.kind === "rename" ? "Rename file" :
          modal?.kind === "move" ? "Move file" :
          modal?.kind === "replace" ? "Replace file" :
          modal?.kind === "delete" ? "Delete file?" :
          modal?.kind === "preview" ? modal.item?.name :
          modal?.kind === "details" ? "File details" : ""
        }
        size={modal?.kind === "preview" ? "lg" : "md"}
        className={modal?.kind === "preview" ? "storage-manager__preview-overlay" : ""}
      >
        {modal?.kind === "folder" && (
          <div className="storage-manager__modal-body">
            <label>Folder name<input autoFocus value={modalValue} onChange={(event) => setModalValue(event.target.value)} placeholder="e.g. Admin Uploads" /></label>
            <p>Will be created inside <code>{prefix || "/"}</code>.</p>
            <div className="storage-manager__modal-actions"><Button variant="ghost" onClick={closeModal}>Cancel</Button><Button loading={working} onClick={() => void saveModal()}>Create folder</Button></div>
          </div>
        )}
        {modal?.kind === "replace" && modal.item && (
          <div className="storage-manager__modal-body">
            <p>The existing object <strong>{modal.item.name}</strong> will be overwritten with the selected file.</p>
            <p className="storage-manager__key-preview">{modal.item.key}</p>
            <p>The Worker checks the current ETag before replacing it. Replacement is allowed only inside <code>Admin Uploads/</code>.</p>
            <div className="storage-manager__modal-actions">
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button loading={working} onClick={() => replaceFileInputRef.current?.click()}>Choose replacement file</Button>
            </div>
          </div>
        )}
        {(modal?.kind === "rename" || modal?.kind === "move") && modal.item && (
          <div className="storage-manager__modal-body">
            <p>Current key: <code>{modal.item.key}</code></p>
            <label>{modal.kind === "rename" ? "New filename" : "Destination object key"}<input autoFocus value={modalValue} onChange={(event) => setModalValue(event.target.value)} placeholder={modal.kind === "rename" ? "new-file.pdf" : "Admin Uploads/folder/file.pdf"} /></label>
            {modal.kind === "move" && <p>Move and rename operations are enabled only for objects in <code>Admin Uploads/</code>.</p>}
            <div className="storage-manager__modal-actions"><Button variant="ghost" onClick={closeModal}>Cancel</Button><Button loading={working} onClick={() => void saveModal()}>Confirm</Button></div>
          </div>
        )}
        {modal?.kind === "delete" && modal.item && (
          <div className="storage-manager__modal-body">
            <p>You are about to permanently delete <strong>{modal.item.name}</strong>.</p>
            <p className="storage-manager__key-preview">{modal.item.key}</p>
            <p>This action is limited to <code>Admin Uploads/</code> and cannot be undone.</p>
            <div className="storage-manager__modal-actions"><Button variant="ghost" onClick={closeModal}>Cancel</Button><Button variant="danger" loading={working} onClick={() => void confirmDelete()}>Delete file</Button></div>
          </div>
        )}
        {modal?.kind === "details" && modal.item && (
          <div className="storage-manager__modal-body">
            <dl className="storage-manager__details">
              <dt>Filename</dt><dd>{modal.item.name}</dd>
              <dt>Object key</dt><dd><code>{modal.item.key}</code></dd>
              <dt>Size</dt><dd>{formatSize(modal.item.size)}</dd>
              <dt>MIME type</dt><dd>{modal.item.contentType}</dd>
              <dt>Last modified</dt><dd>{new Date(modal.item.lastModified).toLocaleString()}</dd>
              <dt>ETag</dt><dd><code>{modal.item.etag}</code></dd>
              {modal.item.publicUrl && <><dt>Public URL</dt><dd className="storage-manager__url">{modal.item.publicUrl}</dd></>}
            </dl>
            <div className="storage-manager__modal-actions">
              <Button variant="outline" onClick={() => void copyUrl(modal.item!)} icon={<FaCopy />}>Copy URL</Button>
              <Button onClick={() => void download(modal.item!)} icon={<FaDownload />}>Download</Button>
            </div>
          </div>
        )}
        {modal?.kind === "preview" && modal.item && (
          <div className="storage-manager__preview">
            {previewUrl && fileKind(modal.item) === "image" ? <img src={previewUrl} alt={modal.item.name} /> :
              previewUrl ? <iframe src={previewUrl} title={modal.item.name} /> :
              <p>Preparing preview…</p>}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
