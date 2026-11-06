export interface NoteItem {
  title: string;
  url: string;
  type: string;
  size?: string;
}

const fileIcon = (type: string): string => {
  switch (type) {
    case "pdf": return "📄";
    case "doc": return "📝";
    case "zip": return "📦";
    default: return "📁";
  }
};

interface NoteCardProps {
  item: NoteItem;
  favorite: boolean;
  downloadCount: number;
  onToggleFavorite: (key: string) => void;
  onDownload: (item: NoteItem) => void;
}

const NoteCard = ({ item, favorite, downloadCount, onToggleFavorite, onDownload }: NoteCardProps) => (
  <div className={`note-card${favorite ? " favorite" : ""}`}>
    <div className="note-header">
      <span className="file-icon">{fileIcon(item.type)}</span>
      <h3 className="note-title">{item.title}</h3>
      <button
        type="button"
        className={`favorite-btn${favorite ? " favorited" : ""}`}
        onClick={() => onToggleFavorite(`${item.title}`)}
        title={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </div>
    <div className="note-meta">
      <span className="file-type">{(item.type || "pdf").toUpperCase()}</span>
      <span className="file-size">{item.size || ""}</span>
      <span className="download-count">📥 {downloadCount || 0}</span>
    </div>
    <div className="note-actions">
      <button
        type="button"
        className="download-btn"
        onClick={() => onDownload(item)}
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
);

export default NoteCard;
