// pages/api/addresses/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCollection } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const addressesCollection = await getCollection('addresses');

    switch (req.method) {
      case 'GET':
        const userId = req.query.userId as string;
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }
        
        const addresses = await addressesCollection
          .find({ userId })
          .toArray();
          
        res.status(200).json(addresses);
        break;

      case 'POST':
        const address = req.body;
        if (!address.userId) {
          return res.status(400).json({ error: 'userId is required' });
        }

        const result = await addressesCollection.insertOne({
          ...address,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        res.status(201).json(result);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}