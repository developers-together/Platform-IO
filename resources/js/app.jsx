// resources/js/app.jsx
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../css/app.css';
import ChatPage from './components/ChatPage';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';

function App() {
    // Switch pages
    const [currentPage, setCurrentPage] = useState('dashboard');
    // Toggle sidebar open/closed
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="app-container">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div style={{ flex: 1 }}>{currentPage === 'dashboard' ? <Dashboard /> : <ChatPage />}</div>
        </div>
    );
}

const root = document.getElementById('app');
if (root) {
    ReactDOM.createRoot(root).render(<App />);
}
