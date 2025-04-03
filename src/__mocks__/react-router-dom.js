const mockNavigate = jest.fn();

const ReactRouterDOM = jest.requireActual('react-router-dom');

// Mock the useNavigate hook
const useNavigate = () => mockNavigate;

// Export everything from the original module, but with our mocked hooks
module.exports = {
  ...ReactRouterDOM,
  useNavigate,
  BrowserRouter: ({ children }) => <div>{children}</div>
};

// Export the mock navigate function for tests to access
module.exports.mockNavigate = mockNavigate;