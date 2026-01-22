import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
    // API Key (public identifier)
    apiKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
        // Format: hxl_live_abc123xyz789 or hxl_test_abc123xyz789
    },

    // API Secret (hashed, never returned)
    apiSecretHash: {
        type: String,
        required: true,
    },

    // Owner information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        index: true,
    },

    // Key metadata
    name: {
        type: String,
        required: true,
        trim: true,
        // e.g., "Production API Key", "Development Key"
    },

    description: {
        type: String,
        trim: true,
    },

    // Permissions & scopes
    scopes: [{
        type: String,
        enum: [
            'labs:read',
            'labs:write',
            'labs:delete',
            'users:read',
            'users:write',
            'orders:read',
            'orders:write',
            'organizations:read',
            'organizations:write',
            'analytics:read',
            'webhooks:read',
            'webhooks:write',
            'admin:all',
        ],
    }],

    // Rate limiting tier
    tier: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free',
    },

    rateLimit: {
        requestsPerHour: {
            type: Number,
            default: 100,
        },
        requestsPerDay: {
            type: Number,
            default: 1000,
        },
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'revoked', 'expired'],
        default: 'active',
        index: true,
    },

    // Environment
    environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        default: 'production',
    },

    // Usage tracking
    lastUsedAt: {
        type: Date,
    },

    totalRequests: {
        type: Number,
        default: 0,
    },

    // IP whitelist (optional)
    allowedIPs: [{
        type: String,
    }],

    // Webhook URL (optional)
    webhookUrl: {
        type: String,
    },

    // Expiration
    expiresAt: {
        type: Date,
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Indexes for performance
apiKeySchema.index({ userId: 1, status: 1 });
apiKeySchema.index({ organizationId: 1, status: 1 });
apiKeySchema.index({ expiresAt: 1 }, { sparse: true });

// Methods
apiKeySchema.methods.isExpired = function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
};

apiKeySchema.methods.isActive = function () {
    return this.status === 'active' && !this.isExpired();
};

apiKeySchema.methods.hasScope = function (scope: string) {
    return this.scopes.includes(scope) || this.scopes.includes('admin:all');
};

apiKeySchema.methods.updateLastUsed = async function () {
    this.lastUsedAt = new Date();
    this.totalRequests += 1;
    await this.save();
};

// Statics
apiKeySchema.statics.generateKey = function (environment: string = 'production') {
    const prefix = 'hxl';
    const env = environment === 'production' ? 'live' : 'test';
    const randomPart = require('crypto').randomBytes(16).toString('hex');
    return `${prefix}_${env}_${randomPart}`;
};

apiKeySchema.statics.generateSecret = function () {
    return require('crypto').randomBytes(32).toString('hex');
};

// Note: updatedAt is automatically handled by timestamps: true option

const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
