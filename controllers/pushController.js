import { db } from "../config/firebase.js";
import { Expo } from "expo-server-sdk";
import admin from "firebase-admin";
import { geohashForLocation } from "geofire-common";
import { geohashQueryBounds, distanceBetween } from "geofire-common";

const expo = new Expo();

const RAID_MESSAGES = {
  sos: {
    title: "🚨 Alert ‼️ – SOS",
    body: "⚠️ Urgent assistance requested nearby.",
  },

  suspicious: {
    title: "🚨 Alert ‼️ – Suspicious Vehicle",
    body: "🚘 Suspicious vehicle reported in your area.",
  },

  ice_agents: {
    title: "🚨 Alert ‼️ – Law Enforcement Activity",
    body: "👮 Activity reported nearby.",
  },

  checkpoint: {
    title: "🚨 Alert ‼️ – Checkpoint / Road Closure",
    body: "🚧 Road activity reported nearby. Expect delays.",
  },

  second_hand: {
    title: "🚨 Alert ‼️ – Abandoned Vehicle",
    body: "🚗 Unattended vehicle reported near you.",
  },
};

export const savePushToken = async (req, res) => {
  try {
    const { pushToken, userId, latitude, longitude } = req.body;

    if (!pushToken || !userId || latitude == null || longitude == null) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const geohash = geohashForLocation([latitude, longitude]);

    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          pushToken,
          location: new admin.firestore.GeoPoint(latitude, longitude),
          geohash,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendNearbyNotification = async (req, res) => {
  try {
    const { title, category, latitude, longitude } = req.body;

    if (!title || !category || latitude == null || longitude == null) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const alert = RAID_MESSAGES[category];

    if (!alert) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const center = [latitude, longitude];
    const radiusInKm = 8.05; // 🎯 5 miles

    const bounds = geohashQueryBounds(center, radiusInKm * 1000);
    const promises = [];

    for (const b of bounds) {
      const q = db
        .collection("users")
        .orderBy("geohash")
        .startAt(b[0])
        .endAt(b[1]);

      promises.push(q.get());
    }

    const snapshots = await Promise.all(promises);

    let messages = [];

    snapshots.forEach((snap) => {
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.location) return;

        const userLat = data.location.latitude;
        const userLng = data.location.longitude;

        const distanceKm = distanceBetween([userLat, userLng], center);

        if (distanceKm <= radiusInKm && Expo.isExpoPushToken(data.pushToken)) {
          messages.push({
            to: data.pushToken,
            sound: "default",
            title: alert.title,
            body: alert.body,
          });
        }
      });
    });

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    res.json({ success: true, sent: messages.length });
  } catch (error) {
    console.error("Nearby push error:", error);
    res.status(500).json({ error: error.message });
  }
};
