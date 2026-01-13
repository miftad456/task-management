import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Briefcase, AlignLeft, Loader2 } from 'lucide-react';
import api from '../services/api';

const UserProfileModal = ({ isOpen, onClose, userId, username }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isOpen || (!userId && !username)) return;

            try {
                setLoading(true);
                // The backend has GET /users/profile/:id for public profiles
                // But we might need to resolve username to ID first if we only have username
                // For now, let's try to fetch by ID if available, otherwise we might need a search endpoint
                const identifier = userId || username;
                const response = await api.get(`/users/profile/${identifier}`);
                setProfile(response.data.data);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isOpen, userId, username]);

    const getInitials = (name, uname) => {
        const displayName = name || uname || 'User';
        return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg glass rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        {loading ? (
                            <div className="h-96 flex items-center justify-center">
                                <Loader2 className="animate-spin text-brand-primary" size={40} />
                            </div>
                        ) : profile ? (
                            <div className="p-10 space-y-8">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-1 shadow-xl shadow-brand-primary/20">
                                        <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                                            {profile.profilePicture ? (
                                                <img
                                                    src={`http://localhost:3000/${profile.profilePicture}`}
                                                    alt={profile.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-4xl font-bold text-white">
                                                    {getInitials(profile.name, profile.username)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{profile.name || profile.username}</h3>
                                        <p className="text-brand-primary font-medium">@{profile.username}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                                            <Mail size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                                            <p className="text-white font-medium">{profile.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-secondary">
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Experience</p>
                                            <p className="text-white font-medium">{profile.experience || 'No experience listed'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="p-2 bg-brand-accent/10 rounded-xl text-brand-accent mt-1">
                                            <AlignLeft size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bio</p>
                                            <p className="text-white font-medium leading-relaxed">
                                                {profile.bio || 'This user hasn\'t added a bio yet.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-96 flex flex-col items-center justify-center text-center p-10 space-y-4">
                                <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                                    <X size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Profile Not Found</h3>
                                <p className="text-slate-500">We couldn't load the profile for this user.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserProfileModal;
