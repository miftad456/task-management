import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Save, Loader2, AlertCircle, CheckCircle2, AlignLeft } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { API_BASE_URL } from '../config';

const Profile = () => {
    const { user, updateProfile, loading, error } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        experience: user?.experience || '',
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        const success = await updateProfile(formData);
        if (success) {
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('picture', file);

        setUploading(true);
        try {
            const response = await api.post('/users/profile/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = response.data.data;
            // Update local storage and store
            localStorage.setItem('user', JSON.stringify(updatedUser));
            useAuthStore.setState({ user: updatedUser });
        } catch (err) {
            alert('Failed to upload image: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white">User Profile</h2>
                <p className="text-slate-400 mt-1">Manage your account settings and profile information.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Picture Section */}
                <div className="lg:col-span-1">
                    <div className="glass p-8 rounded-[2.5rem] text-center space-y-6">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-1 shadow-2xl shadow-brand-primary/20">
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img src={`${API_BASE_URL}/${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} className="text-slate-700" />
                                    )}
                                </div>
                            </div>
                            <label className="absolute bottom-0 right-0 p-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl cursor-pointer shadow-lg transition-all hover:scale-110">
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user?.username}</h3>
                            <p className="text-slate-500 text-sm">{user?.role || 'Team Member'}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Details Section */}
                <div className="lg:col-span-2">
                    <div className="glass p-10 rounded-[2.5rem] shadow-2xl relative">
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500 text-sm">
                                <CheckCircle2 size={18} />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1">Experience</label>
                                    <div className="relative group">
                                        <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                            placeholder="e.g. 5 years in Project Management"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white min-h-[150px] resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /> Save Changes</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
