/**
 * Shape every language file must satisfy. Functions take typed args; static
 * strings are plain. TypeScript will yell loudly if a translator forgets a key.
 */
import type { ProductDraftResponse } from "../../types";

export interface ProductCard {
  title: string;
  price: number;
  quantity: number;
  status: string;
}

export interface OrderCard {
  id: string;
  productTitle: string;
  status: string;
  amount: number;
  buyerCity?: string;
}

export interface QuoteCard {
  id: string;
  sellerName: string;
  price: number;
  deliveryNote?: string;
  index: number;
}

export interface MessageRegistry {
  // ----- First-time setup -----
  greeting(): string;
  languageInvalid(): string;
  languageConfirmed(language: string): string;
  /** Quick how-to-use guide shown right after the language is picked. */
  languageInstructions(): string;

  replyModeAsk(): string;

  roleAsk(): string;
  roleInvalid(): string;
  roleConfirmed(role: "seller" | "buyer" | "sakhi"): string;

  tutorial(videoUrl: string): string;
  tutorialPostText(role?: "seller" | "buyer" | "sakhi"): string;

  // ----- Seller community / certification gate -----
  sellerPrecheckName(): string;
  sellerPrecheckAddress(): string;
  sellerPrecheckContact(currentPhone: string): string;
  sellerCommunityJoin(communityLink: string): string;
  sellerCommunityWaiting(): string;
  sellerCommunityAlreadyJoined(): string;
  sellerLockedMenu(): string;
  sellerCertUnlocked(name: string): string;
  /** Caption sent alongside the certificate PDF */
  sellerCertPdfCaption(name: string): string;
  /** Text-only fallback when no PDF URL is configured */
  sellerCertTextFallback(name: string): string;

  // ----- Returning user -----
  welcomeBack(name?: string): string;
  whichRole(): string;

  // ----- Seller onboarding -----
  sellerAskName(): string;
  sellerAskDistrict(): string;
  sellerAskCraft(): string;
  sellerAskShg(): string;
  sellerAskShgName(): string;
  sellerAskSakhiHelp(): string;
  sellerOnboardComplete(name: string): string;

  // ----- Buyer onboarding -----
  buyerAskName(): string;
  buyerAskLocation(): string;
  buyerAskInterests(): string;
  buyerOnboardComplete(name: string): string;

  // ----- Sakhi onboarding -----
  sakhiAskName(): string;
  sakhiAskDistrict(): string;
  sakhiAskGroups(): string;
  sakhiOnboardComplete(name: string): string;

  // ----- Main menus -----
  sellerMenu(name: string): string;
  sellerMenuMore(): string;
  buyerMenu(name: string): string;
  buyerMenuMore(): string;
  sakhiMenu(name: string): string;
  sakhiMenuMore(): string;

  // ----- Add product -----
  addProductStart(): string;
  addProductPhotoReceived(count: number, max: number): string;
  addProductMaxPhotos(): string;
  addProductPhotosNeedFirst(): string;
  addProductAskDetails(): string;
  addProductCreating(): string;
  addProductMissingPrice(): string;
  addProductMissingQuantity(): string;
  addProductMissingTitle(): string;
  addProductDraftPreview(opts: {
    title: string;
    price: number;
    quantity: number;
    material?: string;
    category?: string;
    description?: string;
    photos: number;
  }): string;
  addProductSubmitted(approvalUrl?: string): string;
  addProductApproved(opts: { title: string; publicUrl?: string }): string;
  addProductCancelled(): string;
  addProductPriceUpdated(price: number): string;
  addProductQuantityUpdated(quantity: number): string;
  addProductTitleUpdated(title: string): string;
  addProductDescriptionUpdated(): string;
  addProductAskNewPrice(): string;
  addProductAskNewQuantity(): string;
  addProductAskNewTitle(): string;
  addProductAskNewDescription(): string;

  // ----- My products -----
  myProductsHeader(): string;
  myProductsEmpty(): string;
  myProductsList(items: ProductCard[]): string;
  myProductsManage(title: string): string;
  myProductsStockUpdated(quantity: number): string;
  myProductsSoldOut(title: string): string;
  myProductsAskNewStock(): string;

