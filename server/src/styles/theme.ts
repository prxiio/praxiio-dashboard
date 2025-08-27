// Type definitions for theme system
export interface ThemeColors {
    primary: string;
    secondary: string;
    background: {
        main: string;
        light: string;
        dark: string;
    };
    text: {
        primary: string;
        secondary: string;
        muted: string;
    };
    status: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
}

export const theme = {
    colors: {
        primary: '#E87461',
        secondary: '#4B5563',
        background: {
            main: '#1F2937',
            light: '#374151',
            dark: '#111827'
        },
        text: {
            primary: '#E5E7EB',
            secondary: '#9CA3AF',
            muted: '#6B7280'
        },
        status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
        }
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
        }
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
};