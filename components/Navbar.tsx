"use client";

import { Menu, User } from "lucide-react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import NotificationDropdown from "./NotificationDropdown";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/lml_logo.png";

interface User {
  id: string;
  name: string;
  email: string;
  notification: Notification[];
}

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: Props) {
  return (
    <nav className="bg-white shadow fixed w-full z-10 top-0 left-0">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="relative flex items-center space-x-8">
            {user?.id && <NotificationDropdown userId={user.id} />}

            {user?.id && (
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
                        <div className="px-4 pt-2 text-lg font-medium text-gray-700">
                          {user?.name}
                        </div>
                      )}
                    </HeadlessMenu.Item>
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <div className="px-4 pb-2 text-sm text-gray-500">
                          @{user?.email.slice(0, 8)}
                        </div>
                      )}
                    </HeadlessMenu.Item>
                    <div className="border-t border-gray-200"></div>
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
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
            )}
          </div>

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
