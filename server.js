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

app.post('/delete-image', async (req, res) => {
  try {
    let publicPath = req.body.path || req.body.publicPath || "";

    if (!publicPath) return res.status(400).json({ error: 'Missing path' });

    // If client passed a full URL, extract pathname
    try {
      if (publicPath.startsWith("http://") || publicPath.startsWith("https://")) {
        publicPath = new URL(publicPath).pathname;
      }
    } catch (e) {
      // ignore URL parse errors; continue with original string
    }

    // Normalize leading slash
    if (!publicPath.startsWith("/")) publicPath = "/" + publicPath;

    // Only accept paths served under /saved
    if (!publicPath.startsWith('/saved/')) {
      return res.status(400).json({ error: 'Invalid public path' });
    }

    // Map public path to real filesystem path under baseOutput
    const relPathPosix = publicPath.replace(/^\/saved\//, ''); // posix-style segments
    const segments = relPathPosix.split('/').map(s => decodeURIComponent(s));
    const relFsPath = path.join(...segments); // platform-specific join

    const baseResolved = path.resolve(baseOutput);
    const target = path.resolve(baseResolved, relFsPath);

    // Debug log to inspect mapping (will print to server console)
    console.log('delete-image request:', { publicPath, relFsPath, baseResolved, target });

    // Safety: ensure target is inside the baseOutput folder using path.relative
    const rel = path.relative(baseResolved, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      return res.status(400).json({ error: 'Invalid path (outside baseOutput)', details: { rel } });
    }

    // Check exists first for clearer error and return directory listing for debugging
    const exists = await fs.promises
      .access(target, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      const dir = path.dirname(target);
      const files = await fs.promises.readdir(dir).catch(() => []);
      console.warn('delete-image not found:', { target, dir, files });
      return res.status(404).json({ error: 'not found', target, dir, files });
    }

    await fs.promises.unlink(target);

    // notify SSE subscribers that file was removed (optional)
    pushEvent('deleted', { path: publicPath });

    return res.json({ success: true, deleted: true, path: publicPath, target });
  } catch (err) {
    console.error('delete-image error', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Saving to: ${baseOutput}`);
});
