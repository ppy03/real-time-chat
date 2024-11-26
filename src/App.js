import React, { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import ChatRoom from "./components/ChatRoom";

function App() {
  return (
    <div>
      <h1>Realtime Chat Application</h1>
      <ChatRoom />
    </div>
  );
}

export default App;
