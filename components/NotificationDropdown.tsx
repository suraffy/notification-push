"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { socket } from "@/socket";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  deliveryMethod: string;
}

interface Props {
  userId: string;
}

export default function NotificationDropdown({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (userId) fetchNotifications();

    socket.emit("join", userId);
    console.log(`Joining room: ${userId}`);

    socket.on("new_notification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      socket.off("new-notification");
    };
  }, [userId, socket]);

  // Fetch notifications (filter only In-App notifications)
  async function fetchNotifications() {
    try {
      const res = await fetch(`/api/users/${userId}/notifications`);
      const data: Notification[] = await res.json();
      setNotifications(data.filter((n) => n.deliveryMethod === "InApp"));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }

  // Mark a single notification as read
  async function markAsRead(id: string) {
    console.log("id: ", id);
    await fetch(`/api/users/${userId}/notifications/${id}/mark-read`, {
      method: "PATCH",
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  // Mark all as read
  async function markAllAsRead() {
    await fetch(`/api/users/${userId}/notifications/mark-all-read`, {
      method: "PATCH",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  // Remove notification
  async function deleteNotification(id: string) {
    await fetch(`/api/users/${userId}/notifications/${id}`, {
      method: "DELETE",
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute -right-12 mt-3 w-96 bg-white shadow-lg rounded-xl p-4 border border-gray-200 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative bg-gray-50 p-3 rounded-lg shadow flex flex-col border border-gray-200",
                    !notification.isRead && "bg-blue-50"
                  )}
                >
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-700">
                    {notification.message}
                  </p>
                  {notification.isRead === false && (
                    <div className="flex justify-end items-center mt-3">
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="absolute right-3 text-red-700 hover:text-red-600 bg-red-100 hover:bg-red-200 rounded p-0.5 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
