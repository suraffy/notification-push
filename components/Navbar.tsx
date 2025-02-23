"use client";

import { useState } from "react";
import { Bell, Menu, User, Check } from "lucide-react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/lml_logo.png";

export default function Navbar() {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New comment on your post", unread: true },
    { id: 2, message: "New follower", unread: true },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <nav className="bg-white shadow fixed w-full z-10 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4">
            <Image
              src={logo}
              width={40}
              height={40}
              alt="lml-logo"
              className="rounded-md"
            />
            <h1 className="text-2xl font-bold text-gray-800">LML Repair</h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-10">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </div>

          {/* Notification Bell */}
          <div className="relative flex items-center space-x-8">
            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </HeadlessMenu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <HeadlessMenu.Items className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-md py-2 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {notifications.map((notification) => (
                    <HeadlessMenu.Item key={notification.id}>
                      {({ active }) => (
                        <div
                          className={`flex justify-between items-center px-4 py-2 text-sm text-gray-700 ${
                            active ? "bg-gray-100" : ""
                          }`}
                        >
                          <span
                            className={notification.unread ? "font-bold" : ""}
                          >
                            {notification.message}
                          </span>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-500 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </HeadlessMenu.Item>
                  ))}
                </HeadlessMenu.Items>
              </Transition>
            </HeadlessMenu>

            {/* Profile Dropdown */}
            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full border border-gray-300">
                <User className="w-6 h-6" />
              </HeadlessMenu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <div className="px-4 py-2 text-sm text-gray-700">
                        John Doe
                      </div>
                    )}
                  </HeadlessMenu.Item>
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        @johndoe
                      </div>
                    )}
                  </HeadlessMenu.Item>
                  <div className="border-t border-gray-200"></div>
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-100" : ""
                        } w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Logout
                      </button>
                    )}
                  </HeadlessMenu.Item>
                </HeadlessMenu.Items>
              </Transition>
            </HeadlessMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
