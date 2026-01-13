import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Camera, Save, Loader2, AlertCircle, CheckCircle2, AlignLeft, ArrowLeft } from 'lucide-react';
import teamService from '../services/team.service';

const TeamProfileEdit = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', bio: '' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://localhost:3000';

    // Helper: normalize image URL
    const getImageUrl = (path) => {
        if (!path) return null;
        // Align with Profile.jsx logic: http://localhost:3000/uploads/filename.jpg
        return `${API_BASE_URL}/${String(path).replace(/\\/g, '/')}`;
    };

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await teamService.getTeamById(teamId);
                setTeam(data);
                setFormData({ name: data.name || '', bio: data.bio || '' });
            } catch (err) {
                setError('Failed to load team data.');
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, [teamId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await teamService.updateTeamProfile(teamId, formData);
            setSuccessMessage('Team profile updated successfully!');
            setTimeout(() => navigate(`/team/${teamId}`), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update team');
        } finally {
            setActionLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');
        try {
            await teamService.uploadTeamProfilePicture(teamId, file);

            // Refresh team after upload
            const updated = await teamService.getTeamById(teamId);
            setTeam(updated);

            setSuccessMessage('Logo updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 p-6">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/team/${teamId}`)}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Edit Team Profile</h2>
                    <p className="text-slate-400 mt-1">Update your team's visual identity and description.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Picture Section */}
                <div className="lg:col-span-1">
                    <div className="glass p-8 rounded-[2.5rem] text-center space-y-6 bg-[#0f172a]/50">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-1 shadow-2xl">
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                                    {team?.profilePicture ? (
                                        <img
                                            src={getImageUrl(team.profilePicture)}
                                            alt="Team Logo"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${team.name}&background=random`;
                                            }}
                                        />
                                    ) : (
                                        <Users size={64} className="text-slate-700" />
                                    )}
                                </div>
                            </div>
                            <label className="absolute bottom-0 right-0 p-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl cursor-pointer shadow-lg transition-all hover:scale-110">
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
                            <h3 className="text-xl font-bold text-white uppercase">{team?.name}</h3>
                            <p className="text-brand-primary text-sm font-medium">TEAM LOGO</p>
                        </div>
                    </div>
                </div>

                {/* Team Form Section */}
                <div className="lg:col-span-2">
                    <div className="glass p-10 rounded-[2.5rem] shadow-2xl bg-[#0f172a]/50">
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500">
                                <CheckCircle2 size={18} />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Team Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-brand-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Team Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white min-h-[150px] focus:border-brand-primary transition-all"
                                    placeholder="Tell us about your team..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading || uploading}
                                className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamProfileEdit;
