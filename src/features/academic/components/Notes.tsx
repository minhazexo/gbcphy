import { useState, useEffect } from "react";
import { getNotes, getSyllabus, subscribeToContent } from "../../../data/contentStore.ts";
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
}

const Notes = ({
  selectedYear,
  selectedType,
  searchTerm,
  downloadCounts,
  onDownloadRecorded,
  favorites,
  onToggleFavorite
}: NotesProps) => {
  const [loading, setLoading] = useState(false);

  const [notes, setNotes] = useState<Record<string, NoteItem[]>>(() => getNotes());
  const [syllabus, setSyllabus] = useState<Record<string, NoteItem[]>>(() => getSyllabus());

  useEffect(
    () =>
      subscribeToContent(() => {
        setNotes(getNotes());
        setSyllabus(getSyllabus());
      }),
    []
  );

  const itemKey = (item: NoteItem) => `${selectedYear}-${selectedType}-${item.title}`;

  const handleDownload = (item: NoteItem) => {
    setLoading(true);

    setTimeout(() => {
      onDownloadRecorded(item.title);
      setLoading(false);

      if (item.url !== "#") {
        const link = document.createElement("a");
        link.href = item.url;
        link.download = item.title;
        link.click();
      }
    }, 800);
  };

  const currentItems = selectedType === "Notes" ? notes[selectedYear] : syllabus[selectedYear];
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
