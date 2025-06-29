import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HistoryList } from '@components/HistoryList';

jest.mock('@store/historyStore', () => ({
  useHistoryStore: jest.fn(),
}));

import { useHistoryStore } from '@store/historyStore';

describe('HistoryList component', () => {
  const mockClearHistory = jest.fn();
  const mockRemoveFromHistory = jest.fn();
  const mockSetSelectedItem = jest.fn();
  const mockShowModal = jest.fn();
  const mockUpdateHistoryFromStorage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Приводим useHistoryStore к типу jest.Mock через unknown, чтобы избежать ошибки
    (useHistoryStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        history: [
          {
            id: '1',
            fileName: 'sample.csv',
            timestamp: Date.now(),
            highlights: ['some'],
          },
        ],
        clearHistory: mockClearHistory,
        removeFromHistory: mockRemoveFromHistory,
        setSelectedItem: mockSetSelectedItem,
        showModal: mockShowModal,
        updateHistoryFromStorage: mockUpdateHistoryFromStorage,
      })
    );
  });

  test('рендерит элементы истории из заглушенного стора', async () => {
    render(<HistoryList />);
    expect(await screen.findByText('sample.csv')).toBeInTheDocument();
  });

  test('удаляет элемент из истории при клике по кнопке удаления', async () => {
    (useHistoryStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        history: [
          {
            id: '1',
            fileName: 'delete-me.csv',
            timestamp: Date.now(),
            highlights: ['some'],
          },
        ],
        clearHistory: mockClearHistory,
        removeFromHistory: mockRemoveFromHistory,
        setSelectedItem: mockSetSelectedItem,
        showModal: mockShowModal,
        updateHistoryFromStorage: mockUpdateHistoryFromStorage,
      })
    );

    const user = userEvent.setup();

    render(<HistoryList />);

    const deleteButton = await screen.findByTestId('delete-button-0');
    await user.click(deleteButton);

    expect(mockRemoveFromHistory).toHaveBeenCalledWith('1');
  });
});
