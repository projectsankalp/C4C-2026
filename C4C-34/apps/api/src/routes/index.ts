import { Router } from 'express';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import vendorRoutes from './vendor.routes';
import artisanRoutes from './artisan.routes';
import whatsappRoutes from './whatsapp.routes';
import analyticsRoutes from './analytics.routes';
import demoRoutes from './demo.routes';
import barterRoutes from './barter.routes';
import aiRoutes from './ai.routes';
import processStepRoutes from './processStep.routes';
import communityRoutes from './community.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import requestRoutes from './request.routes';
import quoteRoutes from './quote.routes';
import sellerRoutes from './seller.routes';
import certificationRoutes from './certification.routes';
import otpRoutes from './otp.routes';
import networkRoutes from './network.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', service: 'hastkala-api', time: new Date().toISOString() },
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/products/:productId/steps', processStepRoutes);
router.use('/orders', orderRoutes);
router.use('/vendor', vendorRoutes);
router.use('/artisans', artisanRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/impact', analyticsRoutes);
router.use('/demo', demoRoutes);
router.use('/barter', barterRoutes);
router.use('/ai', aiRoutes);
router.use('/community', communityRoutes);

// New WhatsApp-bot-facing endpoints (Person 3 enhancement batch).
router.use('/users', userRoutes);
router.use('/requests', requestRoutes);
router.use('/quotes', quoteRoutes);
router.use('/sellers', sellerRoutes);
router.use('/certify', certificationRoutes);
router.use('/otp', otpRoutes);
router.use('/network', networkRoutes);
router.use('/admin', adminRoutes);

export default router;
