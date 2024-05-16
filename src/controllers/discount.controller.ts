import type { Request, Response } from 'express';
import type { Discount } from '../models/discount.model';

import {
  createNewDiscount,
  deleteDiscount,
  getAllDiscount,
  getDiscount,
  updateDiscount,
} from '../services/discount.service';
import { serverError } from '../utils/response';

export async function getAllDiscountHandler(_req: Request, res: Response) {
  try {
    const discounts = await getAllDiscount();

    return res
      .status(discounts.code)
      .send(discounts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(serverError);
  }
}

export async function createNewDiscountHandler(req: Request, res: Response) {
  try {
    const discount = await createNewDiscount(req.body, req.file!.filename);

    return res
      .status(discount.code)
      .send(discount);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(serverError);
  }
}

export async function getDiscountHandler(req: Request<{ discountId: string }>, res: Response) {
  try {
    const discount = await getDiscount(req.params.discountId);

    return res
      .status(discount.code)
      .send(discount);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(serverError);
  }
}

export async function updateDiscountHandler(req: Request<{ discountId: string }, any, Discount>, res: Response) {
  try {
    const { discountId } = req.params;
    const discount = await updateDiscount({ ...req.body, id_diskon: discountId });

    return res
      .status(discount.code)
      .send(discount);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(serverError);
  }
}

export async function deleteDiscountHandler(req: Request<{ discountId: string }>, res: Response) {
  try {
    const result = await deleteDiscount(req.params.discountId);

    return res
      .status(result.code)
      .send(result);
  } catch (error) {
    console.error(error);
    return res.send(serverError);
  }
}
