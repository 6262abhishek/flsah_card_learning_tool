import { render, screen } from '@testing-library/react';
import App from './App';

test('renders generate button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/generate/i);
  expect(buttonElement).toBeInTheDocument();
});
