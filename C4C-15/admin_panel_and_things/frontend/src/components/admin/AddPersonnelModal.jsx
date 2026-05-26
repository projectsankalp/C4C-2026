import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

export default function AddPersonnelModal({ onClose, onSave, existingUsers = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'DOCTOR',
    phc: '',
    village: '',
    status: 'ACTIVE'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.username.trim() || !formData.password || !formData.phc.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.role === 'ADMIN') {
      setError('Cannot create ADMIN accounts from this panel.');
      return;
    }

    // Check for duplicate login ID
    const isDuplicate = existingUsers.some(
      u => u.username === formData.username || u.loginId === formData.username || u.email === formData.username
    );
    if (isDuplicate) {
      setError('An operational account already exists with this login ID.');
      return;
    }

    const newUser = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      password: formData.password,
      role: formData.role,
      phcId: formData.phc.trim(),
      village: formData.village.trim() || undefined,
      status: formData.status
    };

    onSave(newUser);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border-primary/50 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 border-b border-border-primary/50 bg-surface-2/30 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-text-main">Add Personnel</h2>
            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">Create New Operational Account</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-4 p-3 bg-status-red/10 border border-status-red/30 rounded-lg text-sm font-semibold text-status-red">
              {error}
            </div>
          )}

          <form id="add-personnel-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-surface-2 border border-border-primary/50 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-accent-primary"
                placeholder="Dr. Example Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-surface-2 border border-border-primary/50 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-accent-primary"
                  placeholder="doctor1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-surface-2 border border-border-primary/50 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-accent-primary appearance-none"
                >
                  <option value="DOCTOR">DOCTOR</option>
                  <option value="ASHA">ASHA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Temporary Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-surface-2 border border-border-primary/50 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-accent-primary pr-10"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] font-medium text-text-muted/70 mt-1">Personnel should change password after first login.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Assigned PHC *</label>
                <input
                  type="text"
                  name="phc"
                  value={formData.phc}
                  onChange={handleChange}
                  className="w-full bg-surface-2 border border-border-primary/50 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-accent-primary"
                  placeholder="Bantwal PHC"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Village (Optional)</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full bg-surface-2 border border-border-primary/50 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-accent-primary"
                  placeholder="Kalladka"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-surface-2 border border-border-primary/50 rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-accent-primary appearance-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border-primary/30 px-5 py-3">
          <button onClick={onClose} className="inline-flex items-center justify-center rounded-lg border border-border-primary/50 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition duration-200 hover:bg-surface-3 hover:text-text-primary">
            Cancel
          </button>
          <button 
            form="add-personnel-form"
            type="submit" 
            className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-3.5 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
