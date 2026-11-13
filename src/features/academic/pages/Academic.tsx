import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaClipboardList,
  FaLightbulb,
  FaQuestionCircle,
  FaStickyNote
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { ACADEMIC_CATEGORIES } from "../data/academicResources.ts";
import type { AcademicCategory } from "../data/academicResources.ts";
import "./academic-portal.scss";

const CATEGORY_ICONS: Record<AcademicCategory, typeof FaBookOpen> = {
  Books: FaBookOpen,
  Questions: FaQuestionCircle,
  SuperSuggestion: FaLightbulb,
  Syllabus: FaClipboardList,
  Notes: FaStickyNote
};

export default function Academic() {
  return (
    <section className="academic-portal">
      <div className="academic-portal__inner">
        <div className="academic-portal__intro">
          <span className="academic-portal__eyebrow">Department of Physics</span>
          <h1>Academic Resources</h1>
          <p>
            Everything you need for your courses, organized in one place.
            Choose a resource collection to explore materials by academic year.
          </p>
        </div>

        <div className="academic-portal__grid" aria-label="Academic resource categories">
          {ACADEMIC_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            return (
              <Link
                key={category.id}
                to={"/academic/" + category.id}
                className="academic-category-card"
              >
                <span className="academic-category-card__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="academic-category-card__content">
                  <span className="academic-category-card__title">{category.title}</span>
                  <span className="academic-category-card__description">{category.description}</span>
                  <span className="academic-category-card__action">
                    Explore resources <FaArrowRight aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="academic-portal__footer">
          <div>
            <strong>Need your class schedule?</strong>
            <span>Open the latest class routine in a separate section.</span>
          </div>
          <Link to="/class-routine" className="academic-routine-link">
            <FaCalendarAlt aria-hidden="true" />
            View Class Routine
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
