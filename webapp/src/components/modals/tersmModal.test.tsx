import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TermsOfServiceModal, PrivacyPolicyModal } from './termsModal';

// Radix UI Dialogs often render in a Portal. 
// We rely on finding the text because the trigger wraps the children text.

describe('Legal Modals', () => {
  it('opens Terms of Service modal', () => {
    render(<TermsOfServiceModal>Apri Termini</TermsOfServiceModal>);
    
    // 1. Find Trigger
    const trigger = screen.getByText('Apri Termini');
    expect(trigger).toBeInTheDocument();

    // 2. Click Trigger
    fireEvent.click(trigger);

    // 3. Check Modal Content (Title usually)
    // Note: Radix UI renders content in a portal, so we look for it in the document body
    expect(screen.getByText('Termini di Servizio')).toBeInTheDocument();
    expect(screen.getByText(/accettazione dei termini/i)).toBeInTheDocument();
  });

  it('opens Privacy Policy modal', () => {
    render(<PrivacyPolicyModal>Apri Privacy</PrivacyPolicyModal>);
    
    const trigger = screen.getByText('Apri Privacy');
    fireEvent.click(trigger);

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/titolare del trattamento/i)).toBeInTheDocument();
  });
});