import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HomePage } from './HomePage';

import { useAnalysisStore } from '@store/analysisStore';
import { addToHistory } from '@utils/storage';
import { useCsvAnalysis } from '@hooks/use-csv-analysis';

jest.mock('@store/analysisStore');
jest.mock('@utils/storage');
jest.mock('@hooks/use-csv-analysis');

describe('HomePage', () => {
    const setFile = jest.fn();
    const setStatus = jest.fn();
    const setHighlights = jest.fn();
    const setError = jest.fn();
    const reset = jest.fn();

    const analyzeCsvMock = jest.fn();

    let onCompleteCallback: ((highlights?: any) => void) | null = null;
    let onErrorCallback: ((error: Error) => void) | null = null;

    beforeEach(() => {
        jest.clearAllMocks();

        onCompleteCallback = null;
        onErrorCallback = null;

        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: null,
            status: 'idle',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        (useCsvAnalysis as jest.Mock).mockImplementation(({ onComplete, onError }) => {
            onCompleteCallback = onComplete;
            onErrorCallback = onError;
            return {
                analyzeCsv: analyzeCsvMock,
            };
        });
    });

    test('загружает файл и вызывает setFile', async () => {
        render(<HomePage />);
        const file = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });

        const input = screen.getByTestId('file-input');
        await userEvent.upload(input, file);

        expect(setFile).toHaveBeenCalledWith(file);
    });

    test('кнопка "Отправить" появляется при выбранном файле и статусе idle', () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: new File(['a,b,c'], 'test.csv', { type: 'text/csv' }),
            status: 'idle',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        const button = screen.getByRole('button', { name: /отправить/i });

        expect(button).toBeInTheDocument();
    });

    test('запускает анализ и меняет статус на processing', async () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: new File(['a,b,c'], 'test.csv', { type: 'text/csv' }),
            status: 'idle',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        const button = screen.getByRole('button', { name: /отправить/i });
        await userEvent.click(button);

        expect(setStatus).toHaveBeenCalledWith('processing');
        expect(analyzeCsvMock).toHaveBeenCalledWith(expect.any(File));
    });

    test('не запускает анализ если файл не выбран', async () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: null,
            status: 'idle',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        const button = screen.queryByRole('button', { name: /отправить/i });
        expect(button).not.toBeInTheDocument();
    });

    test('не запускает анализ если статус processing', () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: new File(['a,b,c'], 'test.csv', { type: 'text/csv' }),
            status: 'processing',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        const button = screen.queryByRole('button', { name: /отправить/i });
        expect(button).not.toBeInTheDocument();
    });

    test('onComplete меняет статус и добавляет в историю', () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: new File(['a,b,c'], 'test.csv', { type: 'text/csv' }),
            status: 'processing',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        onCompleteCallback?.(['highlight1']);

        expect(setStatus).toHaveBeenCalledWith('completed');
        expect(addToHistory).toHaveBeenCalledWith({ fileName: 'test.csv', highlights: ['highlight1'] });
    });

    test('onError меняет статус и добавляет в историю', () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: new File(['a,b,c'], 'test.csv', { type: 'text/csv' }),
            status: 'processing',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        onErrorCallback?.(new Error('Fail'));

        expect(setError).toHaveBeenCalledWith('Fail');
        expect(addToHistory).toHaveBeenCalledWith({ fileName: 'test.csv' });
    });

    test('отображает ошибку, если есть error', () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: null,
            status: 'error',
            highlights: [],
            error: 'Ошибка анализа',
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        expect(screen.getByText(/Ошибка анализа/i)).toBeInTheDocument();
    });

    test('кнопка отправки не отображается в статусе processing', () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: new File(['a,b,c'], 'test.csv', { type: 'text/csv' }),
            status: 'processing',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        expect(screen.queryByRole('button', { name: /отправить/i })).not.toBeInTheDocument();
        expect(screen.getByText(/идёт парсинг файла/i)).toBeInTheDocument();
    });

    test('отображает заглушку если подсветок нет', () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: null,
            status: 'idle',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        expect(screen.getByText(/здесь появятся хайлайты/i)).toBeInTheDocument();
    });

    test('отображает подсветки если они есть', () => {
        const highlights = [
            { id: 'h1', description: 'Highlight 1' },
            { id: 'h2', description: 'Highlight 2' },
        ];

        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: null,
            status: 'idle',
            highlights,
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        highlights.forEach(({ description }) => {
            expect(screen.getByText(description)).toBeInTheDocument();
        });
    });

    test('кнопка очистки вызывает reset', async () => {
        (useAnalysisStore as unknown as jest.Mock).mockReturnValue({
            file: new File(['a,b,c'], 'test.csv', { type: 'text/csv' }),
            status: 'idle',
            highlights: [],
            error: null,
            setFile,
            setStatus,
            setHighlights,
            setError,
            reset,
        });

        render(<HomePage />);
        const clearButton = screen.getByRole('button', { name: /очистить/i });
        await userEvent.click(clearButton);

        expect(reset).toHaveBeenCalled();
    });
});
