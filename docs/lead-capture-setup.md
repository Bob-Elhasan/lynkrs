# Connecting the lead form to Google Sheets

The site is a static export on GitHub Pages, so it has no server of its own.
The popup form posts each submission to a Google Apps Script web app, which
appends it as a row on your sheet. Setting it up takes about five minutes and
only has to be done once.

Until the endpoint is set, the form validates and steps through normally but
the final send fails with a visible error. Nothing is lost quietly.

## 1. Make the sheet

1. Create a new Google Sheet, name it something like **Lynkrs leads**.
2. Leave it empty. The script writes its own header row the first time a lead
   arrives.

## 2. Add the script

1. In that sheet: **Extensions → Apps Script**.
2. Delete whatever is in `Code.gs` and paste the contents of
   [`scripts/lead-capture.gs`](../scripts/lead-capture.gs).
3. Save.

## 3. Deploy it as a web app

1. **Deploy → New deployment**.
2. Choose type **Web app**.
3. Set:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. **Deploy**, then approve the permission prompt. Google will warn that the
   app is unverified; it is your own script, so continue through the advanced
   link.
5. Copy the **Web app URL**. It ends in `/exec`.

Open that URL in a browser tab. It should show `{"result":"ready"}`.

> **Who has access: Anyone** is required. The visitor's browser posts directly
> to this URL and is not signed into your Google account. The script only
> appends rows; it never reads or returns your data.

## 4. Give the URL to the site

In the GitHub repository: **Settings → Secrets and variables → Actions →
Variables → New repository variable**.

- **Name**: `LEAD_ENDPOINT`
- **Value**: the `/exec` URL

Then run the **Deploy Next.js site to Pages** workflow again (Actions tab →
select the workflow → Run workflow), or push any commit. The value is read at
build time, so the site has to be rebuilt once after you set it.

To try it locally first:

```bash
NEXT_PUBLIC_LEAD_ENDPOINT="https://script.google.com/macros/s/.../exec" npm run dev
```

## What lands in the sheet

| Column | Notes |
| --- | --- |
| Received | Server timestamp, not the browser's |
| First name / Last name | |
| Business email | Personal and disposable domains are rejected in the form |
| Mobile | Full international form, e.g. `+971501234567` |
| Country | ISO code behind the dial code they picked |
| Organisation / Title | |
| Page | The URL they submitted from |
| Referrer | Where they arrived from, when the browser shares it |

## Getting an email for each lead

Add this to the script and set a trigger, or simply turn on Sheets'
notification rules: **Tools → Notification settings → Any changes are made →
Email straight away**. That needs no extra code.

## If it stops working

- **Rows stop arriving after you edit the script**: every edit needs
  **Deploy → Manage deployments → edit → Version: New version**. Without a new
  version the old code keeps serving.
- **`{"result":"error"}`**: open **Executions** in the Apps Script editor; the
  failed run has the reason.
- **The form says it did not send**: check that `LEAD_ENDPOINT` is set as an
  Actions *variable* (not a secret) and that the site has been rebuilt since.
