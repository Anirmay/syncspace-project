import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// --- SVG Icons (no changes) ---
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>;
const GoogleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11v2.4h3.97c-.16 1.02-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42s1.95-4.42 4.34-4.42c1.36 0 2.27.58 2.79 1.08l1.9-1.83c-1.22-1.14-2.8-1.83-4.69-1.83-3.87 0-7 3.13-7 7s3.13 7 7 7c4.08 0 6.7-2.84 6.7-6.84 0-.46-.05-.91-.11-1.36h-6.59z"></path></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.98v16h4.98v-9.099c0-2.198 1.226-3.901 3.518-3.901s3.484 1.703 3.484 3.901v9.099h4.98v-10.373c0-4.529-2.585-7.627-6.281-7.627s-5.698 3.101-5.698 3.101v-2.101z"></path></svg>;

const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const [signUpData, setSignUpData] = useState({ username: '', email: '', password: '' });
    const [signInData, setSignInData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location.pathname === '/register') {
            setIsSignUp(true);
        } else {
            setIsSignUp(false);
        }
    }, [location.pathname]);

    const handleSignUpClick = () => { setIsSignUp(true); setError(null); };
    const handleSignInClick = () => { setIsSignUp(false); setError(null); };
    const handleSignUpChange = (e) => { setSignUpData({ ...signUpData, [e.target.name]: e.target.value }); };
    const handleSignInChange = (e) => { setSignInData({ ...signInData, [e.target.name]: e.target.value }); };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post('http://localhost:5000/api/auth/register', signUpData);
            alert('Registration successful! Please sign in.');
            setIsSignUp(false);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
            setLoading(false);
        }
    };

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', signInData);
            login(res.data);
            navigate('/');
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
            setLoading(false);
        }
    };

    const containerClassName = `auth-container ${isSignUp ? 'right-panel-active show-signup' : ''}`;

    const AuthStyles = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&display=swap');
            
            :root {
                /* --- UPDATED COLORS --- */
                --accent-color: #4F46E5; /* Indigo */
                --primary-text-color: #E5E7EB; /* Light Gray */
                --overlay-gradient: linear-gradient(to right, #4F46E5, #6366F1);
            }
            
            .auth-page-wrapper {
                font-family: 'Poppins', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #0F172A; /* Dark Slate Background */
                overflow: hidden;
            }
            /* --- UPDATED: Increased heading size & set color to white --- */
            .auth-page-wrapper h1 { 
                font-weight: 700; 
                margin-bottom: 1rem; 
                font-size: 2.5rem; 
                color: #FFFFFF;
            } 
            
            .auth-page-wrapper p { font-size: 14px; font-weight: 300; line-height: 20px; letter-spacing: 0.5px; margin: 20px 0 30px; color: #9CA3AF; }
            .auth-page-wrapper span { font-size: 12px; color: #9CA3AF; }
            .auth-page-wrapper a { color: var(--accent-color); font-size: 14px; text-decoration: none; margin: 15px 0; }
            .auth-page-wrapper a:hover { text-decoration: underline; }
            
            /* --- UPDATED: Dark theme for inputs --- */
            .auth-page-wrapper input, .auth-page-wrapper select { 
                background-color: #334155; /* Slate 700 */
                border: 1px solid #475569; /* Slate 600 */
                color: #FFFFFF;
                padding: 12px 15px; 
                margin: 8px 0; 
                width: 90%; /* Increased width */
                border-radius: 8px; 
                transition: all 0.3s ease; 
            }
            .auth-page-wrapper input::placeholder {
                color: #9CA3AF; /* Slate 400 */
            }
            .auth-page-wrapper input:focus, .auth-page-wrapper select:focus { 
                outline: none; 
                border-color: var(--accent-color); 
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3); 
            }
            
            /* --- UPDATED: Increased button text size (already done) --- */
            .auth-page-wrapper button { 
                font-family: 'Poppins', sans-serif; border-radius: 20px; border: 1px solid var(--accent-color); 
                background-color: var(--accent-color); color: #FFFFFF; 
                font-size: 14px; /* Increased font size */
                font-weight: bold; padding: 12px 45px; letter-spacing: 1px; text-transform: uppercase; 
                transition: transform 80ms ease-in; cursor: pointer; margin-top: 10px; 
            }
            .auth-page-wrapper button:disabled { background-color: #475569; border-color: #475569; cursor: not-allowed; }
            .auth-page-wrapper button:active { transform: scale(0.95); }
            .auth-page-wrapper button.ghost { background-color: transparent; border-color: #FFFFFF; }
            
            /* --- UPDATED: Dark theme for social buttons --- */
            .social-container { margin: 20px 0; }
            .social-container a { 
                border: 1px solid #475569; /* Slate 600 */
                border-radius: 50%; 
                display: inline-flex; 
                justify-content: center; 
                align-items: center; 
                margin: 0 5px; 
                height: 40px; 
                width: 40px; 
                transition: all 0.3s ease-in-out; 
                color: #E5E7EB; /* Light Gray Icon */
            }
            .social-container a:hover { transform: scale(1.1); background-color: var(--accent-color); color: #fff; border-color: var(--accent-color); }
            .social-container svg { width: 20px; height: 20px; }
            
            .auth-container { background: transparent; width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative; overflow: hidden; }
            
            /* --- UPDATED: Dark theme for mobile tabs --- */
            .mobile-tabs { display: flex; width: 100%; background-color: #1E293B; /* Slate 800 */ z-index: 10; position: absolute; top: 0; }
            .mobile-tab { flex: 1; padding: 15px; text-align: center; background: none; border: none; border-bottom: 3px solid transparent; color: var(--primary-text-color); font-size: 14px; font-weight: 700; transition: all 0.3s ease; }
            .mobile-tab.active { color: var(--accent-color); border-bottom: 3px solid var(--accent-color); }
            
            .form-wrapper { flex-grow: 1; position: relative; width: 100%; display: flex; justify-content: center; align-items: center; padding: 20px; padding-top: 80px; }
            
            /* --- UPDATED: Dark theme for form container --- */
            .form-container { 
                background-color: #1E293B; /* Slate 800 */
                position: absolute; 
                width: calc(100% - 40px); 
                max-width: 400px; 
                height: auto; 
                transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out; 
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                padding: 40px 30px; 
                border-radius: 12px; 
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* Darker shadow */
            }
            .form-container form { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .error-message { color: #F87171; /* Lighter Red */ font-size: 12px; margin-top: 10px; height: 15px; }
            .sign-up-container { opacity: 0; transform: translateY(100%); z-index: 1; pointer-events: none; }
            .sign-in-container { opacity: 1; transform: translateY(0); z-index: 2; }
            .auth-container.show-signup .sign-in-container { opacity: 0; transform: translateY(-100%); z-index: 1; pointer-events: none; }
            .auth-container.show-signup .sign-up-container { opacity: 1; transform: translateY(0); z-index: 5; pointer-events: auto; }
            .overlay-container { display: none; }
            
            @media (min-width: 768px) {
                .auth-page-wrapper { background: #0F172A; /* Dark Slate Background */ }
                .mobile-tabs { display: none; }
                .form-wrapper { padding: 0; display: block; flex-grow: 0; position: static; }
                
                /* --- UPDATED: Dark theme for desktop container --- */
                .auth-container { 
                    background-color: #1E293B; /* Slate 800 */
                    border-radius: 10px; 
                    box-shadow: 0 14px 28px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3); 
                    position: relative; overflow: hidden; width: 850px; max-width: 100%; min-height: 520px; height: auto; flex-direction: row; 
                }
                .form-container { position: absolute; top: 0; height: 100%; width: 50%; max-width: none; box-shadow: none; border-radius: 0; opacity: 1; transform: none; transition: all 0.6s ease-in-out; }
                .form-container form { height: 100%; padding: 0; }
                .sign-in-container { right: 50%; z-index: 2; padding: 0 40px; }
                .sign-up-container { right: 50%; opacity: 0; z-index: 1; padding: 0 40px; }
                .auth-container.right-panel-active .sign-in-container { transform: translateX(100%); }
                .auth-container.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
                @keyframes show { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
                .overlay-container { display: block; position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
                .auth-container.right-panel-active .overlay-container { transform: translateX(-100%); }
                .overlay { background: var(--overlay-gradient); color: #FFFFFF; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                .auth-container.right-panel-active .overlay { transform: translateX(50%); }
                .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; top: 0; height: 100%; width: 50%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                .overlay-panel p { color: #FFFFFF; } /* Added */
                .overlay-left { transform: translateX(-20%); }
                .overlay-left h1 { color: #FFFFFF; } /* Added */
                .overlay-right { right: 0; transform: translateX(0); }
                .overlay-right h1 { font-size: 2.25rem; color: #FFFFFF; } /* Updated */
                .auth-container.right-panel-active .overlay-left { transform: translateX(0); }
                .auth-container.right-panel-active .overlay-right { transform: translateX(20%); }
            }
        `}</style>
    );

    return (
        <div className="auth-page-wrapper">
            <AuthStyles />
            <div className={containerClassName}>

                {/* Mobile-Only Tabs */}
                <div className="mobile-tabs">
                    <button className={`mobile-tab ${!isSignUp ? 'active' : ''}`} onClick={handleSignInClick}>SIGN IN</button>
                    <button className={`mobile-tab ${isSignUp ? 'active' : ''}`} onClick={handleSignUpClick}>SIGN UP</button>
                </div>

                <div className="form-wrapper">
                    {/* Sign Up Form */}
                    <div className="form-container sign-up-container">
                        <form onSubmit={handleSignUpSubmit}>
                            <h1>Create Account</h1>
                            <div className="social-container">
                                <a href="#" className="social"><FacebookIcon /></a>
                                <a href="#" className="social"><GoogleIcon /></a>
                                <a href="#" className="social"><LinkedinIcon /></a>
                            </div>
                            <span>or use your email for registration</span>
                            <input type="text" placeholder="Username" name="username" value={signUpData.username} onChange={handleSignUpChange} required />
                            <input typeMIMEType="email" placeholder="Email" name="email" value={signUpData.email} onChange={handleSignUpChange} required />
                            <input type="password" placeholder="Password" name="password" value={signUpData.password} onChange={handleSignUpChange} required />
                            
                            <div className="error-message">{isSignUp ? error : ''}</div>
                            <button type="submit" disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>
                        </form>
                    </div>

                    {/* Sign In Form */}
                    <div className="form-container sign-in-container">
                        <form onSubmit={handleSignInSubmit}>
                            <h1>Sign In</h1>
                            <div className="social-container">
                                <a href="#" className="social"><FacebookIcon /></a>
                                <a href="#" className="social"><GoogleIcon /></a>
                                <a href="#" className="social"><LinkedinIcon /></a>
                            </div>
                            <span>or use your account</span>
                            <input type="email" placeholder="Email" name="email" value={signInData.email} onChange={handleSignInChange} required />
                            <input type="password" placeholder="Password" name="password" value={signInData.password} onChange={handleSignInChange} required />
                            
                            <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 my-3 inline-block">Forgot your password?</Link> 

                            <div className="error-message" style={{ marginTop: '5px' }}>{!isSignUp ? error : ''}</div>
                            <button type="submit" disabled={loading} style={{ marginTop: '5px' }}>{loading ? 'Signing In...' : 'Sign In'}</button>
                        </form>
                    </div>
                </div>

                {/* Desktop-Only Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost" onClick={handleSignInClick}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start <br /> your journey with us</p>
                            <button className="ghost" onClick={handleSignUpClick}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

