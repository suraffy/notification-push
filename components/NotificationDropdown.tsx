"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { socket } from "@/socket";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  deliveryMethod: string;
  createdAt: string;
}

interface Props {
  userId: string;
}

export default function NotificationDropdown({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const notificationSound = new Audio("/notification.mp3");

  useEffect(() => {
    if (userId) fetchNotifications();

    socket.emit("join", userId);
    console.log(`Joining room: ${userId}`);

    socket.on("new_notification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);

      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/lml_logo.png",
          });
        } else {
          notificationSound.play();
          notify(newNotification.title, newNotification.message);
        }
      });
    });

    return () => {
      socket.off("new-notification");
    };
  }, [userId]);

  const notify = (title: string, message: string) => {
    toast(
      <div>
        <p className="font-bold">{title.slice(0, 20)}</p>
        <p className="text-sm">
          {message.length > 80 ? message.slice(0, 80) + "..." : message}
        </p>
      </div>,
      {
        autoClose: 5000,
        position: "top-right",
        type: "info",
        theme: "colored",
        // icon: false,
      }
    );
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/notifications`);
      const data: Notification[] = await res.json();
      setNotifications(data.filter((n) => n.deliveryMethod === "InApp"));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    await fetch(`/api/users/${userId}/notifications/${id}/mark-read`, {
      method: "PATCH",
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch(`/api/users/${userId}/notifications/mark-all-read`, {
      method: "PATCH",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/users/${userId}/notifications/${id}`, {
      method: "DELETE",
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <ToastContainer style={{ top: "72px" }} />
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
                    !notification.isRead && "bg-blue-100 border-blue-200"
                  )}
                >
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-700">
                    {notification.message}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    <small className="text-gray-500 font-medium text-[15px]">
                      {moment(notification.createdAt).fromNow()}
                    </small>
                    {notification.isRead === false && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>

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
