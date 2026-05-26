/**
 * "My Products" flow — seller views and manages their own products.
 *
 *   MY_PRODUCTS_LIST       → list 1..N products with status badges
 *   MY_PRODUCTS_MANAGE     → after a number is picked, show 7-option submenu
 *   MY_PRODUCTS_EDIT_PRICE → bare price input
 *   MY_PRODUCTS_EDIT_STOCK → bare integer input
 *   MY_PRODUCTS_EDIT_TITLE → text input for new title
 *   MY_PRODUCTS_EDIT_DESC  → text input for new description
 */
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { mainMenuFor, transition, updateSession } from "../state";
import { parseInteger, parseMenuChoice, parsePriceReply } from "../../utils/text";
import { api } from "../../services/apiClient";
import {
  deleteProduct,
  getProductsForArtisan,
  updateProduct,
  updateProductStock,
} from "../../services/listingService";
import { loadProfile } from "../../services/userService";
import { config } from "../../config";

export async function enterMyProducts(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);

  // Fetch seller + their products in one call by phone. This used to be a
  // two-step lookup via loadProfile() + getProductsForArtisan(artisanId),
  // but loadProfile() returns a User row (no artisanId) so it always failed
  // and "My Products" appeared empty even when the seller had real products.
  let products: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    status: string;
  }> = [];
  try {
    const res = await api.get<any>(`/api/sellers/by-phone/${encodeURIComponent(s.phone)}/products`);
    const items = res.data?.data?.products || [];
    products = items.slice(0, 10).map((p: any) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      quantity: p.quantity,
      status: p.status ?? "approved",
    }));
  } catch {
    // Backend down — fall back to empty list. The user will see the
    // "no products yet" prompt rather than a hard error.
  }

  if (products.length === 0) {
    transition(s.phone, mainMenuFor(s.role));
    return [{ text: m.myProductsEmpty(), state: "SELLER_MENU" }];
  }

  updateSession(s.phone, { context: { manageProduct: { productList: products } } });
  transition(s.phone, "MY_PRODUCTS_LIST");

  return [{ text: m.myProductsList(products), state: "MY_PRODUCTS_LIST" }];
}

export async function handleMyProductsList(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const list = s.context.manageProduct?.productList ?? [];
  const idx = parseMenuChoice(msg.body, list.length);
  if (!idx) {
    return [{ text: m.invalidChoice(), state: "MY_PRODUCTS_LIST" }];
  }
  const selected = list[idx - 1];
  updateSession(s.phone, {
    context: { manageProduct: { productId: selected.id, productList: list } },
  });
  transition(s.phone, "MY_PRODUCTS_MANAGE");
  return [{ text: m.myProductsManage(selected.title), state: "MY_PRODUCTS_MANAGE" }];
}

export async function handleMyProductsManage(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 7);
  if (!choice) {
    return [{ text: m.invalidChoice(), state: "MY_PRODUCTS_MANAGE" }];
  }
  const productId = s.context.manageProduct?.productId;
  if (!productId) {
    transition(s.phone, "MY_PRODUCTS_LIST");
    return [{ text: m.errorGeneric(), state: "MY_PRODUCTS_LIST" }];
  }

  switch (choice) {
    case 1:
      transition(s.phone, "MY_PRODUCTS_EDIT_PRICE");
      return [{ text: m.addProductAskNewPrice(), state: "MY_PRODUCTS_EDIT_PRICE" }];
    case 2:
      transition(s.phone, "MY_PRODUCTS_EDIT_STOCK");
      return [{ text: m.myProductsAskNewStock(), state: "MY_PRODUCTS_EDIT_STOCK" }];
    case 3:
      transition(s.phone, "MY_PRODUCTS_EDIT_TITLE");
      return [{ text: "What should the new title be?\n\n_Type the new product name._", state: "MY_PRODUCTS_EDIT_TITLE" }];
    case 4:
      transition(s.phone, "MY_PRODUCTS_EDIT_DESC");
      return [{ text: "Type the new description for this product:\n\n_Minimum 10 characters._", state: "MY_PRODUCTS_EDIT_DESC" }];
    case 5: {
      // Delete product
      const ok = await deleteProduct(productId);
      const list = s.context.manageProduct?.productList ?? [];
      const item = list.find((p) => p.id === productId);
      transition(s.phone, mainMenuFor(s.role));
      const text = ok
        ? `🗑️ *${item?.title ?? "Product"}* has been deleted.`
        : m.errorBackend();
      return [{ text, state: "SELLER_MENU" }];
    }
    case 6: {
      const url = `${config.publicWebUrl}/products/${productId}`;
      return [{ text: `🔗 ${url}`, state: "MY_PRODUCTS_MANAGE" }];
    }
    case 7:
      transition(s.phone, "MY_PRODUCTS_LIST");
      return enterMyProducts(s);
  }
  return [{ text: m.invalidChoice(), state: "MY_PRODUCTS_MANAGE" }];
}

