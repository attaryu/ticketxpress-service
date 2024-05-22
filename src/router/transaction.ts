import { Router } from 'express';

import {
  createTransactionHandler,
  getAllTransactionsHandler,
  getAllUserTransactionsHandler,
  getTransactionHandler,
} from '../controllers/transaction.controller';
import checkAdmin from '../middleware/checkAdmin';

const transactionRoutes = Router();

// * admin routes

transactionRoutes.get('/admin/transaction', checkAdmin, getAllTransactionsHandler);

// * user routes

transactionRoutes
  .get('/transaction', getAllUserTransactionsHandler)
  .post('/transaction', createTransactionHandler);

transactionRoutes.get('/transaction/:transactionId', getTransactionHandler)

export default transactionRoutes;
