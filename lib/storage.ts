import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

const MAX_SIZE_MB = 5;

/**
 * Upload an image to Firebase Storage and return its permanent download URL.
 * Files land in `{folder}/{timestamp}-{name}` (e.g. rewards/, partners/).
 */
export async function uploadImage(
  file: File,
  folder: "rewards" | "partners"
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG, WebP…)");
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_SIZE_MB} MB`);
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileRef = ref(storage, `${folder}/${Date.now()}-${safeName}`);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}
