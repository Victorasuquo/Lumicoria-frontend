# Careers → Google Sheet setup

The careers page has no backend. Applications are posted straight from the
browser into a Google Sheet you own, using a Google Apps Script Web App.

This is a **one-time setup, about 10 minutes**. You need to do it yourself —
it requires being signed into your Google account.

At the end you'll have a URL ending in `/exec`. Paste that into the frontend
`.env` and applications start flowing.

---

## 1. Create the sheet

1. Go to [sheets.new](https://sheets.new) to create a blank spreadsheet.
2. Name it something like **Lumicoria — Careers Applications**.
3. Rename the first tab (bottom-left) to exactly **`Applications`**.

> You can skip adding headers — the script writes them on the first
> submission. If you'd rather have them up front, import
> `docs/careers-sheet-template.csv` via **File ▸ Import ▸ Upload ▸ Replace
> current sheet**.

## 2. Add the script

1. In the sheet, open **Extensions ▸ Apps Script**.
2. Delete whatever is in `Code.gs`.
3. Open `scripts/careers-apps-script.gs` from this repo, copy **all** of it,
   and paste it in.
4. At the top of the file, check these settings:
   - `NOTIFY_EMAIL` — where new-application alerts go. Set to `''` to disable.
   - `SEND_CONFIRMATION_EMAIL` — `true` sends applicants an automatic
     "we got it" email. Recommended.
5. Click the **save** icon (💾).

## 3. Deploy it as a Web App

1. Click **Deploy ▸ New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `Careers form receiver`
   - **Execute as:** **Me** *(so the script can write to your sheet and Drive)*
   - **Who has access:** **Anyone** ← **this matters**
4. Click **Deploy**.
5. Google will ask you to authorise it. Click **Authorize access**, pick your
   account, then on the "Google hasn't verified this app" screen click
   **Advanced ▸ Go to … (unsafe)** and **Allow**. This warning is normal for
   your own scripts.
6. Copy the **Web app URL**. It looks like:
   ```
   https://script.google.com/macros/s/AKfycb.................../exec
   ```

> **"Who has access: Anyone" is required.** The form posts from visitors'
> browsers, and they are not signed into your Google account. "Anyone" means
> anyone can *POST to this endpoint* — it does **not** make your sheet public.

## 4. Connect the frontend

In `Lumicoria-frontend/.env` (create it if it doesn't exist):

```bash
VITE_CAREERS_ENDPOINT="https://script.google.com/macros/s/AKfycb...../exec"
```

Restart the dev server, and set the same variable in **Vercel ▸ Project ▸
Settings ▸ Environment Variables** for production.

## 5. Test it

1. Visit `/careers`, open any role, click **Apply**, and submit a test entry.
2. A new row should appear in the **Applications** tab within a second or two.
3. Attach a small PDF and confirm the **CV File** column gets a Drive link.

You can also open the `/exec` URL directly in a browser — it should return
`{"ok":true,"service":"lumicoria-careers",...}`. That confirms the deployment
is live.

---

## If something goes wrong

**Nothing arrives, and the browser console shows a CORS error**
The deployment is probably set to "Only myself". Redeploy with **Who has
access: Anyone**.

**Nothing arrives, no error**
Open **Apps Script ▸ Executions** to see the failure. Usually the tab isn't
named `Applications`, or the script was never authorised.

**Applicants see the "couldn't submit" message**
That's the built-in fallback — they'll be offered a prefilled email instead,
so the application still reaches you. Nothing is lost while you fix the
endpoint.

**You changed the script**
Apps Script serves the *deployed* version, not the saved one. Use **Deploy ▸
Manage deployments ▸ ✏️ ▸ Version: New version ▸ Deploy** to publish edits.
The `/exec` URL stays the same.

---

## Notes on security and data

- The `/exec` URL ships inside the public JS bundle. That's unavoidable for a
  frontend-only form, and it's fine: the endpoint only *accepts* applications
  and never reads anything back. **Never put a secret in it.**
- Spam is filtered by a hidden honeypot field, a minimum time-to-submit, and
  required-field validation inside the script.
- The privacy notice on the page commits to a **12-month retention window**.
  Deleting old rows periodically is a manual step — put a reminder in your
  calendar so the page stays truthful.
- CV files are stored in a Drive folder called **Lumicoria Careers — CVs**,
  shared as "anyone with the link can view" so your team can open them from
  the sheet. Move it into a shared drive if you want tighter control.
