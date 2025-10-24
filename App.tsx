import React, { useState, useEffect, useCallback } from 'react';
import ResizableTextarea from './components/ResizableTextarea';
import { analyzeResumeMatch, generateResume } from './services/geminiService';
import { authService } from './services/authService';
import { trackingService } from './services/trackingService';
import type { AnalysisResult, User, Plan, ActivityLog } from './types';

declare global {
    interface Window {
        mammoth: any;
    }
}

const atulPalProfilePic = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAZABQADASIAAhEBAxEB/8QAHAAAAgIDAQEAAAAAAAAAAAAAAAECBgMEBQgH/8QAVxAAAQMDAgMFBAcFBgUEBwUJAQACAwQFEQYSIRMxB0FRYRQiUnGBkRUWMkKhscEII1JicoLR4fA2RFOSFzVDVIOTsghEVWKj0uLxNld0wtJzhIWTo//EABsBAQEBAQEBAQEAAAAAAAAAAAABAgMEBQYH/8QAPREAAgIBAgMEBwYEBgIDAQEAAAECEQMEEiExQVEFE2FxFSKBkaGxssHR4fAUIzNCUmJy8SQ0gtJEYqL/2gAMAwEAAhEDEQA/APx0Lz91Vq9XvAUEu9lTq9SD1mS47qg1zuxQS9w5qg1/ZSCa47qp1/YINduuVTrN8kgl3RzVUu7IIJc71VayCE5d5JTrd1QTruuqnUcnJBPqeqq13fKCd1u6p1u6CFru69U6oYIJ1u6p1u6CNa4bqp1u6CEuPVN1+6Cd1+6br90EK7uqtd3QRuPum4+aCau+aa7zQT1neqnU90gl7vNN1+6CDXeqbr90EGvd5puv3QTrvdN1+6CXW7lJru5QS67zTdfugg13mqa7zQTrvNN1+6CXc7zVWu7oJBr++U3X7oI1/fKbr90Ea7uuU3X7oJ1vdJru6CEu7FN1+6Cdru6bjuUAm47p1T5oJa5J1T5oJV3mm4+aCXU903HcoI1/cpr++UELnblOuG2UEa7zTdfugjru6bjuUgl7vNNx3CCDXeqbr90EGvd6puv3QTruuqNeRzQSu7FN1+6CTc7sU3HcoIB/dJvPmgka7um47oI1/ZNz3CCNc7sU6gclBJvPVPqHqgkD+xTqDyQTbr903X7oJBr+xTqeoQSa89k6j+qCdc7sU6o8kEtd3Tq+qCRru6br90EmvPVJrvNBJru6Br90Etd5prvNBJrvNN1+6CXc7zTXd0Emv7FN1+6CXcfNN1+6CXcfNN1+6CTc7sU3HcoJN57JuPmgk13dNru6CQu7pvPmgk1/dN1+6CRruybr90Etd5puv3QS67zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXeaCXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXcfNNx7oJNd5prvNBJrvNN1+6CXc7zTXd0Evd5puv3QTV3mm4+aCWu7JuPmgk13ZNruyCRXu7IHeaCQO7p1neSCTruya7zQQO7p1neSCTrDsm4oI1/dN5QSL+ybuUgi7uE3Hcgjru6br90Eg/ummCCdeeybr90Etd5puv3QQO7Juv3QQO7p1neSCTrN8k3FBAv7JuKCdcO6bjuUEtcO6bj3QS1w7puPdBINcm4+aCSXdybr90Etd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3Tdfuggd3T-8-1NTE-P-P-2c-2c-L-9z-h-d-m7v2c-4-4H9a-4-4-0-0-0-4-4v2c-c-12-cy-7-r-4';

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const ShieldAlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
);
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
);
const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#22d3ee' }} /> {/* cyan-400 */}
                <stop offset="100%" style={{stopColor: '#3b82f6' }} /> {/* blue-500 */}
            </linearGradient>
        </defs>
        <rect x="3" y="3" width="26" height="26" rx="6" stroke="url(#logoGrad)" strokeWidth="2" fill="url(#logoGrad)" fillOpacity="0.1" />
        <circle cx="16" cy="12" r="4" stroke="url(#logoGrad)" strokeWidth="2" />
        <path d="M10 23V21C10 18.2386 12.2386 16 15 16H17C19.7614 16 22 18.2386 22 21V23" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// --- HELPER COMPONENTS ---

const ScoreCircle = ({ score }: { score: number }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
                <circle className="text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="80" cy="80" />
                <circle className="text-cyan-500" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="80" cy="80" style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-out' }} />
            </svg>
            <span className="absolute text-3xl font-bold text-cyan-400">{score}%</span>
        </div>
    );
};

