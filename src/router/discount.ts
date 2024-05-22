import { Router } from 'express';

import {
  createNewDiscountHandler,
  deleteDiscountHandler,
  getAllDiscountHandler,
  getDiscountHandler,
  updateDiscountHandler,
} from '../controllers/discount.controller';
import uploadImage from '../storage';
import checkAdmin from '../middleware/checkAdmin';

const discountRoutes = Router();
const upload = uploadImage.single('image')

// * admin route
discountRoutes.route('/admin/discount')
  .get(checkAdmin, getAllDiscountHandler)
  .post([checkAdmin, upload], createNewDiscountHandler);

discountRoutes.route('/admin/discount/:discountId')
  .get(checkAdmin, getDiscountHandler)
  .put([checkAdmin, upload], updateDiscountHandler)
  .delete(checkAdmin, deleteDiscountHandler);

// discountRoutes.put('/admin/discount/:discountId/switch-status');

// * user route
// discountRoutes.get('/discount');

export default discountRoutes;
