import { Request, Response } from 'express';
import { prisma } from '../index';

export const getTransactions = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const deposit = async (req: Request, res: Response) => {
  const { amount } = req.body; // amount is in Credits
  const user = (req as any).user;

  try {
    // In a real app, integrate Razorpay/Stripe here
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        credits: { increment: amount },
        transactions: {
          create: {
            amount,
            type: 'DEPOSIT',
            status: 'COMPLETED'
          }
        }
      }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Deposit failed' });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  const { amount, bankAccount } = req.body;
  const user = (req as any).user;

  if (user.credits < amount) {
    return res.status(400).json({ message: 'Insufficient credits' });
  }

  try {
    // Implement business model: take a small withdrawal fee (e.g., 5%)
    const fee = amount * 0.05;
    const netAmount = amount - fee;

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        credits: { decrement: amount },
        transactions: {
          create: {
            amount: -amount,
            type: 'WITHDRAW',
            status: 'PENDING'
          }
        }
      }
    });
    // Log withdrawal request for manual processing in real life
    console.log(`Withdrawal request: User ${user.id}, Net: ${netAmount} credits to ${bankAccount}`);

    res.json({ message: 'Withdrawal request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Withdrawal failed' });
  }
};
