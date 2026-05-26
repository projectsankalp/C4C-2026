/**
 * Standalone simulator server.
 *
 * Runs the same internal HTTP server but WITHOUT a WhatsApp client.
 * This lets us demo the conversation flow entirely in a browser if Open-WA
 * fails on demo day. The flow, the backend calls, and the AI listing path
 * are identical — only the transport changes.
 *
 * Run: npm run dev:simulator
 * Open: http://localhost:5002/simulator/
 */
import { buildInternalServer } from "../server/internalServer";
import { config } from "../config";
import { log } from "../utils/logger";

const app = buildInternalServer();

const port = config.simulatorPort;

app.listen(port, () => {
  log.info("SIMULATOR_STARTED", {
    port,
    url: `http://localhost:${port}/simulator/`,
    backend: config.backendUrl,
  });
  console.log("");
  console.log(`  Open this URL in your browser:`);
  console.log(`  ➜  http://localhost:${port}/simulator/`);
  console.log("");
});
