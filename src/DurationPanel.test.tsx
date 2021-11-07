import React from 'react';
import { render, screen } from '@testing-library/react';
import DurationPanel from './DurationPanel';
import { Timestamp } from './Timestamp';

test('renders duration', () => {
  const from = Timestamp.parse('2006-01-02T15:04:05.008-07:00', false);
  const to = Timestamp.parse('2006-01-02T16:04:05.008-07:00', false);
  render(<DurationPanel from={from} to={to} />);
  const divElement = screen.getByRole('textbox');
  expect(divElement).toBeInTheDocument();
  expect(divElement.getAttribute('value')).toEqual('PT1H');
});
