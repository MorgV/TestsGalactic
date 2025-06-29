import { getHistory, addToHistory, removeFromHistory, clearHistory } from '../utils/storage';

describe('history storage utils', () => {
    beforeEach(() => localStorage.clear());
    // TODO: Названия
    test('добавляет элемент в историю', () => {
        const item = { fileName: 'test.csv' };
        addToHistory(item);

        const stored = getHistory();
        expect(stored).toHaveLength(1);
        expect(stored[0]).toMatchObject(item);
        expect(stored[0]).toHaveProperty('id');
        expect(stored[0]).toHaveProperty('timestamp');
    });

    test('удаляет элемент из истории', () => {
        const item = addToHistory({ fileName: 'delete.csv' });
        removeFromHistory(item.id);
        expect(getHistory()).toHaveLength(0);
    });

    test('очищает историю', () => {
        addToHistory({ fileName: 'clean.csv' });
        clearHistory();
        expect(getHistory()).toEqual([]);
    });
});
