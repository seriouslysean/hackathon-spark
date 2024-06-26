import { describe, it, expect } from 'vitest';
import { sanitizeHtmlForEmail } from '#utils/email-utils';

describe('sanitizeHtmlForEmail', () => {
    it('should remove custom data attributes and unsupported tags while preserving content', () => {
        const htmlContent = `<div data-v-a9c48381="" class="email"><div data-v-a9c48381="" class="section"><p data-v-a9c48381="">Hello,</p></div><!-- Comment --><script>alert('Hi');</script></div>`;
        const expectedSanitizedContent = `<div class="email"><div class="section"><p>Hello,</p></div></div>`;
        const sanitizedContent = sanitizeHtmlForEmail(htmlContent);
        expect(sanitizedContent).toBe(expectedSanitizedContent);
    });

    it('should preserve allowed tags and their allowed attributes', () => {
        const htmlContent = `<div><a href="https://spark.local/link" target="_blank" rel="noopener">Visit Example</a></div>`;
        const expectedSanitizedContent = `<div><a href="https://spark.local/link">Visit Example</a></div>`;
        const sanitizedContent = sanitizeHtmlForEmail(htmlContent);
        expect(sanitizedContent).toBe(expectedSanitizedContent);
    });

    it('should remove unsupported markup within nested structures', () => {
        const htmlContent = `<ul><li>Item 1</li><script>console.log('Remove this');</script><li>Item 2</li></ul>`;
        const expectedSanitizedContent = `<ul><li>Item 1</li><li>Item 2</li></ul>`;
        const sanitizedContent = sanitizeHtmlForEmail(htmlContent);
        expect(sanitizedContent).toBe(expectedSanitizedContent);
    });

    it('should handle complex HTML structures by removing unsupported elements and attributes', () => {
        const htmlContent = `<div data-v-a9c48381="" class="email"><div data-v-a9c48381="" class="section"><p data-v-a9c48381="">Hello,</p><p data-v-a9c48381="">Here are the latest release notes for GoblinGrub 1.2.3, releasing on 2024-07-06.</p></div><div data-v-a9c48381="" class="section"><h3 data-v-a9c48381="">✨ Feature Releases and Highlights</h3><ul data-v-a9c48381=""><li data-v-a9c48381="">highlight 1</li><li data-v-a9c48381="">highlight 2</li><li data-v-a9c48381="">highlight 3</li></ul></div></div>`;
        const expectedSanitizedContent = `<div class="email"><div class="section"><p>Hello,</p><p>Here are the latest release notes for GoblinGrub 1.2.3, releasing on 2024-07-06.</p></div><div class="section"><h3>✨ Feature Releases and Highlights</h3><ul><li>highlight 1</li><li>highlight 2</li><li>highlight 3</li></ul></div></div>`;
        const sanitizedContent = sanitizeHtmlForEmail(htmlContent);
        expect(sanitizedContent).toBe(expectedSanitizedContent);
    });
});
