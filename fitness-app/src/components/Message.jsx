import React from "react";

export default function Message({ message, type = "info", onClose }) {
  if (!message) return null;

  const bgColor = type === "error" ? "bg-red-600" : "bg-green-600";
  const textColor = "text-white";

  return (
    <div className={`${bgColor} ${textColor} px-4 py-2 rounded fixed top-4 right-4 shadow-lg z-50 flex items-center space-x-4`}>
      <span>{message}</span>
      <button onClick={onClose} className="font-bold text-xl leading-none focus:outline-none">
        &times;
      </button>
    </div>
  );
}
