import {
  FaBookmark,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaRegBookmark
} from "react-icons/fa";
import type { AcademicResource } from "../data/academicResources.ts";

interface AcademicResourceCardProps {
  resource: AcademicResource;
  favorite: boolean;
  downloading: boolean;
  downloadCount: number;
  onPreview: (resource: AcademicResource) => void;
  onDownload: (resource: AcademicResource) => void;
  onToggleFavorite: (resource: AcademicResource) => void;
}

export default function AcademicResourceCard({
  resource,
  favorite,
  downloading,
  downloadCount,
  onPreview,
  onDownload,
  onToggleFavorite
}: AcademicResourceCardProps) {
  return (
    <article className="academic-resource-card">
      <div className="academic-resource-card__top">
        <span className="academic-resource-card__file-icon" aria-hidden="true">
          <FaFilePdf />
        </span>
        <button
          type="button"
          className={"academic-resource-card__favorite" + (favorite ? " is-active" : "")}
          onClick={() => onToggleFavorite(resource)}
          aria-label={favorite ? "Remove " + resource.title + " from favorites" : "Add " + resource.title + " to favorites"}
          aria-pressed={favorite}
          title={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {favorite ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>

      <div className="academic-resource-card__body">
        <h3>{resource.title}</h3>
        {resource.subject && resource.subject !== resource.title && (
          <p className="academic-resource-card__subject">{resource.subject}</p>
        )}
        <div className="academic-resource-card__meta">
          <span>PDF document</span>
          {downloadCount > 0 && <span>{downloadCount} downloads</span>}
          {resource.size && <span>{resource.size}</span>}
          {resource.fileName && resource.fileName !== "suggestion.pdf" && resource.fileName !== "syllabus.pdf" && (
            <span className="academic-resource-card__filename" title={resource.fileName}>
              {resource.fileName}
            </span>
          )}
        </div>
      </div>

      <div className="academic-resource-card__actions">
        <button
          type="button"
          className="academic-button academic-button--secondary"
          onClick={() => onPreview(resource)}
          disabled={!resource.pdfUrl}
        >
          <FaEye aria-hidden="true" />
          Preview
        </button>
        <button
          type="button"
          className="academic-button academic-button--primary"
          onClick={() => onDownload(resource)}
          disabled={!resource.pdfUrl || downloading}
        >
          <FaDownload aria-hidden="true" />
          {downloading ? "Preparing…" : "Download"}
        </button>
      </div>
    </article>
  );
}
