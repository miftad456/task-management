import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Eye, Shield } from 'lucide-react';

const Settings = () => {
    const sections = [
        { icon: Bell, title: 'Notifications', description: 'Configure how you receive alerts and updates.' },
        { icon: Lock, title: 'Privacy & Security', description: 'Manage your password and account security.' },
        { icon: Eye, title: 'Appearance', description: 'Customize the look and feel of your dashboard.' },
        { icon: Shield, title: 'Data Management', description: 'Export or delete your personal data.' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-slate-400 mt-1">Manage your application preferences and account security.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {sections.map((section, index) => (
                    <div key={index} className="glass p-8 rounded-3xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary group-hover:scale-110 transition-transform">
                                <section.icon size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
                                <p className="text-slate-500">{section.description}</p>
                            </div>
                            <div className="text-slate-600 group-hover:text-brand-primary transition-colors">
                                <SettingsIcon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Settings;
