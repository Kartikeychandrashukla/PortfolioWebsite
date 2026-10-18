import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/inter-tight';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import App from './App.jsx';

const root = document.getElementById('root');
// Production HTML is prerendered (for SEO/AI crawlers) → hydrate. Dev server → render fresh.
if (root.firstElementChild) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
