import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: function (this: any) {
            // Password required only for non-OAuth users
            return !this.oauthProvider;
        },
        select: false, // Do not return password by default
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    role: {
        type: String,
        enum: ['super_admin', 'org_admin', 'org_member', 'user'],
        default: 'user',
    },
    // OAuth fields
    oauthProvider: {
        type: String,
        enum: ['google', 'azure-ad', null],
        default: null,
    },
    oauthId: {
        type: String,
        default: null,
    },
    // Organization membership (null for individual users and super admin)
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    purchasedLabs: [{
        courseId: String,
        purchaseDate: { type: Date, default: Date.now },
        accessExpiresAt: { type: Date }, // 180 days from purchase
        launchCount: { type: Number, default: 0 }, // Track total launches
        maxLaunches: { type: Number, default: 10 }, // Maximum 10 launches
        sessionDurationHours: { type: Number, default: 4 }, // 4 hours per session
        resourceGroupName: String, // Preserved RG name for reuse
        snapshotId: String, // Azure snapshot resource ID
        snapshotName: String, // Snapshot name for identification
        snapshotCreatedAt: Date, // When snapshot was created
        // Usage tracking
        totalTimeSpent: { type: Number, default: 0 }, // Total minutes spent in this lab
        lastAccessedAt: Date, // Last time lab was accessed
        launchHistory: [{
            launchedAt: Date,
            closedAt: Date,
            duration: Number // in minutes
        }],
        // Task progress tracking for lab instructions
        taskProgress: {
            completedTasks: [String], // Array of completed task IDs
            currentTaskIndex: { type: Number, default: 0 }, // Index of current task
            lastUpdatedAt: Date // Last progress update timestamp
        },
        activeSession: {
            id: String, // Resource Group Name (for lab VM)
            vmName: String,
            guacamoleConnectionId: String,
            guacamoleUsername: String,
            guacamolePassword: String,
            guacamoleAuthToken: String,
            // NEW: Azure Portal Access (separate from lab VM)
            azureUsername: String, // lab-user-xyz@hexalabs.online
            azurePassword: String, // Temporary password
            azureObjectId: String, // Azure AD user object ID
            azureResourceGroup: String, // Separate RG for user's Azure Portal work
            status: String,
            startTime: Date,
            expiresAt: Date // Session expires after 4 hours
        }
    }],
}, { timestamps: true, strict: false });

export default mongoose.models.User || mongoose.model('User', UserSchema);
