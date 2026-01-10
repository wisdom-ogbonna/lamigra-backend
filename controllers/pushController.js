import { db } from "../config/firebase.js";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

/**
 * Save user's push token
 */
export const savePushToken = async (req, res) => {
  try {
    const { pushToken, userId } = req.body;

    if (!pushToken || !userId) {
      return res.status(400).json({ error: "Missing pushToken or userId" });
    }

    await db.collection("users").doc(userId).set(
      { pushToken },
      { merge: true }
    );

    res.json({ success: true, message: "Push token saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * Send notification to ALL users
 */
export const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body required" });
    }

    const usersSnapshot = await db.collection("users").get();

    let messages = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (Expo.isExpoPushToken(data.pushToken)) {
        messages.push({
          to: data.pushToken,
          sound: "default",
          title,
          body,
        });
      }
    });

    const chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    res.json({
      success: true,
      sent: messages.length,
      message: "Notification sent to all users"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
