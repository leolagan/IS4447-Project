//This imports React and the testing utilities needed to render components and simulate user interactions
import FormField from '@/components/ui/FormField';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

//This mocks the ThemeContext so the FormField component can access theme colours without needing a real context provider wrapping it in every test
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colours: {
      text: '#0D1F19', subtext: '#6B8C83', border: '#DDE9E5',
      card: '#FFFFFF', background: '#F5F8F7',
    },
  }),
}));

//This groups all tests related to the FormField component together
describe('FormField', () => {

  //This tests that the label prop is rendered visibly on screen
  it('renders the label', () => {
    const { getByText } = render(
      <FormField label="Habit Name" value="" onChangeText={jest.fn()} />
    );
    expect(getByText('Habit Name')).toBeTruthy();
  });

  //This tests that the value prop is displayed inside the text input
  it('displays the current value', () => {
    const { getByDisplayValue } = render(
      <FormField label="Name" value="Running" onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue('Running')).toBeTruthy();
  });

  //This tests that typing into the input fires the onChangeText callback with the new text value the user entered
  it('calls onChangeText when the user types', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <FormField label="Name" value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByDisplayValue(''), 'Running');
    expect(onChangeText).toHaveBeenCalledWith('Running');
  });
});