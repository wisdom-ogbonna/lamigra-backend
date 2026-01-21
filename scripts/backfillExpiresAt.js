import { admin, db } from "../config/firebase.js";

const FIVE_HOURS = 5 * 60 * 60 * 1000;

async function backfill() {
  const snapshot = await db.collection("ice_raids").get();

  if (snapshot.empty) {
    console.log("No raids found");
    return;
  }

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();

    if (!data.expiresAt) {
      const createdAt = data.createdAt?.toDate() || new Date();
      const expiresAt = admin.firestore.Timestamp.fromMillis(
        createdAt.getTime() + FIVE_HOURS
      );

      batch.update(doc.ref, { expiresAt });
      count++;
    }
  });

  await batch.commit();
  console.log(`✅ Backfilled ${count} raids`);
}

backfill().then(() => process.exit());
