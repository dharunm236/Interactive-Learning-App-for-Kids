import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../components/Homepage';
import '@testing-library/jest-dom';

// Mock the firebase dependency
jest.mock('../firebaseConfig', () => ({
  db: {
    collection: jest.fn(() => ({
      addDoc: jest.fn().mockResolvedValue({ id: 'mock-doc-id' })
    }))
  }
}));

// Mock the toast notification
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock window.open for new tab links
window.open = jest.fn();

// Mock window.location.href for the chatbot redirect
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true
});

// Mock fetch for NewsSection component
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ items: Array(10).fill({ title: 'News Item', link: 'https://example.com' }) }),
    ok: true
  })
);

// Mock console methods to prevent console logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Homepage Component', () => {
  const mockProps = {
    onLogout: jest.fn(),
    currentUserId: 'user123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.open.mockClear(); // Clear the window.open mock before each test
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  // Helper function to render component and wait for async operations
  const renderWithAsyncWait = async (component) => {
    const result = render(component);
    // Wait for all pending promises to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    return result;
  };

  test('renders the homepage with correct header', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
    expect(screen.getByText(/FunLearn!/i)).toBeInTheDocument();
    expect(screen.getByText(/Where Learning Becomes a Magical Adventure/i)).toBeInTheDocument();
  });

  test('renders navigation links', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    expect(screen.getAllByText(/Home/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Lessons/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Games/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Quiz/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Progress/i).length).toBeGreaterThan(0);
  });

  test('toggles dropdown menu when profile is clicked', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    // Profile dropdown is initially hidden
    expect(screen.queryByText(/Add Friend/i)).not.toBeInTheDocument();
    
    // Click on profile picture to open dropdown
    const profileButton = document.querySelector('.profile-preview');
    await act(async () => {
      fireEvent.click(profileButton);
    });
    
    // Dropdown should be visible now
    expect(screen.getByText(/Add Friend/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test('calls logout function when logout is clicked', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    // Open dropdown menu
    const profileButton = document.querySelector('.profile-preview');
    await act(async () => {
      fireEvent.click(profileButton);
    });
    
    // Click logout button
    const logoutButton = screen.getByText(/Logout/i);
    await act(async () => {
      fireEvent.click(logoutButton);
    });
    
    // Check if onLogout was called
    expect(mockProps.onLogout).toHaveBeenCalledTimes(1);
  });

  test('navigates to create-story when story mascot is clicked', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    // Find the Story Time mascot card and click it
    const storyMascot = screen.getByText(/Story Time!/i).closest('.mascot-card');
    await act(async () => {
      fireEvent.click(storyMascot);
    });
    
    // Check if navigated to create-story
    expect(mockNavigate).toHaveBeenCalledWith('/create-story');
  });

  test('redirects to chatbot when spiritual guide mascot is clicked', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    // Find the spiritual guide mascot card and click it
    const spiritualMascot = screen.getByText(/Try this!/i).closest('.mascot-card');
    await act(async () => {
      fireEvent.click(spiritualMascot);
    });
    
    // Check if window.open was called with the correct URL and target
    expect(window.open).toHaveBeenCalledWith('https://sacredtext-chatbot.onrender.com/', '_blank');
  });

  test('renders mascot section with three mascots', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Meet Our Playful Mascots!/i)).toBeInTheDocument();
    expect(screen.getByText(/Story Time!/i)).toBeInTheDocument();
    expect(screen.getByText(/Try this!/i)).toBeInTheDocument();
    expect(screen.getByText(/Happy Hippo/i)).toBeInTheDocument();
  });

  test('renders learning adventures section with four activities', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Learning Adventures/i)).toBeInTheDocument();
    expect(screen.getByText(/Math Adventures/i)).toBeInTheDocument();
    expect(screen.getByText(/Alphabet Safari/i)).toBeInTheDocument();
    expect(screen.getByText(/Science World/i)).toBeInTheDocument();
    expect(screen.getByText(/Speech Practice/i)).toBeInTheDocument();
  });

  test('renders features section', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    // First find the features section container
    const featuresSection = screen.getByText(/Why Choose FunLearn\?/i).closest('section');
    expect(featuresSection).toBeInTheDocument();
    
    // Look for elements within the features section
    expect(featuresSection).toHaveTextContent(/Personalized Learning/i);
    expect(featuresSection).toHaveTextContent(/Gamified Rewards/i);
    expect(featuresSection).toHaveTextContent(/Parent Dashboard/i);
    expect(featuresSection).toHaveTextContent(/Kid-Safe Environment/i);
  });

  test('renders footer with navigation links', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    const footer = screen.getByText(/© 2025 FunLearn. All rights reserved./i);
    expect(footer).toBeInTheDocument();
    
    const footerLinks = screen.getAllByText(/Explore/i);
    expect(footerLinks.length).toBeGreaterThan(0);
  });

  test('renders features section with proper headings', async () => {
    await renderWithAsyncWait(
      <BrowserRouter>
        <Homepage {...mockProps} />
      </BrowserRouter>
    );
    
    const featuresSection = screen.getByText(/Why Choose FunLearn\?/i).closest('section');
    
    // Find all headings within the features section
    const headings = within(featuresSection).getAllByRole('heading', { level: 3 });
    
    // Check that the headings contain the expected text
    expect(headings[0]).toHaveTextContent(/Personalized Learning/i);
    expect(headings[1]).toHaveTextContent(/Gamified Rewards/i);
    expect(headings[2]).toHaveTextContent(/Parent Dashboard/i);
    expect(headings[3]).toHaveTextContent(/Kid-Safe Environment/i);
  });
});