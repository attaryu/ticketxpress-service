import type { Request, Response } from 'express';

import { createTransaction, getAllUserTransactions, getTransaction } from '../services/transaction.service';
import { serverError } from '../utils/response';
import { decodeToken } from '../utils/token';

export async function getAllUserTransactionsHandler(req: Request, res: Response) {
  try {
    const userLoggedIn = decodeToken<{ id: string }>(req.cookies.request_token);
    const transaction = await getAllUserTransactions(userLoggedIn!.id);

    return res
      .status(transaction.code)
      .send(transaction);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function createTransactionHandler(req: Request, res: Response) {
  try {
    const userLoggedIn = decodeToken<{ id: string }>(req.cookies.request_token);
    const transaction = await createTransaction({ ...req.body, pengguna: userLoggedIn!.id });

    return res
      .status(transaction.code)
      .send(transaction);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function getTransactionHandler(req: Request, res: Response) {
  try {
    const userLoggedIn = decodeToken<{ id: string }>(req.cookies.request_token);
    const transaction = await getTransaction(req.params.transactionId, userLoggedIn!.id);

    return res
      .status(transaction.code)
      .send(transaction);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}
