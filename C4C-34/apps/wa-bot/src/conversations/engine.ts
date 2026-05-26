/**
 * Conversation engine — the brain of BolKeBecho.
 *
 * Transport-agnostic. Takes a normalized IncomingMessage and returns one or
 * more OutgoingReply objects. Both the whatsapp-web.js handler and the
 * browser simulator call this same function. That guarantees the WhatsApp
 * demo and the simulator fallback behave identically.
 *
 * Architecture:
 *   1. Universal commands (RESET, MENU, BACK, HELP, LANGUAGE, HUMAN, STOP)
 *      always work, in every state, in every language.
 *   2. Returning users skip greeting → go straight to their main menu.
 *   3. Otherwise, dispatch by `session.state` to the matching flow handler.
 *   4. After 3 unparseable replies in a row, surface HELP + HUMAN options.
 */
import { log } from "../utils/logger";
import { config } from "../config";
import {
  isBackCommand,
  isBuyerSwitchCommand,
  isCancelCommand,
  isExitCommand,
  isHelpCommand,
  isHumanCommand,
  isLanguageCommand,
  isMenuCommand,
  isProfileCommand,
  isResetCommand,
  isSellerSwitchCommand,
  isStartCommand,
  isStatusCommand,
  isUndoCommand,
  isVoicePrefCommand,
  isYes,
  isNo,
  normalizeText,
  parseChangeLanguageCommand,
} from "../utils/text";
import {
  getSession,
  incrementUnparseable,
  mainMenuFor,
  popState,
  resetSession,
  transition,
  updateSession,
} from "./state";
import { getMessages } from "./messages";
import { logInbound } from "../services/inboundService";
import { loadProfile, saveProfile } from "../services/userService";
import { transcribeAudio } from "../services/transcribeService";
import { synthesizeSpeech } from "../services/ttsService";
import { translateForUser } from "../services/translationService";
import { translateAndSpeak } from "../services/indicSpeechService";
import { classifyIntent, type NavTarget } from "../services/nluService";
import { answerQuestion } from "../services/qaService";
import { describeState, getOptionsForState } from "./stateOptions";
import type { ConversationState, IncomingMessage, OutgoingReply, Role, UserSession } from "../types";
import {
  handleAwaitingLanguage,
  handleAwaitingReplyMode,
  handleAwaitingRole,
  handleGreeting,
  handleReturningUser,
  handleTutorial,
} from "./flows/identity";
import {
  handleSellerCommunityJoin,
  handleSellerCommunityWaiting,
  handleSellerLockedMenu,
  handleSellerPrecheckAddress,
  handleSellerPrecheckContact,
  handleSellerPrecheckName,
} from "./flows/certification";
import {
  handleBuyerOnboardInterests,
  handleBuyerOnboardLocation,
  handleBuyerOnboardName,
  handleSakhiOnboardDistrict,
  handleSakhiOnboardGroups,
  handleSakhiOnboardName,
  handleSellerOnboardCraft,
  handleSellerOnboardDistrict,
  handleSellerOnboardName,
  handleSellerOnboardSakhiHelp,
  handleSellerOnboardShgAsk,
  handleSellerOnboardShgName,
} from "./flows/onboarding";
import { handleSellerMenu, handleSellerMenuMore } from "./flows/sellerMenu";
import {
  handleAddProductConfirm,
  handleAddProductDetails,
  handleAddProductEditDescription,
  handleAddProductEditPrice,
  handleAddProductEditQuantity,
  handleAddProductEditTitle,
  handleAddProductPhotos,
} from "./flows/addProduct";
import {
  enterMyProducts,
  handleMyProductsEditDesc,
  handleMyProductsEditPrice,
  handleMyProductsEditStock,
  handleMyProductsEditTitle,
  handleMyProductsList,
  handleMyProductsManage,
} from "./flows/myProducts";
import { enterOrdersList, handleOrdersList, handleOrdersManage } from "./flows/sellerOrders";
import { handleBuyerMenu, handleBuyerMenuMore } from "./flows/buyerMenu";
import {
  enterTrending,
  handleBrowseCategories,
  handleBrowseProductDetail,
  handleBrowseResults,
  handleBuyerPurchaseConfirm,
  handleBuyerPurchaseDetails,
  handleSearchPrompt,
  handleSearchResults,
} from "./flows/browse";
import {
  handleRequestBrief,
  handleRequestBudget,
  handleRequestConfirm,
  handleRequestDate,
  handleRequestLocation,
} from "./flows/request";
import {
  enterSellerRequestList,
  handleQuoteBrowse,
  handleQuoteConfirm,
  handleQuoteDelivery,
  handleQuoteNote,
  handleQuotePrice,
  handleQuoteViewIncoming,
} from "./flows/quote";
import {
  enterSakhiPending,
  handleSakhiMenu,
  handleSakhiMenuMore,
  handleSakhiPendingDetail,
  handleSakhiPendingList,
} from "./flows/sakhi";

