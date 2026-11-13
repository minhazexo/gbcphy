import { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaFilePdf, FaTimes } from "react-icons/fa";
import type { AcademicResource } from "../data/academicResources.ts";

interface PdfPreviewModalProps {
  resource: AcademicResource;
  onClose: () => void;
}

export default function PdfPreviewModal({ resource, onClose }: PdfPreviewModalProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
  }, [resource.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="pdf-preview-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="pdf-preview-modal" role="dialog" aria-modal="true" aria-labelledby="pdf-preview-title">
        <header className="pdf-preview-modal__header">
          <div className="pdf-preview-modal__heading">
            <span className="pdf-preview-modal__icon" aria-hidden="true"><FaFilePdf /></span>
            <div>
              <h2 id="pdf-preview-title">{resource.title}</h2>
              <p>{resource.subject || resource.fileName || "PDF document"}</p>
            </div>
          </div>
          <div className="pdf-preview-modal__tools">
            <a href={resource.pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-preview-modal__open">
              <FaExternalLinkAlt aria-hidden="true" />
              Open separately
            </a>
            <button type="button" onClick={onClose} aria-label="Close PDF preview" className="pdf-preview-modal__close">
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="pdf-preview-modal__viewer">
          {status === "loading" && (
            <div className="pdf-preview-modal__loading" role="status">
              <span className="academic-spinner" />
              <span>Loading PDF preview…</span>
            </div>
          )}
          {status === "error" && (
            <div className="pdf-preview-modal__error">
              <FaFilePdf aria-hidden="true" />
              <strong>Preview unavailable</strong>
              <span>This file could not be displayed here. Try opening it separately.</span>
              <a href={resource.pdfUrl} target="_blank" rel="noopener noreferrer">Open PDF</a>
            </div>
          )}
          <iframe
            key={resource.id}
            src={resource.pdfUrl}
            title={"PDF preview: " + resource.title}
            loading="lazy"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={status === "error" ? "is-hidden" : ""}
          />
        </div>
      </section>
    </div>
  );
}
