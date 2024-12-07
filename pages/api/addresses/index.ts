import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db("store");

  switch (req.method) {
    case 'GET':
      try {
        const userId = req.query.userId as string;
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }
        
        const addresses = await db
          .collection("addresses")
          .find({ userId })
          .toArray();
          
        res.status(200).json(addresses);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch addresses' });
      }
      break;

    case 'POST':
      try {
        const address = req.body;
        if (!address.userId) {
          return res.status(400).json({ error: 'userId is required' });
        }

        const result = await db.collection("addresses").insertOne({
          ...address,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create address' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
