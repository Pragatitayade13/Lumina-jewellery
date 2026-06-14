import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerSupportAgent from '../CustomerSupportAgent';

// Mock context/hooks
vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    user: { uid: 'user123', getIdToken: vi.fn().mockResolvedValue('mock-token') },
    customerSelectedStore: 'eoNjBBBlw1edDfPWufPD'
  })
}));

vi.mock('../CustomerSupportAgent.css', () => ({}));

vi.mock('lucide-react', () => {
  const dummyIcon = () => null;
  return {
    MessageSquare: dummyIcon,
    X: dummyIcon,
    Send: dummyIcon,
    Sparkles: dummyIcon,
    AlertCircle: dummyIcon,
    Check: dummyIcon,
    HelpCircle: dummyIcon
  };
});

describe('CustomerSupportAgent Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        response: "Hello user, this is a response from the AI support agent."
      })
    });
  });

  it('renders the floating toggle button initially', () => {
    render(<CustomerSupportAgent />);
    expect(screen.getByRole('button', { name: /Open Customer Support AI/i })).toBeInTheDocument();
  });

  it('opens the chat drawer on toggle click', () => {
    render(<CustomerSupportAgent />);
    const toggleButton = screen.getByRole('button', { name: /Open Customer Support AI/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText('Lumina Support AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('sends a user message and displays the AI agent response', async () => {
    render(<CustomerSupportAgent />);
    // Open chat
    fireEvent.click(screen.getByRole('button', { name: /Open Customer Support AI/i }));
    
    // Type and send
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Track order #12345' } });
    
    const sendButton = screen.getByRole('button', { name: '' }); // Send button
    fireEvent.click(sendButton);

    // Verify loading status & API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/customer/chat', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          message: 'Track order #12345',
          language: 'en',
          storeId: 'eoNjBBBlw1edDfPWufPD',
          confirmActionId: null,
          isCancel: false
        })
      }));
    });

    // Verify response is rendered
    await waitFor(() => {
      expect(screen.getByText("Hello user, this is a response from the AI support agent.")).toBeInTheDocument();
    });
  });
});
