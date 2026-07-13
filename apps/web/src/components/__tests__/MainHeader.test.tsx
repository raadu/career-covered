import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainHeader from '../MainHeader';

describe('MainHeader', () => {
    it('renders the header title', () => {
        render(<MainHeader />);
        expect(screen.getByText(/Create Free Cover Letters in 2 Seconds/i)).toBeInTheDocument();
    });

    it('renders the description text', () => {
        render(<MainHeader />);
        expect(screen.getByText(/Paste your cover letter template/i)).toBeInTheDocument();
    });
});
