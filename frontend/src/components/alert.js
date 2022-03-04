import React from "react";

export default function Alert(props) {
  const { type, message } = props;
  return (
    <article className={`message ${type}`}>
      <div className="message-body">{message}</div>
    </article>
  );
}
