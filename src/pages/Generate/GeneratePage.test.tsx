import { act } from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { GeneratePage } from './GeneratePage';




describe('GeneratePage', () => {
    const originalCreateElement = document.createElement;

    beforeAll(() => {
        if (!window.URL.createObjectURL) {
            window.URL.createObjectURL = jest.fn(() => 'mock-url');
        }
        if (!window.URL.revokeObjectURL) {
            window.URL.revokeObjectURL = jest.fn();
        }
    });

    beforeEach(() => {
        jest.resetAllMocks();

        jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName === 'a') {
                const element = originalCreateElement.call(document, 'a');
                element.click = jest.fn();
                return element;
            }
            return originalCreateElement.call(document, tagName);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Когда компонент генерации файла рендерится — отображается кнопка "Начать генерацию".', () => {
        render(<GeneratePage />);
        expect(screen.getByRole('button', { name: /начать генерацию/i })).toBeInTheDocument();
    });

    // Новый отдельный тест для проверки блокировки кнопки при клике
    test('Кнопка "Начать генерацию" блокируется при клике и разблокируется после завершения', async () => {
        // Мокаем fetch так, чтобы он сразу резолвился
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                redirected: false,
                type: 'basic',
                url: '',
                headers: {
                    get: (key: string) =>
                        key === 'Content-Disposition' ? 'attachment; filename="report.csv"' : null,
                } as unknown as Headers,
                blob: () => Promise.resolve(new Blob(['test content'], { type: 'text/csv' })),
                clone: function () {
                    return this;
                },
                body: null,
                bodyUsed: false,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                formData: () => Promise.resolve(new FormData()),
                json: () => Promise.resolve({}),
                text: () => Promise.resolve(''),
            } as Response)
        );


        render(<GeneratePage />);
        const button = screen.getByRole('button', { name: /начать генерацию/i });

        // Проверяем начальное состояние кнопки
        expect(button).not.toBeDisabled();

        // Кликаем по кнопке
        fireEvent.click(button);

        // После клика кнопка должна стать disabled
        expect(button).toBeDisabled();

        // Ждём завершения операции (кнопка разблокируется)
        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

    // Остальные тесты без проверки disabled
    // TODO: посмотреть еще раз
    it('Когда пользователь кликает по кнопке "Начать генерацию", сервер возвращает успешный ответ — файл скачивается, появляется сообщение об успехе.', async () => {
        const mockBlob = new Blob(['test content'], { type: 'text/csv' });
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                headers: {
                    get: (key: string) =>
                        key === 'Content-Disposition' ? 'attachment; filename="report.csv"' : null,
                } as unknown as Headers,
                blob: () => Promise.resolve(mockBlob),
            } as Response)
        );

        render(<GeneratePage />);
        const button = screen.getByRole('button', { name: /начать генерацию/i });
        fireEvent.click(button);

        await waitFor(() =>
            expect(screen.getByText(/отчёт успешно сгенерирован/i)).toBeInTheDocument()
        );

        expect(button).not.toBeDisabled();
    });

    it('Когда пользователь кликает по кнопке "Начать генерацию" и сервер возвращает ошибку — отображается сообщение об ошибке, и кнопка разблокируется.', async () => {
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                headers: {
                    get: () => null,
                } as unknown as Headers,
                json: () => Promise.resolve({ error: 'Ошибка сервера' }),
                status: 500,
                statusText: 'Internal Server Error',
            } as Response)
        );

        render(<GeneratePage />);
        const button = screen.getByRole('button', { name: /начать генерацию/i });
        fireEvent.click(button);

        await waitFor(() =>
            expect(screen.getByText(/произошла ошибка: ошибка сервера/i)).toBeInTheDocument()
        );

        expect(button).not.toBeDisabled();
    });

    it('Когда пользователь кликает по кнопке "Начать генерацию" и происходит сбой сети — отображается сообщение о сетевой ошибке, и кнопка разблокируется.', async () => {
        globalThis.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

        render(<GeneratePage />);
        const button = screen.getByRole('button', { name: /начать генерацию/i });
        fireEvent.click(button);

        await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());

        expect(button).not.toBeDisabled();
    });

    it('Когда пользователь успешно скачивает файл — сообщение об успешной генерации исчезает через заданное время.', async () => {
        const mockBlob = new Blob(['test content'], { type: 'text/csv' });

        jest.useFakeTimers();

        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                headers: {
                    get: (key) =>
                        key === 'Content-Disposition' ? 'attachment; filename="report.csv"' : null,
                } as Headers,
                blob: () => Promise.resolve(mockBlob),
            } as Response)
        );

        render(<GeneratePage />);

        const button = screen.getByRole('button', { name: /начать генерацию/i });

        fireEvent.click(button);

        await waitFor(() =>
            expect(screen.getByText(/отчёт успешно сгенерирован/i)).toBeInTheDocument()
        );

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() =>
            expect(screen.queryByText(/отчёт успешно сгенерирован/i)).not.toBeInTheDocument()
        );

        jest.useRealTimers();
    });
});
