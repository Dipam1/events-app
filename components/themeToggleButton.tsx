import { useThemeContext } from '@/app/providers';

export default function ThemeToggler() {
    const themeContext = useThemeContext();

    const { mode, toggleTheme } = themeContext;
    const isDark = mode === 'dark';

    return (
        <button
            className="ThemeToggler mr-4"
            aria-label="Toggle Dark Mode"
            onClick={toggleTheme}
        >
            <svg
                className={`ThemeToggler__icon ${isDark ? 'ThemeToggler__icon--active' : ''}`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
            >
                <defs>
                    <mask id="theme-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <circle className="ThemeToggler__mask-cutout" r="6" cx="24" cy="10" fill="black" />
                    </mask>
                </defs>
                <circle className="ThemeToggler__sun-moon" r="6" cx="12" cy="12" fill="currentColor" mask="url(#theme-mask)" />
                <g className="ThemeToggler__rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" x2="12" y1="3" y2="1" />
                    <line x1="21" x2="23" y1="12" y2="12" />
                    <line x1="12" x2="12" y1="21" y2="23" />
                    <line x1="1" x2="3" y1="12" y2="12" />
                </g>
                <g className="ThemeToggler__rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform="rotate(45 12 12)">
                    <line x1="12" x2="12" y1="3" y2="1" />
                    <line x1="21" x2="23" y1="12" y2="12" />
                    <line x1="12" x2="12" y1="21" y2="23" />
                    <line x1="1" x2="3" y1="12" y2="12" />
                </g>
            </svg>
        </button >
    );
}