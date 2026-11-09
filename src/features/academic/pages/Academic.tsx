// Academic page — notes & syllabus browser

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./academic.scss";
import Notes, { NoteItem } from "../components/Notes.tsx";
import {
  getDownloads,
  getFavorites,
  getQuestions,
  recordDownload,
  saveFavorites
} from "../../../data/contentStore.ts";

const Academic = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState("First Year");
  const [selectedType, setSelectedType] = useState("Notes");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>(getDownloads());
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [questions] = useState<Record<string, NoteItem[]>>(() => getQuestions());

  const handleDownloadRecorded = (title: string) => {
    setDownloadCounts(recordDownload(title));
  };

  const handleToggleFavorite = (itemKey: string) => {
    const next = favorites.includes(itemKey)
      ? favorites.filter((key) => key !== itemKey)
      : [...favorites, itemKey];
    setFavorites(next);
    saveFavorites(next);
  };

  return (
    <div className="notes-container">
      <button
        className="class-routine-button"
        onClick={() => navigate("/class-routine")}
      >
        📅 Class Routine
      </button>

      <h1>
        <span className="academic-title">
          {selectedYear} {selectedType}
        </span>
      </h1>

      <div className="controls-container">
        <div className="dropdown-container">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-select"
          >
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Fourth Year">Fourth Year</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-select"
          >
            <option value="Notes">Notes</option>
            <option value="Syllabus">Syllabus</option>
            <option value="Questions">Questions</option>
          </select>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder={`Search ${selectedType.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <Notes
        selectedYear={selectedYear}
        selectedType={selectedType}
        searchTerm={searchTerm}
        downloadCounts={downloadCounts}
        onDownloadRecorded={handleDownloadRecorded}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        questions={questions}
      />
    </div>
  );
};

export default Academic;
