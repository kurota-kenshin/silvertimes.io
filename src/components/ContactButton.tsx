import { useState } from "react";
import GetSTTModal from "./GetSTTModal";

export default function ContactButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Fixed Contact Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Contact us"
      >
        {/* Headset Icon - Filled */}
        <svg
          className="w-6 h-6 text-black"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z" />
        </svg>
      </button>

      {/* Reuse GetSTTModal for contact */}
      <GetSTTModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
