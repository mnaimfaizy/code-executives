/**
 * Toast Component Tests
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './Toast';

// Test component that uses the toast hook
const ToastTrigger = () => {
  const { showToast } = useToast();

  const showSuccess = (message: string) => showToast('success', message);
  const showError = (message: string) => showToast('error', message);
  const showWarning = (message: string) => showToast('warning', message);
  const showInfo = (message: string) => showToast('info', message);

  return (
    <div>
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showWarning('Warning message')}>Show Warning</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
    </div>
  );
};

describe('Toast System', () => {
  // Don't use fake timers by default
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // Ensure timers are real
  });

  it('should render ToastProvider without crashing', () => {
    const { getByText } = render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );

    expect(getByText('Content')).toBeInTheDocument();
  });

  it('should show success toast', async () => {
    const user = userEvent.setup();
    const { getByText, getByRole } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(getByText('Show Success'));

    expect(getByText('Success message')).toBeInTheDocument();
    expect(getByRole('alert')).toBeInTheDocument();
  });

  it('should show error toast', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(getByText('Show Error'));

    expect(getByText('Error message')).toBeInTheDocument();
  });

  it('should show warning toast', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(getByText('Show Warning'));

    expect(getByText('Warning message')).toBeInTheDocument();
  });

  it('should show info toast', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(getByText('Show Info'));

    expect(getByText('Info message')).toBeInTheDocument();
  });

  it('should close toast when close button is clicked', async () => {
    const user = userEvent.setup();
    const { getByText, getByRole, queryByText } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(getByText('Show Success'));
    expect(getByText('Success message')).toBeInTheDocument();

    const closeButton = getByRole('button', { name: /close/i });
    await user.click(closeButton);

    // Wait a tick for state update
    await waitFor(() => {
      expect(queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('should auto-dismiss toast after duration', async () => {
    const { getByText, queryByText } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    const user = userEvent.setup();
    await user.click(getByText('Show Success'));

    expect(getByText('Success message')).toBeInTheDocument();

    // Wait for auto-dismiss (default duration is 3000ms)
    await waitFor(
      () => {
        expect(queryByText('Success message')).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('should have accessible ARIA attributes', async () => {
    const user = userEvent.setup();
    const { getByText, getByRole } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(getByText('Show Success'));

    const alert = getByRole('alert');
    expect(alert).toBeInTheDocument();

    // Check if toast container has ARIA region
    const region = getByRole('region', { name: /notifications/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('should display multiple toasts', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    await user.click(getByText('Show Success'));
    await user.click(getByText('Show Error'));

    expect(getByText('Success message')).toBeInTheDocument();
    expect(getByText('Error message')).toBeInTheDocument();
  });
});
