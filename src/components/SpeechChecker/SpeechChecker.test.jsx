import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeechChecker from './SpeechChecker';

// Mock the Web Speech API
window.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

window.webkitSpeechRecognition = window.SpeechRecognition;

describe('SpeechChecker Component', () => {
  test('renders initial state correctly', () => {
    render(<SpeechChecker />);
    expect(screen.getByText(/Speech Practice/i)).toBeInTheDocument();
    expect(screen.getByText(/How to Practice Your Speaking Skills/i)).toBeInTheDocument();
  });

  test('starts recording when button is clicked', () => {
    render(<SpeechChecker />);
    fireEvent.click(screen.getByText(/Start Speaking Practice/i));
    // Use role="button" to specifically target the button element
    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    expect(screen.getByText(/Stop & Get Feedback/i)).toBeInTheDocument();
  });

  test('stops recording and gets feedback', () => {
    render(<SpeechChecker />);
    fireEvent.click(screen.getByText(/Start Speaking Practice/i));
    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    fireEvent.click(screen.getByText(/Stop & Get Feedback/i));
    expect(screen.getByText(/Your Speaking Feedback/i)).toBeInTheDocument();
  });

  test('resets the exercise', () => {
    render(<SpeechChecker />);
    fireEvent.click(screen.getByText(/Start Speaking Practice/i));
    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }));
    fireEvent.click(screen.getByText(/Stop & Get Feedback/i));
    fireEvent.click(screen.getByText(/Try Another Topic/i));
    expect(screen.getByText(/How to Practice Your Speaking Skills/i)).toBeInTheDocument();
  });

});