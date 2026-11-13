import { describe, expect, test } from "bun:test";
import { ApiError } from "../src/errors.ts";
import {
  getAllowedMime,
  isManagedUploadKey,
  publicObjectUrl,
  requireManagedUploadKey,
  validateObjectKey,
  validatePrefix,
} from "../src/utils.ts";

describe("R2 object-key validation", () => {
  test("preserves exact existing key spelling and spaces", () => {
    expect(validateObjectKey("Questions/2nd year/Mathematical Physics .pdf"))
      .toBe("Questions/2nd year/Mathematical Physics .pdf");
  });

  test("rejects traversal, encoded separators, absolute paths, and URLs", () => {
    for (const key of [
      "../secret.pdf",
      "Questions/../secret.pdf",
      "Questions/%2e%2e/secret.pdf",
      "Questions%2fsecret.pdf",
      "/absolute.pdf",
      "https://example.com/file.pdf",
    ]) {
      expect(() => validateObjectKey(key)).toThrow(ApiError);
    }
  });

  test("accepts folder prefixes and normalizes the trailing slash", () => {
    expect(validatePrefix("Questions/3rd year/")).toBe("Questions/3rd year/");
    expect(validatePrefix("")).toBe("");
  });
});

describe("R2 upload validation", () => {
  test("accepts only extension and MIME combinations on the allow-list", () => {
    expect(getAllowedMime("lecture.pdf", "application/pdf")).toBe("application/pdf");
    expect(getAllowedMime("photo.webp", "image/webp")).toBe("image/webp");
    expect(() => getAllowedMime("lecture.pdf", "image/png")).toThrow(ApiError);
    expect(() => getAllowedMime("archive.zip", "application/zip")).toThrow(ApiError);
  });
});

describe("safe management boundaries", () => {
  test("limits destructive actions to the dedicated Admin Uploads namespace", () => {
    expect(isManagedUploadKey("Admin Uploads/new-file.pdf")).toBe(true);
    expect(isManagedUploadKey("Questions/1st year/Calculus I.pdf")).toBe(false);
    expect(() => requireManagedUploadKey("Questions/1st year/Calculus I.pdf")).toThrow(ApiError);
  });

  test("encodes URL segments without encoding path separators", () => {
    expect(publicObjectUrl("https://cdn.example.test/", "A Folder/a & b.pdf"))
      .toBe("https://cdn.example.test/A%20Folder/a%20%26%20b.pdf");
  });
});
