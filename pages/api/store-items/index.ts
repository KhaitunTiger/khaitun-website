// pages/api/store-items/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCollection } from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const collection = await getCollection('store-items');

    if (req.method === 'GET') {
      const items = await collection.find({}).toArray();
      res.status(200).json(items);
    } 
    else if (req.method === 'POST') {
      const { name, price, image } = req.body;
      const result = await collection.insertOne({
        name,
        price,
        image,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const insertedItem = await collection.findOne({ 
        _id: result.insertedId 
      });
      
      res.status(201).json(insertedItem);
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
}
