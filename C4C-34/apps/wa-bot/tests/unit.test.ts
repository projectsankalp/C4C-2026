/**
 * Unit tests using Node's built-in test runner (node:test, node ≥18).
 * No external dependencies. Run with:
 *   npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  detectLanguageHint,
  extractPrice,
  extractQuantity,
  isBackCommand,
  isHelpCommand,
  isLanguageCommand,
  isMenuCommand,
  isResetCommand,
  isStartCommand,
  isYes,
  isNo,
  matchOption,
  normalizeText,
  parseInteger,
  parseMenuChoice,
  parsePriceReply,
} from "../src/utils/text";
import {
  isAllowed,
  normalizePhone,
  stripWhatsAppSuffix,
  toIndianInternational,
} from "../src/utils/phone";
import { parseLanguageChoice } from "../src/conversations/messages";

// ---------- text utilities ----------

test("extractPrice: ₹ symbol", () => {
  assert.equal(extractPrice("Handmade lamp ₹600 each"), 600);
});

test("extractPrice: rupees word", () => {
  assert.equal(extractPrice("price 350 rupees only"), 350);
});

test("extractPrice: rs prefix", () => {
  assert.equal(extractPrice("Rs. 1200 each"), 1200);
});

test("extractPrice: missing", () => {
  assert.equal(extractPrice("a beautiful lamp"), null);
});

test("extractQuantity: pieces", () => {
  assert.equal(extractQuantity("2 pieces available"), 2);
});

test("extractQuantity: nos", () => {
  assert.equal(extractQuantity("3 nos in stock"), 3);
});

test("extractQuantity: missing returns null (no fabrication)", () => {
  assert.equal(extractQuantity("a lamp for sale"), null);
});

test("isStartCommand: english triggers", () => {
  assert.equal(isStartCommand("hi"), true);
  assert.equal(isStartCommand("hello there"), true);
  assert.equal(isStartCommand("namaste"), true);
});

test("isStartCommand: kannada", () => {
  assert.equal(isStartCommand("ನಮಸ್ಕಾರ"), true);
});

test("isStartCommand: rejects garbage", () => {
  assert.equal(isStartCommand("xyz"), false);
});

test("isResetCommand: variants", () => {
  assert.equal(isResetCommand("reset"), true);
  assert.equal(isResetCommand("RESTART"), true);
  assert.equal(isResetCommand("रीसेट"), true);
});

test("isMenuCommand", () => {
  assert.equal(isMenuCommand("menu"), true);
  assert.equal(isMenuCommand("ಮೆನು"), true);
  assert.equal(isMenuCommand("मेनू"), true);
});

test("isBackCommand", () => {
  assert.equal(isBackCommand("back"), true);
  assert.equal(isBackCommand("ಹಿಂದೆ"), true);
});

test("isHelpCommand", () => {
  assert.equal(isHelpCommand("help"), true);
  assert.equal(isHelpCommand("?"), true);
});

test("isLanguageCommand", () => {
  assert.equal(isLanguageCommand("language"), true);
  assert.equal(isLanguageCommand("भाषा"), true);
});

test("isYes / isNo", () => {
  assert.equal(isYes("1"), true);
  assert.equal(isYes("yes"), true);
  assert.equal(isYes("haan"), true);
  assert.equal(isNo("2"), true);
  assert.equal(isNo("no"), true);
  assert.equal(isNo("नहीं"), true);
});

test("parseMenuChoice: in range", () => {
  assert.equal(parseMenuChoice("3", 6), 3);
});

test("parseMenuChoice: out of range", () => {
  assert.equal(parseMenuChoice("7", 6), null);
});

test("parseMenuChoice: not a number", () => {
  assert.equal(parseMenuChoice("seven", 6), null);
});

test("parseInteger", () => {
  assert.equal(parseInteger("3"), 3);
  assert.equal(parseInteger("0"), 0);
  assert.equal(parseInteger("foo"), null);
});

test("parsePriceReply", () => {
  assert.equal(parsePriceReply("700"), 700);
  assert.equal(parsePriceReply("₹700"), 700);
  assert.equal(parsePriceReply("rs 700"), 700);
});

test("matchOption: by alias", () => {
  assert.equal(matchOption("add product", [["add", "add product"], ["my products"]]), 1);
  assert.equal(matchOption("my products", [["add", "add product"], ["my products"]]), 2);
  assert.equal(matchOption("xyz", [["add", "add product"], ["my products"]]), null);
});

test("detectLanguageHint: kannada script", () => {
  assert.equal(detectLanguageHint("ನಮಸ್ಕಾರ ಲಕ್ಷ್ಮಿ"), "kn");
});

test("detectLanguageHint: english fallback", () => {
  assert.equal(detectLanguageHint("hello"), "en");
});

test("normalizeText: trims and lowers", () => {
  assert.equal(normalizeText("  HELLO  "), "hello");
});

// ---------- phone utilities ----------

test("stripWhatsAppSuffix", () => {
  assert.equal(stripWhatsAppSuffix("919876543210@c.us"), "919876543210");
});

test("normalizePhone: strips non-digits", () => {
  assert.equal(normalizePhone("+91 98765-43210"), "919876543210");
});

test("toIndianInternational: 10-digit becomes 12", () => {
  assert.equal(toIndianInternational("9876543210"), "919876543210");
});

test("toIndianInternational: already prefixed", () => {
  assert.equal(toIndianInternational("919876543210"), "919876543210");
});

test("isAllowed: empty allowlist permits everyone in demo mode", () => {
  assert.equal(isAllowed("919876543210", [], true), true);
});

test("isAllowed: matches by suffix", () => {
  assert.equal(isAllowed("919876543210", ["9876543210"], true), true);
});

test("isAllowed: rejects non-matching number in demo mode", () => {
  assert.equal(isAllowed("911111111111", ["9876543210"], true), false);
});

test("isAllowed: production mode lets everyone through", () => {
  assert.equal(isAllowed("911111111111", ["9876543210"], false), true);
});

// ---------- language picker ----------

test("parseLanguageChoice: by number", () => {
  assert.equal(parseLanguageChoice("1"), "en");
  assert.equal(parseLanguageChoice("2"), "hi");
  assert.equal(parseLanguageChoice("3"), "kn");
});

test("parseLanguageChoice: by name", () => {
  assert.equal(parseLanguageChoice("english"), "en");
  assert.equal(parseLanguageChoice("hindi"), "hi");
  assert.equal(parseLanguageChoice("kannada"), "kn");
});

test("parseLanguageChoice: by code", () => {
  assert.equal(parseLanguageChoice("kn"), "kn");
});

test("parseLanguageChoice: invalid", () => {
  assert.equal(parseLanguageChoice("9"), null);
  assert.equal(parseLanguageChoice("klingon"), null);
});
