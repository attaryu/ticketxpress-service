import { Router } from 'express';

import {
  createNewDiscountHandler,
  deleteDiscountHandler,
  getAllDiscountHandler,
  getDiscountHandler,
  updateDiscountHandler,
} from '../controllers/discount.controller';
import uploadImage from '../storage';

const discountRoutes = Router();
const upload = uploadImage.single('image')

// * admin route
discountRoutes.route('/admin/discount')
  .get(getAllDiscountHandler)
  .post(upload, createNewDiscountHandler);

discountRoutes.route('/admin/discount/:discountId')
  .get(getDiscountHandler)
  .put(upload, updateDiscountHandler)
  .delete(deleteDiscountHandler);

// discountRoutes.put('/admin/discount/:discountId/switch-status');

// * user route
// discountRoutes.get('/discount');

export default discountRoutes;
