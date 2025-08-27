'use client';

import { useState, useEffect } from 'react';

export default function TestChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chart/financial?days=30');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Financial Chart Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}