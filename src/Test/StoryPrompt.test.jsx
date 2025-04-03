import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StoryPrompt from '../components/Story/StoryPrompt';
import '@testing-library/jest-dom';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock scrollIntoView which is not available in JSDOM
Element.prototype.scrollIntoView = jest.fn();

// Mock speech synthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn().mockReturnValue([
    { lang: 'en-US', name: 'English Voice' },
    { lang: 'es-ES', name: 'Spanish Voice' },
    { lang: 'fr-FR', name: 'French Voice' }
  ])
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis
});

// Mock SpeechSynthesisUtterance
window.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  voice: null,
  lang: '',
  rate: 1,
  pitch: 1,
  onend: null
}));

describe('StoryPrompt Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders StoryPrompt component correctly', () => {
    render(
      <BrowserRouter>
        <StoryPrompt />
      </BrowserRouter>
    );
    
    // Check if the main elements are rendered
    expect(screen.getByText('✨ Create Your Magical Story! ✨')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your story idea...')).toBeInTheDocument();
    expect(screen.getByText('Choose a language:')).toBeInTheDocument();
    expect(screen.getByText('🎪 Generate Story!')).toBeInTheDocument();
  });

  test('handles back button click', () => {
    render(
      <BrowserRouter>
        <StoryPrompt />
      </BrowserRouter>
    );
    
    // Click the back button
    const backButton = screen.getByAltText('Back');
    fireEvent.click(backButton);
    
    // Check if navigate was called with correct route
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('allows typing in the prompt input', () => {
    render(
      <BrowserRouter>
        <StoryPrompt />
      </BrowserRouter>
    );
    
    // Get the input field and type in it
    const inputElement = screen.getByPlaceholderText('Enter your story idea...');
    fireEvent.change(inputElement, { target: { value: 'A story about a flying elephant' } });
    
    // Check if the value was updated
    expect(inputElement.value).toBe('A story about a flying elephant');
  });

  test('allows changing language selection', () => {
    render(
      <BrowserRouter>
        <StoryPrompt />
      </BrowserRouter>
    );
    
    // Get the language dropdown and change the selection
    const languageSelect = screen.getByRole('combobox');
    fireEvent.change(languageSelect, { target: { value: 'spanish' } });
    
    // Check if the value was updated
    expect(languageSelect.value).toBe('spanish');
  });

  test('generates a story when button is clicked', async () => {
    // Mock the axios response
    axios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: { 
              content: 'Once upon a time, there was a magical elephant who could fly.' 
            }
          }
        ]
      }
    });

    render(
      <BrowserRouter>
        <StoryPrompt />
      </BrowserRouter>
    );
    
    // Enter a prompt
    const inputElement = screen.getByPlaceholderText('Enter your story idea...');
    fireEvent.change(inputElement, { target: { value: 'A flying elephant' } });
    
    // Click the generate button
    const generateButton = screen.getByText('🎪 Generate Story!');
    fireEvent.click(generateButton);
    
    // Wait for the story to be displayed
    await waitFor(() => {
      expect(screen.getByText('📖 Your Amazing Story:')).toBeInTheDocument();
      expect(screen.getByText('Once upon a time, there was a magical elephant who could fly.')).toBeInTheDocument();
    });
    
    // Check if API was called with correct data
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('A flying elephant')
          })
        ])
      }),
      expect.any(Object)
    );
  });

  test('handles story narration controls', async () => {
    // Mock the axios response
    axios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: { 
              content: 'Once upon a time, there was a magical elephant who could fly.' 
            }
          }
        ]
      }
    });

    render(
      <BrowserRouter>
        <StoryPrompt />
      </BrowserRouter>
    );
    
    // Enter a prompt and generate story
    const inputElement = screen.getByPlaceholderText('Enter your story idea...');
    fireEvent.change(inputElement, { target: { value: 'A flying elephant' } });
    const generateButton = screen.getByText('🎪 Generate Story!');
    fireEvent.click(generateButton);
    
    // Wait for the story to be displayed
    await waitFor(() => {
      expect(screen.getByText('📖 Your Amazing Story:')).toBeInTheDocument();
    });
    
    // Click the narration button
    const narrationButton = screen.getByText('🔊 Listen to Story');
    fireEvent.click(narrationButton);
    
    // Check if speech synthesis was called
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    
    // Check if the button changed to stop
    expect(screen.getByText('🔇 Stop Narration')).toBeInTheDocument();
    
    // Click stop narration
    const stopButton = screen.getByText('🔇 Stop Narration');
    fireEvent.click(stopButton);
    
    // Check if speech synthesis cancel was called
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    
    // Check if the button changed back to play
    expect(screen.getByText('🔊 Listen to Story')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    // Mock the axios error response
    axios.post.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <StoryPrompt />
      </BrowserRouter>
    );
    
    // Enter a prompt
    const inputElement = screen.getByPlaceholderText('Enter your story idea...');
    fireEvent.change(inputElement, { target: { value: 'A flying elephant' } });
    
    // Click the generate button
    const generateButton = screen.getByText('🎪 Generate Story!');
    fireEvent.click(generateButton);
    
    // Wait for any error message to appear using a more flexible approach
    await waitFor(
      () => {
        // Look for any element containing parts of the error message
        const errorElement = screen.getByText((content, element) => {
          // Check if the content contains the error message or parts of it
          return content.includes('Failed to generate') || 
                 content.includes('Please try again') ||
                 content.toLowerCase().includes('error') ||
                 content.toLowerCase().includes('failed');
        });
        expect(errorElement).toBeInTheDocument();
      },
      { timeout: 3000 } // Increase timeout to ensure we give enough time
    );
    
    // Also verify that the loading state has been reset
    await waitFor(() => {
      // The loading indicator should be gone
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      
      // And the generate button should be enabled again
      const button = screen.getByText('🎪 Generate Story!');
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});