const UNPARSEABLE_HELP_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function processMessage(message: IncomingMessage): Promise<OutgoingReply[]> {
  const phone = message.phone;
  let session = getSession(phone);

  log.info("MESSAGE_RECEIVED", {
    phone,
    source: message.source,
    state: session.state,
    hasImage: message.hasImage,
    hasAudio: message.hasAudio,
    bodyLen: message.body?.length ?? 0,
  });

  // Audit log (best-effort).
  logInbound({
    fromPhone: phone,
    messageType: message.hasImage ? "image" : message.hasAudio ? "audio" : "text",
    body: message.body || undefined,
    mediaUrl: message.imageUrl,
  }).catch(() => undefined);

  // Record user message in history (for AI context)
  if (message.body && message.body.trim()) {
    const history = (session.messageHistory || []).slice(-19);
    history.push({ role: "user", text: message.body.trim().slice(0, 200), ts: Date.now() });
    updateSession(phone, { messageHistory: history });
    session = getSession(phone);
  }

  // ------- Voice transcription -------
  // Transcribe ANY audio message into the body field BEFORE further processing,
  // so all downstream layers (universal commands, NLU, dispatch) see text.
  let transcriptPreview: string | undefined;
  if (message.hasAudio && (!message.body || message.body.trim().length === 0)) {
    try {
      // Don't bias Whisper with a language hint until the user has actually
      // chosen their language — otherwise short Kannada/Hindi voice notes at
      // the greeting stage get mis-transcribed as English.
      const langHint =
        session.state === "GREETING" || session.state === "AWAITING_LANGUAGE"
          ? undefined
          : session.language;
      const transcript = await transcribeAudio({
        audioBuffer: message.audioBuffer,
        mimetype: message.audioMimetype,
        language: langHint,
      });
      if (transcript.text) {
        log.info("VOICE_TRANSCRIBED", {
          phone,
          state: session.state,
          source: transcript.source,
          textPreview: transcript.text.slice(0, 60),
        });
        message = { ...message, body: transcript.text };
        transcriptPreview = transcript.text;
      }
    } catch (error: any) {
      log.warn("VOICE_TRANSCRIBE_FAILED", { message: error?.message });
    }
  }

  /**
   * Helper: prepend a 🎙️ transcript banner to the bot's first reply when
   * the user sent a voice note. Lets the user verify what we heard.
   */
  function withTranscriptBanner(replies: OutgoingReply[]): OutgoingReply[] {
    if (!transcriptPreview || replies.length === 0) return replies;
    const banner = `🎙️ _I heard:_ "${transcriptPreview.trim().slice(0, 200)}"`;
    return [{ text: banner, state: replies[0].state }, ...replies];
  }

  /**
   * Final post-processing for every reply path:
   *
   * For INDIC LANGUAGES needing runtime translation (ta/ml):
   *   - We MUST await translateAndSpeak before we can send the text bubble
   *     (because the translated text IS the text). Both text and voice come
   *     from the same model in one call. This is the bottleneck for ta/ml.
   *
   * For ENGLISH or already-translated languages (en/hi/kn):
   *   - Text is already final. We start TTS as a fire-and-forget Promise
   *     attached to the reply (`voicePromise`). The handler can send text
   *     bubbles immediately and pick up the voice when it's ready, in a
   *     SECOND pass. This means the user sees text bubbles in ~1s instead
   *     of ~10s waiting for the slowest TTS to finish.
   *
   * Skipping rules:
   *   - Transcript-banner replies ("🎙️ I heard: ...") stay text-only.
   *   - Replies with media attached (cert PDF) skip voice to avoid overlap.
   */
  async function attachLanguageAndVoice(replies: OutgoingReply[]): Promise<OutgoingReply[]> {
    if (!replies.length) return replies;
    const liveSession = getSession(session.phone);
    const lang = liveSession.language;
    const needsRuntimeTranslation = lang === "ta" || lang === "ml";
    // Voice preference (set during AWAITING_REPLY_MODE). Defaults to "both"
    // until the user picks. Effect:
    //   "text"  → never synthesize voice (zero TTS cost)
    //   "voice" → always synthesize voice (text bubble still goes — but the
    //              handler will only send the voice if mode is "voice")
    //   "both"  → text + voice (default)
    const mode = liveSession.replyMode || "both";
    const includeVoice = mode !== "text";

    // Only the LAST reply in a batch gets a voice note. The earlier replies
    // are usually banners ("welcome back"), short transitions ("here's the
    // menu"), or emoji headers — synthesizing voice for each one creates a
    // pile of audio messages that the user has to swipe through.
    // The last reply is almost always the actionable one (the prompt or menu).
    const lastIdx = replies.length - 1;
    const shouldVoice = (idx: number, r: OutgoingReply): boolean => {
      if (!includeVoice) return false;
      if (r.text.startsWith("🎙️")) return false; // transcript banner
      if (r.media) return false;                  // PDF / image attachment
      // In "voice" mode every actionable bubble still gets voice.
      // In "both" mode we only voice the last reply to reduce noise.
      if (mode === "voice") return true;
      return idx === lastIdx;
    };

    if (needsRuntimeTranslation) {
      // ta/ml — must await text from the unified audio model.
      const tasks = replies.map(async (r, idx) => {
        if (r.text.startsWith("🎙️")) return r;
        if (r.media) return r;

        if (!shouldVoice(idx, r)) {
          // Text-only path — translate via the cheaper text path, skip TTS.
          const translatedText = await translateForUser(r.text, { targetLanguage: lang });
          return { ...r, text: translatedText };
        }

        const result = await translateAndSpeak({ text: r.text, language: lang });
        if (result) {
          return {
            ...r,
            text: result.text,
            voice: {
              buffer: result.audioBuffer,
              mimetype: result.audioMimetype,
            },
          };
        }
        // Fall through to text-only translation + TTS-promise path
        const translatedText = await translateForUser(r.text, { targetLanguage: lang });
        const voicePromise = synthesizeSpeech({ text: translatedText, language: lang });
        return { ...r, text: translatedText, voicePromise };
      });
      return Promise.all(tasks);
    }

    // en/hi/kn — text is already final; voice is async.
    return replies.map((r, idx) => {
      if (!shouldVoice(idx, r)) return r;
      const voicePromise = synthesizeSpeech({ text: r.text, language: lang });
      return { ...r, voicePromise };
    });
  }

  /** Combine the transcript banner + translation + TTS into one finalize step. */
  async function finalize(replies: OutgoingReply[]): Promise<OutgoingReply[]> {
    // Record bot replies in history (first reply only, to save memory)
    if (replies.length > 0 && replies[0].text) {
      const s = getSession(phone);
      const history = (s.messageHistory || []).slice(-19);
      history.push({ role: "bot", text: replies[0].text.slice(0, 200), ts: Date.now() });
      updateSession(phone, { messageHistory: history });
    }
    return attachLanguageAndVoice(withTranscriptBanner(replies));
  }

  // ------- Exit gate -------
  // If the user previously typed EXIT/QUIT/BYE we go silent until they
  // greet again. A real greeting (HI / HELLO / NAMASTE / etc.) wakes us up
  // and we drop them straight into their saved menu.
  if (session.exited) {
    const body = (message.body || "").trim();
    if (body && isStartCommand(body)) {
      session = updateSession(session.phone, { exited: false });
      const m = getMessages(session.language);
      const welcome = { text: m.exitWelcomeBack(session.name), state: session.state };
      // If they're onboarded, drop into their main menu. Otherwise show
      // the greeting (they need to finish identity setup).
      if (session.onboardingComplete && session.role) {
        transition(session.phone, mainMenuFor(session.role));
        return finalize([welcome, ...menuTextFor(session)]);
      }
      transition(session.phone, "GREETING");
      return finalize([welcome, { text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }]);
    }
    // Anything else while exited: stay silent. We don't even reply.
    log.info("MESSAGE_IGNORED_EXITED", { phone, bodyLen: body.length });
    return [];
  }

  // ------- Returning user hydration -------
  // If we have an onboarded profile in the backend but our in-memory session
  // is fresh (e.g. after a deploy restart), pull the profile in BEFORE running
  // universal commands. This way commands like "change language to hindi"
  // operate on the correct hydrated state instead of triggering a generic
  // welcome-back reply that swallows the user's intent.
  if (session.state === "GREETING" && !session.onboardingComplete) {
    const hydrated = await tryHydrateFromBackend(session);
    if (hydrated && hydrated.onboardingComplete) {
      session = hydrated;
      // Continue to universal commands / dispatch — only show welcome-back
      // if we don't end up handling the message a more specific way.
    }
  }

  // ------- Universal commands (text-based, work in any state) -------
  const universalReply = await handleUniversalCommands(session, message);
  if (universalReply) return finalize(universalReply);

  // ------- Returning user lift-off (deferred until after universal commands) -------
  // If the user is hydrated/onboarded but currently sitting at GREETING (just
  // came back after a restart or first contact today) AND no universal command
  // matched, give them the welcome-back + menu.
  if (session.state === "GREETING" && session.onboardingComplete) {
    return finalize(handleReturningUser(session));
  }

  // ------- NLU pre-processing for free-form input -------
  // If the input looks like free-form natural language (not a single digit,
  // not a photo, not empty), try to map it to an option/command/question
  // BEFORE dispatching. The existing flow handlers expect numbers/exact
  // aliases, so we synthesize that for them.
  const nluTransformedMessage = await tryNLUTransform(session, message);

  // If NLU detected a question about the platform, answer it inline and stay
  // in the current state. The user can keep their flow afterwards.
  const askedQuestion =
    (message as any).__nluAskQuestion ??
    (nluTransformedMessage as any)?.__nluAskQuestion;
  if (askedQuestion) {
    const answer = await answerQuestion(askedQuestion, session.language);
    if (answer) {
      log.info("QA_ANSWERED", {
        phone,
        state: session.state,
        questionPreview: askedQuestion.slice(0, 60),
      });
      // If we're at the very first turn (GREETING), advance to AWAITING_LANGUAGE
      // after answering — otherwise the user would land in GREETING again on
      // their next message and have to "wake" the bot a second time.
      if (session.state === "GREETING") {
        const advanced = (await import("./state")).transition(session.phone, "AWAITING_LANGUAGE");
        const reEntered = await reEnterState(advanced);
        return finalize([{ text: answer, state: advanced.state }, ...reEntered]);
      }
      // Re-show the current prompt so user knows they can continue
      const reEntered = await reEnterState(session);
      return finalize([{ text: answer, state: session.state }, ...reEntered]);
    }
  }

  // After NLU transformed the body to a canonical command/keyword, re-run
  // universal commands so MENU/BACK/HELP/LANGUAGE/etc. fire correctly.
  if (nluTransformedMessage) {
    const universalAfterNLU = await handleUniversalCommands(session, nluTransformedMessage);
    if (universalAfterNLU) return finalize(universalAfterNLU);
  }

  // ------- Voice confirmation for critical inputs -------
  // When a voice note was transcribed in a state that collects name or price,
  // ask the user to confirm before proceeding.
  const VOICE_CONFIRM_STATES = new Set([
    "SELLER_PRECHECK_NAME", "SELLER_ONBOARD_NAME", "BUYER_ONBOARD_NAME",
    "SAKHI_ONBOARD_NAME", "ADD_PRODUCT_EDIT_PRICE", "ADD_PRODUCT_EDIT_TITLE",
    "ADD_PRODUCT_DETAILS", "REQUEST_BRIEF", "REQUEST_BUDGET", "SEARCH_PROMPT",
    // Buyer order details — phone digits or address typos in a voice transcript
    // would corrupt the order. Always confirm before sending.
    "BUYER_PURCHASE_DETAILS",
  ]);

  // Check if user is responding to a pending voice confirmation
  if (session.context.voiceConfirm) {
    const pending = session.context.voiceConfirm;
    const answer = normalizeText(message.body);
    if (answer === "1" || isYes(answer)) {
      // Confirmed — proceed with the stored text
      updateSession(session.phone, { context: { voiceConfirm: undefined } });
      message = { ...message, body: pending.text, hasAudio: false };
      transcriptPreview = undefined; // don't show banner again
    } else if (answer === "2" || isNo(answer)) {
      // Rejected — ask them to try again
      updateSession(session.phone, { context: { voiceConfirm: undefined } });
      const m = getMessages(session.language);
      const retryMsg = session.language === "hi"
        ? "🎙️ ठीक है, कृपया फिर से बोलें या टाइप करें।"
        : session.language === "kn"
          ? "🎙️ ಸರಿ, ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ."
          : "🎙️ OK, please try again — speak or type.";
      return finalize([{ text: retryMsg, state: session.state }]);
    } else {
      // Treat as "yes" if they typed something else (probably the corrected text)
      updateSession(session.phone, { context: { voiceConfirm: undefined } });
      // Let it fall through to dispatch with whatever they typed
    }
  } else if (transcriptPreview && VOICE_CONFIRM_STATES.has(session.state)) {
    // New voice note in a critical state — ask for confirmation
    updateSession(session.phone, {
      context: { voiceConfirm: { text: transcriptPreview, state: session.state } },
    });
    const confirmMsg = session.language === "hi"
      ? `🎙️ मैंने सुना: "*${transcriptPreview.slice(0, 150)}*"\n\nक्या यह सही है?\n1. ✅ हाँ\n2. ❌ नहीं, फिर से बोलूँगी`
      : session.language === "kn"
        ? `🎙️ ನಾನು ಕೇಳಿದ್ದು: "*${transcriptPreview.slice(0, 150)}*"\n\nಇದು ಸರಿಯೇ?\n1. ✅ ಹೌದು\n2. ❌ ಇಲ್ಲ, ಮತ್ತೆ ಹೇಳುತ್ತೇನೆ`
        : `🎙️ I heard: "*${transcriptPreview.slice(0, 150)}*"\n\nIs this correct?\n1. ✅ Yes\n2. ❌ No, I'll try again`;
    return finalize([{ text: confirmMsg, state: session.state }]);
  }

  // ------- Dispatch by state -------
  try {
    const replies = await dispatch(session, nluTransformedMessage ?? message);
    if (replies && replies.length > 0) {
      // SAFETY NET: if dispatch returned an "invalid choice" / "didn't understand"
      // reply AND we haven't tried NLU yet (e.g. the input was a single keyword
      // we thought was an exact command but flow rejected it), retry once with
      // a forced NLU pass.
      if (
        !nluTransformedMessage &&
        replies.some((r) => looksLikeRejectionReply(r.text))
      ) {
        log.info("DISPATCH_REJECTED_RETRYING_WITH_NLU", {
          phone,
          state: session.state,
        });
        const forced = await tryNLUTransform(
          session,
          { ...message, body: message.body || "" },
        );
        if (forced) {
          // Re-run universal commands on forced transform
          const universalForced = await handleUniversalCommands(session, forced);
          if (universalForced) return finalize(universalForced);
          // Re-dispatch with forced transform
          const retryReplies = await dispatch(session, forced);
          if (retryReplies && retryReplies.length > 0) return finalize(retryReplies);
        }
        // Forced NLU detected a question
        const forcedQ = (forced as any)?.__nluAskQuestion;
        if (forcedQ) {
          const answer = await answerQuestion(forcedQ, session.language);
          if (answer) {
            const reEntered = await reEnterState(session);
            return finalize([{ text: answer, state: session.state }, ...reEntered]);
          }
        }
      }
      return finalize(replies);
    }
    return finalize(await handleUnparseable(session));
  } catch (error: any) {
    log.error("ENGINE_HANDLER_FAILED", {
      state: session.state,
      message: error?.message,
      stack: String(error?.stack || "").slice(0, 400),
    });
    const m = getMessages(session.language);
    return finalize([{ text: m.errorGeneric(), state: session.state }]);
  }
}

