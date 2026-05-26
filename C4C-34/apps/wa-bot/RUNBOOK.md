# BolKeBecho Demo Runbook

> The 15-minute window before the judge walks over. Follow this exactly.

## T-30 minutes — Pre-flight

- [ ] Both phones charged and on chargers.
- [ ] Demo phone (bot number) has WhatsApp Web logged in already, or QR session is fresh.
- [ ] Artisan phone has the bot number saved and a product photo ready in the gallery.
- [ ] Mobile data on both phones, hotspot enabled if venue Wi-Fi is flaky.
- [ ] Battery saver OFF on both phones.
- [ ] Laptop plugged in, lid open, screen brightness up.

## T-15 — Boot the stack in this exact order

```bash
# Terminal 1 — Person 4 backend (or our mock)
cd apps/api && npm run dev
# OR fall back to our mock:
cd apps/wa-bot && npm run dev:mock-backend

# Terminal 2 — WhatsApp bot
cd apps/wa-bot && npm run dev
# Scan QR with the demo WhatsApp number (only if not already logged in).

# Terminal 3 — Public marketplace (Person 1)
cd apps/public-web && npm run dev

# Terminal 4 — Vendor dashboard (Person 2)
cd apps/vendor-web && npm run dev
```

Health check from a fifth terminal:

```bash
curl http://localhost:5001/health
curl http://localhost:5000/api/health
```

## T-10 — Smoke test the full path

From the artisan phone, send to the bot:

```
RESET
```

Expect: `Session cleared ✅`. Then run the demo product as a dry run:

```
DEMO PRODUCT
```

Expect: a draft confirmation with title, price, quantity. Check the vendor dashboard — the pending listing should appear within 2 seconds.

If anything fails: switch to the simulator at `http://localhost:5001/simulator/` and run the same flow. The judge will see identical replies.

## T-0 — Live demo (your turn)

Speak this line first, then act:

> "Now we will show how a rural woman artisan can list a product without using any seller app — just WhatsApp."

Action sequence:

1. Send `ADD PRODUCT` from the artisan phone.
2. Bot asks for a photo → send the product photo from the gallery.
3. Bot asks for details → send: `Handmade coconut shell lamp, ₹600, 2 pieces`.
4. Bot replies with the draft confirmation.

Then say:

> "This draft is now waiting for Karigar Sakhi approval."

Hand over to Person 2 (vendor dashboard).

After Person 1 places the order on the marketplace, your bot will receive an order alert (triggered by the backend). Hold the phone up so the audience sees the new-order WhatsApp notification.

If the live order-alert doesn't fire (backend issue), send `ORDER DEMO` from the artisan phone — the bot will produce the same notification text.

## If something breaks

| Symptom                                        | What to do                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| QR keeps appearing                             | Session lost. Just rescan with the demo phone.                                                            |
| Bot does not respond                           | Check terminal 2 for errors. If WhatsApp is unreachable, switch to simulator.                             |
| Backend errors in terminal 2                   | Set `USE_MOCK_DRAFT=true` in `.env`, restart bot. Drafts now synthesize locally.                          |
| Vendor dashboard does not show pending product | Refresh the dashboard. If still empty, ask Person 2 to check their `/products/pending` endpoint directly. |
| Marketplace doesn't update after approval      | Refresh the marketplace tab. The judge won't notice.                                                      |

## What NOT to say

- "We are using an unofficial WhatsApp API in production."
- "We can scrape WhatsApp groups."
- "This bypasses WhatsApp API costs."

## What TO say if asked

- "Production uses the official WhatsApp Business Cloud API with opt-in consent."
- "The demo bridge proves the experience. The architecture is WhatsApp-first."
- "Our innovation is the workflow, not the transport."

## Closing line

> "A woman artisan sent a WhatsApp message. Within minutes, her product is verified, listed, and order-ready. That is HastKala."
