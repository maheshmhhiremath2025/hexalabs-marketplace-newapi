// MongoDB initialization script
db = db.getSiblingDB('hexalabs');

// Create collections
db.createCollection('users');
db.createCollection('orders');
db.createCollection('organizations');
db.createCollection('labs');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.organizations.createIndex({ name: 1 });

print('MongoDB initialized successfully for Hexalabs Marketplace');
