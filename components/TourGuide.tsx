'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useAuth } from '@/lib/auth/AuthContext';

const TOUR_STORAGE_KEY = 'dashboard-tour-completed';

// Context to expose tour controls
const TourContext = createContext<{ startTour: () => void } | null>(null);

export function useTourControls() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourControls must be used within TourGuide');
  }
  return context;
}

// Tour steps configuration - responsive and works across all resolutions
const steps = [
  {
    selector: '[data-tour="asset-selection"]',
    content: (
      <div className="tour-step-1" style={{ padding: '20px', maxWidth: 'min(350px, 90vw)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: '1.3' }}>
          Select an Asset
        </h3>
        <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
          Browse and select from the list of available assets on the left. Each asset shows its current bias and score. 
          Click on any asset card to view its detailed analysis.
        </p>
      </div>
    ),
    position: 'right' as const,
  },
  {
    selector: '[data-tour="analysis-display"]',
    content: (
      <div style={{ padding: '20px', maxWidth: 'min(350px, 90vw)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: '1.3' }}>
          View Analysis
        </h3>
        <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
          Here you'll see the comprehensive analysis for the selected asset, including COT (Commitment of Traders) data, 
          seasonality patterns, and the final combined score and bias.
        </p>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="analysis-info"]',
    content: (
      <div style={{ padding: '20px', maxWidth: 'min(350px, 90vw)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: '1.3' }}>
          Learn More
        </h3>
        <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
          Click on the info icons (?) throughout the analysis to learn more about specific metrics, 
          how scores are calculated, and what the data means.
        </p>
      </div>
    ),
    position: 'top' as const,
  },
  {
    selector: '[data-tour="score-settings"]',
    content: (
      <div style={{ padding: '20px', maxWidth: 'min(350px, 90vw)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: '1.3' }}>
          Customize Score Calculation
        </h3>
        <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
          Adjust the slider to change how much weight COT data and seasonality patterns have on the final score. 
          Your preferences are saved automatically. Click the info icon to learn more.
        </p>
      </div>
    ),
    position: 'bottom' as const,
  },
];

function TourContent() {
  const { setIsOpen, currentStep } = useTour();
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Backup: Adjust first step popover position if afterOpen doesn't catch it
  useEffect(() => {
    if (currentStep === 0) {
      const adjustPopover = () => {
        const popover = document.querySelector('[data-tour-elem="popover"]') as HTMLElement;
        const target = document.querySelector('[data-tour="asset-selection"]');
        if (popover && target) {
          // Change '50px' to adjust position
          popover.style.setProperty('transform', 'translateX(50px)', 'important');
        }
      };
      
      // Try after a short delay to ensure popover is rendered
      const timeout = setTimeout(adjustPopover, 100);
      return () => clearTimeout(timeout);
    } else {
      // Reset for other steps
      const popover = document.querySelector('[data-tour-elem="popover"]') as HTMLElement;
      if (popover) {
        popover.style.removeProperty('transform');
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (!user || !isDesktop) return;

    const tourKey = `${TOUR_STORAGE_KEY}-${user.uid}`;
    const hasCompletedTour = localStorage.getItem(tourKey) === 'true';
    
    const isNewUser = user.metadata.creationTime 
      ? (Date.now() - new Date(user.metadata.creationTime).getTime()) < 24 * 60 * 60 * 1000
      : false;

    if (isNewUser && !hasCompletedTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, isDesktop, setIsOpen]);

  useEffect(() => {
    if (currentStep === steps.length - 1 && user) {
      const tourKey = `${TOUR_STORAGE_KEY}-${user.uid}`;
      localStorage.setItem(tourKey, 'true');
    }
  }, [currentStep, user]);

  return null;
}

function TourControlsProvider({ children }: { children: React.ReactNode }) {
  const { setIsOpen, setCurrentStep } = useTour();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const startTour = useCallback(() => {
    if (!isDesktop) return;
    
    // Function to wait for element to be visible and have dimensions
    const waitForElement = (selector: string, timeout = 2000): Promise<Element | null> => {
      return new Promise((resolve) => {
        const startTime = Date.now();
        
        const check = () => {
          const element = document.querySelector(selector);
          
          if (element) {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            const isVisible = rect.width > 0 && 
                           rect.height > 0 && 
                           styles.display !== 'none' && 
                           styles.visibility !== 'hidden' &&
                           parseFloat(styles.opacity) > 0;
            
            if (isVisible) {
              resolve(element);
              return;
            }
          }
          
          if (Date.now() - startTime < timeout) {
            requestAnimationFrame(check);
          } else {
            resolve(null);
          }
        };
        
        check();
      });
    };
    
    // Scroll to top smoothly first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Wait for scroll and DOM to settle, then verify elements exist
    setTimeout(async () => {
      // Wait for critical elements to be visible
      const elements = await Promise.all([
        waitForElement('[data-tour="asset-selection"]'),
        waitForElement('[data-tour="analysis-display"]'),
        waitForElement('[data-tour="score-settings"]'),
      ]);
      
      // Log any missing elements for debugging
      const missing = elements.filter(el => !el);
      if (missing.length > 0) {
        console.warn('Some tour elements are not visible:', {
          assetSelection: !!elements[0],
          analysisDisplay: !!elements[1],
          scoreSettings: !!elements[2],
        });
      }
      
      // Start tour even if some elements are missing (they might appear later)
      setCurrentStep(0);
      setIsOpen(true);
    }, 600);
  }, [isDesktop, setIsOpen, setCurrentStep]);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
    </TourContext.Provider>
  );
}

function FallbackTourProvider({ children }: { children: React.ReactNode }) {
  const startTour = () => {};

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
    </TourContext.Provider>
  );
}

export function TourGuide({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop) {
    return (
      <FallbackTourProvider>
        {children}
      </FallbackTourProvider>
    );
  }

  return (
    <TourProvider
      steps={steps}
      styles={{
        popover: (base, state) => {
          // Add extra margin-left for first step (step 0)
          const baseStyles = {
            ...base,
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderRadius: '12px',
            padding: 0,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: 'min(400px, 90vw)',
            minWidth: 'min(320px, 85vw)',
            zIndex: 10001,
            position: 'fixed' as const,
          };
          
          // For first step, add margin-left to shift right
          if (state?.currentStep === 0) {
            return {
              ...baseStyles,
              marginLeft: '50px', // Change this value to adjust
            };
          }
          
          return baseStyles;
        },
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        badge: (base) => ({
          ...base,
          left: 'auto',
          right: '-0.8125em',
        }),
        controls: (base) => ({
          ...base,
          marginTop: '20px',
          padding: '0 20px 20px 20px',
        }),
        close: (base) => ({
          ...base,
          right: '8px',
          left: 'auto',
          top: '8px',
          color: '#64748b',
          width: '24px',
          height: '24px',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
        }),
        maskWrapper: (base) => ({
          ...base,
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }),
      }}
      padding={{ mask: 5, popover: [20, 20] }}
      scrollSmooth={false}
      afterOpen={(target) => {
        // Adjust first step popover position - check if target is asset-selection
        setTimeout(() => {
          const popover = document.querySelector('[data-tour-elem="popover"]') as HTMLElement;
          if (popover && target && target.getAttribute('data-tour') === 'asset-selection') {
            // Apply transform to shift right
            // Change '50px' to adjust how much it shifts right
            popover.style.setProperty('transform', 'translateX(50px)', 'important');
          } else if (popover) {
            // Reset transform for other steps
            popover.style.removeProperty('transform');
          }
        }, 10);
      }}
      beforeClose={(target) => {
        // Clean up any scroll locks when closing
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }}
      onClickClose={({ setIsOpen }) => {
        setIsOpen(false);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (user) {
          const tourKey = `${TOUR_STORAGE_KEY}-${user.uid}`;
          localStorage.setItem(tourKey, 'true');
        }
      }}
      onClickMask={({ setIsOpen }) => {
        setIsOpen(false);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (user) {
          const tourKey = `${TOUR_STORAGE_KEY}-${user.uid}`;
          localStorage.setItem(tourKey, 'true');
        }
      }}
    >
      <TourControlsProvider>
        <TourContent />
        {children}
      </TourControlsProvider>
    </TourProvider>
  );
}

export function TourStartButton() {
  const [isDesktop, setIsDesktop] = useState(false);
  const context = useContext(TourContext);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop || !context) {
    return null;
  }

  const { startTour } = context;

  return (
    <button
      onClick={startTour}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
      aria-label="Start Tour Guide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Start Tour
    </button>
  );
}
