/**
 * Lynkrs lead capture: receives a submission from the site and appends it as a
 * row on the sheet this script is bound to.
 *
 * Paste this into Extensions > Apps Script on the Google Sheet, then deploy it
 * as a Web app (Execute as: Me, Who has access: Anyone). The /exec URL that
 * deployment gives you is the value for the LEAD_ENDPOINT repository variable.
 * Full walk through in docs/lead-capture-setup.md.
 */

var SHEET_NAME = 'Leads';

var COLUMNS = [
  'Received',
  'First name',
  'Last name',
  'Business email',
  'Mobile',
  'Country',
  'Organisation',
  'Title',
  'Page',
  'Referrer',
];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      body.firstName || '',
      body.lastName || '',
      body.email || '',
      // leading apostrophe keeps Sheets from eating the + and the leading zero
      body.phone ? "'" + body.phone : '',
      body.phoneCountry || '',
      body.organization || '',
      body.title || '',
      body.page || '',
      body.referrer || '',
    ]);

    return json_({ result: 'success' });
  } catch (err) {
    return json_({ result: 'error', message: String(err) });
  }
}

/** So you can open the URL in a browser and see that it is alive. */
function doGet() {
  return json_({ result: 'ready' });
}

function getSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
