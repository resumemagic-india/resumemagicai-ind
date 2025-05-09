
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initial value based on window width if available (client-side only)
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    // Default to false for server-side rendering
    return false;
  });

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      console.log(`Current viewport width: ${width}, isMobile: ${width < MOBILE_BREAKPOINT}`);
    };
    
    // Add event listener for resize
    window.addEventListener("resize", checkMobile);
    
    // Run once on mount to ensure correct initial value
    checkMobile();
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(() => {
    // Initial value based on window width if available (client-side only)
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
    }
    // Default to false for server-side rendering
    return false;
  });

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };
    
    // Add event listener for resize
    window.addEventListener("resize", checkTablet);
    
    // Run once on mount to ensure correct initial value
    checkTablet();
    
    // Cleanup
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  return isTablet;
}

// This function helps determine if a device is mobile based on user agent
// Can be used in scenarios where we need device info regardless of viewport size
export function detectMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Regular expression for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
}

// A hook that combines both viewport size and user agent detection
export function useIsMobileDevice() {
  const isMobileViewport = useIsMobile();
  const [isMobileDevice, setIsMobileDevice] = React.useState(false);
  
  React.useEffect(() => {
    setIsMobileDevice(detectMobileDevice());
  }, []);
  
  return {
    isMobileViewport,  // Based on screen size
    isMobileDevice,    // Based on user agent
    isEitherMobile: isMobileViewport || isMobileDevice
  };
}

// New hook to determine device type
export function useDeviceType() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
}
