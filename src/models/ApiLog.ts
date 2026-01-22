import mongoose from 'mongoose';

const apiLogSchema = new mongoose.Schema({
    // Request information
    method: {
        type: String,
        required: true,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    },

    endpoint: {
        type: String,
        required: true,
        index: true,
    },

    path: {
        type: String,
        required: true,
    },

    // Authentication
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },

    apiKey: {
        type: String,
        index: true,
    },

    authMethod: {
        type: String,
        enum: ['api-key', 'jwt', 'none'],
    },

    // Request details
    ip: {
        type: String,
    },

    userAgent: {
        type: String,
    },

    // Response information
    statusCode: {
        type: Number,
        required: true,
        index: true,
    },

    responseTime: {
        type: Number, // milliseconds
        required: true,
    },

    // Error information (if any)
    error: {
        type: String,
    },

    errorStack: {
        type: String,
    },

    // Rate limiting
    rateLimitHit: {
        type: Boolean,
        default: false,
    },

    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: false, // We use custom timestamp field
});

// Indexes for performance
apiLogSchema.index({ timestamp: -1 });
apiLogSchema.index({ userId: 1, timestamp: -1 });
apiLogSchema.index({ statusCode: 1, timestamp: -1 });
apiLogSchema.index({ endpoint: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 30 days
apiLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const ApiLog = mongoose.models.ApiLog || mongoose.model('ApiLog', apiLogSchema);

export default ApiLog;
