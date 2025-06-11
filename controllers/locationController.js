import { admin, db } from '../config/firebase.js';
import { getDistance } from 'geolib';

export const updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    await db.collection('user_locations').doc(userId).set({
      latitude,
      longitude,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const raidsSnap = await db.collection('ice_raids').get();

    for (const raidDoc of raidsSnap.docs) {
      const raid = raidDoc.data();
      const distance = getDistance(
        { latitude, longitude },
        { latitude: raid.latitude, longitude: raid.longitude }
      );

      if (distance <= 500000) {
        const userDoc = await db.collection('users').doc(userId).get();
        const fcmToken = userDoc.data()?.fcmToken;
        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: '🚨 Nearby ICE Raid',
              body: 'An ICE raid was reported near your location.',
            },
            data: {
              type: 'raid_alert',
              raidId: raidDoc.id,
            },
          });
          console.log(`Notification sent to user ${userId} for raid ${raidDoc.id}`);
        }
      }
    }

    console.log(`Location update received and processed for user ${userId}: (${latitude}, ${longitude})`);
    res.send({ status: 'Location updated' });
  } catch (err) {
    console.error('Error in updateLocation:', err);
    res.status(401).send('Unauthorized');
  }
};
