import { admin, db } from "../config/firebase.js";

export const cleanupExpiredRaids = async (req, res) => {
  try {
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db
      .collection("ice_raids")
      .where("expiresAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return res.send({ status: "No expired raids found" });
    }

    const bucket = admin.storage().bucket();
    const batch = db.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Delete image from Firebase Storage
      if (data.imageUrl) {
        const filePath = data.imageUrl.split(`/${bucket.name}/`)[1];
        if (filePath) {
          await bucket.file(filePath).delete().catch(() => {});
        }
      }

      batch.delete(doc.ref);
    }

    await batch.commit();

    res.send({
      status: "Expired raids cleaned",
      deleted: snapshot.size,
    });

  } catch (err) {
    console.error("Cleanup error:", err);
    res.status(500).send("Cleanup failed");
  }
};