  // ----- Orders -----
  ordersHeader(): string;
  ordersEmpty(): string;
  ordersList(items: OrderCard[]): string;
  orderDetail(opts: {
    id: string;
    productTitle: string;
    quantity: number;
    amount: number;
    buyerCity?: string;
    status: string;
  }): string;
  orderAccepted(): string;
  orderUnavailable(): string;

  // ----- Browse / search -----
  browseAskCategory(): string;
  browseResults(items: Array<{ index: number; title: string; price: number }>): string;
  browseEmpty(): string;
  browseProductDetail(opts: {
    title: string;
    price: number;
    artisanName?: string;
    district?: string;
    quantity: number;
    publicUrl?: string;
  }): string;

  trendingHeader(): string;

  searchPrompt(): string;
  searchResults(items: Array<{ index: number; title: string; price: number }>): string;
  searchEmpty(query: string): string;

  // ----- Buyer requests -----
  requestStart(): string;
  requestAskDate(): string;
  requestAskLocation(): string;
  requestAskBudget(): string;
  requestPreview(opts: {
    brief: string;
    quantity?: number;
    deliveryDate?: string;
    location?: string;
    budgetMin?: number;
    budgetMax?: number;
    category?: string;
  }): string;
  requestBroadcasted(requestId: string): string;
  requestEmpty(): string;

  // ----- Seller quote -----
  quoteIncomingRequest(opts: {
    requestId: string;
    brief: string;
    deliveryDate?: string;
    location?: string;
    budgetMin?: number;
    budgetMax?: number;
    distanceKm?: number;
  }): string;
  quoteAskPrice(): string;
  quoteAskDelivery(): string;
  quoteAskNote(): string;
  quotePreview(opts: { price: number; deliveryNote?: string; quoteNote?: string }): string;
  quoteSubmitted(): string;
  quoteCancelled(): string;
  quoteAccepted(): string;

  // ----- Buyer view quotes -----
  quotesHeader(brief: string, count: number): string;
  quotesList(items: QuoteCard[]): string;
  quoteDetail(opts: {
    sellerName: string;
    price: number;
    deliveryNote?: string;
    quoteNote?: string;
  }): string;
  quoteRejected(): string;

  // ----- Sakhi flows -----
  sakhiPendingHeader(): string;
  sakhiPendingEmpty(): string;
  sakhiPendingList(
    items: Array<{ index: number; title: string; artisanName: string; district: string }>,
  ): string;
  sakhiPendingDetail(opts: {
    title: string;
    description: string;
    price: number;
    quantity: number;
    artisanName: string;
    district: string;
  }): string;
  sakhiApproved(title: string): string;
  sakhiRejected(title: string): string;

  // ----- Generic / commands / errors -----
  help(): string;
  helpInState(state: string): string;
  invalidChoice(): string;
  unparseable(): string;
  goingBack(): string;
  cantGoBack(): string;
  errorBackend(): string;
  errorGeneric(): string;
  consentLine(): string;
  resetConfirmed(): string;
  humanEscalated(): string;
  notImplemented(): string;
  /** Farewell when user types EXIT / QUIT / BYE. Profile is preserved. */
  exitGoodbye(name?: string): string;
  /** Welcome-back nudge after EXIT when user returns with HI. */
  exitWelcomeBack(name?: string): string;
  alreadySubmitted(): string;
  /** Used to provide a small English helper line under the native-language reply. */
  englishHelper(text: string): string;
  /** Audit-friendly draft confirmation when backend returns a draft. */
  draftCreated(p: ProductDraftResponse): string;
  /** Order alert delivered TO the artisan when a buyer places an order. */
  orderAlert(p: {
    productTitle: string;
    quantity: number;
    amount: number;
    buyerCity?: string;
    buyerName?: string;
    orderId?: string;
  }): string;
}

/** Static metadata about a language for the picker UI. */
export interface LanguageMeta {
  code: "en" | "hi" | "kn" | "ta" | "ml";
  nativeName: string;
  englishName: string;
  /** Whether this language has a complete translation. False = falls back to English. */
  complete: boolean;
}
