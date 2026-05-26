/**
 * Probe — talks to the running bot via a live debug endpoint to see what
 * whatsapp-web.js thinks our chat list looks like. Use this to confirm
 * incoming messages from the allowlisted numbers are actually being
 * delivered to the linked-device browser.
 */
import axios from "axios";
import { config } from "../src/config";

async function run() {
  const url = `http://localhost:${config.port}/debug/chats`;
  console.log("Probing", url);
  const r = await axios.get(url, { timeout: 30000 });
  console.log(JSON.stringify(r.data, null, 2));
}

run().catch((err) => {
  console.error("Probe failed:", err?.message || err);
  process.exit(1);
});
