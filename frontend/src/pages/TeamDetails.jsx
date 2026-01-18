import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AssignTaskModal from '../components/AssignTaskModal';
import { Users, UserPlus, UserMinus, Loader2, Shield, User, ArrowLeft, Trash2, ClipboardList, Edit, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import teamService from '../services/team.service';
import taskService from '../services/task.service';
import useAuthStore from '../store/useAuthStore';
import Modal from '../components/Modal';
import UserProfileModal from '../components/UserProfileModal';

const TeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [teamDashboard, setTeamDashboard] = useState({});
    const [isLeaveRequestsModalOpen, setIsLeaveRequestsModalOpen] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignee, setAssignee] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [teamTasks, setTeamTasks] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const API_BASE_URL = 'http://localhost:3000';

    // Utility to render images or fallback
    const renderImage = (path, altText, iconSize = 32) => {
        if (!path) return <Users size={iconSize} className="text-slate-600" />;

        const cleanPath = String(path).replace(/\\/g, '/');
        // Align with Profile.jsx logic: http://localhost:3000/uploads/filename.jpg
        const fullUrl = cleanPath.startsWith('http') ? cleanPath : `${API_BASE_URL}/${cleanPath}`;

        return (
            <img
                src={fullUrl}
                alt={altText}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${altText}&background=random`;
                }}
            />
        );
    };

    // Fetch team and tasks
    const fetchTeamDetails = async () => {
        try {
            setLoading(true);
            const [teamData, tasksData] = await Promise.all([
                teamService.getTeamById(teamId),
                taskService.getTeamTasks(teamId).catch(() => [])
            ]);

            // Normalize managerId and members
            const normalizedTeam = {
                ...teamData,
                managerId:
                    typeof teamData.managerId === 'string'
                        ? { id: teamData.managerId, username: teamData.managerUsername || 'Manager' }
                        : teamData.managerId,
                members: (teamData.members || []).map((m) =>
                    typeof m === 'string' ? { id: m, username: m } : m
                ),
            };

            setTeam(normalizedTeam);
            setTeamTasks(tasksData);

            // Fetch dashboard stats if user is manager
            const isManager = user && String(normalizedTeam.managerId?.id) === String(user.id);
            if (isManager) {
                setDashboardLoading(true);
                try {
                    const [dashboardData, leaveData] = await Promise.all([
                        taskService.getTeamDashboard(teamId),
                        teamService.getLeaveRequests(teamId)
                    ]);
                    setTeamDashboard(dashboardData);
                    setLeaveRequests(leaveData);
                } catch (err) {
                    console.error('Failed to fetch manager data:', err);
                } finally {
                    setDashboardLoading(false);
                }
            }
        } catch (error) {
            console.error('Failed to fetch team details:', error);
            alert('Failed to load team details.');
            navigate('/team');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamDetails();
    }, [teamId]);

    // Add member
    const handleAddMember = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await teamService.addMember(teamId, newMemberUsername);
            setIsAddMemberModalOpen(false);
            setNewMemberUsername('');
            fetchTeamDetails();
        } catch (error) {
            alert('Failed to add member: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Remove member
    const handleRemoveMember = async (username) => {
        if (!window.confirm(`Are you sure you want to remove ${username} from the team?`)) return;
        try {
            await teamService.removeMember(teamId, username);
            fetchTeamDetails();
        } catch (error) {
            alert('Failed to remove member: ' + error.message);
        }
    };

    // Delete team
    const handleDeleteTeam = async () => {
        if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
        try {
            await teamService.deleteTeam(teamId);
            alert('Team deleted successfully.');
            navigate('/team');
        } catch (error) {
            alert('Failed to delete team: ' + error.message);
        }
    };

    // Leave Request Actions
    const handleApproveLeave = async (requestId) => {
        try {
            setLeaveLoading(true);
            await teamService.approveLeaveRequest(requestId);
            alert('Leave request approved.');
            fetchTeamDetails();
        } catch (error) {
            alert('Failed to approve: ' + error.message);
        } finally {
            setLeaveLoading(false);
        }
    };

    const handleRejectLeave = async (requestId) => {
        try {
            setLeaveLoading(true);
            await teamService.rejectLeaveRequest(requestId);
            alert('Leave request rejected.');
            fetchTeamDetails();
        } catch (error) {
            alert('Failed to reject: ' + error.message);
        } finally {
            setLeaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary" size={48} />
            </div>
        );
    }

    if (!team) return null;

    const isManager = team && user && String(team.managerId?.id) === String(user.id);

    // Delete task
    const handleDeleteTask = async (e, taskId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.deleteTask(taskId);
            alert('Task deleted successfully.');
            fetchTeamDetails();
        } catch (error) {
            alert('Failed to delete task: ' + error.message);
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/team')}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-1">
                        <div className="w-full h-full rounded-[14px] bg-[#0f172a] flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                            {renderImage(team.profilePicture, team.name, 32)}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">{team.name}</h2>
                        <p className="text-slate-400 mt-1 max-w-xl italic line-clamp-2">
                            {team.bio || 'Manage your team members and collaboration.'}
                        </p>
                    </div>
                </div>

                {isManager && (
                    <div className="flex items-center gap-3 self-start md:self-center">
                        <button
                            onClick={() => navigate(`/team/${teamId}/edit`)}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold transition-all border border-white/10"
                        >
                            <Edit size={20} /> <span>Edit Profile</span>
                        </button>
                        <button
                            onClick={handleDeleteTeam}
                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-xl font-semibold transition-all border border-red-500/20"
                        >
                            <Trash2 size={20} /> <span>Delete</span>
                        </button>
                        <button
                            onClick={() => setIsLeaveRequestsModalOpen(true)}
                            className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-5 py-2.5 rounded-xl font-semibold transition-all border border-yellow-500/20"
                        >
                            <UserMinus size={20} /> <span>Leave Requests {leaveRequests.length > 0 && <span className="bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded-full ml-1">{leaveRequests.length}</span>}</span>
                        </button>
                        <button
                            onClick={() => setIsAddMemberModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-brand-primary/20"
                        >
                            <UserPlus size={20} /> <span>Add Member</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Team Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-8 rounded-3xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Team Overview</h3>
                                <p className="text-sm text-slate-500">Created {new Date(team.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Total Members</span>
                                <span className="text-white font-bold">{team.members?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Role</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isManager ? 'bg-brand-primary/10 text-brand-primary' : 'bg-green-500/10 text-green-500'}`}>
                                    {isManager ? 'Manager' : 'Member'}
                                </span>
                            </div>
                        </div>
                        {team.bio && (
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">About Team</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">{team.bio}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Members List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-6">Team Members</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Manager */}
                            <div
                                onClick={() => {
                                    setSelectedMember(team.managerId.id);
                                    setIsProfileModalOpen(true);
                                }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-brand-primary/50 hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/30 transition-colors">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-white font-bold">{team.managerId?.name || team.managerId?.username || 'Manager'}</span>
                                        <span className="text-sm text-slate-500">{isManager ? 'You (Manager)' : 'Team Manager'}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-3 py-1 rounded-full">Manager</span>
                            </div>

                            {/* Members */}
                            {(team.members || [])
                                .filter((m) => String(m?.id || m) !== String(team.managerId?.id || team.managerId))
                                .map((member) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        onClick={() => {
                                            setSelectedMember(member.id);
                                            setIsProfileModalOpen(true);
                                        }}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-brand-primary/50 hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition-colors overflow-hidden">
                                                {renderImage(member.profilePicture, member.username, 20)}
                                            </div>
                                            <div>
                                                <span className="block text-white font-bold">{member.name || member.username}</span>
                                                <span className="text-sm text-slate-500">Team Member</span>
                                            </div>
                                        </div>
                                        {isManager && (
                                            <div className="flex items-center gap-2 transition-all">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAssignee(member);
                                                        setIsAssignModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                                                >
                                                    <ClipboardList size={20} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveMember(member.username);
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <UserMinus size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Dashboard Statistics (Manager Only) */}
            {isManager && teamDashboard && (
                <div className="glass p-8 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-6">Team Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Total Tasks</span>
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <ClipboardList size={20} className="text-blue-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{teamDashboard.totalTasks || 0}</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">In Progress</span>
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Clock size={20} className="text-yellow-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{teamDashboard.inProgress || 0}</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Completed</span>
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <CheckCircle2 size={20} className="text-green-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{teamDashboard.completed || 0}</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Pending Review</span>
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <AlertCircle size={20} className="text-purple-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{teamDashboard.submitted || 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Tasks */}
            <div className="glass p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Team Tasks</h3>
                    <span className="text-slate-400 text-sm">{teamTasks.length} tasks</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamTasks.map((task) => (
                        <Link
                            to={`/task/${task.id}`}
                            key={task.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-brand-primary/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span
                                    className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${task.priority === 'high'
                                        ? 'text-red-500 bg-red-500/10'
                                        : task.priority === 'medium'
                                            ? 'text-yellow-500 bg-yellow-500/10'
                                            : 'text-green-500 bg-green-500/10'
                                        }`}
                                >
                                    {task.priority}
                                </span>
                                <span className={`text-xs ${task.status === 'completed' ? 'text-green-500' : 'text-slate-400'}`}>
                                    {task.status.replace('-', ' ')}
                                </span>
                                {isManager && (
                                    <button
                                        onClick={(e) => handleDeleteTask(e, task.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all ml-2"
                                        title="Delete Task"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <h4 className="text-white font-bold mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
                                {task.title}
                            </h4>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">{task.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <User size={14} />
                                    <span>{(team.members || []).find((m) => (m?.id || m) === task.userId)?.username || 'Unknown'}</span>
                                </div>
                                <div className="text-xs text-slate-500">Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Team Member">
                <form onSubmit={handleAddMember} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                            <input
                                type="text"
                                value={newMemberUsername}
                                onChange={(e) => setNewMemberUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                placeholder="Enter member's username"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={actionLoading} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2">
                        {actionLoading ? <Loader2 className="animate-spin" size={24} /> : 'Add Member'}
                    </button>
                </form>
            </Modal>

            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} userId={selectedMember} />
            <AssignTaskModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} teamId={teamId} assignee={assignee} onTaskAssigned={fetchTeamDetails} />

            <Modal isOpen={isLeaveRequestsModalOpen} onClose={() => setIsLeaveRequestsModalOpen(false)} title="Leave Requests">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {leaveRequests.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <UserMinus size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No pending leave requests</p>
                        </div>
                    ) : (
                        leaveRequests.map((req) => (
                            <div key={req._id} className="glass p-4 rounded-2xl flex items-center justify-between border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                        {req.userId?.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">
                                            {req.userId?.username || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-slate-500">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRejectLeave(req._id)}
                                        disabled={leaveLoading}
                                        className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                                        title="Reject"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleApproveLeave(req._id)}
                                        disabled={leaveLoading}
                                        className="p-2 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all"
                                        title="Approve"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default TeamDetails;
