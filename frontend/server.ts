import { opine, serveStatic, json } from "https://deno.land/x/opine/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

// Open a SQLite database
const db = new DB("./chat_usage.db");
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


app.post("/context", async (req, res) => {
  const text = req.body.text || ""; // Expect a text string
  const url = "http://private-gpt-service:8001/v1/chunks"; // URL of the external API for context

  // Prepare the request body with the text
  const requestBody = { text };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    res.setStatus(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.setStatus(500).send("Internal Server Error");
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
