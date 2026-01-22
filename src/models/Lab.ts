import mongoose from 'mongoose';

const LabSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: String,
    difficulty: String,
    objectives: [String],
    prerequisites: [String],
}, {
    timestamps: true,
});

export default mongoose.models.Lab || mongoose.model('Lab', LabSchema);