/**
 * Did this reply look like a "didn't understand / invalid option" message?
 * Used to trigger a retry with NLU when the cheap parser missed.
 *
 * Important: we ONLY want to match true rejection replies, not handler prompts
 * that happen to contain words like "please send" (e.g. asking the buyer for
 * their address). False positives here cause valid input to get re-routed
 * through smartAssist, which then responds with generic AI text instead of
 * letting the flow handler advance.
 */
function looksLikeRejectionReply(text: string): boolean {
  const t = (text || "").toLowerCase();
  // Strong signals: the word "invalid" or explicit "didn't understand" copy.
  if (
    t.includes("invalid") ||
    t.includes("not one of the options") ||
    t.includes("didn't understand") ||
    t.includes("didn’t understand") ||
    t.includes("समझ नहीं") || // Hindi "don't understand"
    t.includes("ಅರ್ಥವಾಗ") // Kannada "doesn't make sense"
  ) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Universal commands
// ---------------------------------------------------------------------------

async function handleUniversalCommands(
  session: UserSession,
  message: IncomingMessage,
): Promise<OutgoingReply[] | null> {
  const m = getMessages(session.language);
  const text = (message.body || "").trim();

  // RESET — full session reset
  if (isResetCommand(text)) {
    const fresh = resetSession(session.phone);
    // Also reset the community_members row so re-onboarding creates a
    // fresh pending entry visible in /admin. Best-effort — never blocks.
    fetch(`${config.backendUrl}/api/community/reset-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: session.phone }),
    }).catch(() => undefined);
    return [{ text: m.resetConfirmed(), state: fresh.state }];
  }

  // EXIT / QUIT / BYE — graceful exit. Profile preserved. Bot goes silent
  // until user greets again (HI / HELLO / NAMASTE).
  if (isExitCommand(text)) {
    updateSession(session.phone, { exited: true });
    return [{ text: m.exitGoodbye(session.name), state: session.state }];
  }

  // MENU — go to main menu.
  //
  // For ONBOARDED users: go to their main menu.
  // For NON-onboarded users in identity / language / tutorial states:
  //   show the greeting again so they can pick a language.
  // For NON-onboarded users mid-flow (pre-check, community wait, locked
  //   menu, onboarding questions): stay in the current state and re-render
  //   its prompt — they shouldn't lose their progress.
  if (isMenuCommand(text)) {
    if (session.onboardingComplete) {
      transition(session.phone, mainMenuFor(session.role));
      return menuTextFor(session);
    }
    // Pre-onboarding states where MENU should re-render the current prompt
    // instead of dumping the user back to the greeting.
    const KEEP_STATES: ReadonlyArray<UserSession["state"]> = [
      "SELLER_PRECHECK_NAME",
      "SELLER_PRECHECK_ADDRESS",
      "SELLER_PRECHECK_CONTACT",
      "SELLER_COMMUNITY_JOIN",
      "SELLER_COMMUNITY_WAITING",
      "SELLER_LOCKED_MENU",
      "SELLER_ONBOARD_NAME",
      "SELLER_ONBOARD_DISTRICT",
      "SELLER_ONBOARD_CRAFT",
      "SELLER_ONBOARD_SHG_ASK",
      "SELLER_ONBOARD_SHG_NAME",
      "SELLER_ONBOARD_SAKHI_HELP",
      "BUYER_ONBOARD_NAME",
      "BUYER_ONBOARD_LOCATION",
      "BUYER_ONBOARD_INTERESTS",
      "SAKHI_ONBOARD_NAME",
      "SAKHI_ONBOARD_DISTRICT",
      "SAKHI_ONBOARD_GROUPS",
    ];
    if (KEEP_STATES.includes(session.state)) {
      // Render a short "still here, keep going" preface, then re-show the
      // current prompt so the user knows where they are without losing
      // their progress. We use the existing helpInState copy which is
      // localized in every language pack.
      const reEntered = await reEnterState(session);
      return reEntered;
    }
    // Otherwise (GREETING / AWAITING_LANGUAGE / AWAITING_REPLY_MODE /
    // AWAITING_ROLE / TUTORIAL) — show greeting.
    transition(session.phone, "GREETING");
    return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
  }

  // BACK — pop state stack
  if (isBackCommand(text) || isUndoCommand(text)) {
    const popped = popState(session.phone);
    if (!popped) {
      return [{ text: m.cantGoBack(), state: session.state }];
    }
    return [{ text: m.goingBack(), state: popped.state }, ...(await reEnterState(popped))];
  }

  // HELP
  if (isHelpCommand(text)) {
    return [{ text: m.help(), state: session.state }];
  }

  // CHANGE LANGUAGE in NL — "use malayalam", "speak hindi", "change to kannada"
  // Detected before the bare "language" command so a phrase like
  // "change language to malayalam" jumps straight to ml without a re-pick.
  const directLang = parseChangeLanguageCommand(text);
  if (directLang) {
    const updated = updateSession(session.phone, { language: directLang });
    saveProfile(session.phone, { language: directLang } as any).catch(() => undefined);
    const langLabel = labelForLang(directLang);
    const mNew = getMessages(directLang);
    // Re-render the current state's prompt in the new language
    const reEntered = await reEnterState(updated);
    return [
      { text: mNew.languageConfirmed(langLabel), state: updated.state },
      ...reEntered,
    ];
  }

  // LANGUAGE — re-pick (only when user types the bare "language" keyword)
  if (isLanguageCommand(text)) {
    updateSession(session.phone, { stateStack: [...session.stateStack, session.state] });
    transition(session.phone, "AWAITING_LANGUAGE");
    return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
  }

  // VOICE / MODE — re-pick how replies are delivered
  if (isVoicePrefCommand(text)) {
    updateSession(session.phone, { stateStack: [...session.stateStack, session.state] });
    transition(session.phone, "AWAITING_REPLY_MODE");
    return [{ text: m.replyModeAsk(), state: "AWAITING_REPLY_MODE" }];
  }

  // HUMAN — escalate
  if (isHumanCommand(text)) {
    return [{ text: m.humanEscalated(), state: session.state }];
  }

  // PROFILE
  if (isProfileCommand(text)) {
    return [{ text: profileSummary(session), state: session.state }];
  }

  // STATUS — debug / demo
  if (isStatusCommand(text)) {
    return [{ text: statusReport(session), state: session.state }];
  }

  // STOP — full opt-out reset
  if (isCancelCommand(text) && session.state === "GREETING") {
    return [{ text: m.resetConfirmed(), state: "GREETING" }];
  }

  // SWITCH TO BUYER — let onboarded users browse as a buyer
  if (isBuyerSwitchCommand(text) && session.onboardingComplete) {
    return switchActiveRole(session, "buyer");
  }

  // SWITCH TO SELLER — switch back to seller mode
  if (isSellerSwitchCommand(text) && session.onboardingComplete) {
    return switchActiveRole(session, "seller");
  }

  // BUY <productId> — deeplink from "Share on WhatsApp" button on a listing.
  // Look up the product and drop straight into the purchase details flow.
  const buyMatch = text.match(/^buy\s+([a-z0-9-]{8,})/i);
  if (buyMatch) {
    const productId = buyMatch[1].trim();
    try {
      const { api } = await import("../services/apiClient");
      const res = await api.get<any>(`/api/products/${productId}`);
      const p = res.data?.data ?? res.data;
      if (p && p.id) {
        updateSession(session.phone, {
          context: {
            ...session.context,
            purchase: {
              productId: p.id,
              productTitle: p.title,
              productPrice: p.price,
              sellerName: p.artisan?.name,
              sellerPhone: p.artisan?.phone,
            },
          },
        });
        transition(session.phone, "BUYER_PURCHASE_DETAILS");
        const liveSession = getSession(session.phone);
        const lang = liveSession.language || "en";
        const askText = lang === "hi"
          ? `🛒 *${p.title}* — ₹${p.price}\n\nऑर्डर करने के लिए अपना नाम, पता और फ़ोन नंबर भेजें।\n\n_उदाहरण: राहुल, MG Road, बेंगलुरु, 9876543210_`
          : lang === "kn"
          ? `🛒 *${p.title}* — ₹${p.price}\n\nಆರ್ಡರ್ ಮಾಡಲು ನಿಮ್ಮ ಹೆಸರು, ವಿಳಾಸ ಮತ್ತು ಫೋನ್ ನಂಬರ್ ಕಳುಹಿಸಿ।`
          : `🛒 *${p.title}* — ₹${p.price}\n\nTo order, please send your *name, delivery address, and phone number*.\n\n_Example: Rahul, MG Road, Bengaluru, 9876543210_`;
        return [{ text: askText, state: "BUYER_PURCHASE_DETAILS" }];
      }
    } catch {
      // Product not found or API down — fall through to normal flow
    }
  }

  // Re-trigger greeting from a fresh "hi" if user is currently idle in a menu.
  // We DO NOT do this when onboarded — they'd lose context. They can use MENU instead.
  if (!session.onboardingComplete && session.state === "GREETING" && isStartCommand(text)) {
    return null; // fall through to dispatch which handles GREETING
  }

  // NETWORK — show community network info (for Sakhis and sellers)
  const networkTriggers = ["network", "communities", "collab", "collaboration", "नेटवर्क", "ಸಮುದಾಯ", "समुदाय"];
  if (networkTriggers.includes(normalizeText(text)) && session.onboardingComplete) {
    const { api } = await import("../services/apiClient");
    try {
      const [commRes, reqRes] = await Promise.all([
        api.get<any>("/api/network/communities"),
        api.get<any>("/api/network/requests", { params: { communityId: undefined, status: "pending" } }),
      ]);
      const comms = commRes.data?.data?.communities || [];
      const reqs = (reqRes.data?.data?.requests || []).slice(0, 3);

      const commList = comms.map((c: any, i: number) => `  ${i + 1}. *${c.name}* (${c.district}) — ${c.craftType}, ${c.memberCount} members`).join("\n");
      const reqList = reqs.length
        ? reqs.map((r: any) => `  • ${r.fromCommunity?.name || "?"} → ${r.toCommunity?.name || "?"}: ${r.description.slice(0, 50)}...`).join("\n")
        : "  None pending";

      const networkMsg = session.language === "hi"
        ? `🤝 *समुदाय नेटवर्क*\n\n*सक्रिय समुदाय:*\n${commList}\n\n*लंबित अनुरोध:*\n${reqList}\n\n_वेबसाइट पर अधिक देखें: hastkala.in/network_`
        : session.language === "kn"
          ? `🤝 *ಸಮುದಾಯ ನೆಟ್‌ವರ್ಕ್*\n\n*ಸಕ್ರಿಯ ಸಮುದಾಯಗಳು:*\n${commList}\n\n*ಬಾಕಿ ವಿನಂತಿಗಳು:*\n${reqList}\n\n_ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಹೆಚ್ಚು ನೋಡಿ: hastkala.in/network_`
          : `🤝 *Community Network*\n\n*Active communities:*\n${commList}\n\n*Pending requests:*\n${reqList}\n\n_See more on the website: hastkala.in/network_`;

      return [{ text: networkMsg, state: session.state }];
    } catch {
      return [{ text: "🤝 *Community Network*\n\nVisit hastkala.in/network to connect with other artisan communities.", state: session.state }];
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// State dispatch
// ---------------------------------------------------------------------------

async function dispatch(session: UserSession, message: IncomingMessage): Promise<OutgoingReply[]> {
  const m = getMessages(session.language);

  switch (session.state) {
    // --- Identity ---
    case "GREETING":
      return handleGreeting(session, message);
    case "AWAITING_LANGUAGE":
      return handleAwaitingLanguage(session, message);
    case "AWAITING_REPLY_MODE":
      return handleAwaitingReplyMode(session, message);
    case "AWAITING_ROLE":
      return handleAwaitingRole(session, message);
    case "TUTORIAL":
      return handleTutorial(session, message);

    // --- Seller community / certification gate ---
    case "SELLER_PRECHECK_NAME":
      return handleSellerPrecheckName(session, message);
    case "SELLER_PRECHECK_ADDRESS":
      return handleSellerPrecheckAddress(session, message);
    case "SELLER_PRECHECK_CONTACT":
      return handleSellerPrecheckContact(session, message);
    case "SELLER_COMMUNITY_JOIN":
      return handleSellerCommunityJoin(session, message);
    case "SELLER_COMMUNITY_WAITING":
      return handleSellerCommunityWaiting(session, message);
    case "SELLER_LOCKED_MENU":
      return handleSellerLockedMenu(session, message);

    // --- Seller onboarding ---
    case "SELLER_ONBOARD_NAME":
      return handleSellerOnboardName(session, message);
    case "SELLER_ONBOARD_DISTRICT":
      return handleSellerOnboardDistrict(session, message);
    case "SELLER_ONBOARD_CRAFT":
      return handleSellerOnboardCraft(session, message);
    case "SELLER_ONBOARD_SHG_ASK":
      return handleSellerOnboardShgAsk(session, message);
    case "SELLER_ONBOARD_SHG_NAME":
      return handleSellerOnboardShgName(session, message);
    case "SELLER_ONBOARD_SAKHI_HELP":
      return handleSellerOnboardSakhiHelp(session, message);

    // --- Buyer onboarding ---
    case "BUYER_ONBOARD_NAME":
      return handleBuyerOnboardName(session, message);
    case "BUYER_ONBOARD_LOCATION":
      return handleBuyerOnboardLocation(session, message);
    case "BUYER_ONBOARD_INTERESTS":
      return handleBuyerOnboardInterests(session, message);

    // --- Sakhi onboarding ---
    case "SAKHI_ONBOARD_NAME":
      return handleSakhiOnboardName(session, message);
    case "SAKHI_ONBOARD_DISTRICT":
      return handleSakhiOnboardDistrict(session, message);
    case "SAKHI_ONBOARD_GROUPS":
      return handleSakhiOnboardGroups(session, message);

    // --- Seller menu ---
    case "SELLER_MENU": {
      // Guard: non-certified sellers should not reach the full menu
      if (session.role === "seller" && !session.isCertified) {
        transition(session.phone, "SELLER_LOCKED_MENU");
        return [{ text: m.sellerLockedMenu(), state: "SELLER_LOCKED_MENU" }];
      }
      // Special-case: deferred menu options need a second-step "enter" call.
      const deferred = await tryDeferredEntry(session, message);
      if (deferred) return deferred;
      return handleSellerMenu(session, message);
    }
    case "SELLER_MENU_MORE":
      return handleSellerMenuMore(session, message);

    // --- Add product ---
    case "ADD_PRODUCT_PHOTOS":
      return handleAddProductPhotos(session, message);
    case "ADD_PRODUCT_DETAILS":
      return handleAddProductDetails(session, message);
    case "ADD_PRODUCT_CONFIRM":
      return handleAddProductConfirm(session, message);
    case "ADD_PRODUCT_EDIT_PRICE":
      return handleAddProductEditPrice(session, message);
    case "ADD_PRODUCT_EDIT_QUANTITY":
      return handleAddProductEditQuantity(session, message);
    case "ADD_PRODUCT_EDIT_TITLE":
      return handleAddProductEditTitle(session, message);
    case "ADD_PRODUCT_EDIT_DESCRIPTION":
      return handleAddProductEditDescription(session, message);

    // --- My products ---
    case "MY_PRODUCTS_LIST":
      return handleMyProductsList(session, message);
    case "MY_PRODUCTS_MANAGE":
      return handleMyProductsManage(session, message);
    case "MY_PRODUCTS_EDIT_PRICE":
      return handleMyProductsEditPrice(session, message);
    case "MY_PRODUCTS_EDIT_STOCK":
      return handleMyProductsEditStock(session, message);
    case "MY_PRODUCTS_EDIT_TITLE":
      return handleMyProductsEditTitle(session, message);
    case "MY_PRODUCTS_EDIT_DESC":
      return handleMyProductsEditDesc(session, message);

    // --- Orders ---
    case "ORDERS_LIST":
      return handleOrdersList(session, message);
    case "ORDERS_MANAGE":
      return handleOrdersManage(session, message);

    // --- Buyer menu ---
    case "BUYER_MENU":
      return handleBuyerMenu(session, message);
    case "BUYER_MENU_MORE":
      return handleBuyerMenuMore(session, message);

    // --- Browse / search ---
    case "BROWSE_CATEGORIES":
      return handleBrowseCategories(session, message);
    case "BROWSE_RESULTS":
      return handleBrowseResults(session, message);
    case "BROWSE_PRODUCT_DETAIL":
      return handleBrowseProductDetail(session, message);
    case "BUYER_PURCHASE_DETAILS":
      return handleBuyerPurchaseDetails(session, message);
    case "BUYER_PURCHASE_CONFIRM":
      return handleBuyerPurchaseConfirm(session, message);
    case "TRENDING_LIST":
      return enterTrending(session);
    case "SEARCH_PROMPT":
      return handleSearchPrompt(session, message);
    case "SEARCH_RESULTS":
      return handleSearchResults(session, message);

    // --- Buyer requests ---
    case "REQUEST_BRIEF":
      return handleRequestBrief(session, message);
    case "REQUEST_DELIVERY_DATE":
      return handleRequestDate(session, message);
    case "REQUEST_LOCATION":
      return handleRequestLocation(session, message);
    case "REQUEST_BUDGET":
      return handleRequestBudget(session, message);
    case "REQUEST_CONFIRM":
      return handleRequestConfirm(session, message);

    // --- Seller quotes ---
    case "REQUEST_LIST":
      return enterSellerRequestList(session);
    case "QUOTE_VIEW_INCOMING":
      return handleQuoteViewIncoming(session, message);
    case "QUOTE_PRICE":
      return handleQuotePrice(session, message);
    case "QUOTE_DELIVERY":
      return handleQuoteDelivery(session, message);
    case "QUOTE_NOTE":
      return handleQuoteNote(session, message);
    case "QUOTE_CONFIRM":
      return handleQuoteConfirm(session, message);
    case "QUOTE_BROWSE":
      return handleQuoteBrowse(session, message);

    // --- Sakhi ---
    case "SAKHI_MENU":
      return handleSakhiMenu(session, message);
    case "SAKHI_MENU_MORE":
      return handleSakhiMenuMore(session, message);
    case "SAKHI_PENDING_LIST":
      return handleSakhiPendingList(session, message);
    case "SAKHI_PENDING_DETAIL":
      return handleSakhiPendingDetail(session, message);
    case "SAKHI_VERIFY_SELLER_LIST":
      return [{ text: m.notImplemented(), state: session.state }];

    case "ERROR":
    default: {
      // Self-heal from ERROR state — reset to greeting.
      resetSession(session.phone);
      return [{ text: m.resetConfirmed(), state: "GREETING" }];
    }
  }
}

/**
 * Some menu options (My Products, Orders, Buyer Requests) require an async
 * "enter" call rather than a static prompt. We trigger them here on the very
 * next dispatch tick after the menu transition.
 */
async function tryDeferredEntry(
  session: UserSession,
  message: IncomingMessage,
): Promise<OutgoingReply[] | null> {
  // Look at the menu choice to decide which entry point to call.
  // (We dispatch the actual menu handler after this, so we don't return on
  // miss — only return when we handled it ourselves.)
  void message;
  void session;
  return null;
}

// ---------------------------------------------------------------------------
// Re-enter a state we just popped to (re-render its prompt)
// ---------------------------------------------------------------------------

async function reEnterState(session: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(session.language);

  switch (session.state) {
    case "GREETING":
      return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
    case "AWAITING_LANGUAGE":
      return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
    case "AWAITING_REPLY_MODE":
      return [{ text: m.replyModeAsk(), state: "AWAITING_REPLY_MODE" }];
    case "AWAITING_ROLE":
      return [{ text: m.roleAsk(), state: "AWAITING_ROLE" }];
    case "SELLER_PRECHECK_NAME":
      return [{ text: m.sellerPrecheckName(), state: "SELLER_PRECHECK_NAME" }];
    case "SELLER_PRECHECK_ADDRESS":
      return [{ text: m.sellerPrecheckAddress(), state: "SELLER_PRECHECK_ADDRESS" }];
    case "SELLER_PRECHECK_CONTACT":
      return [{ text: m.sellerPrecheckContact(session.phone), state: "SELLER_PRECHECK_CONTACT" }];
    case "SELLER_COMMUNITY_JOIN":
      return [
        {
          text: m.sellerCommunityJoin(config.sellerCommunityLink),
          state: "SELLER_COMMUNITY_JOIN",
        },
      ];
    case "SELLER_COMMUNITY_WAITING":
      return [{ text: m.sellerCommunityWaiting(), state: "SELLER_COMMUNITY_WAITING" }];
    case "SELLER_LOCKED_MENU":
      return [{ text: m.sellerLockedMenu(), state: "SELLER_LOCKED_MENU" }];
    case "SELLER_MENU":
      return menuTextFor(session);
    case "BUYER_MENU":
      return menuTextFor(session);
    case "SAKHI_MENU":
      return menuTextFor(session);
    case "SELLER_MENU_MORE":
      return [{ text: m.sellerMenuMore(), state: session.state }];
    case "BUYER_MENU_MORE":
      return [{ text: m.buyerMenuMore(), state: session.state }];
    case "SAKHI_MENU_MORE":
      return [{ text: m.sakhiMenuMore(), state: session.state }];
    case "BROWSE_CATEGORIES":
      return [{ text: m.browseAskCategory(), state: session.state }];
    case "REQUEST_BRIEF":
      return [{ text: m.requestStart(), state: session.state }];
    default:
      // Fallback: tell user they're back, let them keep typing.
      return [{ text: m.helpInState(session.state), state: session.state }];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function menuTextFor(session: UserSession): OutgoingReply[] {
  const m = getMessages(session.language);
  const name = session.name || "";
  switch (session.role) {
    case "seller":
      return [{ text: m.sellerMenu(name), state: "SELLER_MENU" }];
    case "buyer":
      return [{ text: m.buyerMenu(name), state: "BUYER_MENU" }];
    case "sakhi":
      return [{ text: m.sakhiMenu(name), state: "SAKHI_MENU" }];
    default:
      return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
  }
}

/**
 * Switch the user's active role and drop them into that role's main menu.
 *
 * Rules:
 *   - If they don't have the target role yet, add it (sellers can become
 *     buyers freely; buyers can become sellers but must go through the
 *     community/certification gate first).
 *   - Save the active role to the backend so returning sessions remember.
 */
function switchActiveRole(session: UserSession, target: "seller" | "buyer"): OutgoingReply[] {
  const m = getMessages(session.language);
  const name = session.name || "";

  // Already in this role — just refresh the menu
  if (session.role === target) {
    transition(session.phone, mainMenuFor(target));
    return menuTextFor({ ...session, role: target } as UserSession);
  }

  // Buyer trying to switch to seller without certification → send them to the gate
  if (target === "seller" && !session.isCertified) {
    const roles: Role[] = session.roles.includes("seller") ? session.roles : [...session.roles, "seller"];
    updateSession(session.phone, { role: "seller", roles });
    transition(session.phone, "SELLER_PRECHECK_NAME");
    return [
      { text: roleSwitchSellerBanner(session.language, name), state: "SELLER_PRECHECK_NAME" },
      { text: m.sellerPrecheckName(), state: "SELLER_PRECHECK_NAME" },
    ];
  }

  // Add the target role if they don't have it yet
  const roles = session.roles.includes(target) ? session.roles : [...session.roles, target];

  // For buyers being added to a seller's profile, also seed buyer-side fields
  // (interests) so requestStore matching still works. We use defaults — the
  // user can refine later via "Change Location" / "More" menu.
  const patch: Partial<UserSession> = { role: target, roles };

  updateSession(session.phone, patch);

  // Best-effort persist to backend
  saveProfile(session.phone, {
    role: target,
    roles,
    onboardingComplete: true,
  } as any).catch(() => undefined);

  // Drop into the target role's main menu
  transition(session.phone, mainMenuFor(target));

  // Show a clear "you're now in X mode" banner + the menu
  const switchMsg =
    target === "buyer"
      ? roleSwitchBuyerBanner(session.language, name)
      : roleSwitchSellerBanner(session.language, name);

  return [
    { text: switchMsg, state: mainMenuFor(target) },
    ...(target === "seller"
      ? [{ text: m.sellerMenu(name), state: "SELLER_MENU" as const }]
      : [{ text: m.buyerMenu(name), state: "BUYER_MENU" as const }]),
  ];
}

function roleSwitchBuyerBanner(lang: UserSession["language"], name: string): string {
  const namePart = name ? `, ${name}` : "";
  switch (lang) {
    case "hi":
      return `🛍️ *आप अब खरीदार मोड में हैं${namePart}.*\n\n_विक्रेता मोड पर वापस जाने के लिए *SELLER* लिखें।_`;
    case "kn":
      return `🛍️ *ನೀವು ಈಗ ಖರೀದಿದಾರ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ${namePart}.*\n\n_ಮಾರಾಟಗಾರ ಮೋಡ್‌ಗೆ ಮರಳಲು *SELLER* ಬರೆಯಿರಿ._`;
    default:
      return `🛍️ *You're now in Buyer mode${namePart}.*\n\n_Reply *SELLER* anytime to switch back to selling._`;
  }
}

function roleSwitchSellerBanner(lang: UserSession["language"], name: string): string {
  const namePart = name ? `, ${name}` : "";
  switch (lang) {
    case "hi":
      return `🌸 *आप अब विक्रेता मोड में हैं${namePart}.*\n\n_खरीदार मोड पर जाने के लिए *BUYER* लिखें।_`;
    case "kn":
      return `🌸 *ನೀವು ಈಗ ಮಾರಾಟಗಾರ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ${namePart}.*\n\n_ಖರೀದಿದಾರ ಮೋಡ್‌ಗೆ ಹೋಗಲು *BUYER* ಬರೆಯಿರಿ._`;
    default:
      return `🌸 *You're now in Seller mode${namePart}.*\n\n_Reply *BUYER* anytime to shop as a buyer._`;
  }
}

function profileSummary(session: UserSession): string {
  const lines = [`*Your HastKala profile*`, ``];
  if (session.name) lines.push(`Name: ${session.name}`);
  if (session.role) lines.push(`Role: ${session.role}`);
  if (session.district) lines.push(`Location: ${session.district}`);
  if (session.craftCategory) lines.push(`Craft: ${session.craftCategory}`);
  if (session.shgName) lines.push(`Group: ${session.shgName}`);
  lines.push(`Language: ${session.language}`);
  lines.push("");
  lines.push("_Reply MENU to return._");
  return lines.join("\n");
}

function statusReport(session: UserSession): string {
  return [
    `*Session status*`,
    ``,
    `State: ${session.state}`,
    `Role: ${session.role ?? "none"}`,
    `Language: ${session.language}`,
    `Onboarded: ${session.onboardingComplete ? "yes" : "no"}`,
    `Stack: ${session.stateStack.join(" → ") || "(empty)"}`,
  ].join("\n");
}

async function handleUnparseable(session: UserSession): Promise<OutgoingReply[]> {
  const updated = incrementUnparseable(session.phone);
  const m = getMessages(updated.language);

  // Try smart AI assistant before giving up (only for onboarded users to save tokens)
  if (updated.onboardingComplete && updated.unparseableCount < UNPARSEABLE_HELP_THRESHOLD) {
    const { smartAssist } = await import("../services/smartAssist");
    const lastMsg = updated.messageHistory?.slice(-1)[0]?.text;
    if (lastMsg) {
      const aiReply = await smartAssist(updated, lastMsg);
      if (aiReply) {
        // Reset unparseable count since AI handled it
        updateSession(session.phone, { unparseableCount: 0 });
        return [{ text: aiReply, state: updated.state }];
      }
    }
  }

  if (updated.unparseableCount >= UNPARSEABLE_HELP_THRESHOLD) {
    return [
      { text: m.helpInState(updated.state), state: updated.state },
      { text: m.help(), state: updated.state },
    ];
  }

  return [{ text: m.unparseable(), state: updated.state }];
}

// ---------------------------------------------------------------------------
// Backend hydration
// ---------------------------------------------------------------------------

async function tryHydrateFromBackend(session: UserSession): Promise<UserSession | null> {
  try {
    const profile = await loadProfile(session.phone);
    if (!profile || !profile.onboardingComplete) return null;

    const merged = updateSession(session.phone, {
      name: profile.name,
      role: profile.role,
      roles: profile.roles ?? (profile.role ? [profile.role] : []),
      district: profile.district ?? profile.city,
      craftCategory: profile.craftCategory,
      shgName: profile.shgName,
      interests: profile.interests,
      language: profile.language ?? session.language,
      replyMode: (profile as any).replyMode ?? session.replyMode,
      onboardingComplete: true,
      isCertified: (profile as any).isCertified ?? false,
    });
    return merged;
  } catch (error: any) {
    log.warn("HYDRATE_FAILED", { message: error?.message });
    return null;
  }
}

// ---------------------------------------------------------------------------
// NLU pre-processing layer
// ---------------------------------------------------------------------------

/**
 * States where the user's text IS the answer (free-form name, district,
 * brief description, etc.). In these states we DON'T treat input as an
 * option select, but we DO still check for navigation/commands/questions
 * so the user can escape the flow at any time.
 */
const FREE_TEXT_STATES = new Set<ConversationState>([
  "SELLER_PRECHECK_NAME",
  "SELLER_PRECHECK_ADDRESS",
  "SELLER_PRECHECK_CONTACT",
  "SELLER_ONBOARD_NAME",
  "SELLER_ONBOARD_DISTRICT",
  "SELLER_ONBOARD_SHG_NAME",
  "BUYER_ONBOARD_NAME",
  "BUYER_ONBOARD_LOCATION",
  "SAKHI_ONBOARD_NAME",
  "SAKHI_ONBOARD_DISTRICT",
  "SAKHI_ONBOARD_GROUPS",
  "ADD_PRODUCT_DETAILS",
  "ADD_PRODUCT_EDIT_PRICE",
  "ADD_PRODUCT_EDIT_QUANTITY",
  "ADD_PRODUCT_EDIT_TITLE",
  "ADD_PRODUCT_EDIT_DESCRIPTION",
  "MY_PRODUCTS_EDIT_PRICE",
  "MY_PRODUCTS_EDIT_STOCK",
  "MY_PRODUCTS_EDIT_TITLE",
  "MY_PRODUCTS_EDIT_DESC",
  "REQUEST_BRIEF",
  "REQUEST_DELIVERY_DATE",
  "REQUEST_LOCATION",
  "REQUEST_BUDGET",
  "QUOTE_PRICE",
  "QUOTE_DELIVERY",
  "QUOTE_NOTE",
  "SEARCH_PROMPT",
]);

/**
 * Heuristic: does this look like a meta-command rather than the user's
 * actual answer to a free-text prompt? Used to decide whether to bother
 * NLU in a free-text state.
 *
 * Triggers when the message:
 *   - is short (<= 60 chars)
 *   - contains nav/question keywords in any common language
 *   - OR ends with a question mark
 */
function looksLikeMetaCommand(text: string): boolean {
  const t = text.trim();
  if (t.length === 0 || t.length > 80) return false;
  if (/[?？]$/.test(t)) return true;
  const lower = t.toLowerCase();
  // English nav/help keywords
  const navWords = [
    "menu",
    "main menu",
    "go back",
    "back",
    "cancel",
    "stop",
    "reset",
    "language",
    "change language",
    "help",
    "human",
    "agent",
    "support",
    "what is",
    "what does",
    "how do",
    "how does",
    "tell me",
    "explain",
    "doubt",
    "question",
    "join",
    "joined",
    "certified",
    "browse",
    "search",
    // Hindi
    "मेनू",
    "मुख्य",
    "वापस",
    "पीछे",
    "रद्द",
    "बंद",
    "मदद",
    "क्या है",
    "कैसे",
    // Kannada
    "ಮೆನು",
    "ಹಿಂದೆ",
    "ರದ್ದು",
    "ಸಹಾಯ",
    "ಏನು",
    // Tamil
    "மெனு",
    "பின்னால்",
    // Malayalam
    "മെനു",
    "പിന്നോട്ട്",
    "സഹായം",
    "എന്താണ്",
  ];
  return navWords.some((w) => lower.includes(w));
}

/**
 * Try to map free-form text/voice input to a synthetic IncomingMessage that
 * the existing flow handlers can consume. Returns null if no transformation
 * is needed (cheap path: numbers, photos, empty bodies pass through).
 *
 * Possible transformations:
 *   - "I want hindi"           → message.body = "2"   (numeric option select)
 *   - "go back"                → message.body = "BACK" (universal command)
 *   - "what is community?"     → returns Q&A reply directly (handled inline)
 */
async function tryNLUTransform(
  session: UserSession,
  message: IncomingMessage,
): Promise<IncomingMessage | null> {
  const body = (message.body || "").trim();

  // Skip transformation for cheap cases
  if (!body) return null;
  if (message.hasImage) return null; // photo flow handles itself
  if (/^[1-9]\d?$/.test(body)) return null; // already a numeric choice

  // Skip if the input is already an exact universal command keyword
  const lower = body.toLowerCase();
  const exactCommands = [
    "menu",
    "back",
    "reset",
    "help",
    "human",
    "language",
    "profile",
    "status",
    "stop",
    "cancel",
    "done",
    "skip",
    "join",
    "joined",
    "certified",
    "browse",
    "search",
    "yes",
    "no",
    "buyer",
    "seller",
  ];
  if (exactCommands.includes(lower)) return null;

  // In free-text states, only run NLU if the input looks like a meta-command
  // (a question, navigation, or escape). Otherwise treat it as the literal
  // answer (the user's name, district, etc.).
  const isFreeText = FREE_TEXT_STATES.has(session.state);
  if (isFreeText && !looksLikeMetaCommand(body)) {
    return null;
  }

  // Run NLU. In free-text states we tell NLU there are no options to pick
  // (so it doesn't accidentally classify a name as an option).
  const options = isFreeText ? [] : getOptionsForState(session.state);
  const nlu = await classifyIntent({
    text: body,
    options,
    language: session.language,
    stateContext: describeState(session.state),
    allowQA: true,
  });

  log.info("NLU_RESULT", {
    phone: session.phone,
    state: session.state,
    action: nlu.action,
    optionIndex: nlu.optionIndex,
    navTarget: nlu.navTarget,
    confidence: nlu.confidence,
    isFreeText,
  });

  // Low confidence → don't transform; let the flow handle the raw text
  // Confidence gate. Was 0.55 — too lenient. At 0.7 we trust the model
  // when it's reasonably sure but fall through to "didn't understand"
  // for borderline cases, which is safer than wrongly picking a menu
  // option for the user.
  if (nlu.confidence < 0.7) return null;

  // ASK_QUESTION → mark message so processMessage can answer inline
  if (nlu.action === "ask_question" && nlu.question) {
    (message as any).__nluAskQuestion = nlu.question;
    return null;
  }

  // SELECT → synthesize numeric body (only outside free-text states)
  if (
    !isFreeText &&
    nlu.action === "select" &&
    typeof nlu.optionIndex === "number" &&
    nlu.optionIndex > 0
  ) {
    return { ...message, body: String(nlu.optionIndex) };
  }

  // NAVIGATE / COMMAND → synthesize the canonical keyword (works in any state)
  if ((nlu.action === "navigate" || nlu.action === "command") && nlu.navTarget) {
    return { ...message, body: navTargetToKeyword(nlu.navTarget) };
  }

  return null;
}

function navTargetToKeyword(t: NavTarget): string {
  // Lowercase so existing isMenuCommand/isBackCommand etc. match
  return t.toLowerCase();
}

function labelForLang(code: string): string {
  switch (code) {
    case "en":
      return "English";
    case "hi":
      return "हिन्दी";
    case "kn":
      return "ಕನ್ನಡ";
    case "ta":
      return "தமிழ்";
    case "ml":
      return "മലയാളം";
    default:
      return code;
  }
}
