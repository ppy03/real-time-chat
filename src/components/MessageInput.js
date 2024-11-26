import React from "react";

const MessageInput = ({ onSendMessage, onFileChange, onFileUpload }) => {
  const [message, setMessage] = React.useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage(""); // Clear message input
    }
  };

  return (
    <div style={{ padding: "10px", display: "flex", alignItems: "center" }}>
      <input
        type="text"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ flex: 1 }}
      />
      <button onClick={handleSend}>Send</button>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload File</button>
    </div>
  );
};

export default MessageInput;
