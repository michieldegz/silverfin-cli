/**
 * Shared helpers for wrapping raw template objects in the sfApi response
 * envelope, matching what the real API functions return to callers.
 *
 * Usage:
 *   const { apiResponse, apiListResponse } = require("../api_wrappers");
 *   SF.readReconciliationTextById.mockResolvedValue(apiResponse(REC_BASE));
 *   SF.readReconciliationTexts.mockResolvedValue(apiListResponse([REC_BASE, REC_WITH_PARTS]));
 */

/** Wraps a single template object in a { data: template } envelope. */
function apiResponse(data) {
  return { data };
}

/** Wraps an array of templates in { data: [...] } — used by list endpoints. */
function apiListResponse(items) {
  return { data: items };
}

/** Wraps a paginated list in the format readReconciliationTexts returns (bare array). */
function apiPageResponse(items) {
  return items;
}

module.exports = { apiResponse, apiListResponse, apiPageResponse };
