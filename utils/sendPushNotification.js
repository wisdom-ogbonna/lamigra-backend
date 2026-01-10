import { Expo } from "expo-server-sdk";

const expo = new Expo();

export async function sendPushNotification(tokens, title, body, data = {}) {
  const messages = [];

  for (let token of tokens) {
    if (!Expo.isExpoPushToken(token)) continue;

    messages.push({
      to: token,
      sound: "default",
      title,
      body,
      data,
    });
  }

  if (messages.length > 0) {
    await expo.sendPushNotificationsAsync(messages);
  }
}
