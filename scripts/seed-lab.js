const mongoose = require('mongoose');
const { Schema } = mongoose;

// Ensure this matches your .env.local
const MONGODB_URI = 'mongodb://localhost:27020/hexalabs';

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    purchasedLabs: [{
        courseId: String,
        purchaseDate: { type: Date, default: Date.now },
    }],
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function addDummyLab() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'mahesh@hexalabs.online';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found! Please register this user in the UI first.`);
        } else {
            const labId = 'az-104';

            const exists = user.purchasedLabs && user.purchasedLabs.some(l => l.courseId === labId);
            if (!exists) {
                user.purchasedLabs = user.purchasedLabs || [];
                user.purchasedLabs.push({ courseId: labId });
                await user.save();
                console.log(`Successfully added lab ${labId} to ${email}`);
            } else {
                console.log(`User already has lab ${labId}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

addDummyLab();