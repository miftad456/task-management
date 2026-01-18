import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, UserPlus, UserMinus, Loader2, Shield, User, ArrowRight, LogOut } from 'lucide-react';
import teamService from '../services/team.service';
import useAuthStore from '../store/useAuthStore';
import Modal from '../components/Modal';
import UserProfileModal from '../components/UserProfileModal';

const Team = () => {
    const navigate = useNavigate();
    const { user, fetchUser } = useAuthStore();
    const [managerTeams, setManagerTeams] = useState([]);
    const [memberTeams, setMemberTeams] = useState([]);
    const [activeTab, setActiveTab] = useState('managed'); // 'managed' or 'joined'
    const [managerStats, setManagerStats] = useState({ managedTeamsCount: 0, totalMembers: 0 });
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const [mTeams, jTeams, mStats] = await Promise.all([
                teamService.getManagerTeams().catch(() => []),
                teamService.getMemberTeams().catch(() => []),
                teamService.getManagerStats().catch(() => ({ managedTeamsCount: 0, totalMembers: 0 }))
            ]);

            setManagerTeams(mTeams);
            // Filter out teams where user is manager from memberTeams to avoid overlap
            setMemberTeams(jTeams.filter(jt => !mTeams.find(mt => mt.id === jt.id)));
            setManagerStats(mStats);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [user]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await teamService.createTeam(newTeamName);
            setIsCreateModalOpen(false);
            setNewTeamName('');

            // Refresh user data to get the new role if they just became a manager
            await fetchUser();
            fetchTeams();
        } catch (error) {
            alert('Failed to create team: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveMember = async (teamId, username) => {
        if (!window.confirm(`Are you sure you want to remove ${username} from the team?`)) return;
        try {
            await teamService.removeMember(teamId, username);
            fetchTeams();
        } catch (error) {
            alert('Failed to remove member: ' + error.message);
        }
    };

    const handleLeaveTeam = async (teamId) => {
        if (!window.confirm('Are you sure you want to request to leave this team?')) return;
        try {
            await teamService.requestLeave(teamId);
            alert('Leave request submitted to the manager.');
            fetchTeams();
        } catch (error) {
            alert('Failed to submit leave request: ' + error.message);
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
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Teams</h2>
                    <p className="text-slate-400 mt-1">
                        Managing <span className="text-brand-primary font-bold">{managerStats.managedTeamsCount}</span> {managerStats.managedTeamsCount === 1 ? 'team' : 'teams'} with <span className="text-brand-secondary font-bold">{managerStats.totalMembers}</span> total members.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-brand-primary/20 self-start md:self-center"
                >
                    <Plus size={20} />
                    <span>Create Team</span>
                </button>
            </header>

            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('managed')}
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'managed' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    Teams I Manage
                </button>
                <button
                    onClick={() => setActiveTab('joined')}
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'joined' ? 'bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    Joined Teams
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(activeTab === 'managed' ? managerTeams : memberTeams).length > 0 ? (activeTab === 'managed' ? managerTeams : memberTeams).map((team) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => navigate(`/team/${team.id || team._id}`)}
                        className={`glass rounded-3xl p-8 space-y-6 cursor-pointer transition-all group/card ${activeTab === 'managed' ? 'hover:border-brand-primary/30' : 'hover:border-brand-secondary/30'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${activeTab === 'managed' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-secondary/10 text-brand-secondary'}`}>
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{team.name}</h3>
                                    <p className="text-sm text-slate-500">
                                        Managed by <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMember(team.managerId?.id || team.managerId);
                                                setIsProfileModalOpen(true);
                                            }}
                                            className={`font-bold hover:underline ${activeTab === 'managed' ? 'text-brand-primary' : 'text-brand-secondary'}`}
                                        >
                                            {team.managerId?.name || team.managerId?.username || 'Manager'}
                                        </button> • {team.members?.length || 0} Members
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeTab === 'managed' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">Manager</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/team/${team.id || team._id}`);
                                            }}
                                            className="p-2 hover:bg-white/5 rounded-xl text-brand-primary transition-all flex items-center gap-2 group/btn"
                                            title="Manage Team"
                                        >
                                            <Shield size={20} />
                                            <span className="text-xs font-bold hidden group-hover/btn:inline transition-all">Manage</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-md">Member</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLeaveTeam(team.id || team._id);
                                            }}
                                            className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-all flex items-center gap-2 group/btn"
                                            title="Leave Team"
                                        >
                                            <LogOut size={20} />
                                            <span className="text-xs font-bold hidden group-hover/btn:inline transition-all">Leave</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Members</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Manager */}
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMember(team.managerId?.id || team.managerId);
                                        setIsProfileModalOpen(true);
                                    }}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 group hover:border-brand-primary/50 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'managed' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-secondary/20 text-brand-secondary'}`}>
                                            <Shield size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-white">Manager {activeTab === 'managed' ? '(You)' : `(${team.managerId?.name || team.managerId?.username || 'Owner'})`}</span>
                                    </div>
                                </div>

                                {/* Members */}
                                {team.members?.filter(m => (m.username || m) !== user.username).slice(0, 3).map((member, idx) => (
                                    <div
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMember(member.id || member);
                                            setIsProfileModalOpen(true);
                                        }}
                                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 group hover:border-brand-primary/50 hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition-colors overflow-hidden">
                                                {member.profilePicture ? (
                                                    <img src={`http://localhost:3000/${member.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={16} />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-white truncate max-w-[80px]">{member.name || member.username || member}</span>
                                        </div>
                                    </div>
                                ))}
                                {(team.members?.length || 0) > 4 && (
                                    <div className="flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-500">
                                        +{(team.members?.length || 0) - 4} more
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="lg:col-span-2 glass rounded-3xl p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                            <Users size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white">No {activeTab} teams found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {activeTab === 'managed'
                                ? "You haven't created any teams yet. Start by creating a team to collaborate with others."
                                : "You are not a member of any teams yet. Ask your manager to add you to a team."}
                        </p>
                    </div>
                )}
            </div>

            {/* Create Team Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Team"
            >
                <form onSubmit={handleCreateTeam} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Team Name</label>
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                            placeholder="e.g. Engineering, Marketing..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={24} /> : "Create Team"}
                    </button>
                </form>
            </Modal>

            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userId={selectedMember}
            />
        </div>
    );
};

export default Team;
