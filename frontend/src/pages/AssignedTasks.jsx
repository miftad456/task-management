import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Loader2, Calendar, Flag, CheckCircle2, Clock, Users } from 'lucide-react';
import taskService from '../services/task.service';
import { Link } from 'react-router-dom';

const AssignedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedTasks = async () => {
            try {
                const data = await taskService.getAssignedTasks();
                setTasks(data);
            } catch (error) {
                console.error('Failed to fetch assigned tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedTasks();
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-500/10';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10';
            case 'low': return 'text-green-500 bg-green-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-500 bg-green-500/10';
            case 'in-progress': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
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
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white">Assigned to Me</h2>
                <p className="text-slate-400 mt-1">Tasks assigned to you by your team managers.</p>
            </header>

            {tasks.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                        <ClipboardList size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">No tasks assigned yet</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        You don't have any tasks assigned to you right now. When a manager assigns you a task, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task, idx) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass p-6 rounded-3xl space-y-4 hover:border-brand-primary/30 transition-all group"
                        >
                            <div className="flex justify-between items-start">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                                    {task.status.replace('-', ' ')}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                                    {task.title}
                                </h3>
                                <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                                    {task.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                                {task.teamId && (
                                    <div className="flex items-center gap-2 text-brand-secondary">
                                        <Users size={16} />
                                        <span>{task.teamId.name}</span>
                                    </div>
                                )}
                                <Link
                                    to={`/task/${task.id}`}
                                    className="text-brand-primary font-bold hover:underline"
                                >
                                    View Details
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssignedTasks;
