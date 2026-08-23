import { Resend } from "resend";

export const sendLowStockEmail = async (product) => {
  try {
    const resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;

    if (!resend || !process.env.ALERT_EMAIL) {
      console.warn("Low-stock email skipped: RESEND_API_KEY or ALERT_EMAIL not configured");
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: "Inventory Alert <onboarding@resend.dev>",
      to: [process.env.ALERT_EMAIL],
      subject: `⚠ Low Stock Alert - ${product.name}`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>⚠ Low Stock Alert</h2>

          <p>
            The following product has fallen below its minimum stock
            threshold.
          </p>

          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding: 8px;"><strong>Product</strong></td>
              <td style="padding: 8px;">${product.name}</td>
            </tr>

            <tr>
              <td style="padding: 8px;"><strong>Current Stock</strong></td>
              <td style="padding: 8px;">${product.currentStock}</td>
            </tr>

            <tr>
              <td style="padding: 8px;"><strong>Minimum Stock</strong></td>
              <td style="padding: 8px;">${product.minimumStock}</td>
            </tr>

            <tr>
              <td style="padding: 8px;"><strong>Recommended Reorder</strong></td>
              <td style="padding: 8px;">${product.reorderQuantity}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">
            Please consider replenishing this item.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    console.log("Low-stock email sent:", data.id);
    return true;

  } catch (error) {
    console.error("Email service error:", error);
    return false;
  }
};