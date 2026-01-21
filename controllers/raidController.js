import { admin, db } from "../config/firebase.js";
import { v4 as uuidv4 } from "uuid";

export const reportRaid = async (req, res) => {
  const {
    description,
    latitude,
    longitude,
    radius = 5000,
    reportedAddress,
    category,
    sourceLink,
    carPlateNumber,
  } = req.body;

  const files = req.files; // 👈 multiple images
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  try {
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // 🔐 Verify Firebase user
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    const userRecord = await admin.auth().getUser(userId);
    const reportedByName = userRecord.displayName || "Anonymous";

    const bucket = admin.storage().bucket();
    const imageUrls = [];

    // 📸 Upload images
    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = `raids/${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(file.buffer, {
          metadata: { contentType: file.mimetype },
        });

        await fileUpload.makePublic();

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        imageUrls.push(imageUrl);
      }
    }

    // ⏳ Auto-delete after 5 hours
    const FIVE_HOURS = 5 * 60 * 60 * 1000;
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + FIVE_HOURS);

    // 🔥 Save raid
    const raidRef = await db.collection("ice_raids").add({
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: Number(radius),
      reportedAddress,
      category,
      sourceLink: sourceLink || null,
      carPlateNumber: carPlateNumber || null,
      imageUrls,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
      reportedBy: userId,
      reportedByName,
    });

    return res.json({
      success: true,
      message: "Raid reported successfully",
      raidId: raidRef.id,
      imageUrls,
    });
  } catch (err) {
    console.error("❌ Error in reportRaid:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
