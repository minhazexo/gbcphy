import { getAcademicResources, isAcademicCategory } from "./academicResources.ts";

test("all required academic category slugs are validated exactly", () => {
  expect(isAcademicCategory("Books")).toBe(true);
  expect(isAcademicCategory("Questions")).toBe(true);
  expect(isAcademicCategory("SuperSuggestion")).toBe(true);
  expect(isAcademicCategory("Syllabus")).toBe(true);
  expect(isAcademicCategory("Notes")).toBe(true);
  expect(isAcademicCategory("supersuggestion")).toBe(false);
  expect(isAcademicCategory("Unknown")).toBe(false);
  expect(isAcademicCategory(undefined)).toBe(false);
});

test("existing book PDFs are retained and grouped by the original year folders", () => {
  const books = getAcademicResources("Books");

  expect(books).toHaveLength(21);
  expect(books.every((resource) => resource.pdfUrl.startsWith("/Books/"))).toBe(true);
  expect(books.filter((resource) => resource.year === "1st Year")).toHaveLength(13);
  expect(books.filter((resource) => resource.year === "2nd Year")).toHaveLength(8);
  expect(books.filter((resource) => resource.year === "3rd Year")).toHaveLength(0);
  expect(books.filter((resource) => resource.year === "4th Year")).toHaveLength(0);
});

test("all existing super-suggestion PDFs are included", () => {
  const suggestions = getAcademicResources("SuperSuggestion");

  expect(suggestions).toHaveLength(17);
  expect(suggestions.every((resource) => resource.pdfUrl.startsWith("/Super%20Suggestion/"))).toBe(true);
  expect(suggestions.filter((resource) => resource.year === "1st Year")).toHaveLength(7);
  expect(suggestions.filter((resource) => resource.year === "2nd Year")).toHaveLength(2);
  expect(suggestions.filter((resource) => resource.year === "3rd Year")).toHaveLength(8);
});
