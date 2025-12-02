// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.static("public"));

// base output folder => Pictures/Photobox
const picturesDir = path.join(os.homedir(), "Pictures");
const baseOutput = path.join(picturesDir, "Photobox");

// ensure base exists
if (!fs.existsSync(baseOutput)) fs.mkdirSync(baseOutput, { recursive: true });

// Serve saved images statically at /saved
app.use("/saved", express.static(baseOutput));

// --- SSE clients for auto-update ---
let sseClients = [];
app.get("/events", (req, res) => {
  // headers for SSE
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // ping so connection stays alive
  const keepAlive = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// helper to push event
function pushEvent(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(c => c.res.write(payload));
}

// save endpoint
app.post("/save", (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "no image" });

    // create folder for today's date
    const today = new Date();
    const folderName =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
    const dateFolder = path.join(baseOutput, folderName);
    if (!fs.existsSync(dateFolder)) fs.mkdirSync(dateFolder, { recursive: true });

    const filename = "photobox_" + Date.now() + ".png";
    const filepath = path.join(dateFolder, filename);

    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(filepath, base64Data, "base64");

    // build public URL for client (served under /saved)
    // relative path: /saved/<dateFolderName>/<filename>
    const publicUrl = path.posix.join("/saved", folderName, filename);

    // notify SSE subscribers
    pushEvent("saved", { path: publicUrl, filename, date: folderName });

    res.json({ status: "ok", path: publicUrl, filepath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Saving to: ${baseOutput}`);
});
