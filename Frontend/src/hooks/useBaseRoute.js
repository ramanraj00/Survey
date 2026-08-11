import { useLocation } from 'react-router-dom';

export function useBaseRoute() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return '/admin';
  }
  return '/agent';
}
