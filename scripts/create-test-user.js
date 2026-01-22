const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - matches docker-compose.yml
// Port 27020 on host maps to 27017 in container
const MONGODB_URI = 'mongodb://localhost:27020/hexalabs';

// User Schema - must match src/models/User.ts
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    purchasedLabs: [{
        courseId: String,
        purchaseDate: { type: Date, default: Date.now },
        activeSession: {
            id: String,
            vmName: String,
            guacamoleConnectionId: String,
            status: String,
            startTime: Date,
            expiresAt: Date
        }
    }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const email = 'its@s.com';
        const password = 'abc';
        const name = 'Test User';

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`⚠ User ${email} already exists`);

            // Update password if needed
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.updateOne(
                { email },
                { $set: { password: hashedPassword } }
            );
            console.log(`✓ Updated password for ${email}`);
        } else {
            // Create new user with hashed password
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'user'
            });

            console.log(`✓ Successfully created user: ${email}`);
            console.log(`  Name: ${name}`);
            console.log(`  Role: ${user.role}`);
        }

        // Verify user can be found (without password)
        const verifyUser = await User.findOne({ email });
        console.log(`✓ Verified user exists in database`);
        console.log(`  ID: ${verifyUser._id}`);
        console.log(`  Email: ${verifyUser.email}`);
        console.log(`  Name: ${verifyUser.name}`);

    } catch (error) {
        console.error('✗ Error:', error.message);
        if (error.code === 11000) {
            console.error('  Duplicate key error - user already exists');
        }
    } finally {
        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
    }
}

createTestUser();
