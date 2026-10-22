/**
 * Rizwan Stationer — order emails through Gmail (free, no domain needed).
 *
 * Emails are sent FROM the Google account that deploys this script.
 * Daily limit for a normal Gmail account: about 100 recipients.
 *
 * Setup:
 *   1. Signed in to the Gmail you want to send from, open https://script.google.com → New project.
 *   2. Delete the sample code, paste this whole file.
 *   3. Change SECRET below to a long random password (letters + numbers, 24+ characters).
 *   4. Deploy → New deployment → type "Web app":
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      → Deploy → allow the permissions Google asks for → copy the "Web app URL".
 *   5. In Supabase → Edge Functions → Secrets add:
 *        EMAIL_SCRIPT_URL    = the Web app URL
 *        EMAIL_SCRIPT_SECRET = the same SECRET as below
 *
 * After editing this file later: Deploy → Manage deployments → edit → Version: New version.
 */

const SECRET = "change-me-to-a-long-random-password";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data.secret || data.secret !== SECRET) return reply({ ok: false, error: "unauthorised" });
    if (!data.to || !data.subject || !data.html) return reply({ ok: false, error: "missing fields" });

    const options = { htmlBody: data.html, name: data.name || "Rizwan Stationer" };
    if (data.replyTo) options.replyTo = data.replyTo;
    MailApp.sendEmail(data.to, data.subject, "Please view this email in an HTML-capable mail app.", options);

    return reply({ ok: true, remaining: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

// opening the URL in a browser just confirms the script is live
function doGet() {
  return reply({ ok: true, service: "rizwan-stationer-email", remaining: MailApp.getRemainingDailyQuota() });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
