import React, { useState } from 'react';
import { User } from '../types';
import { XIcon } from './common/Icon';

interface SettingsModalProps {
    user: User;
    onClose: () => void;
    onUpdate: (user: User) => void;
    onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onUpdate, onLogout }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate({ ...user, name, email });
        onClose();
    };

    const simpleHash = (s: string) => {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            const char = s.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash.toString();
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordError('Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('codePilotUsers') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === user.id);

        if (userIndex === -1) {
            setPasswordError('Could not find user data. Please log out and log back in.');
            return;
        }

        const storedUser = users[userIndex];
        if (storedUser.passwordHash !== simpleHash(currentPassword)) {
            setPasswordError('Incorrect current password.');
            return;
        }

        storedUser.passwordHash = simpleHash(newPassword);
        users[userIndex] = storedUser;
        localStorage.setItem('codePilotUsers', JSON.stringify(users));

        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const inputClasses = "w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md animate-enter flex flex-col max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface">
                    <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                        <XIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </header>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} />
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg">Update Profile</button>
                        </div>
                    </form>

                    <hr className="my-8 border-border" />

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary">Change Password</h3>
                        {passwordError && <p className="bg-red-500/10 text-red-500 text-sm font-medium p-3 rounded-lg text-center">{passwordError}</p>}
                        {passwordSuccess && <p className="bg-green-500/10 text-green-500 text-sm font-medium p-3 rounded-lg text-center">{passwordSuccess}</p>}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Confirm New Password</label>
                            <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className={inputClasses} />
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full py-3 bg-secondary text-text-primary font-bold rounded-lg hover:bg-border transition-colors">Change Password</button>
                        </div>
                    </form>
                </div>


                <footer className="p-6 border-t border-border mt-auto sticky bottom-0 bg-surface">
                    <button onClick={onLogout} className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-lg hover:bg-red-500/20 transition-colors">Logout</button>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;