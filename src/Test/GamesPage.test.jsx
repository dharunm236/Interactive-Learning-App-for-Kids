import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GamesPage from '../components/GamesPage';
import '@testing-library/jest-dom';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  delete window.location;
  window.location = { href: '' };
});

afterEach(() => {
  window.location = originalLocation;
});

describe('GamesPage Component', () => {
  test('renders the header with correct text', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('FunLearn Games Hub')).toBeInTheDocument();
    expect(screen.getByText('Explore exciting games to learn and have fun!')).toBeInTheDocument();
  });

  test('renders all game cards', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('🎈 Balloon Game')).toBeInTheDocument();
    expect(screen.getByText('🧠 Memory Match')).toBeInTheDocument();
    expect(screen.getByText('➕ Maths Solving')).toBeInTheDocument();
    expect(screen.getByText('💰 Money Game')).toBeInTheDocument();
    expect(screen.getByText('🚀 Coming Soon')).toBeInTheDocument();
  });

  test('back button navigates to home page', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    const backButton = screen.getByAltText('Back');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('balloon game button navigates to correct route', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    const balloonGameButton = screen.getAllByText('Play Now')[0];
    fireEvent.click(balloonGameButton);
    expect(mockNavigate).toHaveBeenCalledWith('/games/Ballongame');
  });

  test('money game button navigates to correct route', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    // Find the button in the Money Game card
    const moneyGameCardIndex = 3; // 0-indexed, 4th card
    const playButtons = screen.getAllByText('Play Now');
    fireEvent.click(playButtons[moneyGameCardIndex]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/moneygame');
  });

  test('memory match button redirects to correct URL', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    const memoryMatchButton = screen.getAllByText('Play Now')[1];
    fireEvent.click(memoryMatchButton);
    
    expect(window.location.href).toBe('/games/Memory-Game/index_M.html');
  });

  test('math solving button redirects to correct URL', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    const mathSolvingButton = screen.getAllByText('Play Now')[2];
    fireEvent.click(mathSolvingButton);
    
    expect(window.location.href).toBe('/games/Basic-Arith/index_B.html');
  });

  test('coming soon button is disabled', () => {
    render(
      <BrowserRouter>
        <GamesPage />
      </BrowserRouter>
    );
    
    const comingSoonButton = screen.getByText('Coming Soon');
    expect(comingSoonButton).toBeDisabled();
  });
});