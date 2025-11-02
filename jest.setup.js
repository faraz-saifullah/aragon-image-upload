// Jest setup file
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db?schema=public';

// Test API base URL (used for creating NextRequest URLs in tests)
// This is a generic domain since we're testing handlers directly, not making actual HTTP calls
process.env.TEST_API_BASE_URL = 'http://test.local';
