// ─── Test Setup ───────────────────────────────────
// Runs before each test file. Sets env vars needed by the app.
process.env.JWT_SECRET = 'test_secret_key_for_jest_do_not_use_in_production';
process.env.NODE_ENV = 'test';
