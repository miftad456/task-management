import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Camera, Save, Loader2, AlertCircle, CheckCircle2, AlignLeft, Info } from 'lucide-react';
import teamService from '../services/team.service';
import api from '../services/api';

const TeamProfile = ({ team: initialTeam }) => {
    // Local state for form data
    const [formData, setFormData] = useState({
        name: initialTeam?.name || '',
        bio: initialTeam?.bio || '',
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [team, setTeam] = useState(initialTeam);

    // Sync state if prop changes
    useEffect(() => {
        if (initialTeam) {
            setTeam(initialTeam);
            setFormData({
                name: initialTeam.name || '',
                bio: initialTeam.bio || '',
            });
        }
    }, [initialTeam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Using the specific update endpoint from your team.service
            await teamService.updateTeamProfile(team.id || team._id, formData);
            setSuccessMessage('Team profile updated successfully!');

            // Optional: clear success message after 3s
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update team profile');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('picture', file);

        setUploading(true);
        setError('');
        try {
            // Using the specific endpoint pattern from your UserProfile example
            // but targeting the team profile picture route
            const response = await api.post(`/teams/profile/picture`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Assuming backend returns the updated team object
            const updatedTeam = response.data.data;
            setTeam(updatedTeam);

            // Refresh to ensure all components see the new image
            window.location.reload();
        } catch (err) {
            setError('Failed to upload team image: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white">Team Settings</h2>
                <p className="text-slate-400 mt-1">Customize the team identity and public information.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Team Branding Section */}
                <div className="lg:col-span-1">
                    <div className="glass p-8 rounded-[2.5rem] text-center space-y-6">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-1 shadow-2xl shadow-brand-primary/20">
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden relative">
                                    {team?.profilePicture ? (
                                        <img
                                            src={`http://localhost:3000/${team.profilePicture}`}
                                            alt="Team Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Users size={64} className="text-slate-700" />
                                    )}

                                    {/* Sublte Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                                        <Camera className="text-white/70" size={24} />
                                    </div>
                                </div>
                            </div>
                            <label className="absolute bottom-0 right-0 p-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl cursor-pointer shadow-lg transition-all hover:scale-110 z-10">
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{team?.name}</h3>
                            <p className="text-brand-primary text-sm font-medium">Team Profile</p>
                        </div>
                    </div>
                </div>

                {/* Team Details Form Section */}
                <div className="lg:col-span-2">
                    <div className="glass p-10 rounded-[2.5rem] shadow-2xl">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm"
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500 text-sm"
                            >
                                <CheckCircle2 size={18} />
                                <span>{successMessage}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Team Name Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Team Display Name</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                        placeholder="e.g. Frontend Development"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Team Bio Textarea */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Team Bio</label>
                                <div className="relative group">
                                    <AlignLeft className="absolute left-4 top-6 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white min-h-[180px] resize-none"
                                        placeholder="Describe your team's goals, mission, or stack..."
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
                                <Info size={18} className="text-brand-primary shrink-0" />
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    This information will be visible to all team members and on team-related reports. Ensure the name and bio accurately represent your working group.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="w-full md:w-auto bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <Save size={20} className="group-hover:scale-110 transition-transform" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamProfile;