import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnswerButton from '../AnswerButton';

describe('AnswerButton', () => {
  const defaultProps = {
    option: 'Test Answer',
    index: 0,
    isSelected: false,
    onClick: vi.fn(),
  };

  it('renders the answer option text', () => {
    render(<AnswerButton {...defaultProps} />);
    expect(screen.getByText('Test Answer')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<AnswerButton {...defaultProps} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('shows correct option label (A, B, C, D)', () => {
    render(<AnswerButton {...defaultProps} index={2} />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('applies selected styles when isSelected is true', () => {
    render(<AnswerButton {...defaultProps} isSelected={true} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-primary-400');
  });

  it('shows correct answer indicator when revealed and correct', () => {
    render(
      <AnswerButton 
        {...defaultProps} 
        isRevealed={true} 
        isCorrect={true} 
      />
    );
    expect(screen.getByRole('button')).toHaveClass('bg-green-100');
  });

  it('is disabled when disabled prop is true', () => {
    render(<AnswerButton {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});