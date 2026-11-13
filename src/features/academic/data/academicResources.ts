import {
  getNotes,
  getQuestions,
  getSyllabus,
  subscribeToContent,
  type NoteItem
} from "../../../data/contentStore.ts";

export type AcademicCategory =
  | "Books"
  | "Questions"
  | "SuperSuggestion"
  | "Syllabus"
  | "Notes";

export type AcademicYear = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";

export interface AcademicResource {
  id: string;
  title: string;
  pdfUrl: string;
  category: AcademicCategory;
  year: AcademicYear;
  subject?: string;
  fileName?: string;
  size?: string;
  type: string;
  source: "repository" | "content-store";
}

export const ACADEMIC_YEARS: AcademicYear[] = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year"
];

export const ACADEMIC_CATEGORIES: {
  id: AcademicCategory;
  title: string;
  description: string;
}[] = [
  { id: "Books", title: "Books", description: "Recommended textbooks and references organized by course and academic year." },
  { id: "Questions", title: "Questions", description: "Previous examination questions and question-bank PDFs for focused practice." },
  { id: "SuperSuggestion", title: "Super Suggestion", description: "Curated topic suggestions to help you plan your exam preparation." },
  { id: "Syllabus", title: "Syllabus", description: "Course-wise and year-wise syllabus documents for the programme." },
  { id: "Notes", title: "Notes", description: "Lecture notes and study materials shared for each academic year." }
];

const STATIC_PDF_PATHS = [
  "public/Books/1st year/CMG-7100 — Fundamentals of Chemistry/CHEM1040 Textbook.pdf",
  "public/Books/1st year/CMG-7100 — Fundamentals of Chemistry/Essentials of Physical Chemistry (Bahl Arun Bahl B.S.  Tuli G.D.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
  "public/Books/1st year/MAM-102 — Calculus-I/Calculus 10th edition H. Anton.pdf",
  "public/Books/1st year/PHA-101 — Mechanics & Properties of Matter/Fundamentals of Physics Extended 10th edition Halliday & Resnick.pdf",
  "public/Books/1st year/PHA-101 — Mechanics & Properties of Matter/Physics Halliday,Resnick and Krane 5th ed. Uploaded by M.Yaseen.pdf",
  "public/Books/1st year/PHA-102 — Thermal Physics/Heat Thermodynamics and Statistical Physics (Brij Lal  N Subrahmanyam  PS Hemne) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
  "public/Books/1st year/PHA-103 — Electricity & Magnetism/Physics (Robert Resnick, David Halliday etc.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
  "public/Books/1st year/PHA-104 — Introduction to Computer and Programming/C The Complete Reference.pdf",
  "public/Books/1st year/PHA-104 — Introduction to Computer and Programming/C++_ The Complete Reference, 4th Edition.pdf",
  "public/Books/1st year/PHA-104 — Introduction to Computer and Programming/Computer Fundamentals P.K Sinha   (By Yogi)-By www.LearnEngineering.in.pdf",
  "public/Books/1st year/PHA-104 — Introduction to Computer and Programming/Digital Logic and Computer Designby M.Morris Mano.pdf",
  "public/Books/1st year/PHA-104 — Introduction to Computer and Programming/Digital Systems.pdf",
  "public/Books/1st year/PHA-104 — Introduction to Computer and Programming/The C Programming Language Ritchie & kernighan -.pdf",
  "public/Books/2nd year/PHA-201 — Optics/Principles of optics.pdf",
  "public/Books/2nd year/PHA-202 — Electronics I/MIllman-Halkias.pdf",
  "public/Books/2nd year/PHA-202 — Electronics I/[Robert_L._Boylestad,_Louis_Nashelsky]_Electronic Devices.pdf",
  "public/Books/2nd year/PHA-204 — Atomic & Molecular Physics/1 Aurther Beiser.pdf",
  "public/Books/2nd year/PHA-204 — Atomic & Molecular Physics/Concepts Of Modern Physics Arthur Beiser 2003.pdf",
  "public/Books/2nd year/PHA-205 — Waves, Oscillations and Advanced Mechanics/Foundations Of Electromagnetic Theroy.pdf",
  "public/Books/2nd year/PHA-205 — Waves, Oscillations and Advanced Mechanics/Goldstein, H.pdf",
  "public/Books/2nd year/PHA-205 — Waves, Oscillations and Advanced Mechanics/[ Landau L. D., Lifshitz E. M.pdf",
  "public/Super Suggestion/1st year/CMG-7100 — Fundamentals of Chemistry/suggestion.pdf",
  "public/Super Suggestion/1st year/MAM-102 — Calculus-I/suggestion.pdf",
  "public/Super Suggestion/1st year/MAM-103 — Analytic and Vector Geometry/suggestion.pdf",
  "public/Super Suggestion/1st year/PHA-101 — Mechanics & Properties of Matter/suggestion.pdf",
  "public/Super Suggestion/1st year/PHA-102 — Thermal Physics/suggestion.pdf",
  "public/Super Suggestion/1st year/PHA-103 — Electricity & Magnetism/suggestion.pdf",
  "public/Super Suggestion/1st year/PHA-104 — Introduction to Computer and Programming/suggestion.pdf",
  "public/Super Suggestion/2nd year/PHA-203 — Mathematical Physics/suggestion.pdf",
  "public/Super Suggestion/2nd year/PHA-204 — Atomic & Molecular Physics/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-301 — Classical Mechanics & Relativity/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-302 — Quantum Mechanics I/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-303 — Solid State Physics I/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-304 — Nuclear Physics/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-305 — Classical Electrodynamics/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-306 — Photonics & Lasers/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-307 — Computational Physics/suggestion.pdf",
  "public/Super Suggestion/3rd year/PHA-308 — Introduction to Astrophysics/suggestion.pdf",
  "public/Syllabus/1st year/CMG-7100 — Fundamentals of Chemistry/syllabus.pdf",
  "public/Syllabus/1st year/MAM-102 — Calculus-I/syllabus.pdf",
  "public/Syllabus/1st year/MAM-103 — Analytic and Vector Geometry/syllabus.pdf",
  "public/Syllabus/1st year/PHA-101 — Mechanics & Properties of Matter/syllabus.pdf",
  "public/Syllabus/1st year/PHA-102 — Thermal Physics/syllabus.pdf",
  "public/Syllabus/1st year/PHA-103 — Electricity & Magnetism/syllabus.pdf",
  "public/Syllabus/1st year/PHA-104 — Introduction to Computer and Programming/syllabus.pdf",
  "public/Syllabus/2nd year/MAM 104 — Linear Algebra/syllabus.pdf",
  "public/Syllabus/2nd year/PHA-201 — Optics/syllabus.pdf",
  "public/Syllabus/2nd year/PHA-202 — Electronics I/syllabus.pdf",
  "public/Syllabus/2nd year/PHA-203 — Mathematical Physics/syllabus.pdf",
  "public/Syllabus/2nd year/PHA-204 — Atomic & Molecular Physics/syllabus.pdf",
  "public/Syllabus/2nd year/PHA-205 — Waves, Oscillations and Advanced Mechanics/syllabus.pdf",
  "public/Syllabus/2nd year/STAT NM-202 — Principles of Statistics/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-301 — Classical Mechanics & Relativity/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-302 — Quantum Mechanics I/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-303 — Solid State Physics I/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-304 — Nuclear Physics/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-305 — Classical Electrodynamics/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-306 — Photonics & Lasers/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-307 — Computational Physics/syllabus.pdf",
  "public/Syllabus/3rd year/PHA-308 — Introduction to Astrophysics/syllabus.pdf",
  "public/Syllabus/4th year/PHA-401 — Statistical Mechanics/syllabus.pdf",
  "public/Syllabus/4th year/PHA-402 — Quantum Mechanics II/syllabus.pdf",
  "public/Syllabus/4th year/PHA-403 — Electronics II/syllabus.pdf",
  "public/Syllabus/4th year/PHA-404 — Methods of Experimental Physics/syllabus.pdf",
  "public/Syllabus/4th year/PHA-405 — Solid State Physics II/syllabus.pdf",
  "public/Syllabus/4th year/PHA-406 — Nuclear and Particle Physics/syllabus.pdf",
  "public/Syllabus/4th year/PHA-407 — Introduction to Material Science & Nanotechnology/syllabus.pdf"
] as const;

