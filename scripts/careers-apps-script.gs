/**
 * Lumicoria — Careers application receiver (Google Apps Script)
 * ---------------------------------------------------------------
 * Receives applications from lumicoria.ai/careers and appends them to the
 * bound Google Sheet. Optionally saves an attached CV to Drive and emails
 * the applicant a confirmation.
 *
 * Setup: see docs/CAREERS_SHEET_SETUP.md
 *
 * IMPORTANT — the frontend posts with Content-Type "text/plain" on purpose.
 * That keeps it a CORS "simple request" so the browser skips the preflight
 * OPTIONS call, which Apps Script cannot answer. Do not "fix" it to
 * application/json: the submission will start failing silently.
 */

// ── Configuration ────────────────────────────────────────────────────

/** Tab name inside the spreadsheet. Created automatically if missing. */
var SHEET_NAME = 'Applications';

/** Drive folder for uploaded CVs. Created automatically on first upload. */
var CV_FOLDER_NAME = 'Lumicoria Careers — CVs';

/** Send applicants an automatic confirmation email. */
var SEND_CONFIRMATION_EMAIL = true;

/** Notify the team on every new application. Leave '' to disable. */
var NOTIFY_EMAIL = 'careers@lumicoria.ai';

/** Largest accepted CV, in bytes (must match the frontend's 5MB limit). */
var MAX_CV_BYTES = 5 * 1024 * 1024;

/** Column order — must match docs/careers-sheet-template.csv exactly. */
var HEADERS = [
  'Submitted At',
  'Role',
  'Department',
  'Full Name',
  'Email',
  'Phone',
  'Location',
  'Portfolio URL',
  'LinkedIn URL',
  'CV Link',
  'CV File',
  'Cover Note',
  'Earliest Start',
  'Heard From',
  'Right To Work',
  'Consent',
  'Status',
];

// ── Entry points ─────────────────────────────────────────────────────

/** Health check — visiting the /exec URL in a browser should show "ok". */
function doGet() {
  return json({ ok: true, service: 'lumicoria-careers', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'Empty request body.' });
    }

    var data = JSON.parse(e.postData.contents);

    // Required fields — mirrors the client-side zod schema.
    if (!data.fullName || !data.email || !data.coverNote) {
      return json({ ok: false, error: 'Missing required fields.' });
    }
    if (String(data.consent) !== 'Yes') {
      return json({ ok: false, error: 'Consent is required.' });
    }
    // Honeypot: real submissions never carry this field.
    if (data.website) {
      return json({ ok: true }); // silently accept so bots don't learn
    }

    var cvFileLink = '';
    if (data.cvFileBase64 && data.cvFileName) {
      cvFileLink = saveCvToDrive(data);
    }

    var sheet = getSheet();
    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.roleTitle || '',
      data.department || '',
      data.fullName,
      data.email,
      data.phone || '',
      data.location || '',
      data.portfolioUrl || '',
      data.linkedinUrl || '',
      data.cvUrl || '',
      cvFileLink,
      data.coverNote,
      data.earliestStart || '',
      data.heardFrom || '',
      data.rightToWork || '',
      data.consent || '',
      'New',
    ]);

    if (SEND_CONFIRMATION_EMAIL) trySendConfirmation(data);
    if (NOTIFY_EMAIL) tryNotifyTeam(data, cvFileLink);

    return json({ ok: true });
  } catch (err) {
    // Log for the script owner; return a safe message to the browser.
    console.error('Careers submission failed: ' + err);
    return json({ ok: false, error: 'Could not save the application.' });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Get (or create) the Applications tab, with a frozen header row. */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Decode the base64 CV into Drive and return a shareable link. */
function saveCvToDrive(data) {
  try {
    var bytes = Utilities.base64Decode(data.cvFileBase64);
    if (bytes.length > MAX_CV_BYTES) return 'Rejected: file too large';

    var blob = Utilities.newBlob(
      bytes,
      data.cvMimeType || 'application/octet-stream',
      buildCvFileName(data)
    );

    var folders = DriveApp.getFoldersByName(CV_FOLDER_NAME);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CV_FOLDER_NAME);

    var file = folder.createFile(blob);
    // Anyone in the org with the link can read it; the file is not public-indexed.
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    console.error('CV upload failed: ' + err);
    return 'Upload failed';
  }
}

/** "Ada Lovelace — Product Designer.pdf" */
function buildCvFileName(data) {
  var extension = (data.cvFileName || '').split('.').pop();
  var safeName = String(data.fullName || 'applicant').replace(/[^\w\s-]/g, '');
  var safeRole = String(data.roleTitle || 'role').replace(/[^\w\s-]/g, '');
  return safeName + ' — ' + safeRole + (extension ? '.' + extension : '');
}

function trySendConfirmation(data) {
  try {
    MailApp.sendEmail({
      to: data.email,
      subject: 'We received your application — ' + (data.roleTitle || 'Lumicoria'),
      htmlBody:
        '<p>Hi ' + escapeHtml(String(data.fullName).split(' ')[0]) + ',</p>' +
        '<p>Thanks for applying for <strong>' + escapeHtml(data.roleTitle || 'a role') +
        '</strong> at Lumicoria. Your application has reached us and a real person will read it.</p>' +
        '<p>We come back to every applicant either way. If it looks like a fit, the next step is a short intro ' +
        'call where we walk through the role, the expectations, and the terms together.</p>' +
        '<p>— The Lumicoria team</p>' +
        '<hr><p style="color:#888;font-size:12px">We never ask candidates for payment at any stage of hiring.</p>',
    });
  } catch (err) {
    // Never fail the submission because an email bounced.
    console.error('Confirmation email failed: ' + err);
  }
}

function tryNotifyTeam(data, cvFileLink) {
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New application — ' + (data.roleTitle || 'Lumicoria'),
      htmlBody:
        '<p><strong>' + escapeHtml(data.fullName) + '</strong> applied for ' +
        escapeHtml(data.roleTitle || 'a role') + '.</p>' +
        '<p>Email: ' + escapeHtml(data.email) + '<br>' +
        'Location: ' + escapeHtml(data.location || '—') + '<br>' +
        'Portfolio: ' + escapeHtml(data.portfolioUrl || '—') + '<br>' +
        'LinkedIn: ' + escapeHtml(data.linkedinUrl || '—') + '<br>' +
        'CV: ' + escapeHtml(cvFileLink || data.cvUrl || '—') + '</p>' +
        '<p><em>' + escapeHtml(data.coverNote).slice(0, 500) + '</em></p>',
    });
  } catch (err) {
    console.error('Team notification failed: ' + err);
  }
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
