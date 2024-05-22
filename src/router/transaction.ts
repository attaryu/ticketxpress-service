import { Router } from 'express';

import {
  createTransactionHandler,
  getAllUserTransactionsHandler,
  getTransactionHandler,
} from '../controllers/transaction.controller';

const transactionRoutes = Router();

transactionRoutes
  .get('/transaction', getAllUserTransactionsHandler)
  .post('/transaction', createTransactionHandler);

transactionRoutes.get('/transaction/:transactionId', getTransactionHandler)

export default transactionRoutes;
