# Digistore24 Configuration & Production Guide

This guide outlines the exact steps to configure your payment gateway, link your products, and test the flow before going live.

## 1. Digistore24 Dashboard Configuration

### A. Get Your API Keys
1.  Log in to your **Digistore24** account.
2.  Go to **Settings > Integrations (IPN)**.
3.  Create a new connection:
    *   **Type:** Generic
    *   **Name:** Yoga Studio App
    *   **IPN URL:** `https://your-domain.com/api/payments/digistore/ipn` (For testing, see Section 3)
    *   **IPN Passphrase:** Set a strong secret string (e.g., `MySuperSecretIPNPass2026`).
    *   **Event:** Select all (Payment, Refund, Chargeback).
    *   **Active:** Yes.
4.  Copy your **Digistore ID** (found in top left, e.g., `user_xyz`) - this is your `DIGISTORE_VENDOR_ID`.

### B. Configure Environment Variables
Update your `.env` file (or production environment variables) with these values:

```bash
DIGISTORE_VENDOR_ID=your_digistore_id
DIGISTORE_IPN_PASSPHRASE=your_chosen_passphrase
# Ensure this matches where your frontend is hosted
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 2. Product Setup (Mapping)

You must link every Class and Course in your database to a Digistore24 Product.

### Step 1: Create Product in Digistore24
1.  Go to **Account > Products**.
2.  Click **Add Product**.
3.  Fill in details (Title, Description, Price).
4.  Save and go to the **Properties** tab.
5.  Copy the **Product ID** (e.g., `123456`).

### Step 2: Link to MongoDB
You need to update your Class/Course documents with this Product ID.
*   **For a Class:**
    *   Set `isPaid: true`
    *   Set `price: 29.99` (example)
    *   Set `digistoreProductId: "123456"` (The ID from Digistore)
*   **For a Course:**
    *   Same fields as above.

> **Tip:** You can use the Admin Dashboard or a database GUI (like MongoDB Compass) to update these fields for existing items.

---

## 3. Testing Plan (Localhost)

Since Digistore24 needs to send a webhook (IPN) to your server, `localhost` won't work directly. You need a tunnel.

### Step A: Setup Ngrok
1.  Download and install [ngrok](https://ngrok.com/).
2.  Start your local server (`npm run dev` on port 5001).
3.  Run ngrok: `ngrok http 5001`.
4.  Copy the HTTPS URL (e.g., `https://a1b2-c3d4.ngrok-free.app`).

### Step B: Configure Test IPN
1.  In Digistore24 **Settings > Integrations (IPN)**.
2.  Edit your connection.
3.  Set **IPN URL** to: `https://a1b2-c3d4.ngrok-free.app/api/payments/digistore/ipn`
4.  Save.
5.  Click **Test Connection**. You should see a success log in your server terminal.

### Step C: Perform a Test Purchase
1.  In Digistore24, go to your **Product > Properties**.
2.  Find the **Order URL** (Promolink).
3.  Open it in an incognito window.
4.  Select **"Test Pay"** as the payment method.
5.  Complete the purchase.
6.  **Verify:**
    *   Check server logs: `Payment processed: Order ...`
    *   Check MongoDB: User should be added to `enrolledClasses` / `enrolledCourses`.

---

## 4. Production Checklist

When moving to production (Vercel, Heroku, VPS, etc.):

- [ ] **Environment Variables:** Set `DIGISTORE_VENDOR_ID` and `DIGISTORE_IPN_PASSPHRASE` in your hosting provider's dashboard.
- [ ] **IPN URL:** Update the IPN URL in Digistore24 to your **real production domain**: `https://api.your-yoga-studio.com/api/payments/digistore/ipn`.
- [ ] **Frontend URL:** Ensure `FRONTEND_URL` in env vars points to your production frontend (for success/cancel redirects).
- [ ] **HTTPS:** Your production server MUST be served over HTTPS for secure IPN communication.
- [ ] **Database:** Ensure your production `Class` and `Course` documents have the correct `digistoreProductId`s (if you created separate test vs production products).
