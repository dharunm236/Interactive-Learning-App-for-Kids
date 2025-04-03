import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../components/Profile/ProfilePage';

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    useNavigate: () => jest.fn()
  };
});

describe('ProfilePage Component', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => JSON.stringify({
        name: "Alex Johnson",
        username: "alexkid",
        email: "alex@example.com",
        age: "8",
        language: "English",
        avatar: "https://api.dicebear.com/6.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4"
      })),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  test('renders profile information', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByText('alexkid')).toBeInTheDocument();
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
  });
  
  test('allows editing profile field', async () => {
    const { container } = render(<ProfilePage />);
    
    // Use querySelector to find elements by class
    const firstEditIcon = container.querySelector('.editIcon');
    fireEvent.click(firstEditIcon);
    
    // Edit the input field
    const inputField = screen.getByDisplayValue('Alex Johnson');
    fireEvent.change(inputField, { target: { value: 'New Name' } });
    
    // Find and click save button
    const saveButton = container.querySelector('.saveFieldButton');
    fireEvent.click(saveButton);
    
    // Verify localStorage was updated
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('New Name')
    );
  });
});