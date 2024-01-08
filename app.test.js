const db = require('./config/config'); 

describe('Database Connection Test', () => {
  it('should establish a database connection', async () => {
    try {
      await db.authenticate();
      // If the promise resolves without throwing an error, the connection is successful
      expect(true).toBe(true); // Placeholder expectation for a successful connection
    } catch (error) {
      // If an error occurs during the database connection attempt, the test fails
      expect(error).toBeNull(); // This will fail the test and show the error
    }
  });
});

