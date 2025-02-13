import { NextFunction, Request, Response } from 'express';
import { getUserIdFromRequest } from '../services/session';
import {
  createTransactionService,
  formatGetTransactionsFilters,
  getTransactionByIdService,
  updateTransactionService,
  validateTransactionId,
} from '../services/transaction';
import {
  CreateTransactionInput,
  FilterTransactionsInput,
  OrderByDirections,
  OrderByFields,
  TransactionType,
} from '../types/transaction';
import {
  deleteTransactionDB,
  getTotalNumberTransactionsFullDB,
  getTransactionsDB,
  getTransactionsFullDB,
} from '../models/transaction';
import { validateAccountId } from '../services/account';
import { validateCategoryId } from '../services/category';

export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);
  const {
    amount,
    description,
    date,
    accountId,
    categoryId,
    type,
  }: {
    amount: number;
    description: string;
    date: string;
    accountId: string;
    categoryId: string;
    type: number;
  } = req.body;

  const dateObj = new Date(date);

  try {
    await validateAccountId(accountId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    await validateCategoryId(categoryId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    const createTransactionInput: CreateTransactionInput = {
      amount,
      description,
      date: dateObj,
      accountId,
      categoryId,
      type: type as TransactionType,
    };
    const transaction = await createTransactionService(createTransactionInput);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
}

export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);

  try {
    const transactions = await getTransactionsDB({ userId });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

export async function getTransactionsFull(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);
  const defaultFilters: FilterTransactionsInput = {
    startDate: new Date(
      new Date().setHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000,
    ), // 30 days ago at 00:00:00
    endDate: new Date(new Date().setHours(23, 59, 59, 999)), // Today at 23:59:59
    type: undefined,
    accountId: undefined,
    categoryId: undefined,
    orderBy: [
      {
        field: OrderByFields.Date,
        direction: OrderByDirections.Desc,
      },
    ],
    limit: 20,
    offset: 0,
  };
  const filters: FilterTransactionsInput = formatGetTransactionsFilters(
    req.query,
    defaultFilters,
  );

  try {
    const transactions = await getTransactionsFullDB({ userId, filters });
    const total = await getTotalNumberTransactionsFullDB({ userId, filters });
    res.json({ data: transactions, total });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);
  const transactionId = req.params.transactionId;

  try {
    const transactions = await getTransactionByIdService(transactionId, userId);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

export async function getTransactionsByAccount(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);
  const accountId = req.params.accountId;

  try {
    await validateAccountId(accountId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    const transactions = await getTransactionsDB({ userId, accountId });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

export async function getTransactionsByCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);
  const categoryId = req.params.categoryId;

  try {
    await validateCategoryId(categoryId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    const transactions = await getTransactionsDB({ userId, categoryId });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);
  const transactionId = req.params.transactionId;
  const {
    amount,
    description,
    date,
    accountId,
    categoryId,
    type,
  }: {
    amount: number;
    description: string;
    date: string;
    accountId: string;
    categoryId: string;
    type: number;
  } = req.body;

  const dateObj = new Date(date);

  try {
    await validateTransactionId(transactionId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    await validateAccountId(accountId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    await validateCategoryId(categoryId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    const createTransactionInput: CreateTransactionInput = {
      id: transactionId,
      amount,
      description,
      date: dateObj,
      accountId,
      categoryId,
      type: type as TransactionType,
    };
    const transaction = await updateTransactionService(createTransactionInput);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserIdFromRequest(req);
  const transactionId = req.params.transactionId;

  try {
    await validateTransactionId(transactionId, userId);
  } catch (error) {
    next(error);
    return;
  }

  try {
    await deleteTransactionDB(transactionId);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
}
