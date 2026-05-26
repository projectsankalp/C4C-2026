import { AppError } from "../middleware/errorHandler";

export interface WhatsAppNotification {
  phone: string;
  message: string;
}

export class WhatsAppService {
  private static botUrl = process.env.WA_BOT_URL || process.env.WHATSAPP_BOT_URL;

  static async sendOrderAlert(
    artisanPhone: string,
    orderId: string,
    productTitle: string,
    quantity: number,
    amount: number,
    buyerName: string,
  ): Promise<void> {
    const message = [
      "New HastKala order received.",
      `Order: ${orderId}`,
      `Product: ${productTitle}`,
      `Quantity: ${quantity}`,
      `Amount: Rs ${amount}`,
      `Buyer: ${buyerName}`,
      "Please confirm packing in the Karigar Sakhi dashboard.",
    ].join("\n");

    try {
      await this.sendMessage(artisanPhone, message);
    } catch (error) {
      console.error("Failed to send WhatsApp order alert:", error);
    }
  }

  static async sendApprovalNotification(
    artisanPhone: string,
    productTitle: string,
    approved: boolean,
    publicUrl?: string,
  ): Promise<void> {
    const message = approved
      ? `🎉 Your product "${productTitle}" has been approved and is now live on HastKala Haat!\n\n${publicUrl ? `🌐 View & share: ${publicUrl}\n\n` : ""}Buyers can now place orders. We'll notify you when an order arrives.`
      : `Your product "${productTitle}" needs revision. Please contact your Karigar Sakhi.`;

    try {
      await this.sendMessage(artisanPhone, message);
    } catch (error) {
      console.error("Failed to send approval notification:", error);
    }
  }

  /**
   * Generic broadcast helper used by the buyer-request → seller-broadcast flow.
   * Logs failures but never throws, so a missing bot doesn't break HTTP responses.
   */
  static async sendBroadcastMessage(phone: string, message: string): Promise<void> {
    try {
      await this.sendMessage(phone, message);
    } catch (error) {
      console.error("Broadcast send failed:", error);
    }
  }

  private static async sendMessage(phone: string, message: string): Promise<void> {
    if (!this.botUrl) {
      console.log("WA_BOT_URL not configured. Skipping WhatsApp message.", { phone, message });
      return;
    }

    const response = await fetch(`${this.botUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bot-secret": process.env.WHATSAPP_BOT_SECRET || "",
      },
      body: JSON.stringify({ to: phone, phone, message }),
    });

    if (!response.ok) {
      throw new AppError("WhatsApp notification failed", 502);
    }
  }
}
