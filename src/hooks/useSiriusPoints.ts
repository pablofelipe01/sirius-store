// src/hooks/useSiriusPoints.ts
import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  wallet_address: string;
  points: number;
  name: string;
  created_at: string;
  last_updated: string;
}

interface UseSiriusPointsReturn {
  points: number;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  userExists: boolean;
  refetch: () => Promise<void>;
  createUser: (name?: string) => Promise<boolean>;
  updatePointsTemporarily: (newPoints: number) => void;
}

export function useSiriusPoints(walletAddress: string | undefined): UseSiriusPointsReturn {
  const [points, setPoints] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean>(false);

  const fetchUserPoints = async () => {
    if (!walletAddress) {
      setPoints(0);
      setUserData(null);
      setUserExists(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-points?wallet=${walletAddress}`);
      const data = await response.json();

      if (response.ok && data.exists) {
        setPoints(data.user.points);
        setUserData(data.user);
        setUserExists(true);
      } else {
        setPoints(0);
        setUserData(null);
        setUserExists(false);
        if (response.status === 404) {
          setError('Usuario no registrado en la base de datos');
        }
      }
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError('Error al obtener los puntos del usuario');
      setPoints(0);
      setUserData(null);
      setUserExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (name?: string): Promise<boolean> => {
    if (!walletAddress) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          name: name || 'Usuario'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUserPoints(); // Refetch data after creating user
        return true;
      } else {
        setError(data.error || 'Error al crear usuario');
        return false;
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Error al crear usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePointsTemporarily = (newPoints: number) => {
    setPoints(newPoints);
  };

  useEffect(() => {
    fetchUserPoints();
  }, [walletAddress]);

  return {
    points,
    userData,
    isLoading,
    error,
    userExists,
    refetch: fetchUserPoints,
    createUser,
    updatePointsTemporarily
  };
}