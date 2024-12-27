import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    if (req.method === 'GET') {
      // Fetch orders
      const orders = await db.collection('orders').find({}).toArray();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
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

      return res.status(201).json({ orderId: order.insertedId });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Failed to handle request:', error);
    res.status(500).json({ message: 'Failed to handle request' });
  }
}
