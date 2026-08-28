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
        <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); overflow: hidden;">
            <!-- Header -->
            <div style="background-color: #dc2626; color: #ffffff; padding: 25px 30px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 600;">⚠️ Urgent: Low Stock Alert</h2>
            </div>
            
            <!-- Body -->
            <div style="padding: 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #4b5563; margin-top: 0;">
                Action is required for your inventory. The following product has fallen below its critical minimum stock threshold:
              </p>

              <!-- Product Name Highlight -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="margin: 0; color: #991b1b; font-size: 20px;">${product.name}</h3>
              </div>

              <!-- Data Table -->
              <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 25px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 50%; border-top-left-radius: 8px;">Current Stock</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #dc2626; text-align: right; border-top-right-radius: 8px;">${product.currentStock} units</td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Minimum Threshold</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-align: right;">${product.minimumStock} units</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; border-bottom-left-radius: 8px;">Recommended Reorder</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #059669; text-align: right; border-bottom-right-radius: 8px;">${product.reorderQuantity} units</td>
                </tr>
              </table>

              <p style="font-size: 15px; color: #4b5563; text-align: center; margin-bottom: 0;">
                Please initiate a replenishment request to prevent stockouts.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 15px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                Automated Alert • Inventory Management System
              </p>
            </div>
          </div>
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
    console.error("Error in emailService.js:", error);
    console.error("Email service error:", error);
    return false;
  }
};