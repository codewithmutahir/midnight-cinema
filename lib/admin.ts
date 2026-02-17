import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Check if the given Firebase Auth UID is listed as an admin.
 * Requires Firestore collection `admins` with document ID = uid (add via Firebase Console).
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const ref = doc(db, "admins", uid);
  const snap = await getDoc(ref);
  return snap.exists();
}
