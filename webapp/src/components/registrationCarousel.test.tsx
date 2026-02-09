import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegistrationCarousel } from './registrationCarousel';

// FIX: Mock the UI components directly.
// This bypasses the complex Embla logic and renders all slides as simple divs,
// making them immediately accessible to the test runner.
vi.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: any) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: any) => <div data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children }: any) => <div data-testid="carousel-item">{children}</div>,
  // We don't need these for this test, but mocking them prevents crashes if used
  CarouselPrevious: () => null,
  CarouselNext: () => null,
}));

// Mock Autoplay plugin to return a dummy function
vi.mock('embla-carousel-autoplay', () => ({
  default: () => (() => {}),
}));

describe('RegistrationCarousel', () => {
  it('renders carousel content', () => {
    render(<RegistrationCarousel />);
    
    // Now that Carousel is just a div, all text should be in the DOM
    expect(screen.getByText(/efficienza energetica/i)).toBeInTheDocument();
    expect(screen.getByText(/unisciti alle cer/i)).toBeInTheDocument();
    
    // Check for content from the second slide to ensure everything rendered
    expect(screen.getByText(/gestione semplificata/i)).toBeInTheDocument();
  });
});