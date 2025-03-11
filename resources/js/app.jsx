import ReactDOM from 'react-dom/client';
import '../css/app.css'; // Global resets & font settings
import AppLayout from './components/AppLayout';

const root = document.getElementById('app');
if (root) {
    ReactDOM.createRoot(root).render(<AppLayout />);
}
