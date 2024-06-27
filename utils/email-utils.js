import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { kebabCase } from '#utils/utils.js';

import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes HTML content for email, allowing only a subset of HTML4 elements and attributes.
 *
 * @param {string} html The HTML content to sanitize.
 * @returns {string} Sanitized HTML content.
 */
export function sanitizeHtmlForEmail(html) {
    const allowedTags = [
        'a', 'p', 'br', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'img', 'ul', 'ol', 'li', 'b', 'i', 'u', 'strong', 'em', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'
    ];

    const allowedAttributes = {
        'a': ['href', 'title'],
        'table': ['border', 'cellpadding', 'cellspacing'],
        'td': ['align', 'valign', 'width', 'colspan', 'rowspan'],
        'th': ['align', 'valign', 'width', 'colspan', 'rowspan'],
        'img': ['src', 'alt', 'width', 'height'],
        'span': ['style'],
        'div': ['class']
    };

    return sanitizeHtml(html, {
        allowedTags: allowedTags,
        allowedAttributes: allowedAttributes,
        disallowedTagsMode: 'discard'
    });
}

/**
 * Generates the content of an email file in EML format, ensuring the body is sanitized for HTML4.
 *
 * @param {string} emailSubject The subject of the email.
 * @param {string} emailBody The HTML content of the email body.
 * @returns {string} The complete EML file content as a string.
 */
export function generateEmailFile(emailSubject, emailBody) {
    const sanitizedBody = sanitizeHtmlForEmail(emailBody);

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${emailSubject}</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .section { margin-bottom: 20px; }
    h3 { color: #333; }
    ul { list-style-type: disc; padding-left: 20px; }
  </style>
</head>
<body>
  ${sanitizedBody}
</body>
</html>`;

    return `From: <demo@spark.local>
To: <demo@spark.local>
Subject: ${emailSubject}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="boundary-string"

--boundary-string
Content-Type: text/html; charset="UTF-8"

${fullHtml}

--boundary-string--`;
}

/**
 * Saves the generated email content to a file within a specific release directory.
 * @param {string} release The release version, used to create a directory.
 * @param {string} emailContent The content of the email to be saved.
 */
export function saveEmailToFile(release, emailContent) {
    const releaseKebab = kebabCase(release);
    const filePath = join('/tmp/emails', `${releaseKebab}.eml`);

    try {
        const dirPath = join('/tmp/emails');
        if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
        }

        writeFileSync(filePath, emailContent);
        console.log(`Email saved to ${filePath}`);
    } catch (error) {
        console.error(`Failed to save email: ${error.message}`);
    }
}

