/// <reference types="socket.io-client" />

document.addEventListener("alpine:init", main);

function main() {
  Alpine.store("state", {
    buildId: new URL(window.location.href).searchParams.get("buildId")
  });

  const socket = io({
    autoConnect: false,
  });
  
  // socket.connect();
  socket.on("connect", () => {
    console.log("Connected to server. Session ID: ", socket.id);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });
}
