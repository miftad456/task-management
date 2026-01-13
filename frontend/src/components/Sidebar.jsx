import { LayoutDashboard, CheckSquare, Users, Settings, LogOut, User, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
        { icon: ClipboardList, label: 'Assigned to Me', path: '/assigned-tasks' },
        { icon: Users, label: 'Team', path: '/team' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -300 }}
                className={`fixed top-0 left-0 h-full w-64 glass z-50 transition-all duration-300 lg:translate-x-0 lg:static`}
            >
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-10">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-brand-primary/20" />
                        <h1 className="text-xl font-bold tracking-tight text-white">TaskFlow</h1>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === item.path
                                    ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
