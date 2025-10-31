import { toast } from 'sonner';

// Global error handlers for non-React errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Log to localStorage for debugging
    try {
      const errorLog = {
        type: 'unhandledRejection',
        reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('appErrors') || '[]');
      existingErrors.push(errorLog);
      localStorage.setItem('appErrors', JSON.stringify(existingErrors.slice(-10)));
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Show user-friendly error notification
    toast.error('An unexpected error occurred. Please try refreshing the page.');
    
    // Prevent the browser's default handling
    event.preventDefault();
  });

  // Handle JavaScript runtime errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error);
    
    // Log to localStorage for debugging
    try {
      const errorLog = {
        type: 'runtimeError',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('appErrors') || '[]');
      existingErrors.push(errorLog);
      localStorage.setItem('appErrors', JSON.stringify(existingErrors.slice(-10)));
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Show user-friendly error notification for uncaught errors
    if (event.error) {
      toast.error('An error occurred. Please try refreshing the page.');
    }
  });
  
  // Handle fetch/network errors that aren't caught by try-catch
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof TypeError && event.reason.message.includes('fetch')) {
      console.error('Network error:', event.reason);
      toast.error('Network error. Please check your connection and try again.');
      event.preventDefault();
    }
  });
}