const YEAR_FOLDER_MAP: Record<string, AcademicYear> = {
  "1st year": "1st Year",
  "2nd year": "2nd Year",
  "3rd year": "3rd Year",
  "4th year": "4th Year"
};

const toPublicUrl = (repositoryPath: string): string =>
  "/" + repositoryPath
    .replace(/^public\//, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const staticResources: AcademicResource[] = STATIC_PDF_PATHS.map((repositoryPath) => {
  const segments = repositoryPath.split("/");
  const folderCategory = segments[1];
  const yearFolder = segments[2].toLowerCase();
  const fileName = segments[segments.length - 1];
  const subject = segments.slice(3, -1).join(" / ");
  const category: AcademicCategory =
    folderCategory === "Super Suggestion" ? "SuperSuggestion" : folderCategory as AcademicCategory;
  const year = YEAR_FOLDER_MAP[yearFolder];
  if (!year) throw new Error("Unknown academic year in static PDF path: " + repositoryPath);
  const fileTitle = fileName.replace(/\.pdf$/i, "");
  const title = category === "Books" ? fileTitle : subject;

  return {
    id: repositoryPath,
    title: title || fileTitle,
    pdfUrl: toPublicUrl(repositoryPath),
    category,
    year,
    subject: subject || undefined,
    fileName,
    type: "pdf",
    source: "repository"
  };
});

const STORE_YEAR_MAP: Record<AcademicYear, string> = {
  "1st Year": "First Year",
  "2nd Year": "Second Year",
  "3rd Year": "Third Year",
  "4th Year": "Fourth Year"
};

const fromContentStore = (
  category: "Notes" | "Questions" | "Syllabus",
  itemsByYear: Record<string, NoteItem[]>
): AcademicResource[] =>
  ACADEMIC_YEARS.flatMap((year) =>
    (itemsByYear[STORE_YEAR_MAP[year]] || []).map((item, index) => ({
      id: category + ":" + year + ":" + index + ":" + item.url,
      title: item.title,
      pdfUrl: item.url,
      category,
      year,
      fileName: item.url ? decodeURIComponent(item.url.split("/").pop() || "") : undefined,
      size: item.size,
      type: item.type || "pdf",
      source: "content-store" as const
    }))
  );

export const getAcademicResources = (category: AcademicCategory): AcademicResource[] => {
  const repositoryResources = staticResources.filter((resource) => resource.category === category);

  if (category === "Notes") {
    return [...repositoryResources, ...fromContentStore(category, getNotes())];
  }
  if (category === "Questions") {
    return [...repositoryResources, ...fromContentStore(category, getQuestions())];
  }
  if (category === "Syllabus") {
    // Keep both the course-wise repository PDFs and the existing year-wise
    // content-store documents; they are separate sets of published resources.
    return [...repositoryResources, ...fromContentStore(category, getSyllabus())];
  }

  return repositoryResources;
};

export const isAcademicCategory = (
  value: string | undefined
): value is AcademicCategory =>
  Boolean(value && ACADEMIC_CATEGORIES.some((category) => category.id === value));

export { subscribeToContent };
