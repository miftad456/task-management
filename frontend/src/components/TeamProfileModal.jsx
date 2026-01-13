import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, AlignLeft, Loader2 } from 'lucide-react';
import teamService from '../services/team.service';

const TeamProfileModal = ({ isOpen, onClose, teamId }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:3000';

    useEffect(() => {
        if (!isOpen || !teamId) return;

        const fetchTeam = async () => {
            setLoading(true);
            try {
                const data = await teamService.getTeamProfile(teamId);
                setTeam(data);
            } catch (err) {
                console.error("Error fetching team profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [isOpen, teamId]);

    // UPDATED: Simple and robust URL generator
    const getImageUrl = (path) => {
        if (!path) return null;

        // Fix Windows slashes
        const normalized = path.replace(/\\/g, '/');

        // If path is "uploads/file.png", result is "http://localhost:3000/uploads/file.png"
        // If path is "file.png", result is "http://localhost:3000/uploads/file.png"
        if (normalized.startsWith('uploads/')) {
            return `${API_BASE_URL}/${normalized}`;
        }
        return `${API_BASE_URL}/uploads/${normalized}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass p-10 rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl bg-[#0f172a]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-brand-primary" size={48} />
                                <p className="text-slate-400">Loading Profile...</p>
                            </div>
                        ) : team ? (
                            <div className="space-y-8">
                                <div className="relative mx-auto w-40 h-40">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1">
                                        <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                                            {team.profilePicture ? (
                                                <img
                                                    src={getImageUrl(team.profilePicture)}
                                                    alt={team.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=0D8ABC&color=fff`;
                                                    }}
                                                />
                                            ) : (
                                                <Users size={60} className="text-slate-700" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-white">{team.name}</h3>
                                    <p className="text-cyan-500 text-sm tracking-widest uppercase mt-2">Team Profile</p>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-start gap-4 text-slate-300">
                                        <AlignLeft className="shrink-0 text-cyan-500" size={20} />
                                        <p className="italic leading-relaxed">
                                            {team.bio || 'No bio provided.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-red-400">Team not found.</p>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TeamProfileModal;