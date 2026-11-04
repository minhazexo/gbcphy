import React, { useState, useEffect } from "react";
import { getNotes, getSyllabus, subscribeToContent } from "../../../data/contentStore.js";
import NoteCard from "./NoteCard.js";

const Notes = ({
  selectedYear,
  selectedType,
  searchTerm,
  downloadCounts,
  onDownloadRecorded,
  favorites,
  onToggleFavorite
}) => {
  const [loading, setLoading] = useState(false);

  // Content is managed in /admin and persisted in the local content store
  const [notes, setNotes] = useState(getNotes);
  const [syllabus, setSyllabus] = useState(getSyllabus);

  useEffect(
    () =>
      subscribeToContent(() => {
        setNotes(getNotes());
        setSyllabus(getSyllabus());
      }),
    []
  );

  const itemKey = (item) => `${selectedYear}-${selectedType}-${item.title}`;

  const handleDownload = (item) => {
    setLoading(true);

    // Simulate download delay
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

  const renderCard = (item) => (
    <NoteCard
      key={item.title}
      item={item}
      favorite={favorites.includes(itemKey(item))}
      downloadCount={downloadCounts[item.title]}
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
            {Object.values(downloadCounts).reduce((a, b) => a + b, 0)}
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
