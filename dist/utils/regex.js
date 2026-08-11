"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRegex = sanitizeRegex;
function sanitizeRegex(input) {
    if (typeof input !== 'string')
        return '';
    const MAX_LENGTH = 100;
    const trimmed = input.slice(0, MAX_LENGTH);
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped;
}
//# sourceMappingURL=regex.js.map