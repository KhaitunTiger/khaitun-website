// pages/api/store-items/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCollection } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const collection = await getCollection('store-items');

    if (req.method === 'PUT') {
      const { name, price, image } = req.body;
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id as string) },
        {
          $set: {
            name,
            price,
            image,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      res.status(200).json(result);
    } 
    else if (req.method === 'DELETE') {
      const result = await collection.deleteOne({
        _id: new ObjectId(id as string)
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      res.status(204).end();
    }
    else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
}
