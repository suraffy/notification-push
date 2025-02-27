"use client";

import { useState, useEffect } from "react";
import { Bell, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { socket } from "@/socket";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import { Menu, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

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

  const notificationSound = new Audio("/notification.mp3");

  useEffect(() => {
    if (userId) fetchNotifications();

    socket.emit("join", userId);
    console.log(`Joining room: ${userId}`);

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification); // Cleanup listener on unmount
    };
  }, [userId]);

  const notify = (title: string, message: string) => {
    toast(
      <div>
        <p className="font-bold text-gray-800">{title.slice(0, 20)}</p>
        <p className="text-sm text-gray-700">
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

  const handleNewNotification = (newNotification: Notification) => {
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      return existingIds.has(newNotification.id)
        ? prev
        : [newNotification, ...prev];
    });

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
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full border border-gray-300">
        <Bell className="w-6 h-6 text-gray-600" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </Menu.Button>

      <ToastContainer style={{ top: "72px" }} />

      <Transition
        leave="transition ease-out duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items>
          <Menu.Item>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute -right-12 mt-3 w-96 bg-white shadow-lg rounded-xl p-4 border border-gray-200 min-h-[280px] max-h-[60vh] overflow-y-auto"
              >
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
                          "relative bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200 transition-all cursor-pointer",
                          !notification.isRead && "bg-blue-50 border-blue-200"
                        )}
                      >
                        {/* Dropdown Menu */}
                        <Menu as="div" className="absolute top-2 right-2">
                          <Menu.Button className="p-1 rounded-full hover:bg-gray-200 transition">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </Menu.Button>

                          <Menu.Items className="absolute right-0 w-40 bg-white border border-gray-200 shadow-lg rounded-xl rounded-tr-none overflow-hidden py-1 transition-all animate-fadeIn">
                            {!notification.isRead && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition ${
                                      active
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    Mark as Read
                                  </button>
                                )}
                              </Menu.Item>
                            )}

                            <hr />

                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition ${
                                    active
                                      ? "bg-red-50 text-red-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Menu>

                        <p className="font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {notification.message}
                        </p>

                        <div className="flex justify-between items-center mt-3 text-gray-500">
                          <small className="text-sm">
                            {moment(notification.createdAt).fromNow()}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
