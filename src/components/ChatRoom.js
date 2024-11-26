import React, { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import MessageInput from "./MessageInput";
import UserList from "./UserList";

const ChatRoom = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [roomId, setRoomId] = useState(1); // Default Room ID
  const [userId, setUserId] = useState(""); // Dynamic User ID from input
  const [isJoined, setIsJoined] = useState(false); // Room join status
  const [file, setFile] = useState(null); // File to be sent

  useEffect(() => {
    // Create a connection to the SignalR Hub
    const connect = new HubConnectionBuilder()
      .withUrl("https://localhost:7001/chat") // SignalR Hub URL
      .withAutomaticReconnect()
      .build();

    setConnection(connect);

    return () => {
      if (connect) connect.stop();
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => console.log("SignalR Connected!"))
        .catch((error) => console.error("SignalR Connection Error: ", error));
    }
  }, [connection]);

  const joinRoom = async () => {
    if (connection && userId.trim() !== "") {
      try {
        // Join room via SignalR
        await connection.invoke("JoinRoom", roomId, userId);
        setIsJoined(true);

        // Listen for incoming messages
        connection.on("ReceiveMessage", (data) => {
          setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Listen for updated user list in the room
        connection.on("UsersInRoom", (usersInRoom) => {
          setUsers(usersInRoom);
        });

        console.log(`Joined Room ${roomId} as ${userId}`);
      } catch (err) {
        console.error("Error while joining room: ", err);
      }
    } else {
      alert("Please enter a valid User ID.");
    }
  };

  const sendMessage = async (message, fileHtml = null) => {
    if (connection && message.trim()) {
      try {
        // Send message and HTML content via SignalR
        await connection.invoke("SendMessage", message, fileHtml || null);
      } catch (err) {
        console.error("Error sending message: ", err);
      }
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Get the selected file
  };

  const handleFileUpload = async () => {
    if (file && userId.trim() && roomId) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("UserId", userId);

      try {
        const response = await fetch(`https://localhost:7001/api/Messages/upload-file/${roomId}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.error("File upload failed");
          return;
        }

        const result = await response.json();
        console.log("API Response:", result);

        const fileHtml = result.content || 
          `<a href="${result.fileUrl}" target="_blank"><img src="${result.fileUrl}" class="post-image" alt="file image"></a>`;

        if (!result.content && !result.fileUrl) {
          console.error("Invalid API response: No content or fileUrl found.");
          return;
        }

        sendMessage("", fileHtml);
        console.log(`File uploaded successfully: ${fileHtml}`);
      } catch (err) {
        console.error("Error uploading file: ", err);
      }
    } else {
      alert("User ID or Room ID is missing, or no file selected.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {!isJoined ? (
        <div style={{ padding: "20px" }}>
          <h3>Join Chat Room</h3>
          <label>
            Room ID:
            <input
              type="number"
              value={roomId}
              onChange={(e) => setRoomId(parseInt(e.target.value, 10))}
            />
          </label>
          <br />
          <label>
            User ID:
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>
          <br />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <>
          <h2>Room: {roomId}</h2>
          <UserList users={users} />
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.userId}: </strong>
                <div
                  dangerouslySetInnerHTML={{ __html: msg.content }} // Render HTML content
                />
                {msg.fileUrl && (
                  <div>
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                      [File]
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
          <MessageInput
            onSendMessage={sendMessage}
            onFileChange={handleFileChange}
            onFileUpload={handleFileUpload}
          />
        </>
      )}
    </div>
  );
};

export default ChatRoom;
