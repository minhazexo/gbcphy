// Storage service for Supabase Storage operations (profile images, etc.).

import { supabase, isSupabaseConfigured } from "./client.js";

const BUCKET = "profile-images";

// Upload a file to Supabase Storage and return the public URL.
export const uploadProfileImage = async (file, userId) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const fileName = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return urlData.publicUrl;
};

export default {
  uploadProfileImage,
  BUCKET,
};
