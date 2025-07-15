/// <reference types="socket.io-client" />

document.addEventListener("alpine:init", main);

async function main() {
  const buildId = new URL(window.location.href).searchParams.get("buildId");
  Alpine.store("abc", {
    name: '123'
  });
  Alpine.store("globalData", {
    buildId: buildId,
    loaded: false,
    buildDetails: {},
    logs: [],
    name: "dfldkfnd"
  });
  const socket = io({
    autoConnect: false,
  });

  try {
    const data = (await fetchData(buildId)).data;
    console.log(data);
    
    Alpine.store("globalData").buildDetails = data;
    Alpine.store("globalData").loaded = true;
    Alpine.store("globalData").name = "true";

    if (data.status == "pending") {
      socket.connect();
    }
    socket.on("connect", () => {
      console.log("Connected to server. Session ID: ", socket.id);
      socket.on("error", (data) => {
        console.log("ERR", data);
      });
      socket.on("build-status", data => {
        console.log("BS", data);
      });
      socket.on("status", data => {
        console.log("STATUS", data);
      });
      socket.emit("listen", {
        id: buildId
      });
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to fetch data " + buildId);
    } else {
      alert(error?.message || "Failed to fetch data " + buildId);
    }
  }
}

async function fetchData(id) {
  const res = await axios.get(`/track/${id}`);
  return res.data;
}
