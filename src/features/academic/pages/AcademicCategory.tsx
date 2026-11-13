import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaHome, FaSearch } from "react-icons/fa";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  getAcademicResources,
  isAcademicCategory,
  subscribeToContent,
  type AcademicResource,
  type AcademicYear,
  ACADEMIC_CATEGORIES
} from "../data/academicResources.ts";
import {
  getDownloads,
  getFavorites,
  recordDownload,
  saveFavorites
} from "../../../data/contentStore.ts";
import AcademicYearFilter from "../components/AcademicYearFilter.tsx";
import AcademicResourceCard from "../components/AcademicResourceCard.tsx";
import PdfPreviewModal from "../components/PdfPreviewModal.tsx";
import "./academic-portal.scss";

const LEGACY_YEAR_LABELS: Record<AcademicYear, string> = {
  "1st Year": "First Year",
  "2nd Year": "Second Year",
  "3rd Year": "Third Year",
  "4th Year": "Fourth Year"
};

const legacyCategoryLabel = (category: AcademicResource["category"]): string => category;

const favoriteKey = (resource: AcademicResource): string =>
  LEGACY_YEAR_LABELS[resource.year] + "-" +
  legacyCategoryLabel(resource.category) + "-" +
  resource.title;

export default function AcademicCategory() {
  const { category: categoryParam } = useParams();
  const category = isAcademicCategory(categoryParam) ? categoryParam : null;
  const categoryInfo = ACADEMIC_CATEGORIES.find((item) => item.id === category);

  const [selectedYear, setSelectedYear] = useState<AcademicYear>("1st Year");
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState<AcademicResource[]>(() =>
    category ? getAcademicResources(category) : []
  );
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>(() => getDownloads());
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [previewResource, setPreviewResource] = useState<AcademicResource | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<{ message: string; url?: string } | null>(null);

  useEffect(() => {
    setSelectedYear("1st Year");
    setSearchTerm("");
    setPreviewResource(null);
    setDownloadFeedback(null);
  }, [categoryParam]);

  useEffect(() => {
    if (!category) {
      setResources([]);
      return;
    }

    const refreshResources = () => setResources(getAcademicResources(category));
    refreshResources();
    return subscribeToContent(refreshResources);
  }, [category]);

  const yearResources = useMemo(
    () => resources.filter((resource) => resource.year === selectedYear),
    [resources, selectedYear]
  );

  const filteredResources = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return yearResources;
    return yearResources.filter((resource) =>
      (resource.title + " " + (resource.subject || "") + " " + (resource.fileName || ""))
        .toLowerCase()
        .includes(query)
    );
  }, [yearResources, searchTerm]);

  const favoriteResources = filteredResources.filter((resource) =>
    favorites.includes(favoriteKey(resource))
  );
  const regularResources = filteredResources.filter((resource) =>
    !favorites.includes(favoriteKey(resource))
  );
  const visibleResources = [...favoriteResources, ...regularResources];

  const handleToggleFavorite = (resource: AcademicResource) => {
    const key = favoriteKey(resource);
    const nextFavorites = favorites.includes(key)
      ? favorites.filter((favorite) => favorite !== key)
      : [...favorites, key];
    setFavorites(nextFavorites);
    saveFavorites(nextFavorites);
  };

  const handleDownload = async (resource: AcademicResource) => {
    if (!resource.pdfUrl) {
      setDownloadFeedback({ message: "This resource does not have a PDF file attached." });
      return;
    }

    setDownloadingId(resource.id);
    setDownloadFeedback(null);

    try {
      const parsedUrl = new URL(resource.pdfUrl, window.location.origin);
      if (parsedUrl.origin === window.location.origin) {
        const anchor = document.createElement("a");
        anchor.href = parsedUrl.href;
        anchor.download = resource.fileName || (resource.title + ".pdf");
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } else {
        const response = await fetch(resource.pdfUrl, { method: "GET", mode: "cors" });
        if (!response.ok) throw new Error("HTTP_" + response.status);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const filename = resource.fileName || decodeURIComponent(parsedUrl.pathname.split("/").pop() || "resource.pdf");
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
      }

      setDownloadCounts(recordDownload(resource.title));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Download failed";
      if (message.startsWith("HTTP_")) {
        const status = message.slice(5);
        setDownloadFeedback({
          message: status === "404"
            ? "This PDF could not be found in storage (HTTP 404)."
            : "The PDF is not accessible from storage (HTTP " + status + ")."
        });
      } else {
        setDownloadFeedback({
          message: "The storage host blocked a direct download from this browser. You can open the PDF separately instead.",
          url: resource.pdfUrl
        });
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const closePreview = useCallback(() => setPreviewResource(null), []);

  if (!category || !categoryInfo) {
    return <Navigate to="/academic" replace />;
  }

  return (
    <section className="academic-category-page">
      <div className="academic-category-page__inner">
        <div className="academic-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/"><FaHome aria-hidden="true" /> Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/academic">Academic</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{categoryInfo.title}</span>
        </div>

        <header className="academic-category-heading">
          <div>
            <Link to="/academic" className="academic-category-heading__back">
              <FaArrowLeft aria-hidden="true" /> All academic resources
            </Link>
            <span className="academic-portal__eyebrow">Academic library</span>
            <h1>{categoryInfo.title}</h1>
            <p>{categoryInfo.description}</p>
          </div>
          <div className="academic-category-heading__count" aria-label={resources.length + " resources"}>
            <strong>{resources.length}</strong>
            <span>Resources</span>
          </div>
        </header>

        <div className="academic-year-section">
          <div className="academic-year-section__heading">
            <h2>Choose your year</h2>
            <span>Showing resources for {selectedYear}</span>
          </div>
          <AcademicYearFilter value={selectedYear} onChange={setSelectedYear} />
        </div>

        <div className="academic-resource-toolbar">
          <div>
            <h2>{selectedYear} {categoryInfo.title}</h2>
            <p>{filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"} available</p>
          </div>
          <label className="academic-search">
            <FaSearch aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={"Search " + categoryInfo.title.toLowerCase() + "…"}
              aria-label={"Search " + categoryInfo.title}
            />
          </label>
        </div>

        {downloadFeedback && (
          <div className="academic-download-feedback" role="status">
            <span>{downloadFeedback.message}</span>
            {downloadFeedback.url && (
              <a href={downloadFeedback.url} target="_blank" rel="noopener noreferrer">Open PDF</a>
            )}
            <button type="button" onClick={() => setDownloadFeedback(null)} aria-label="Dismiss message">×</button>
          </div>
        )}

        {visibleResources.length > 0 ? (
          <div className="academic-resources-grid">
            {visibleResources.map((resource) => (
              <AcademicResourceCard
                key={resource.id}
                resource={resource}
                favorite={favorites.includes(favoriteKey(resource))}
                downloading={downloadingId === resource.id}
                downloadCount={downloadCounts[resource.title] || 0}
                onPreview={setPreviewResource}
                onDownload={handleDownload}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="academic-empty-state">
            <span className="academic-empty-state__icon">PDF</span>
            <h3>{searchTerm ? "No matching resources" : "No resources for this year yet"}</h3>
            <p>
              {searchTerm
                ? "Try a different keyword or clear the search field."
                : "There are currently no " + categoryInfo.title.toLowerCase() + " files listed for " + selectedYear + "."}
            </p>
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")}>Clear search</button>
            )}
          </div>
        )}

        <div className="academic-category-page__bottom">
          <Link to="/academic"><FaArrowLeft aria-hidden="true" /> Back to Academic</Link>
          <Link to="/class-routine">View Class Routine</Link>
        </div>
      </div>

      {previewResource && (
        <PdfPreviewModal
          key={previewResource.id}
          resource={previewResource}
          onClose={closePreview}
        />
      )}
    </section>
  );
}
