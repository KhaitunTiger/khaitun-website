import { useState, useEffect, useCallback } from 'react';
import { getDonorRankings } from '../utils/solana-transactions';

interface DonorRank {
  address: string;
  amount: number;
}

export const useDonationRanking = () => {
  const [rankings, setRankings] = useState<DonorRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for forcing updates

  const fetchRankings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const donorRankings = await getDonorRankings(); // Remove the unnecessary parameter
      setRankings(donorRankings);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError('Failed to load rankings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on initial mount and when refreshKey changes
  useEffect(() => {
    fetchRankings();
  }, [fetchRankings, refreshKey]);

  const refresh = async () => {
    setRefreshKey(prev => prev + 1); // Increment refresh key to trigger re-fetch
  };

  return {
    rankings,
    isLoading,
    error,
    showAll,
    setShowAll,
    totalDonors: rankings.length,
    refresh
  };
};