export async function handleMyProductsEditPrice(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const price = parsePriceReply(msg.body);
  if (!price) {
    return [{ text: m.addProductAskNewPrice(), state: "MY_PRODUCTS_EDIT_PRICE" }];
  }
  const productId = s.context.manageProduct?.productId;
  if (!productId) {
    transition(s.phone, "MY_PRODUCTS_LIST");
    return [{ text: m.errorGeneric(), state: "MY_PRODUCTS_LIST" }];
  }
  const ok = await updateProduct(productId, { price });
  transition(s.phone, "MY_PRODUCTS_MANAGE");
  return [
    { text: ok ? m.addProductPriceUpdated(price) : m.errorBackend(), state: "MY_PRODUCTS_MANAGE" },
  ];
}

export async function handleMyProductsEditStock(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const qty = parseInteger(msg.body);
  if (qty === null) {
    return [{ text: m.myProductsAskNewStock(), state: "MY_PRODUCTS_EDIT_STOCK" }];
  }
  const productId = s.context.manageProduct?.productId;
  if (!productId) {
    transition(s.phone, "MY_PRODUCTS_LIST");
    return [{ text: m.errorGeneric(), state: "MY_PRODUCTS_LIST" }];
  }
  const ok = await updateProductStock(productId, qty);
  transition(s.phone, "MY_PRODUCTS_MANAGE");
  return [
    { text: ok ? m.myProductsStockUpdated(qty) : m.errorBackend(), state: "MY_PRODUCTS_MANAGE" },
  ];
}

export async function handleMyProductsEditTitle(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const title = (msg.body || "").trim();
  if (title.length < 2 || title.length > 100) {
    return [{ text: "Please enter a valid title (2-100 characters).", state: "MY_PRODUCTS_EDIT_TITLE" }];
  }
  const productId = s.context.manageProduct?.productId;
  if (!productId) {
    transition(s.phone, "MY_PRODUCTS_LIST");
    return [{ text: m.errorGeneric(), state: "MY_PRODUCTS_LIST" }];
  }
  const ok = await updateProduct(productId, { title });
  transition(s.phone, "MY_PRODUCTS_MANAGE");
  return [
    { text: ok ? `Title updated to *${title}* ✅` : m.errorBackend(), state: "MY_PRODUCTS_MANAGE" },
  ];
}

export async function handleMyProductsEditDesc(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const description = (msg.body || "").trim();
  if (description.length < 10) {
    return [{ text: "Please enter a description (minimum 10 characters).", state: "MY_PRODUCTS_EDIT_DESC" }];
  }
  const productId = s.context.manageProduct?.productId;
  if (!productId) {
    transition(s.phone, "MY_PRODUCTS_LIST");
    return [{ text: m.errorGeneric(), state: "MY_PRODUCTS_LIST" }];
  }
  const ok = await updateProduct(productId, { description });
  transition(s.phone, "MY_PRODUCTS_MANAGE");
  return [
    { text: ok ? "Description updated ✅" : m.errorBackend(), state: "MY_PRODUCTS_MANAGE" },
  ];
}
