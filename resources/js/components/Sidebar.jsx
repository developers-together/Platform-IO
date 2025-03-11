// resources/js/components/Sidebar.jsx
import { FiBell, FiCalendar, FiCheckSquare, FiCpu, FiHome, FiMenu, FiMessageSquare, FiSettings, FiUser } from 'react-icons/fi';
import './Sidebar.css';

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) {
    const topMenu = [
        { icon: <FiMenu />, label: 'Menu', page: null },
        { icon: <FiHome />, label: 'Dashboard', page: 'dashboard' },
        { icon: <FiMessageSquare />, label: 'Chat', page: 'chat' },
        { icon: <FiCheckSquare />, label: 'Tasks', page: null },
        { icon: <FiCalendar />, label: 'Calendar', page: null },
        { icon: <FiCpu />, label: 'AI', page: null },
    ];

    const bottomMenu = [
        { icon: <FiBell />, label: 'Alerts', page: null },
        { icon: <FiSettings />, label: 'Settings', page: null },
        { icon: <FiUser />, label: 'Profile', page: null },
    ];

    const handleNav = (item) => {
        // If label = "Menu", toggle sidebar. If it has a page, switch page. Else do nothing
        if (item.label === 'Menu') {
            setSidebarOpen(!sidebarOpen);
        } else if (item.page) {
            setCurrentPage(item.page);
        } else {
            console.log('Navigating to:', item.label);
        }
    };

    return (
        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="menu-section top-menu">
                {topMenu.map((item, i) => (
                    <div key={i} className={`sidebar-item ${currentPage === item.page ? 'active' : ''}`} onClick={() => handleNav(item)}>
                        <span className="icon">{item.icon}</span>
                        {sidebarOpen && <span className="label">{item.label}</span>}
                    </div>
                ))}
            </div>
            <div className="menu-section bottom-menu">
                {bottomMenu.map((item, i) => (
                    <div key={i} className="sidebar-item" onClick={() => handleNav(item)}>
                        <span className="icon">{item.icon}</span>
                        {sidebarOpen && <span className="label">{item.label}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}
