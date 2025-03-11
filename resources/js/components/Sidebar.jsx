import { FiBell, FiCalendar, FiCheckSquare, FiCpu, FiHome, FiMenu, FiMessageSquare, FiSettings, FiUser } from 'react-icons/fi';
import './Sidebar.css';

export default function Sidebar({ darkMode, currentRoute }) {
    // Define top menu items with navigation paths
    const topMenu = [
        { icon: <FiMenu />, label: 'Menu', path: '#', onClick: () => {} },
        { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
        { icon: <FiMessageSquare />, label: 'Chat', path: '/chat' },
        { icon: <FiCheckSquare />, label: 'Tasks', path: '/tasks' },
        { icon: <FiCalendar />, label: 'Calendar', path: '/calendar' },
        { icon: <FiCpu />, label: 'AI', path: '/ai' },
    ];

    const bottomMenu = [
        { icon: <FiBell />, label: 'Alerts', path: '/alerts' },
        { icon: <FiSettings />, label: 'Settings', path: '/settings' },
        { icon: <FiUser />, label: 'Profile', path: '/profile' },
    ];

    // Simulate navigation – in a real app use React Router
    const navigateTo = (path) => {
        window.location.href = path;
    };

    return (
        <div className={`sidebar ${darkMode ? 'dark' : ''}`}>
            <div className="menu-section top-menu">
                {topMenu.map((item, index) => (
                    <div key={index} className={`sidebar-item ${item.label === 'Dashboard' ? 'active' : ''}`} onClick={() => navigateTo(item.path)}>
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="menu-section bottom-menu">
                {bottomMenu.map((item, index) => (
                    <div key={index} className="sidebar-item" onClick={() => navigateTo(item.path)}>
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
