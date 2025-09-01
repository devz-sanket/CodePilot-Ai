import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { LogoIcon } from './common/Icon';

interface AuthViewProps {
    onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

    // A simple hashing function for demonstration purposes.
    // In a real app, use a strong, salted hashing algorithm on the backend.
    const simpleHash = (s: string) => {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            const char = s.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!loginEmail || !loginPassword) {
            setError('Please fill in all fields.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('codePilotUsers') || '[]');
        const foundUser = users.find((u: any) => u.email === loginEmail && u.passwordHash === simpleHash(loginPassword));

        if (foundUser) {
            const { passwordHash, ...userToLogin } = foundUser;
            onLogin(userToLogin);
        } else {
            setError('Invalid email or password.');
        }
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (signupPassword !== signupConfirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('codePilotUsers') || '[]');
        if (users.some((u: any) => u.email === signupEmail)) {
            setError('An account with this email already exists.');
            return;
        }

        const newUser = {
            id: uuidv4(),
            name: signupName,
            email: signupEmail,
            passwordHash: simpleHash(signupPassword),
        };
        
        users.push(newUser);
        localStorage.setItem('codePilotUsers', JSON.stringify(users));

        setSuccess('Account created successfully! Please log in.');
        setIsLoginView(true);
        // Clear signup form
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirmPassword('');
    };

    const inputClasses = "w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <LogoIcon className="w-20 h-20 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-text-primary">Welcome to CodePilot</h1>
                    <p className="text-text-secondary mt-2">Your AI-powered coding assistant.</p>
                </div>
                <div className="bg-surface p-8 rounded-2xl border border-border shadow-2xl">
                    <div className="flex border-b border-border mb-6">
                        <button onClick={() => { setIsLoginView(true); setError(''); setSuccess(''); }} className={`flex-1 py-3 text-lg font-semibold transition-colors ${isLoginView ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            Login
                        </button>
                        <button onClick={() => { setIsLoginView(false); setError(''); setSuccess(''); }} className={`flex-1 py-3 text-lg font-semibold transition-colors ${!isLoginView ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            Sign Up
                        </button>
                    </div>

                    {error && <p className="bg-red-500/10 text-red-500 text-sm font-medium p-3 rounded-lg mb-4 text-center">{error}</p>}
                    {success && <p className="bg-green-500/10 text-green-500 text-sm font-medium p-3 rounded-lg mb-4 text-center">{success}</p>}

                    {isLoginView ? (
                        <form onSubmit={handleLogin} className="space-y-4 animate-enter">
                            <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={inputClasses} />
                            <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={inputClasses} />
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg">Login</button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-4 animate-enter">
                            <input type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} className={inputClasses} />
                            <input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className={inputClasses} />
                            <input type="password" placeholder="Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className={inputClasses} />
                            <input type="password" placeholder="Confirm Password" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} className={inputClasses} />
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg">Create Account</button>
                        </form>
                    )}
                </div>
                 <footer className="text-center p-4 text-text-secondary/80 text-xs mt-4">
                    Devlop by Sanket Team
                </footer>
            </div>
        </div>
    );
};

export default AuthView;