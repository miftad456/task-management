import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, Plus, Loader2, Calendar, Tag, AlignLeft, ArrowRight, ClipboardList } from 'lucide-react';
import taskService from '../services/task.service';
import useAuthStore from '../store/useAuthStore';
import Modal from '../components/Modal';
import teamService from '../services/team.service';
import { Users, UserPlus, Shield } from 'lucide-react';

const Dashboard = () => {
    const { user, fetchUser } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentTasks, setRecentTasks] = useState([]);
    const [managerStats, setManagerStats] = useState({ managedTeamsCount: 0, totalMembers: 0 });
    const [loading, setLoading] = useState(true);
    const [managedTeams, setManagedTeams] = useState([]);
    const [joinedTeams, setJoinedTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isTaskSelectionModalOpen, setIsTaskSelectionModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium'
    });
    const [newTeamName, setNewTeamName] = useState('');
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);

    const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
    const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [isDeletingCompleted, setIsDeletingCompleted] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [dashboardStats, tasks, mStats, managerTeams, memberTeams] = await Promise.all([
                taskService.getDashboardStats(),
                taskService.getAllTasks(),
                teamService.getManagerStats().catch(() => ({ managedTeamsCount: 0, totalMembers: 0 })),
                teamService.getManagerTeams().catch(() => []),
                teamService.getMemberTeams().catch(() => [])
            ]);
            setStats(dashboardStats);
            setRecentTasks(tasks.slice(0, 5));
            setManagerStats(mStats);

            setManagedTeams(managerTeams.slice(0, 3));
            setJoinedTeams(memberTeams.filter(mt => !managerTeams.find(t => t.id === mt.id)).slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOverdueTasks = async () => {
        try {
            const tasks = await taskService.getOverdueTasks();
            setOverdueTasks(tasks);
            setIsOverdueModalOpen(true);
        } catch (error) {
            alert('Failed to fetch overdue tasks: ' + error.message);
        }
    };

    const fetchCompletedTasks = async () => {
        try {
            const tasks = await taskService.getTasksByStatus('completed');
            setCompletedTasks(tasks);
            setIsCompletedModalOpen(true);
        } catch (error) {
            alert('Failed to fetch completed tasks: ' + error.message);
        }
    };

    const handleDeleteCompleted = async () => {
        if (!window.confirm('Are you sure you want to delete all completed tasks? This action cannot be undone.')) return;

        setIsDeletingCompleted(true);
        try {
            await taskService.deleteCompletedTasks();
            setIsCompletedModalOpen(false);
            fetchDashboardData();
            alert('All completed tasks deleted successfully!');
        } catch (error) {
            alert('Failed to delete completed tasks: ' + error.message);
        } finally {
            setIsDeletingCompleted(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await taskService.createTask(newTask);
            setIsModalOpen(false);
            setNewTask({ title: '', description: '', deadline: '', priority: 'medium' });
            fetchDashboardData();
        } catch (error) {
            alert('Failed to create task: ' + error.message);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setIsCreatingTeam(true);
        try {
            const team = await teamService.createTeam(newTeamName);
            setIsTeamModalOpen(false);
            setNewTeamName('');
            await fetchUser();
            navigate(`/team/${team.id}`);
        } catch (error) {
            alert('Failed to create team: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsCreatingTeam(false);
        }
    };

    const statCards = [
        { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: Clock, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Teams Managed', value: managerStats.managedTeamsCount, icon: Users, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
        { label: 'Total Members', value: managerStats.totalMembers, icon: UserPlus, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    ];

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
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back, {user?.name || user?.username}!</h2>
                        <p className="text-slate-400 mt-1">Here's what's happening with your projects today.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/team')}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold transition-all border border-white/10"
                    >
                        <Users size={20} />
                        <span className="hidden sm:inline">View Teams</span>
                        <span className="sm:hidden">Teams</span>
                    </button>
                    <button
                        onClick={() => setIsTeamModalOpen(true)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold transition-all border border-white/10"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Create Team</span>
                        <span className="sm:hidden">Create</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-brand-primary/20"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">New Task</span>
                        <span className="sm:hidden">Task</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                            if (stat.label === 'Total Tasks') {
                                setIsTaskSelectionModalOpen(true);
                            } else if (stat.label === 'Completed') {
                                fetchCompletedTasks();
                            }
                        }}
                        className={`glass p-6 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer ${stat.label === 'Total Tasks' || stat.label === 'Completed' ? 'ring-2 ring-brand-primary/20 hover:ring-brand-primary/50' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stats</span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold mt-1 text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-6 text-white">Recent Tasks</h3>
                    <div className="space-y-4">
                        {recentTasks.length > 0 ? recentTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-10 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`} />
                                    <div>
                                        <h4 className="font-semibold group-hover:text-brand-primary transition-colors text-white">{task.title}</h4>
                                        <p className="text-sm text-slate-500">{task.status} • Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-brand-primary/10 text-brand-primary'
                                        }`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-center py-10">No tasks found. Create your first task!</p>
                        )}
                    </div>
                </div>

                <div className="glass rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-6 text-white">Project Health</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Task Completion</span>
                                <span className="text-white font-bold">{stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-primary transition-all duration-1000"
                                    style={{ width: `${stats?.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                You have <button onClick={fetchOverdueTasks} className="text-brand-accent font-bold hover:underline transition-all">{stats?.overdueTasks || 0} overdue tasks</button>.
                                Consider prioritizing them to stay on track.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Task"
            >
                <form onSubmit={handleCreateTask} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Task Title</label>
                        <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                placeholder="What needs to be done?"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Description</label>
                        <div className="relative group">
                            <AlignLeft className="absolute left-4 top-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white min-h-[120px] resize-none"
                                placeholder="Add some details..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Due Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                                <input
                                    type="date"
                                    value={newTask.deadline}
                                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Priority</label>
                            <select
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white appearance-none cursor-pointer"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/20 mt-4"
                    >
                        Create Task
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                title="Create New Team"
            >
                <form onSubmit={handleCreateTeam} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Team Name</label>
                        <div className="relative group">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                                placeholder="e.g. Engineering, Marketing..."
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isCreatingTeam}
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                    >
                        {isCreatingTeam ? <Loader2 className="animate-spin" size={24} /> : "Create Team"}
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={isTaskSelectionModalOpen}
                onClose={() => setIsTaskSelectionModalOpen(false)}
                title="View Tasks"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/tasks')}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 hover:bg-brand-primary/10 border border-white/10 hover:border-brand-primary/30 transition-all group space-y-3"
                    >
                        <div className="p-4 rounded-full bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white">My Personal Tasks</h3>
                        <p className="text-sm text-slate-400 text-center">View tasks you created for yourself</p>
                    </button>

                    <button
                        onClick={() => navigate('/assigned-tasks')}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 hover:bg-brand-secondary/10 border border-white/10 hover:border-brand-secondary/30 transition-all group space-y-3"
                    >
                        <div className="p-4 rounded-full bg-brand-secondary/10 text-brand-secondary group-hover:scale-110 transition-transform">
                            <ClipboardList size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Assigned to Me</h3>
                        <p className="text-sm text-slate-400 text-center">View tasks assigned by your managers</p>
                    </button>
                </div>
            </Modal>

            {/* Overdue Tasks Modal */}
            <Modal
                isOpen={isOverdueModalOpen}
                onClose={() => setIsOverdueModalOpen(false)}
                title="Overdue Tasks"
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {overdueTasks.length > 0 ? overdueTasks.map((task) => (
                        <div key={task.id} className="glass p-4 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group cursor-pointer" onClick={() => navigate(`/task/${task.id}`)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="text-red-500" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-white group-hover:text-red-500 transition-colors">{task.title}</h4>
                                        <p className="text-xs text-slate-500">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-slate-600 group-hover:text-white transition-all" />
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-500 text-center py-6">No overdue tasks! Keep up the good work.</p>
                    )}
                </div>
            </Modal>

            {/* Completed Tasks Modal */}
            <Modal
                isOpen={isCompletedModalOpen}
                onClose={() => setIsCompletedModalOpen(false)}
                title="Completed Tasks"
            >
                <div className="space-y-6">
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {completedTasks.length > 0 ? completedTasks.map((task) => (
                            <div key={task.id} className="glass p-4 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all group cursor-pointer" onClick={() => navigate(`/task/${task.id}`)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="text-green-500" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-white group-hover:text-green-500 transition-colors">{task.title}</h4>
                                            <p className="text-xs text-slate-500">Completed on {new Date(task.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-600 group-hover:text-white transition-all" />
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-center py-6">No completed tasks yet.</p>
                        )}
                    </div>

                    {completedTasks.length > 0 && (
                        <button
                            onClick={handleDeleteCompleted}
                            disabled={isDeletingCompleted}
                            className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl font-bold transition-all border border-red-500/20 flex items-center justify-center gap-2"
                        >
                            {isDeletingCompleted ? <Loader2 className="animate-spin" size={20} /> : "Delete All Completed Tasks"}
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
