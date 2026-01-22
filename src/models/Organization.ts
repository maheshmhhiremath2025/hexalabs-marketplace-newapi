import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Lab licenses purchased by this organization
    labLicenses: [{
        courseId: {
            type: String,
            required: true
        },
        totalLicenses: {
            type: Number,
            required: true,
            default: 0
        },
        usedLicenses: {
            type: Number,
            default: 0
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
        }
    }],

    // Billing information
    billingInfo: {
        address: String,
        phone: String,
        taxId: String
    },

    // Zoho Books integration
    zohoCustomerId: {
        type: String,
        default: null
    },
    zohoCustomerName: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Create slug from name before saving
OrganizationSchema.pre('save', function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
