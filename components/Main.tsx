import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "@/public/lml_logo.png";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isLoading: boolean;
  success: string;
  error: string;
  onLogin: (userId: string) => void;
}

const Main = ({ isLoading, success, error, onLogin }: Props) => {
  const [userId, setUserId] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setUserId(""), [success]);
  useEffect(() => inputRef.current?.focus(), [error]);

  return (
    <AnimatePresence>
      <div className="mt-[64px] h-[calc(100vh-64px)] flex flex-col place-content-center place-items-center">
        {error && (
          <motion.div
            initial={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ duration: 0.3 }}
            className="text-white my-2 px-6 py-1 bg-red-500 rounded"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="text-xl font-semibold text-gray-800 text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex items-center justify-center mb-4 gap-2">
              <Image
                src={logo}
                width={40}
                height={80}
                alt="lml-logo"
                className="rounded-md"
              />
              <span className="text-base font-normal">LML Repair</span>
            </div>
            <div className="bg-gray-50 border px-6 py-2 rounded">{success}</div>
          </motion.div>
        )}

        {!success && (
          <motion.div
            className="max-w-sm w-full mx-auto p-8 border rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4">Login</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onLogin(userId);
              }}
            >
              <input
                ref={inputRef}
                type="text"
                required
                autoFocus
                disabled={isLoading}
                placeholder="Enter your User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`w-full px-3 py-2 border text-[15px] text-gray-700 placeholder-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 ${
                  error ? "focus:ring-red-500 border-red-500" : ""
                }`}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full bg-[#fef100] hover:bg-[#f0e400] text-black font-semibold px-3 py-2 rounded transition"
              >
                {isLoading ? (
                  <span
                    className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                  ></span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default Main;
