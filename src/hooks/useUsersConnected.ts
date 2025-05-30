// src/hooks/useUsersConnected.ts
import { getUsersConnected } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';
import { IBackendRes, IUser } from '@/types/backend';
import { useQuery } from 'node_modules/@tanstack/react-query/build/legacy';


export const useUsersConnected = () => {
  const user = useAppSelector((state) => state.account.user) as IUser;

  const { data: res, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['usersConnected'],
    queryFn: () => getUsersConnected(Number(user?.id)),
    enabled: !!user?.id,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
  });

  return { res: res?.data, isLoading, isFetching, error, refetch };
};