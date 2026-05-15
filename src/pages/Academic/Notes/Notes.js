import React, { useState } from "react";

const Notes = ({
  selectedYear,
  selectedType,
  searchTerm,
  downloadCounts,
  setDownloadCounts,
  favorites,
  setFavorites
}) => {
  const [loading, setLoading] = useState(false);

  // Updated Notes Paths with complete Third Year data
  const notes = {
    "First Year": [
      { title: "Analytical and Vector Geometry", url: "/1st Year Notes/Analytical and Vector Geometry .pdf", type: "pdf" },
      { title: "Calculus-1", url: "/1st Year Notes/Calculus-1.pdf", type: "pdf" },
      { title: "Electricity", url: "/1st Year Notes/Electricity .pdf", type: "pdf" },
      { title: "Mechanics and Properties of Matter", url: "/1st Year Notes/Mechanics and Properties of Matter.pdf", type: "pdf" },
      { title: "NM Stat", url: "/1st Year Notes/NM Stat.pdf", type: "pdf" },
      { title: "Thermal Physics", url: "/1st Year Notes/Thermal Physics.pdf", type: "pdf" },
    ],

    "Second Year": [
      { title: "PHA 201 (OPTICS)", url: "/2nd Year Notes/EMON { PHA 201 (OPTICS) }_compressed.pdf", type: "pdf" },
      { title: "PHA 202 (ELECTRONICS 1)", url: "/2nd Year Notes/EMON { PHA 202 (ELECTRONICS 1) }_compressed.pdf", type: "pdf" },
      { title: "PHA 203 (MP)", url: "/2nd Year Notes/EMON { PHA 203 (MP) }_compressed.pdf", type: "pdf" },
      { title: "PHA 204 (AMP)", url: "/2nd Year Notes/EMON { PHA 204 (AMP) }_compressed.pdf", type: "pdf" },
      { title: "PHA 205 (WOAM)", url: "/2nd Year Notes/EMON {PHA 205 (WOAM) }_compressed.pdf", type: "pdf" },
    ],

    "Third Year": [
      // Original Notes
      { title: "Astrophysics", url: "/3rd Year Notes/Astrophysics.PHA-308.pdf", type: "pdf" },
      { title: "Classical Mechanics", url: "/3rd Year Notes/Classical Mechanics.PHA-301.pdf", type: "pdf" },
      { title: "Electrodynamics", url: "/3rd Year Notes/Electrodynamics.PHA-305.pdf", type: "pdf" },
      { title: "Lasers and Photonics", url: "/3rd Year Notes/Lasers and Photonics..pdf", type: "pdf" },
      { title: "Nuclear Physics", url: "/3rd Year Notes/Nuclear Physics.PHA-304.pdf", type: "pdf" },
      { title: "Quantum Mechanics", url: "/3rd Year Notes/Quantum Machanics.PHA-302.pdf", type: "pdf" },
      { title: "Solid State Physics", url: "/3rd Year Notes/Solid State Physics.PH-303.pdf", type: "pdf" },

      // Roy Notes (20-21)
      { title: "Astrophysics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Astrophysics (ROY).pdf", type: "pdf" },
      { title: "Classical Mechanics and Relativity Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Classical mechanics and relativity (ROY).pdf", type: "pdf" },
      { title: "Electrodynamics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Electrodynamics (ROY).pdf", type: "pdf" },
      { title: "Lasers and Photonics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Lasers(ROY).pdf", type: "pdf" },
      { title: "Nuclear Physics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Nuclear (ROY).pdf", type: "pdf" },
      { title: "Quantum Mechanics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Quantum (ROY).pdf", type: "pdf" },
      { title: "Solid State Physics Roy(20-21)", url: "/3rd Year Notes/Roy Notes/Solid(ROY).pdf", type: "pdf" },
    ],

    "Fourth Year": [
      { title: "Experimental Physics (ROY)", url: "/4th Year Notes/Experimental 4 th yr (ROY).pdf", type: "pdf", size: "33 MB" },
      { title: "Nuclear Physics II (ROY)", url: "/4th Year Notes/Nuclear 4 th yr (ROY).pdf", type: "pdf", size: "32 MB" },
      { title: "Quantum Mechanics II (ROY)", url: "/4th Year Notes/Quantum -2 4th yr (ROY).pdf", type: "pdf", size: "40 MB" },
      { title: "Solid State Physics II (ROY)", url: "/4th Year Notes/SSP-2 4th yr (ROY).pdf", type: "pdf", size: "41 MB" },
      { title: "Statistical Physics (ROY)", url: "/4th Year Notes/Statistical 4th yr (ROY).pdf", type: "pdf", size: "41 MB" },
    ],
  };

  const syllabus = {
    "First Year": [
      { title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st and 2nd Year.pdf", type: "pdf", size: "1.2 MB" },
    ],
    "Second Year": [
      { title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st and 2nd Year.pdf", type: "pdf", size: "1.2 MB" },
    ],
    "Third Year": [
      { title: "3rd Year Syllabus", url: "/Syllabus/3rd Year.pdf", type: "pdf", size: "0.9 MB" },
    ],
    "Fourth Year": [
      { title: "4th Year Syllabus", url: "/Syllabus/4th Year.pdf", type: "pdf", size: "1.1 MB" },
    ],
  };

  // Handler functions
  const handleDownload = (item) => {
    setLoading(true);
    
    // Simulate download delay
    setTimeout(() => {
      setDownloadCounts(prev => ({
        ...prev,
        [item.title]: (prev[item.title] || 0) + 1
      }));
      
      // Track in localStorage
      const downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
      downloadStats[item.title] = (downloadStats[item.title] || 0) + 1;
      localStorage.setItem('downloadStats', JSON.stringify(downloadStats));
      
      setLoading(false);
      
      // Trigger actual download
      if (item.url !== "#") {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.title;
        link.click();
      }
    }, 800);
  };

  const toggleFavorite = (item) => {
    const itemKey = `${selectedYear}-${selectedType}-${item.title}`;
    setFavorites(prev => 
      prev.includes(itemKey)
        ? prev.filter(fav => fav !== itemKey)
        : [...prev, itemKey]
    );
  };

  const isFavorite = (item) => {
    const itemKey = `${selectedYear}-${selectedType}-${item.title}`;
    return favorites.includes(itemKey);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'zip': return '📦';
      default: return '📁';
    }
  };

  // Filter items based on search term
  const currentItems = selectedType === "Notes" ? notes[selectedYear] : syllabus[selectedYear];
  const filteredItems = currentItems?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const favoriteItems = filteredItems.filter(item => 
    isFavorite(item)
  );

  const regularItems = filteredItems.filter(item => 
    !isFavorite(item)
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
            <div className="notes-grid">
              {favoriteItems.map((item, index) => (
                <div key={index} className="note-card favorite">
                  <div className="note-header">
                    <span className="file-icon">{getFileIcon(item.type)}</span>
                    <h3 className="note-title">{item.title}</h3>
                    <button
                      className={`favorite-btn ${isFavorite(item) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(item)}
                      title={isFavorite(item) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFavorite(item) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="note-meta">
                    <span className="file-type">{item.type.toUpperCase()}</span>
                    <span className="file-size">{item.size || ""}</span>
                    <span className="download-count">
                      📥 {downloadCounts[item.title] || 0}
                    </span>
                  </div>
                  <div className="note-actions">
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(item)}
                      disabled={item.url === "#"}
                    >
                      {item.url === "#" ? "Coming Soon" : "Download"}
                    </button>
                    {item.url !== "#" && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-btn"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="regular-section">
          {favoriteItems.length > 0 && <h2 className="section-title">All {selectedType}</h2>}
          <div className="notes-grid">
            {regularItems.map((item, index) => (
              <div key={index} className="note-card">
                <div className="note-header">
                  <span className="file-icon">{getFileIcon(item.type)}</span>
                  <h3 className="note-title">{item.title}</h3>
                  <button
                    className={`favorite-btn ${isFavorite(item) ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(item)}
                    title={isFavorite(item) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(item) ? '★' : '☆'}
                  </button>
                </div>
                <div className="note-meta">
                  <span className="file-type">{item.type.toUpperCase()}</span>
                  <span className="file-size">{item.size || ""}</span>
                  <span className="download-count">
                    📥 {downloadCounts[item.title] || 0}
                  </span>
                </div>
                <div className="note-actions">
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(item)}
                    disabled={item.url === "#"}
                  >
                    {item.url === "#" ? "Coming Soon" : "Download"}
                  </button>
                  {item.url !== "#" && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-btn"
                    >
                      Preview
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
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