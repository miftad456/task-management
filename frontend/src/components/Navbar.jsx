import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, LogOut, Check, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import notificationService from '../services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                fetchNotifications();
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        setIsDropdownOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getInitials = (name, username) => {
        const displayName = name || username || 'User';
        return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="h-20 glass flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-white/5 rounded-lg lg:hidden text-slate-400"
                >
                    <Menu size={24} />
                </button>

                <div className="relative group hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 w-64 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`relative p-2 rounded-xl transition-all ${isDropdownOpen ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-accent text-[#0f172a] text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0f172a]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-80 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                    <h3 className="font-bold text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex gap-3 ${!notification.isRead ? 'bg-brand-primary/5' : ''}`}
                                            >
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.isUrgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : notification.isRead ? 'bg-slate-600' : 'bg-brand-primary'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${!notification.isRead ? 'text-white font-semibold' : 'text-slate-400'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock size={12} className="text-slate-500" />
                                                        <span className="text-[10px] text-slate-500">
                                                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                {notification.isRead && <Check size={14} className="text-slate-600 mt-1" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Bell size={32} className="mx-auto text-slate-600 mb-2 opacity-20" />
                                            <p className="text-slate-500 text-sm">No notifications yet</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                                    <button className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
                                        View all activity
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white">{user?.name || user?.username || 'User'}</p>
                        <p className="text-xs text-slate-500">{user?.role || 'Member'}</p>
                    </div>
                    <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-brand-primary/20 hover:scale-110 transition-transform overflow-hidden">
                        {user?.profilePicture ? (
                            <img src={`http://localhost:3000/${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            getInitials(user?.name, user?.username)
                        )}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all ml-2"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
