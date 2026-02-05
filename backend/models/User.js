const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Email/Password Authentication
                                         email: {
                                               type: String,
                                               sparse: true,
                                               lowercase: true,
                                               match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
                                         },
    phone: {
          type: String,
          sparse: true,
    },
    password: {
          type: String,
          minlength: 6,
          select: false,
    },

    // UAE Pass Authentication
    uaePassId: {
          type: String,
          sparse: true,
          unique: true,
    },
    uaePassToken: String,
    uaePassRefreshToken: String,

    // User Information
    firstName: String,
    lastName: String,
    profilePhoto: String,

    // Shopify Integration
    shopifyCustomerId: String,
    shopifyAccessToken: String,

    // Account Status
    isEmailVerified: {
          type: Boolean,
      default: false,
    },
    isPhoneVerified: {
          type: Boolean,
      default: false,
    },
    isActive: {
          type: Boolean,
      default: true,
    },

    // Preferences
    preferences: {
          emailNotifications: {
                  type: Boolean,
            default: true,
          },
          smsNotifications: {
                  type: Boolean,
            default: false,
          },
    },

    // Metadata
    lastLogin: Date,
    createdAt: {
          type: Date,
      default: Date.now,
    },
    updatedAt: {
          type: Date,
      default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

                 try {
                       const salt = await bcrypt.genSalt(10);
                       this.password = await bcrypt.hash(this.password, salt);
                       next();
                 } catch (error) {
                       next(error);
                 }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
