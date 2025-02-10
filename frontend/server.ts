import { opine, serveStatic, json, DB } from "./deps.ts";
import { getUrlForFilename } from "./ts/url_finder.ts";

// Open a SQLite database
const db = new DB("./data/chat_usage.db");
db.query("CREATE TABLE IF NOT EXISTS chat_log (id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT, accessed_at DATETIME, ip_address TEXT, prompt TEXT, response TEXT)");

const app = opine();
app.use(json());
app.use(serveStatic("."));

async function logToFile(data) {
  const encoder = new TextEncoder();
  const dateTime = new Date().toISOString();
  const logString = `${dateTime}: ${JSON.stringify(data)}\n`;
  await Deno.writeFile('chat.log', encoder.encode(logString), { append: true });
}

app.post("/ask", async (req, res) => {
  const chatHistory = req.body.messages || [];
  const useContext = req.body.use_context || false;
  const url = "http://private-gpt-service:8001/v1/chat/completions";
  const requestBody = { messages: chatHistory, use_context: useContext, include_sources: true };
  const ip = req.headers.get("x-forwarded-for") || req.ip;
  const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].content : "";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();

    // If sources are present, add source_url to each source
    if (data.choices && data.choices[0] && data.choices[0].sources) {
      const rootDirectory = "/mnt/shared/";
      data.choices[0].sources = await Promise.all(data.choices[0].sources.map(async (source) => {
        if (source.document && source.document.doc_metadata) {
          const fileName = source.document.doc_metadata.file_name;
          const sourceUrl = await getUrlForFilename(rootDirectory, fileName);
          return { ...source, source_url: sourceUrl };
        }
        return source;
      }));
    }

    // console.log("Processed data:", JSON.stringify(data, null, 2)); // Keep this for debugging

    const responseData = data.choices && data.choices.length > 0 ? data.choices[0].message.content : '';

    db.query("INSERT INTO chat_log (endpoint, accessed_at, ip_address, prompt, response) VALUES (?, ?, ?, ?, ?)", [
      "ask",
      new Date().toISOString(),
      ip,
      lastMessage,
      responseData
    ]);

    res.setStatus(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.setStatus(500).send("Internal Server Error");
    await logToFile({ request: requestBody, ip, error: error.message });
  }
});

app.get("/last-access-time", (req, res) => {
  const lastAccess = db.query("SELECT accessed_at, ip_address FROM chat_log ORDER BY id DESC LIMIT 1");
  if (lastAccess.length) {
    const lastAccessTime = new Date(lastAccess[0][0]);
    const lastAccessIP = lastAccess[0][1];
    const currentTime = new Date();
    const secondsSinceLastAccess = Math.floor((currentTime - lastAccessTime) / 1000); // time difference in seconds
    res.json({ lastAccessTime: secondsSinceLastAccess, lastAccessIP: lastAccessIP });
  } else {
    res.json({ lastAccessTime: 'Never', lastAccessIP: 'No IP Recorded' });
  }
});

app.get("/logs", async (req, res) => {
  try {
    const logs = db.query("SELECT * FROM chat_log ORDER BY accessed_at DESC");
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    res.setStatus(500).json({ error: "Internal Server Error" });
  }
});

app.get("/client-ip", (req, res) => {
  const ip = (req.headers.get("x-forwarded-for") || '').split(',')[0].trim() || req.ip;
  res.json({ ip });
});

app.get("/scraping-report", async (req, res) => {
  const isLocalMode = req.query.mode === 'local';
  try {
    let reportPath;
    if (isLocalMode) {
      reportPath = "./report.json"; // Local file path
    } else {
      reportPath = "/mnt/shared/report.json"; // Shared volume path
    }
    const reportContent = await Deno.readTextFile(reportPath);
    const report = JSON.parse(reportContent);

    // Filter out 'report.json' from changed_files
    report.changed_files = report.changed_files.filter(file => file !== 'report.json');

    res.json(report);
  } catch (error) {
    console.error('Failed to fetch scraping report:', error);
    res.setStatus(500).json({ error: "Failed to fetch scraping report" });
  }
});

app.post("/context", async (req, res) => {
  const text = req.body.text || "";
  const url = "http://private-gpt-service:8001/v1/chunks";
  const requestBody = { text };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Process each item in the data array
    if (data.data && Array.isArray(data.data)) {
      const rootDirectory = "/mnt/shared/";
      for (const item of data.data) {
        if (item.document && item.document.doc_metadata && item.document.doc_metadata.file_name) {
          const fileName = item.document.doc_metadata.file_name;
          const sourceUrl = await getUrlForFilename(rootDirectory, fileName);
          item.source_url = sourceUrl;
        }
      }
    }

    console.log("Processed data:", JSON.stringify(data, null, 2)); // Add this line for debugging

    res.setStatus(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.setStatus(500).send("Internal Server Error");
  }
});

app.get("/version", async (req, res) => {
  try {
    const version = await Deno.readTextFile("./version.txt");
    res.json({ version: version.trim() });
  } catch (error) {
    console.error('Failed to read version:', error);
    res.setStatus(500).json({ error: "Failed to read version" });
  }
});

function closeDb() {
  console.log("Closing the database connection.");
  db.close();
}

Deno.addSignalListener("SIGINT", () => {
  closeDb();
  Deno.exit(0);
});

Deno.addSignalListener("SIGTERM", () => {
  closeDb();
  Deno.exit(0);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.setStatus(500).json({ error: "Internal Server Error" });
});

const port = 3000;
const host = "0.0.0.0";
app.listen({ port, hostname: host }, () => console.log(`Server running on http://${host}:${port}`));