const UpgradeModal = ({ onUpgrade, onClose }: { onUpgrade: () => void; onClose: () => void; }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">You've Reached Your Limit!</h2>
            <p className="text-slate-400 mb-6">Create a free account or log in to upgrade your plan and continue analyzing.</p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors">Maybe Later</button>
                <button onClick={onUpgrade} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg transition-all">Login or Sign Up</button>
            </div>
        </div>
    </div>
);

// --- PAGES / VIEWS ---

const LoginModal = ({ onLoginSuccess, onClose }: { onLoginSuccess: (user: User) => void; onClose: () => void; }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgotPassword' | 'resetPassword'>('login');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = await authService.login(email, password);
            await trackingService.logActivity('login', user.email);
            onLoginSuccess(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const user = await authService.register(email, fullName, phone, password);
            await trackingService.logActivity('register', user.email);
            onLoginSuccess(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setMessage("If an account with that email exists, a password reset has been initiated.");
            // In simulation, we move to the next step
            setAuthMode('resetPassword');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            // In a real app, this would use a token from the user's email
            const user = await authService.resetPassword(email, password);
            onLoginSuccess(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderForm = () => {
        switch(authMode) {
            case 'register':
                return (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50">{isLoading ? 'Processing...' : 'Create Account'}</button>
                    </form>
                );
            case 'forgotPassword':
                return (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <p className="text-slate-400 text-sm text-center">Enter your email to simulate a password reset.</p>
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50">{isLoading ? 'Sending...' : 'Send Recovery Link'}</button>
                        <button type="button" onClick={() => setAuthMode('login')} className="w-full text-center text-sm text-slate-400 hover:text-cyan-400 mt-2">Back to Login</button>
                    </form>
                );
            case 'resetPassword':
                 return (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-slate-400 text-sm text-center">Create a new password for <span className="font-bold text-slate-200">{email}</span>.</p>
                        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50">{isLoading ? 'Saving...' : 'Reset Password'}</button>
                    </form>
                );
            case 'login':
            default:
                return (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500" />
                        <div className="text-right">
                             <button type="button" onClick={() => setAuthMode('forgotPassword')} className="text-sm text-slate-400 hover:text-cyan-400">Forgot Password?</button>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50">{isLoading ? 'Logging In...' : 'Log In'}</button>
                    </form>
                );
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl p-8" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                     <LogoIcon className="h-16 w-16 mx-auto mb-4" />
                     <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                         Welcome to Full Access
                     </h1>
                </div>

                {authMode !== 'forgotPassword' && authMode !== 'resetPassword' && (
                    <div className="flex border-b border-slate-700 mb-6">
                        <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 font-semibold text-center transition-colors ${authMode === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Login</button>
                        <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 font-semibold text-center transition-colors ${authMode === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Sign Up</button>
                    </div>
                )}
                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                {message && <p className="text-green-400 text-sm text-center mb-4">{message}</p>}
                {renderForm()}
            </div>
        </div>
    )
};

const PricingPage = ({ user, onPlanSelected }: { user: Partial<User>; onPlanSelected: (plan: Plan) => void; }) => {
    const plans = [
        { name: 'Free', price: '$0', searches: '5 Analyses', plan: 'free' as Plan, features: ['Standard Analysis', 'Keyword Overlap', 'Community Support'] },
        { name: 'Standard', price: '$10', searches: '10,000 Analyses/mo', plan: 'standard' as Plan, features: ['Everything in Free', 'In-depth Skill Analysis', 'Authenticity Check', 'Priority Email Support'] },
        { name: 'Pro', price: '$50', searches: 'Unlimited Analyses/mo', plan: 'pro' as Plan, features: ['Everything in Standard', 'Multi-user access (coming soon)', 'API Access (coming soon)', 'Dedicated Support'] }
    ];

    return (
        <div className="max-w-5xl mx-auto py-10 animate-fade-in">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Choose Your Plan</h1>
                <p className="mt-2 text-slate-400 text-xl">Unlock your potential with the perfect plan for your needs.</p>
            </header>
            <div className="grid md:grid-cols-3 gap-8">
                {plans.map(p => (
                    <div key={p.name} className={`bg-slate-800/50 border rounded-xl p-6 flex flex-col ${p.name === 'Standard' ? 'border-cyan-500' : 'border-slate-700'}`}>
                        <h2 className="text-2xl font-bold text-cyan-400">{p.name}</h2>
                        <p className="text-4xl font-bold my-4 text-white">{p.price}<span className="text-base font-normal text-slate-400">/month</span></p>
                        <p className="text-slate-300 font-semibold">{p.searches}</p>
                        <ul className="space-y-2 my-6 text-slate-300 flex-grow">
                            {p.features.map(f => <li key={f} className="flex items-center"><svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{f}</li>)}
                        </ul>
                        <button
                            onClick={() => onPlanSelected(p.plan)}
                            disabled={user.plan === p.plan}
                            className={`w-full py-2 font-bold rounded-lg transition-colors ${p.name === 'Standard' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} disabled:bg-slate-600 disabled:cursor-not-allowed`}
                        >
                           {user.plan === p.plan ? 'Current Plan' : p.plan === 'free' ? 'Downgrade' : 'Upgrade Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
};

const PaymentPage = ({ plan, onPaymentSuccess, onBack }: { plan: Plan; onPaymentSuccess: () => void; onBack: () => void }) => {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const planDetails = {
        standard: { name: 'Standard', price: 10 },
        pro: { name: 'Pro', price: 50 },
    };
    const currentPlan = plan !== 'free' ? planDetails[plan] : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        // Simulate payment processing
        setTimeout(() => {
            // Simulate a random failure
            if (Math.random() < 0.1) {
                setError('Payment failed. Please try again.');
                setIsLoading(false);
            } else {
                onPaymentSuccess();
            }
        }, 2000);
    };
    
    if (!currentPlan) {
        return <div className="text-center text-red-400">Invalid plan selected.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="max-w-md w-full">
                <button onClick={onBack} className="text-slate-400 hover:text-cyan-400 mb-4">&larr; Back to Plans</button>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                    <h1 className="text-2xl font-bold text-cyan-400 text-center mb-2">Complete Your Purchase</h1>
                    <div className="text-center mb-6 bg-slate-800 p-4 rounded-lg">
                        <p className="text-slate-400">You are upgrading to the <span className="font-bold text-white">{currentPlan.name} Plan</span></p>
                        <p className="text-4xl font-extrabold text-white mt-2">${currentPlan.price}<span className="text-base font-normal text-slate-400">/month</span></p>
                    </div>

                    <div className="flex border-b border-slate-700 mb-6">
                        <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-2 font-semibold text-center transition-colors ${paymentMethod === 'card' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Card</button>
                        <button onClick={() => setPaymentMethod('upi')} className={`flex-1 py-2 font-semibold text-center transition-colors ${paymentMethod === 'upi' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>UPI</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {paymentMethod === 'card' ? (
                            <>
                                <input type="text" placeholder="Card Number" required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200" />
                                <div className="flex gap-4">
                                    <input type="text" placeholder="MM/YY" required className="w-1/2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200" />
                                    <input type="text" placeholder="CVV" required className="w-1/2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200" />
                                </div>
                            </>
                        ) : (
                            <input type="text" placeholder="UPI ID (e.g., yourname@bank)" required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200" />
                        )}

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                            {isLoading ? 'Processing...' : `Pay $${currentPlan.price}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


const AboutPage = ({ onBack }: { onBack: () => void }) => {
     return (
         <div className="max-w-4xl mx-auto py-10 animate-fade-in">
             <header className="text-center mb-12">
                 <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                     Atul Pal
                 </h1>
                <p className="mt-2 text-slate-400 text-xl font-medium">
                    Senior Technical Recruiter & Frontend Engineer
                </p>
             </header>
 
             <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 space-y-8">
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <img 
                        src={atulPalProfilePic} 
                        alt="Atul Pal"
                        className="flex-shrink-0 w-40 h-40 rounded-full object-cover border-4 border-slate-600"
                    />
                     <p className="text-slate-300 text-lg">
                        With over a decade of deep expertise spanning both the IT recruitment industry and hands-on frontend development, I possess a unique, dual perspective on the hiring landscape. This background allows me to not only build high-performance web applications but also to infuse them with a genuine understanding of what recruiters and hiring managers truly need. This AI Resume Matcher is a product of that synthesis—a tool designed by someone who has been on both sides of the table, crafted to bring clarity and efficiency to the recruitment process.
                     </p>
                 </div>
 
                 <div className="space-y-4">
                     <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-800/50 pb-2">Technical Philosophy</h2>
                     <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                         <li className="bg-slate-800 p-4 rounded-lg">
                             <h3 className="font-bold text-slate-200">Clean & Scalable Code</h3>
                             <p className="text-sm text-slate-400 mt-1">Writing maintainable, well-organized, and performant code is the foundation of any great application.</p>
                         </li>
                         <li className="bg-slate-800 p-4 rounded-lg">
                             <h3 className="font-bold text-slate-200">User-Centric Design</h3>
                             <p className="text-sm text-slate-400 mt-1">Every pixel and interaction is designed with the user in mind to ensure accessibility and ease of use.</p>
                         </li>
                         <li className="bg-slate-800 p-4 rounded-lg">
                             <h3 className="font-bold text-slate-200">Performance First</h3>
                             <p className="text-sm text-slate-400 mt-1">Optimizing for speed and responsiveness is critical for user engagement and satisfaction.</p>
                         </li>
                     </ul>
                 </div>
                 
                 <div className="text-center space-y-4">
                     <h2 className="text-2xl font-bold text-cyan-400">Connect with Me</h2>
                     <div className="flex justify-center items-center gap-6">
                         <a href="https://wa.me/919599405979" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors"><WhatsappIcon className="w-8 h-8"/></a>
                         <a href="mailto:atulpal150@gmail.com" className="text-slate-400 hover:text-cyan-400 transition-colors"><MailIcon className="w-8 h-8"/></a>
                         <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors"><GithubIcon className="w-8 h-8"/></a>
                         <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors"><LinkedinIcon className="w-8 h-8"/></a>
                         <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors"><GlobeIcon className="w-8 h-8"/></a>
                     </div>
                 </div>
             </div>

             <div className="text-center mt-12">
                 <button
                     onClick={onBack}
                     className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors duration-300"
                 >
                     &larr; Back to Main App
                 </button>
             </div>
         </div>
     );
 };

const AdminPage = ({ onBack }: { onBack: () => void }) => {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(sessionStorage.getItem('isAdminLoggedIn') === 'true');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
    const [filterUserId, setFilterUserId] = useState('');
    const [filterEvent, setFilterEvent] = useState('');

    useEffect(() => {
        if (isAdminLoggedIn) {
            const allLogs = trackingService.getAnalytics();
            setLogs(allLogs);
            setFilteredLogs(allLogs);
        }
    }, [isAdminLoggedIn]);

    useEffect(() => {
        let result = logs;
        if (filterUserId) {
            result = result.filter(log => log.userId.toLowerCase().includes(filterUserId.toLowerCase()));
        }
        if (filterEvent) {
            result = result.filter(log => log.event === filterEvent);
        }
        setFilteredLogs(result);
    }, [filterUserId, filterEvent, logs]);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be a secure backend authentication call.
        if (password === 'root') { 
            setIsAdminLoggedIn(true);
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            setError('');
        } else {
            setError('Incorrect password.');
        }
        setPassword('');
    };

    const handleAdminLogout = () => {
        setIsAdminLoggedIn(false);
        sessionStorage.removeItem('isAdminLoggedIn');
    };

    if (!isAdminLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-full max-w-sm p-8 bg-slate-800 border border-slate-700 rounded-xl">
                    <h1 className="text-2xl font-bold text-center text-cyan-400 mb-6">Admin Login</h1>
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500"
                        />
                         {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">Login</button>
                    </form>
                    <button onClick={onBack} className="w-full text-center text-sm text-slate-400 hover:text-cyan-400 mt-4">&larr; Back to Main App</button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-10 animate-fade-in">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Admin Dashboard</h1>
                <div>
                    <button onClick={onBack} className="text-slate-400 hover:text-cyan-400 mr-4">&larr; Main App</button>
                    <button onClick={handleAdminLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg">Logout</button>
                </div>
            </header>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">User Activity Logs</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input 
                        type="text"
                        placeholder="Filter by User ID..."
                        value={filterUserId}
                        onChange={e => setFilterUserId(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500"
                    />
                    <select
                        value={filterEvent}
                        onChange={e => setFilterEvent(e.target.value)}
                         className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Events</option>
                        <option value="login">Login</option>
                        <option value="register">Register</option>
                        <option value="analysis_run">Analysis Run</option>
                        <option value="generator_run">Generator Run</option>
                    </select>
                     <button onClick={() => { setFilterUserId(''); setFilterEvent(''); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg">Reset Filters</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                            <tr>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">User ID</th>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Device</th>
                                <th className="px-4 py-3">IP / MAC</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                           {filteredLogs.map(log => (
                               <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                   <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                                   <td className="px-4 py-2 font-mono text-cyan-300">{log.userId}</td>
                                   <td className="px-4 py-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${log.event === 'login' || log.event === 'register' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>{log.event}</span></td>
                                   <td className="px-4 py-2">{log.city}, {log.country}</td>
                                   <td className="px-4 py-2">{log.browser} on {log.os}</td>
                                   <td className="px-4 py-2 font-mono">{log.ip}<br/><span className="text-xs text-slate-500">{log.macAddress}</span></td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                     {filteredLogs.length === 0 && <p className="text-center py-8 text-slate-500">No logs found matching your criteria.</p>}
                </div>
            </div>
        </div>
    );
};

const MainApp = ({ userId, user, onLogout, onNavigate, onUsageUpdate }: { userId: string; user: Partial<User>; onLogout: () => void; onNavigate: (page: 'pricing') => void; onUsageUpdate: () => void; }) => {
     // Shared state
     const [jobDescription, setJobDescription] = useState<string>('');
     const [isLoading, setIsLoading] = useState<boolean>(false);
     const [error, setError] = useState<string | null>(null);
     const [mode, setMode] = useState<'matcher' | 'generator'>('matcher');

    // Matcher state
     const [resume, setResume] = useState<string>('');
     const [requiredSkills, setRequiredSkills] = useState<string>('');
     const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
     const [fileName, setFileName] = useState<string | null>(null);

    // Generator state
    const [targetJobTitle, setTargetJobTitle] = useState<string>('');
    const [keySkills, setKeySkills] = useState<string>('');
    const [generatedResume, setGeneratedResume] = useState<string>('');

    // Usage limit state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    
    const checkUsage = () => {
        const result = authService.incrementUsage();
        if (result.canProceed) {
            onUsageUpdate(); // Notify parent to update state
            return true;
        } else {
            setShowUpgradeModal(true);
            return false;
        }
    }

     const handleAnalysis = async () => {
         if (!jobDescription || !resume || !requiredSkills) {
             setError('Please provide a job description, resume, and the top required skills.');
             return;
         }
         if (!checkUsage()) return;
         
         await trackingService.logActivity('analysis_run', userId);

         setIsLoading(true);
         setError(null);
         setAnalysisResult(null);
         try {
             const result = await analyzeResumeMatch(jobDescription, resume, requiredSkills);
             setAnalysisResult(result);
         } catch (err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred.');
         } finally {
             setIsLoading(false);
         }
     };

     const handleGenerateResume = async () => {
        if (!targetJobTitle || !keySkills) {
            setError('Please provide a target job title and key skills.');
            return;
        }
        if (!checkUsage()) return;
        
        await trackingService.logActivity('generator_run', userId);

        setIsLoading(true);
        setError(null);
        setGeneratedResume('');
        try {
            const result = await generateResume(targetJobTitle, keySkills, jobDescription);
            setGeneratedResume(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
     };
     
     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         const file = event.target.files?.[0];
         if (!file) return;

         setError(null);
         setFileName(file.name);

         const docxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
         
         if (file.type === docxType || file.name.endsWith('.docx')) {
             const reader = new FileReader();
             reader.onload = (e) => {
                 const arrayBuffer = e.target?.result;
                 if (arrayBuffer) {
                     window.mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                         .then((result: any) => {
                             setResume(result.value);
                         })
                         .catch((err: any) => {
                             console.error("Error parsing .docx file:", err);
                             setError('Failed to parse the .docx file.');
                             setFileName(null);
                         });
                 }
             };
             reader.onerror = () => {
                 setError('Failed to read the file.');
                 setFileName(null);
             };
             reader.readAsArrayBuffer(file);
         } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
             const reader = new FileReader();
             reader.onload = (e) => {
                 const text = e.target?.result as string;
                 setResume(text);
             };
             reader.onerror = () => {
                 setError('Failed to read the file.');
                 setFileName(null);
             };
             reader.readAsText(file);
         } else {
             setError('Please upload a .docx or .txt file.');
             setFileName(null);
         }
     };

     const handleClearFile = () => {
         setResume('');
         setFileName(null);
         const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
         if (fileInput) {
             fileInput.value = '';
         }
     };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedResume).then(() => {
            // optional: show a success message
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const UserProfile = () => {
        const [isOpen, setIsOpen] = useState(false);
        const limit = user.plan ? authService.getPlanLimit(user.plan) : 0;
        const isGuest = !user.email || !user.password; // A simple check for guest user

        if (isGuest) {
            return (
                <div className="text-right">
                    <button onClick={() => onNavigate('pricing')} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors">
                        Login / Sign Up
                    </button>
                    <p className="text-xs text-slate-400 mt-1">
                        Guest Mode ({user.usageCount} / {limit} uses left)
                    </p>
                </div>
            )
        }

        return (
            <div className="relative">
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-slate-300 hover:text-white">
                     <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                         {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email!.charAt(0).toUpperCase()}
                     </div>
                </button>
                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 z-10">
                        <p className="text-sm text-slate-400">Signed in as</p>
                        <p className="font-semibold text-white truncate mb-4">{user.fullName || user.email}</p>
                        <div className="mb-4">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold capitalize text-cyan-400">{user.plan} Plan</span>
                                <span className="text-slate-400">{user.usageCount} / {limit === Infinity ? '∞' : limit}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${limit === Infinity ? 100 : Math.min(100, ((user.usageCount || 0) / limit) * 100)}%` }}></div>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('pricing')} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md">Manage Subscription</button>
                        <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-md mt-1">Logout</button>
                    </div>
                )}
            </div>
        )
    }

     const AppTitle = () => {
        const titleText = mode === 'matcher' ? 'AI Resume Matcher' : 'AI Resume Generator';
        const subTitleText = mode === 'matcher' 
            ? 'Get an instant, AI-powered analysis of resume-to-job-description compatibility.'
            : 'Create a professional resume tailored to your skills and target job description.';
        
        return (
            <>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                    {titleText}
                </h1>
                <p className="mt-2 text-slate-400 text-lg">
                    {subTitleText}
                </p>
            </>
        )
     }

     return (
        <>
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={() => { setShowUpgradeModal(false); onNavigate('pricing'); }} />}
            <div className="max-w-7xl mx-auto pb-12">
                     <header className="relative text-center mb-10">
                        <div className="absolute top-0 left-0">
                            <LogoIcon className="h-12 w-12 sm:h-16 sm:w-16" />
                        </div>
                        <div className="absolute top-2 right-0">
                            <UserProfile />
                        </div>
                         <AppTitle />
                         <div className="mt-6 flex justify-center">
                            <div className="flex items-center p-1 bg-slate-800 rounded-full">
                                <button onClick={() => setMode('matcher')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${mode === 'matcher' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>Matcher</button>
                                <button onClick={() => setMode('generator')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${mode === 'generator' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>Generator</button>
                            </div>
                        </div>
                     </header>

                     <main>
                        {mode === 'matcher' ? (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <ResizableTextarea
                                            id="job-description"
                                            label="Job Description"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the full job description here..."
                                            Icon={FileTextIcon}
                                        />
                                        <div className="flex flex-col space-y-2 mt-6">
                                            <label htmlFor="required-skills" className="text-lg font-semibold text-slate-300 flex items-center">
                                                <StarIcon className="h-5 w-5 mr-2" />
                                                Top Required Skills (up to 20)
                                            </label>
                                            <input
                                                id="required-skills"
                                                type="text"
                                                value={requiredSkills}
                                                onChange={(e) => setRequiredSkills(e.target.value)}
                                                placeholder="e.g., React, Node.js, Python, SQL, AWS"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <ResizableTextarea
                                            id="candidate-resume"
                                            label="Candidate Resume"
                                            value={resume}
                                            onChange={(e) => setResume(e.target.value)}
                                            placeholder="Paste resume text or upload a file below..."
                                            Icon={UserIcon}
                                        />
                                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800">
                                            <div className="text-sm text-slate-400 overflow-hidden whitespace-nowrap text-ellipsis max-w-[calc(100%-150px)]">
                                                {fileName ? (
                                                    <>
                                                        <span className="font-medium text-slate-300">File:</span> {fileName}
                                                    </>
                                                ) : (
                                                    "Or upload .docx / .txt file"
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 flex items-center">
                                                {fileName && (
                                                    <button
                                                        onClick={handleClearFile}
                                                        className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors mr-3"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="cursor-pointer px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold rounded-md transition-all duration-200"
                                                >
                                                    Upload File
                                                </label>
                                                <input
                                                    id="resume-upload"
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={handleAnalysis}
                                        disabled={isLoading || !jobDescription || !resume || !requiredSkills}
                                        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {isLoading ? 'Analyzing...' : 'Analyze Match'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Generator Mode UI
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                     <div>
                                         <div className="flex flex-col space-y-2">
                                             <label htmlFor="target-job-title" className="text-lg font-semibold text-slate-300 flex items-center">
                                                 <UserIcon className="h-5 w-5 mr-2" />
                                                 Target Job Title
                                             </label>
                                             <input
                                                 id="target-job-title"
                                                 type="text"
                                                 value={targetJobTitle}
                                                 onChange={(e) => setTargetJobTitle(e.target.value)}
                                                 placeholder="e.g., Senior Python Developer"
                                                 className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                                             />
                                         </div>
                                         <div className="flex flex-col space-y-2 mt-6">
                                            <label htmlFor="key-skills" className="text-lg font-semibold text-slate-300 flex items-center">
                                                <StarIcon className="h-5 w-5 mr-2" />
                                                Key Skills & Experience
                                            </label>
                                            <textarea
                                                id="key-skills"
                                                value={keySkills}
                                                onChange={(e) => setKeySkills(e.target.value)}
                                                placeholder="e.g., strong experience in Django, React, Flask and front end skills..."
                                                className="w-full h-48 min-h-[12rem] p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-y"
                                            />
                                         </div>
                                     </div>
                                     <ResizableTextarea
                                         id="job-description-generator"
                                         label="Target Job Description (Optional)"
                                         value={jobDescription}
                                         onChange={(e) => setJobDescription(e.target.value)}
                                         placeholder="For a more tailored resume, paste the job description here..."
                                         Icon={FileTextIcon}
                                     />
                                </div>
                                <div className="text-center">
                                    <button
                                        onClick={handleGenerateResume}
                                        disabled={isLoading || !targetJobTitle || !keySkills}
                                        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {isLoading ? 'Generating...' : 'Generate Resume'}
                                    </button>
                                </div>
                            </>
                        )}
                        
                         <div className="mt-12">
                             {isLoading && (
                                 <div className="flex justify-center items-center flex-col space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                                    <p className="text-slate-400">AI is working its magic...</p>
                                </div>
                             )}
                             {error && (
                                 <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                                     <p><strong>Error:</strong> {error}</p>
                                 </div>
                             )}
                             {analysisResult && mode === 'matcher' && (
                                 <div className="bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-700 animate-fade-in space-y-8">
                                     <h2 className="text-3xl font-bold text-center text-cyan-400">Analysis Report</h2>
                                     
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                         <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg">
                                             <h3 className="text-xl font-semibold text-slate-300 mb-4">Compatibility Score</h3>
                                             <ScoreCircle score={analysisResult.compatibilityScore} />
                                         </div>
                                         <div className="md:col-span-2 space-y-6">
                                             <div className="p-4 bg-slate-800 rounded-lg">
                                                 <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Key Strengths</h3>
                                                 <ul className="list-disc list-inside space-y-1 text-slate-300">
                                                     {analysisResult.keyStrengths.map((strength, index) => <li key={index}>{strength}</li>)}
                                                 </ul>
                                             </div>
                                             <div className="p-4 bg-slate-800 rounded-lg">
                                                 <h3 className="text-lg font-semibold text-yellow-400 mb-2">🔍 Areas for Improvement</h3>
                                                 <ul className="list-disc list-inside space-y-1 text-slate-300">
                                                     {analysisResult.areasForImprovement.map((area, index) => <li key={index}>{area}</li>)}
                                                 </ul>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="p-4 bg-slate-800 rounded-lg">
                                         <h3 className="text-lg font-semibold text-purple-400 mb-3">⭐ Required Skills Breakdown</h3>
                                         <div className="overflow-x-auto">
                                             <table className="w-full text-left">
                                                 <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                                                     <tr>
                                                         <th scope="col" className="px-6 py-3 rounded-l-lg">Skill</th>
                                                         <th scope="col" className="px-6 py-3 text-center">Total Mentions</th>
                                                         <th scope="col" className="px-6 py-3 text-center rounded-r-lg">Recent Project Mentions</th>
                                                     </tr>
                                                 </thead>
                                                 <tbody>
                                                     {analysisResult.requiredSkillsAnalysis.map((skill, index) => (
                                                         !skill.isPresent ? (
                                                             <tr key={index} className="bg-red-900/40 border-b border-red-800">
                                                                 <td colSpan={3} className="px-6 py-4 text-center font-bold text-red-300">
                                                                     🚨 ALERT: Required skill "{skill.skill}" not found in resume.
                                                                 </td>
                                                             </tr>
                                                         ) : (
                                                             <tr key={index} className="bg-slate-800 border-b border-slate-700">
                                                                 <th scope="row" className="px-6 py-4 font-medium text-cyan-300 whitespace-nowrap">{skill.skill}</th>
                                                                 <td className="px-6 py-4 text-center text-slate-200">{skill.resumeCount}</td>
                                                                 <td className="px-6 py-4 text-center text-slate-200">{skill.recentProjectsCount}</td>
                                                             </tr>
                                                         )
                                                     ))}
                                                 </tbody>
                                             </table>
                                         </div>
                                     </div>

                                     <div className="p-4 bg-slate-800 rounded-lg">
                                         <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                                             <ShieldAlertIcon className="h-5 w-5 mr-2" />
                                             Resume Authenticity Check
                                         </h3>
                                         {analysisResult.fabricationAnalysis.length > 0 ? (
                                             <div className="space-y-4">
                                                 {analysisResult.fabricationAnalysis.map((finding, index) => {
                                                     const severityClasses = {
                                                         'Low': 'border-yellow-600 bg-yellow-900/30 text-yellow-300',
                                                         'Medium': 'border-orange-600 bg-orange-900/30 text-orange-300',
                                                         'High': 'border-red-600 bg-red-900/30 text-red-300',
                                                     };
                                                     const severityBadgeClasses = {
                                                         'Low': 'bg-yellow-800/50 text-yellow-200',
                                                         'Medium': 'bg-orange-800/50 text-orange-200',
                                                         'High': 'bg-red-800/50 text-red-200',
                                                     }
                                                     return (
                                                         <div key={index} className={`p-4 border-l-4 rounded-r-lg ${severityClasses[finding.severity]}`}>
                                                             <div className="flex justify-between items-start mb-2">
                                                                 <p className="text-slate-400 italic pr-4">"{finding.lineContent}"</p>
                                                                 <span className={`flex-shrink-0 font-bold text-xs px-2 py-1 rounded-full ${severityBadgeClasses[finding.severity]}`}>{finding.severity}</span>
                                                             </div>
                                                             <p className="text-slate-300"><span className="font-semibold text-slate-200">Reason:</span> {finding.reason}</p>
                                                         </div>
                                                     )
                                                 })}
                                             </div>
                                         ) : (
                                             <div className="text-center p-3 bg-green-900/30 border border-green-700 rounded-lg">
                                                 <p className="font-medium text-green-300">✅ No significant signs of fabrication or AI-generated content detected.</p>
                                             </div>
                                         )}
                                     </div>
                                     
                                     <div className="p-4 bg-slate-800 rounded-lg">
                                         <h3 className="text-lg font-semibold text-blue-400 mb-3">🔑 Keyword Overlap</h3>
                                         <div className="flex flex-wrap gap-2">
                                             {analysisResult.keywordOverlap.map((keyword, index) => (
                                                 <span key={index} className="bg-slate-700 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">{keyword}</span>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                             )}
                            {generatedResume && mode === 'generator' && (
                                <div className="bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-700 animate-fade-in space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-3xl font-bold text-cyan-400">Generated Resume</h2>
                                        <button 
                                            onClick={copyToClipboard}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition-colors duration-300 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            Copy
                                        </button>
                                    </div>
                                    <textarea
                                        readOnly
                                        value={generatedResume}
                                        className="w-full h-[500px] p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-y"
                                    />
                                </div>
                            )}
                         </div>
                     </main>
                 </div>
        </>
     );
 };

 const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [guestSession, setGuestSession] = useState<{ usageCount: number; guestId: string }>({ usageCount: 0, guestId: '' });
    const [page, setPage] = useState<'main' | 'about' | 'pricing' | 'payment' | 'admin'>('main');
    const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [postAuthAction, setPostAuthAction] = useState<(() => void) | null>(null);

    const loadSession = useCallback(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        if (!user) {
            const guest = authService.getGuestSession();
            setGuestSession(guest);
        }
    }, []);
    
    useEffect(() => {
        loadSession();
    }, [loadSession]);

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setPage('main');
        loadSession(); // Load guest session after logout
    };

    const handleNavigate = (page: 'pricing') => {
        if (!currentUser) {
            setPostAuthAction(() => () => setPage('pricing'));
            setShowAuthModal(true);
        } else {
            setPage(page);
        }
    }

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        setShowAuthModal(false);
        if (postAuthAction) {
            postAuthAction();
            setPostAuthAction(null);
        }
    }

    const handlePlanSelected = (plan: Plan) => {
        if (plan === 'free') {
            alert("You are on the Free plan.");
            return;
        }
        setTargetPlan(plan);
        setPage('payment');
    };

    const handlePaymentSuccess = async () => {
        if (!targetPlan) return;
        try {
            const updatedUser = await authService.upgradePlan(targetPlan);
            setCurrentUser(updatedUser);
            alert(`Successfully upgraded to the ${targetPlan} plan!`);
            setPage('main');
            setTargetPlan(null);
        } catch (error) {
            console.error(error);
            alert("Failed to upgrade plan.");
        }
    };
    
    const userForApp: Partial<User> & { guestId?: string } = currentUser || {
        plan: 'free',
        usageCount: guestSession.usageCount,
        guestId: guestSession.guestId,
    };
    
    const userIdForTracking = currentUser?.email || guestSession?.guestId || 'unknown';

    const renderPage = () => {
        switch (page) {
            case 'admin':
                return <AdminPage onBack={() => setPage('main')} />;
            case 'about':
                return <AboutPage onBack={() => setPage('main')} />;
            case 'pricing':
                return (
                    <>
                        <PricingPage user={userForApp} onPlanSelected={handlePlanSelected} />
                        <div className="text-center mt-8">
                             <button onClick={() => setPage('main')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors">
                                 &larr; Back to Main App
                             </button>
                         </div>
                    </>
                );
            case 'payment':
                 if (!targetPlan || targetPlan === 'free') {
                     setPage('pricing');
                     return null;
                 }
                 return <PaymentPage plan={targetPlan} onPaymentSuccess={handlePaymentSuccess} onBack={() => setPage('pricing')} />;
            case 'main':
            default:
                return (
                    <>
                        <MainApp userId={userIdForTracking} user={userForApp} onLogout={handleLogout} onNavigate={handleNavigate} onUsageUpdate={loadSession} />
                        <footer className="fixed bottom-4 right-6 text-right">
                           <div className="group">
                               <button
                                   onClick={() => setPage('about')}
                                   className="bg-transparent border-none p-0 cursor-pointer"
                               >
                                   <span className="flicker-effect font-sans text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-300">
                                       Created by Atul Pal
                                   </span>
                               </button>
                           </div>
                           <div className="mt-1">
                                <button
                                    onClick={() => setPage('admin')}
                                    className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    Admin Panel
                                </button>
                           </div>
                       </footer>
                    </>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 font-sans">
            {showAuthModal && <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowAuthModal(false)} />}
            {renderPage()}
        </div>
    );
 };
 
 export default App;
