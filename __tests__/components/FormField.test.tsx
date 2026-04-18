import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormField from '@/components/ui/FormField';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colours: {
      text: '#212529', subtext: '#868E96', border: '#DEE2E6',
      card: '#FFFFFF', background: '#F8F9FA',
    },
  }),
}));

describe('FormField', () => {
  it('renders the label', () => {
    const { getByText } = render(
      <FormField label="Habit Name" value="" onChangeText={jest.fn()} />
    );
    expect(getByText('Habit Name')).toBeTruthy();
  });

  it('displays the current value', () => {
    const { getByDisplayValue } = render(
      <FormField label="Name" value="Running" onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue('Running')).toBeTruthy();
  });

  it('calls onChangeText when the user types', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <FormField label="Name" value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByDisplayValue(''), 'Running');
    expect(onChangeText).toHaveBeenCalledWith('Running');
  });
});
