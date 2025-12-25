import React from "react";
import "./confetti.css";

const COUNT = 200;

export default function Confetti({ open }) {
  if (!open) return null;

  return (
    <div className={`confetti animated`}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <p key={i} className="animated" />
      ))}
    </div>
  );
}