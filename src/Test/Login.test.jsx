import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login/Login';
import { logIn, logInWithGoogle, signUp } from '../authService';
import { useNavigate } from 'react-router-dom';

// Mock the auth service
jest.mock('../authService', () => ({
  logIn: jest.fn(),
  logInWithGoogle: jest.fn(),
  signUp: jest.fn()
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

// Mock window.crypto.getRandomValues for the particle animation
global.crypto = {
  getRandomValues: jest.fn(array => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 1000);
    }
    return array;
  })
};

describe('Login Component', () => {
  const mockNavigate = jest.fn();
  
  // Mock clearInterval and setInterval to prevent timer issues
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    
    // Replace setInterval with a mock to control timing
    global.setInterval = jest.fn((callback) => {
      // Return a fake interval ID
      return 123;
    });
    
    global.clearInterval = jest.fn();
    
    // Create a mock for appendChild since we're creating particles
    const mockAppendChild = jest.fn();
    document.querySelector = jest.fn().mockImplementation(() => ({
      appendChild: mockAppendChild,
      querySelectorAll: jest.fn().mockReturnValue([]),
      clientWidth: 800,
      clientHeight: 600
    }));
  });
  
  afterEach(() => {
    // Restore original interval functions after tests
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  });

  test('renders login form by default', async () => {
    await act(async () => {
      render(<Login />);
    });
    
    // Check if login elements are present
    expect(screen.getByText(/Welcome to KidsLearn!/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Username/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Let's Learn!/i)).toBeInTheDocument();
    expect(screen.getByText(/New friend?/i)).toBeInTheDocument();
  });

  test('toggles to signup form when signup button is clicked', async () => {
    await act(async () => {
      render(<Login />);
    });
    
    // Click the signup toggle button
    await act(async () => {
      fireEvent.click(screen.getByText(/Join our learning adventure!/i));
    });
    
    // Check if signup elements are present
    expect(screen.getByText(/Join the KidsLearn Family!/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign-Up/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Create Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Let's Get Started! 🚀/i)).toBeInTheDocument();
    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
  });

  test('toggles back to login form from signup', async () => {
    await act(async () => {
      render(<Login />);
    });
    
    // Go to signup first
    await act(async () => {
      fireEvent.click(screen.getByText(/Join our learning adventure!/i));
    });
    
    // Then back to login
    await act(async () => {
      fireEvent.click(screen.getByText(/Login here/i));
    });
    
    // Verify we're back to login form
    expect(screen.getByText(/Welcome to KidsLearn!/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Username/i)).not.toBeInTheDocument();
  });

  test('handles login submission correctly', async () => {
    logIn.mockResolvedValueOnce({});
    
    await act(async () => {
      render(<Login />);
    });
    
    // Fill in login form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'test@example.com' }
      });
      
      fireEvent.change(screen.getByPlaceholderText(/Password/i), {
        target: { value: 'password123' }
      });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/Let's Learn!/i));
    });
    
    // Check if login function was called with correct params
    await waitFor(() => {
      expect(logIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles signup submission correctly', async () => {
    signUp.mockResolvedValueOnce({});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    await act(async () => {
      render(<Login />);
    });
    
    // Switch to signup
    await act(async () => {
      fireEvent.click(screen.getByText(/Join our learning adventure!/i));
    });
    
    // Fill in signup form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Username/i), {
        target: { value: 'testuser' }
      });
      
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'test@example.com' }
      });
      
      fireEvent.change(screen.getByPlaceholderText(/Create Password/i), {
        target: { value: 'password123' }
      });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/Let's Get Started! 🚀/i));
    });
    
    // Check if signup function was called with correct params
    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser');
      expect(alertMock).toHaveBeenCalledWith('Signup successful! Please login.');
    });
    
    // Cleanup
    alertMock.mockRestore();
  });

  test('handles login errors correctly', async () => {
    // Mock login to throw an error
    logIn.mockRejectedValueOnce(new Error('Invalid email or password'));
    
    await act(async () => {
      render(<Login />);
    });
    
    // Fill in login form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'test@example.com' }
      });
      
      fireEvent.change(screen.getByPlaceholderText(/Password/i), {
        target: { value: 'wrongpassword' }
      });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/Let's Learn!/i));
    });
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password. Please try again./i)).toBeInTheDocument();
    });
  });

  test('handles Google login correctly', async () => {
    logInWithGoogle.mockResolvedValueOnce({});
    
    await act(async () => {
      render(<Login />);
    });
    
    // Click the Google login button
    await act(async () => {
      fireEvent.click(screen.getByTitle('Sign in with Google'));
    });
    
    // Check if Google login function was called
    await waitFor(() => {
      expect(logInWithGoogle).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays quote rotation', async () => {
    // Use a controlled environment for timers
    jest.useFakeTimers();
    
    // Render the component
    let renderResult;
    
    await act(async () => {
      renderResult = render(<Login />);
    });
    
    // Check initial quote
    expect(screen.getByText(/📚 Learning is fun! Let's explore together! 📖/i)).toBeInTheDocument();
    
    // Manually trigger the quote rotation by manipulating the state directly
    await act(async () => {
      // Advance timers to trigger the setInterval callback
      jest.advanceTimersByTime(3000);
    });
    
    // Check updated quote after timer advances
    expect(screen.getByText(/🌟 Every day is a new adventure! 🌈/i)).toBeInTheDocument();
    
    // Clean up
    jest.useRealTimers();
  });
});