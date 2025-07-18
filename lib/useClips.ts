import useSWR from 'swr';

export interface Clip {
  id: number;
  title: string;
  text_plain: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useClips() {
  return useSWR<Clip[]>('/api/clips', fetcher);
} 