import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HistoryList } from '@components/HistoryList';
import { useHistoryStore } from '@store/historyStore';
// TODO: названия
describe('HistoryList component', () => {
  beforeEach(() => {
    localStorage.clear();
    useHistoryStore.getState().clearHistory();

    // Мокаем updateHistoryFromStorage, чтобы он не перезаписывал историю
    useHistoryStore.setState({
      updateHistoryFromStorage: jest.fn(),
    });
  });

  test('рендерит элементы истории из состояния стора', async () => {
    useHistoryStore.setState({
      history: [
        {
          id: '1',
          fileName: 'sample.csv',
          timestamp: Date.now(),
        },
      ],
    });

    render(<HistoryList />);

    expect(await screen.findByText('sample.csv')).toBeInTheDocument();
  });

  test('удаляет элемент из истории при клике по кнопке удаления', async () => {
    const user = userEvent.setup();

    useHistoryStore.setState({
      history: [
        {
          id: '1',
          fileName: 'delete-me.csv',
          timestamp: Date.now(),
        },
      ],
    });

    render(<HistoryList />);

    // Кнопка удаления для первого элемента — index = 0
    const deleteButton = await screen.findByTestId('delete-button-0');
    await user.click(deleteButton);

    // Проверяем, что элемент удалён
    expect(screen.queryByText('delete-me.csv')).not.toBeInTheDocument();
  });
});
