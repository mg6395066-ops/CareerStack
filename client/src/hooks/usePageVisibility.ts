import { useState, useEffect } from 'react';

/**
 * Hook to detect if the page is visible to the user
 * Returns true when page is visible, false when hidden/minimized
 * Useful for stopping unnecessary polling and background operations
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    // Check initial visibility
    setIsVisible(document.visibilityState === 'visible');

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
