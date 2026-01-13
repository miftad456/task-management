import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
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
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-[#0f172a]"></span>
                </button>

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
