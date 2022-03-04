import React from "react";

export default function Notification({ type, message, setState }) {
  return (
    <div className={`notification ${type}`}>
      <button
        className="delete"
        onClick={() => setState((prev) => ({ ...prev, errors: null }))}
      ></button>

      <p className="is-capitalized">{message}</p>
    </div>
  );
}
