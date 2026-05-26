/**
 * GraamSehat Admin Dashboard - Top Bar Component
 * Location: /src/components/TopBar.jsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { logoutAdmin } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import './TopBar.css';

export default function TopBar({ toggleSidebar }) {
  const { currentAdmin, notifications, clearNotification } = useAdmin();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleNotifClick = (patientId, notifId) => {
    clearNotification(notifId);
    setShowNotifMenu(false);
    navigate(`/patient/${patientId}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <h2 className="top-bar-title">GraamSehat Admin</h2>
      </div>

      <div className="top-bar-right">
        {/* Notifications Bell */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <button 
            className="notif-btn" 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifMenu && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>System Alerts</h3>
                {notifications.length > 0 && (
                  <span className="alert-count">{notifications.length} new</span>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No new high-risk alerts.</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="notif-item">
                      <div className="notif-item-icon">
                        <ShieldAlert size={16} className="notif-alert-icon" />
                      </div>
                      <div className="notif-item-body">
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-time">Just now</span>
                        <div className="notif-actions">
                          <button 
                            className="notif-action-btn view-btn"
                            onClick={() => handleNotifClick(notif.patientId, notif.id)}
                          >
                            View Patient
                          </button>
                          <button 
                            className="notif-action-btn dismiss-btn"
                            onClick={() => clearNotification(notif.id)}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile details */}
        <div className="top-bar-profile">
          <span className="profile-name">
            {currentAdmin ? `Welcome, ${currentAdmin.name || 'Admin'}` : 'Admin'}
          </span>
          <span className="profile-role">District Officer</span>
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout} title="Sign Out">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
