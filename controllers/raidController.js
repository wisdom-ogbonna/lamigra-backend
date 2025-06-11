import { admin, db } from '../config/firebase.js';
import { getDistance } from 'geolib';

export const reportRaid = async (req, res) => {
  const { description, latitude, longitude, radius = 5000 } = req.body;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    const raidRef = await db.collection('ice_raids').add({
      description,
      latitude,
      longitude,
      radius,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reportedBy: userId,
    });

    // Notify users near the raid location
    const userLocSnap = await db.collection('user_locations').get();

    for (const userLocDoc of userLocSnap.docs) {
      const userLoc = userLocDoc.data();
      const distance = getDistance(
        { latitude, longitude },
        { latitude: userLoc.latitude, longitude: userLoc.longitude }
      );

      if (distance <= radius) {
        const notifyUserId = userLocDoc.id;
        const userDoc = await db.collection('users').doc(notifyUserId).get();
        const fcmToken = userDoc.data()?.fcmToken;

        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: '🚨 New ICE Raid Nearby!',
              body: description || 'An ICE raid was just reported near you.',
            },
            data: {
              type: 'raid_alert',
              raidId: raidRef.id,
            },
          });
          console.log(`Notification sent to user ${notifyUserId} for new raid ${raidRef.id}`);
        }
      }
    }

    res.send({ status: 'Raid reported and notifications sent', raidId: raidRef.id });
  } catch (err) {
    console.error('Error in reportRaid:', err);
    res.status(401).send('Unauthorized');
  }
};
