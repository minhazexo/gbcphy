import { useState, useEffect } from "react";
import { getNotes, getSyllabus, getQuestions, subscribeToContent } from "../../../data/contentStore.ts";
import NoteCard from "./NoteCard.tsx";

export interface NoteItem {
  title: string;
  url: string;
  type: string;
  size?: string;
}

interface NotesProps {
  selectedYear: string;
  selectedType: string;
  searchTerm: string;
  downloadCounts: Record<string, number>;
  onDownloadRecorded: (title: string) => void;
  favorites: string[];
  onToggleFavorite: (key: string) => void;
  questions: Record<string, NoteItem[]>;
}

const Notes = ({
  selectedYear,
  selectedType,
  searchTerm,
  downloadCounts,
  onDownloadRecorded,
  favorites,
  onToggleFavorite,
  questions
}: NotesProps) => {
  const [loading, setLoading] = useState(false);

  const [notes, setNotes] = useState<Record<string, NoteItem[]>>(() => getNotes());
  const [syllabus, setSyllabus] = useState<Record<string, NoteItem[]>>(() => getSyllabus());
  const [questionsState, setQuestionsState] = useState<Record<string, NoteItem[]>>(() => questions);

  useEffect(
    () =>
      subscribeToContent(() => {
        setNotes(getNotes());
        setSyllabus(getSyllabus());
        setQuestionsState(getQuestions());
      }),
    []
  );

  const itemKey = (item: NoteItem) => `${selectedYear}-${selectedType}-${item.title}`;

  const handleDownload = async (item: NoteItem) => {
    if (!item.url || item.url === "#") return;

    setLoading(true);

    try {
      // R2 files are hosted on a different origin. Fetch the PDF as a Blob
      // so the browser's download attribute is honored instead of opening
      // the PDF viewer (which happens with cross-origin direct links).
      const response = await fetch(item.url, {
        method: "GET",
        mode: "cors"
      });

      if (!response.ok) {
        throw new Error(`Download failed (HTTP ${response.status}).`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const pathname = new URL(item.url).pathname;
      const originalFilename = decodeURIComponent(pathname.split("/").pop() || "");
      const filename = originalFilename || `${item.title}.pdf`;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      onDownloadRecorded(item.title);
    } catch (error) {
      console.error("Unable to download file:", error);
      window.alert(
        "Could not download this file. Please check the R2 bucket CORS settings and allow GET requests from this website."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentItems =
    selectedType === "Notes"
      ? notes[selectedYear]
      : selectedType === "Syllabus"
      ? syllabus[selectedYear]
      : questionsState[selectedYear];
  const filteredItems = (currentItems || []).filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteItems = filteredItems.filter((item) => favorites.includes(itemKey(item)));
  const regularItems = filteredItems.filter((item) => !favorites.includes(itemKey(item)));

  const renderCard = (item: NoteItem) => (
    <NoteCard
      key={item.title}
      item={item}
      favorite={favorites.includes(itemKey(item))}
      downloadCount={downloadCounts[item.title] || 0}
      onToggleFavorite={() => onToggleFavorite(itemKey(item))}
      onDownload={handleDownload}
    />
  );

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Preparing your download...</p>
        </div>
      )}

      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-number">{filteredItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {Object.values(downloadCounts).reduce((a: number, b: number) => a + b, 0)}
          </span>
          <span className="stat-label">Total Downloads</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{favoriteItems.length}</span>
          <span className="stat-label">Favorites</span>
        </div>
      </div>

      <div className="notes-content">
        {favoriteItems.length > 0 && (
          <div className="favorites-section">
            <h2 className="section-title">⭐ Favorites</h2>
            <div className="notes-grid">{favoriteItems.map(renderCard)}</div>
          </div>
        )}

        <div className="regular-section">
          {favoriteItems.length > 0 && <h2 className="section-title">All {selectedType}</h2>}
          <div className="notes-grid">{regularItems.map(renderCard)}</div>
        </div>

        {filteredItems.length === 0 && (
          <div className="no-results">
            <p>No {selectedType.toLowerCase()} found matching your search.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Notes;
