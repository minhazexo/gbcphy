import { ACADEMIC_YEARS, type AcademicYear } from "../data/academicResources.ts";

interface AcademicYearFilterProps {
  value: AcademicYear;
  onChange: (year: AcademicYear) => void;
}

export default function AcademicYearFilter({ value, onChange }: AcademicYearFilterProps) {
  return (
    <nav className="academic-year-filter" aria-label="Filter resources by academic year">
      {ACADEMIC_YEARS.map((year) => (
        <button
          key={year}
          type="button"
          role="tab"
          aria-selected={value === year}
          className={"academic-year-filter__tab" + (value === year ? " is-active" : "")}
          onClick={() => onChange(year)}
        >
          {year}
        </button>
      ))}
    </nav>
  );
}
