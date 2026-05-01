// lib/notifications.ts

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.error("Browser does not support notifications");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const sendLocalNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico", // Path to your Al Saqr logo
    });
  }
};
