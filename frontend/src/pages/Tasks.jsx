import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Search, Filter, Clock, CheckCircle2, AlertCircle, MoreVertical, Loader2, Calendar, Trash2 } from 'lucide-react';
import taskService from '../services/task.service';
import useAuthStore from '../store/useAuthStore';

const Tasks = () => {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const fetchedTasks = await taskService.getAllTasks(search);
            setTasks(fetchedTasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTasks();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await taskService.updateStatus(taskId, newStatus);
            fetchTasks();
        } catch (error) {
            alert('Failed to update status: ' + error.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.deleteTask(taskId);
            fetchTasks();
        } catch (error) {
            alert('Failed to delete task: ' + error.message);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status.toLowerCase() === filter.toLowerCase();
    });

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return <CheckCircle2 className="text-green-500" size={18} />;
            case 'in-progress': return <Clock className="text-brand-secondary" size={18} />;
            default: return <AlertCircle className="text-brand-primary" size={18} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-green-500/10 text-green-500 border-green-500/20';
        }
    };

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">My Tasks</h2>
                    <p className="text-slate-400 mt-1">Manage and track your daily activities and project tasks.</p>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'pending', 'in-progress', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all whitespace-nowrap ${filter === f
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {f.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-[40vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-primary" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-6 rounded-2xl hover:border-white/20 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">{getStatusIcon(task.status)}</div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">{task.title}</h3>
                                        <p className="text-slate-400 text-sm line-clamp-1">{task.description || 'No description provided.'}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar size={14} />
                                                <span>Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 self-end md:self-center">
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        {(!task.assignedBy || task.assignedBy === user?.id) && (
                                            <option value="completed">Completed</option>
                                        )}
                                    </select>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-all"
                                        title="Delete Task"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="glass rounded-3xl p-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                                <CheckSquare size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white">No tasks found</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                We couldn't find any tasks matching your criteria. Try adjusting your filters or search query.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tasks;
