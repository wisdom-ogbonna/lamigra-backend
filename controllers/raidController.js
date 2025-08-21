import { admin, db } from '../config/firebase.js';
import { getDistance } from 'geolib';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

export const reportRaid = async (req, res) => {
  const { description, latitude, longitude, radius = 5000, reportedAddress,category } = req.body;
  const file = req.file; // 👈 Multer gives you this
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    
    // 🔹 Fetch user details from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    const reportedByName = userRecord.displayName || "Anonymous";

    

    let imageUrl = null;

    if (file) {
      const fileName = `raids/${uuidv4()}_${file.originalname}`;
      const bucket = admin.storage().bucket(); // 👈 make sure storage is configured in firebase.js

      const fileUpload = bucket.file(fileName);
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
      await fileUpload.makePublic();

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
    }
    
    const raidRef = await db.collection('ice_raids').add({
      description,
      latitude,
      longitude,
      radius,
      reportedAddress,
      category,
      imageUrl, // 👈 store image URL
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reportedBy: userId,
      reportedByName, // 🔹 new

    });

    // same notification logic...
    // (unchanged)

    res.send({ status: 'Raid reported and notifications sent', raidId: raidRef.id });
  } catch (err) {
    console.error('❌ Error in reportRaid:', err);
    res.status(401).send('Unauthorized');
  }
};
