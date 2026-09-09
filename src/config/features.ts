// Feature flags for temporarily hiding shipped surfaces.
//
// These hide DISCOVERY only — routes stay live so existing links, bookmarks
// and deep links keep working. Flip back to `true` to restore.

/**
 * Silver Prediction (/prediction).
 *
 * When false, every entry point is removed: the nav link, the footer link,
 * and the account menu's "Withdrawal wallet & claim" deep link. Withdrawal no
 * longer depends on the prediction page.
 */
export const SHOW_SILVER_PREDICTION = false;
