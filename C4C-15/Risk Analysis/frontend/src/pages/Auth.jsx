import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Calendar, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('35');

  // If already logged in, redirect to home
  useEffect(() => {
    const activeSession = localStorage.getItem('health_user');
    if (activeSession) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mock processing timeout for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      if (isLogin) {
        // Sign In logic
        const registry = JSON.parse(localStorage.getItem('users_registry')) || [];
        const matchedUser = registry.find((u) => u.email === email && u.password === password);

        if (!matchedUser) {
          setError("Invalid email address or password combination. Try signing up!");
          setLoading(false);
          return;
        }

        // Save active session
        localStorage.setItem('health_user', JSON.stringify({
          name: matchedUser.name,
          email: matchedUser.email,
          age: matchedUser.age,
          id: matchedUser.id
        }));
      } else {
        // Sign Up logic
        if (!name || !email || !password || !age) {
          setError("All registration fields must be completed.");
          setLoading(false);
          return;
        }

        const registry = JSON.parse(localStorage.getItem('users_registry')) || [];
        if (registry.some((u) => u.email === email)) {
          setError("An account is already registered with this email address.");
          setLoading(false);
          return;
        }

        const newUser = {
          id: `patient_${Date.now()}`,
          name,
          email,
          password,
          age: Number(age)
        };

        // Register user and set session
        registry.push(newUser);
        localStorage.setItem('users_registry', JSON.stringify(registry));
        localStorage.setItem('health_user', JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          age: newUser.age,
          id: newUser.id
        }));
      }

      // Dispatch event to force Navbar and other components to sync session instantly
      window.dispatchEvent(new Event('auth-update'));
      navigate('/');
    } catch (err) {
      setError("An unexpected error occurred during profile synchronization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <div className="bg-tealhealth-500/10 dark:bg-tealhealth-500/20 p-4 rounded-3xl inline-block border border-tealhealth-500/20 mb-3 animate-pulse">
          <ShieldCheck className="h-10 w-10 text-tealhealth-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {isLogin ? "Welcome Back to HealAI" : "Register Patient Account"}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {isLogin ? "Sign in to access history and personalize advisory reports." : "Create a patient profile to automatically customize assessment baseline records."}
        </p>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/20 shadow-lg space-y-6">
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="patient@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Secret Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Age (Years)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  placeholder="35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-tealhealth-600 via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-bold py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
            ) : isLogin ? (
              <>
                <LogIn className="h-4 w-4" />
                <span>Patient Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Patient Profile</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-650 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}
