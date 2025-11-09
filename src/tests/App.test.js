// src/__tests__/App.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import * as api from '../api';

jest.mock('../api');

describe('EmployeeTaskAssignmentApp', () => {
  beforeEach(() => {
    api.getTasks.mockResolvedValue({ data: [] });
    api.addTask.mockResolvedValue({});

  });

  test('rendersMainHeadingAndForm', () => {
    render(<App />);
    expect(screen.getByText(/Employee Task Assignment/i)).toBeInTheDocument();
    expect(screen.getByText(/Assign New Task/i)).toBeInTheDocument();
  });

  test('rendersCalendarComponent', () => {
    render(<App />);
    expect(screen.getByText(/Tasks on/)).toBeInTheDocument();
  });

  

  test('alertShownWhenFieldsAreEmpty', () => {
    render(<App />);
    window.alert = jest.fn();

    fireEvent.click(screen.getByText(/Add Task/i));
    expect(window.alert).toHaveBeenCalledWith('All fields required!');
  });


  test('calendarLoadsTasksOnMount', async () => {
    api.getTasks.mockResolvedValue({
      data: [{ id: 1, title: 'Demo Task', date: '2025-07-30' }]
    });
  });

  test('noTasksMessageShownForEmptyDate', async () => {
    api.getTasks.mockResolvedValue({ data: [] });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No tasks')).toBeInTheDocument();
    });
  });

  test('filtersTasksBySelectedDate', async () => {
    api.getTasks.mockResolvedValue({
      data: [
        { id: 1, title: 'Design UI', date: '2025-07-30' },
        { id: 2, title: 'Write Tests', date: '2025-07-31' }
      ]
    });
  });

  test('multipleTasksOnSameDateAreDisplayed', async () => {
    api.getTasks.mockResolvedValue({
      data: [
        { id: 1, title: 'Task One', date: '2025-07-30' },
        { id: 2, title: 'Task Two', date: '2025-07-30' }
      ]
    });
  });

  test('taskTitleInputWorks', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Task Title/);
    fireEvent.change(input, { target: { value: 'New Task' } });
    expect(input.value).toBe('New Task');
  });

  test('taskDescriptionInputWorks', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Task Description/);
    fireEvent.change(input, { target: { value: 'New Desc' } });
    expect(input.value).toBe('New Desc');
  });
  
});


