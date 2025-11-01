import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      // Immediately jump to top when pathname changes (works for desktop & mobile)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      // Also ensure document offsets are reset for different browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {
      // ignore
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
