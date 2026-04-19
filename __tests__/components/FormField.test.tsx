import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormField from '@/components/ui/FormField';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colours: {
      text: '#0D1F19', subtext: '#6B8C83', border: '#DDE9E5',
      card: '#FFFFFF', background: '#F5F8F7',
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
