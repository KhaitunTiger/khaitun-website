import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const { address, items, solanaAddress, tokenAddress } = req.body;

    if (!address || !items || !solanaAddress || !tokenAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the order
    const order = await db.collection('orders').insertOne({
      address,
      items,
      solanaAddress,
      tokenAddress,
      status: 'pending',
      createdAt: new Date(),
    });

    res.status(201).json({ orderId: order.insertedId });
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
}
