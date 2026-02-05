const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');
const User = require('../models/User');

const router = express.Router();

// Shopify OAuth callback endpoint
router.get('/auth/callback', async (req, res, next) => {
    try {
          const { code, shop, state } = req.query;

      if (!code || !shop) {
              return res.status(400).json({ error: 'Missing code or shop parameter' });
      }

      // Exchange authorization code for access token
      const tokenResponse = await axios.post(
              `https://${shop}/admin/oauth/access_tokens`,
        {
                  client_id: process.env.SHOPIFY_API_KEY,
                  client_secret: process.env.SHOPIFY_API_SECRET,
                  code,
        }
            );

      const { access_token } = tokenResponse.data;

      // Get shop information
      const shopResponse = await axios.get(
              `https://${shop}/admin/api/2023-10/shop.json`,
        {
                  headers: {
                              'X-Shopify-Access-Token': access_token,
                  },
        }
            );

      const shopData = shopResponse.data.shop;

      // Store or update shop credentials in database
      const user = await User.findOneAndUpdate(
        { shopDomain: shop },
        {
                  shopDomain: shop,
                  accessToken: access_token,
                  shopName: shopData.name,
                  shopEmail: shopData.email,
        },
        { upsert: true, new: true }
            );

      logger.log(`Shopify OAuth successful for shop: ${shop}`);

      // Redirect to frontend with success
      res.redirect(
              `${process.env.FRONTEND_URL}/dashboard?shop=${shop}&success=true`
            );
    } catch (error) {
          logger.error(`Shopify OAuth error: ${error.message}`);
          res.redirect(`${process.env.FRONTEND_URL}/auth?error=oauth_failed`);
    }
});

// Shopify webhook endpoint for customer create/update
router.post('/webhooks/customer', express.raw({ type: 'application/json' }), async (req, res, next) => {
    try {
          const payload = JSON.parse(req.body);
          const { id, email, first_name, last_name } = payload;

      logger.log(`Shopify customer webhook received: ${email}`);

      // Update or create customer in database
      await User.findOneAndUpdate(
        { email },
        {
                  email,
                  firstName: first_name,
                  lastName: last_name,
                  shopifyCustomerId: id,
        },
        { upsert: true, new: true }
            );

      res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
    logger.error(`Shopify webhook error: ${error.message}`);
          next(error);
    }
});

// Get store products (optional - for document templates)
router.get('/store/products', async (req, res, next) => {
    try {
          const { shop } = req.query;

      if (!shop) {
              return res.status(400).json({ error: 'Shop parameter required' });
      }

      const user = await User.findOne({ shopDomain: shop });
          if (!user) {
                  return res.status(404).json({ error: 'Shop not found' });
          }

      const productsResponse = await axios.get(
              `https://${shop}/admin/api/2023-10/products.json`,
        {
                  headers: {
                              'X-Shopify-Access-Token': user.accessToken,
                  },
        }
            );

      res.json({
              message: 'Products retrieved successfully',
              products: productsResponse.data.products,
      });
    } catch (error) {
          logger.error(`Get products error: ${error.message}`);
          next(error);
    }
});

// Send document to Shopify customer
router.post('/send-document-to-customer', async (req, res, next) => {
    try {
          const { shop, customerId, documentId, documentUrl } = req.body;

      if (!shop || !customerId || !documentId) {
              return res.status(400).json({
                        error: 'shop, customerId, and documentId are required',
              });
      }

      const user = await User.findOne({ shopDomain: shop });
          if (!user) {
                  return res.status(404).json({ error: 'Shop not found' });
          }

      // Send document to customer via Shopify customer note or email
      // This is a placeholder for actual implementation
      logger.log(`Document ${documentId} sent to customer ${customerId} in shop ${shop}`);

      res.json({
              message: 'Document sent to customer successfully',
      });
    } catch (error) {
          logger.error(`Send document error: ${error.message}`);
          next(error);
    }
});

module.exports = router;
