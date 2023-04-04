import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { assert } from 'console';
import { toHumanReadable } from '../components/file/FileDisplay';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


test('human readable works', () => {
  const bytes = 100;
  assert(toHumanReadable(bytes),"100B");
  assert(toHumanReadable(1024),"1KB");
  assert(toHumanReadable(1025),"1KB");
  assert(toHumanReadable(1024*1024-1),"1023KB");
  assert(toHumanReadable(1024*1024),"1MB");
});
