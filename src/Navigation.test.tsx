
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
// TODO: проверить названия 

describe('Navigation', () => {
    test('отображает все три навигационные ссылки с правильными названиями', () => {
        render(<App />);

        expect(screen.getByText('CSV Аналитик')).toBeInTheDocument();
        expect(screen.getByText('CSV Генератор')).toBeInTheDocument();
        expect(screen.getByText('История')).toBeInTheDocument();
    });

    test('переходит на страницу Generate при клике', async () => {
        render(<App />);

        const user = userEvent.setup();
        const generateLink = screen.getByText('CSV Генератор');

        await user.click(generateLink);

        expect(window.location.pathname).toBe('/generate');
    });

    test('применяет класс "active-link" только к активной ссылке', async () => {
        render(<App />);
        const user = userEvent.setup();

        const uploadLink = screen.getByTestId('link-upload');
        const generateLink = screen.getByTestId('link-generate');
        const historyLink = screen.getByTestId('link-history');


        // Переход на /generate
        await user.click(generateLink);
        expect(generateLink).toHaveClass('active-link');
        expect(uploadLink).not.toHaveClass('active-link');
        expect(historyLink).not.toHaveClass('active-link');

    });
});
