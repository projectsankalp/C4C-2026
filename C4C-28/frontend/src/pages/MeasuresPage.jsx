import React, { useState, useEffect } from 'react';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import { t } from '../services/i18n';
import { Shield, CheckCircle, Award, Compass, Heart, AlertTriangle, Users } from 'lucide-react';

const MeasuresPage = () => {
  const [completedActions, setCompletedActions] = useState([]);

  // Load completed actions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sv_completed_measures');
    if (saved) {
      try {
        setCompletedActions(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing completed measures', e);
      }
    }
  }, []);

  const categories = [
    {
      id: 'preventive',
      titleKey: 'categoryPreventive',
      icon: <Compass size={22} color="var(--color-accent-green)" />,
      actions: [
        { id: 'avoid_burning', titleKey: 'actAvoidBurningTitle', descKey: 'actAvoidBurningDesc' },
        { id: 'improved_cookstoves', titleKey: 'actCookstovesTitle', descKey: 'actCookstovesDesc' },
        { id: 'plant_trees', titleKey: 'actPlantTreesTitle', descKey: 'actPlantTreesDesc' },
        { id: 'wet_sweeping', titleKey: 'actWetSweepingTitle', descKey: 'actWetSweepingDesc' },
      ]
    },
    {
      id: 'monitoring',
      titleKey: 'categoryMonitoring',
      icon: <Shield size={22} color="var(--color-primary)" />,
      actions: [
        { id: 'report_pollution', titleKey: 'actReportPollutionTitle', descKey: 'actReportPollutionDesc' },
        { id: 'check_aqi', titleKey: 'actCheckAQITitle', descKey: 'actCheckAQIDesc' },
        { id: 'log_observations', titleKey: 'actLogObsTitle', descKey: 'actLogObsDesc' },
      ]
    },
    {
      id: 'health',
      titleKey: 'categoryHealth',
      icon: <Heart size={22} color="#DC2626" />,
      actions: [
        { id: 'wear_masks', titleKey: 'actWearMasksTitle', descKey: 'actWearMasksDesc' },
        { id: 'close_windows', titleKey: 'actCloseWindowsTitle', descKey: 'actCloseWindowsDesc' },
      ]
    },
    {
      id: 'leadership',
      titleKey: 'categoryLeadership',
      icon: <Users size={22} color="var(--color-secondary)" />,
      actions: [
        { id: 'no_burn_day', titleKey: 'actNoBurnDayTitle', descKey: 'actNoBurnDayDesc' },
      ]
    }
  ];

  const totalActions = categories.reduce((sum, cat) => sum + cat.actions.length, 0);
  const completedCount = completedActions.length;
  const progressPercent = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  const handleToggleAction = (id) => {
    let updated;
    if (completedActions.includes(id)) {
      updated = completedActions.filter(item => item !== id);
    } else {
      updated = [...completedActions, id];
    }
    setCompletedActions(updated);
    localStorage.setItem('sv_completed_measures', JSON.stringify(updated));
  };

  const getProgressMessage = (percent) => {
    if (percent === 0) return 'Get started to improve your village air quality ranking!';
    if (percent < 40) return 'Great start! Keep adopting clean air habits.';
    if (percent < 80) return 'Awesome progress! Your actions are helping improve your village rank.';
    if (percent < 100) return 'Superb leadership! You are a true Clean Air Champion.';
    return 'Outstanding! 100% committed. Your actions are a model for all villages!';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole="citizen" />
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>
          
          {/* Header */}
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={26} color="var(--color-accent-green)" /> {t('measuresTitle')}
              </h2>
              <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '6px' }}>
                {t('measuresSubtitle')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(19,136,8,0.1)', color: 'var(--color-accent-green)', borderRadius: '24px', fontSize: '13px', fontWeight: 600 }}>
              <Award size={18} />
              <span>Rank Multiplier Active</span>
            </div>
          </div>

          {/* Progress Dashboard Card */}
          <div className="card" style={{ 
            padding: '24px', 
            marginBottom: '32px', 
            borderRadius: '12px', 
            border: '1px solid var(--color-border-light)', 
            background: 'linear-gradient(135deg, #1B3A5C 0%, #0F2440 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(27, 58, 92, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#93C5FD', fontWeight: 600 }}>
                  Community Impact Status
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600 }}>
                  {getProgressMessage(progressPercent)}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {progressPercent}%
                </div>
                <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  {completedCount} of {totalActions} Actions Adopted
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                backgroundColor: 'var(--color-primary)', 
                borderRadius: '6px', 
                transition: 'width 0.4s ease-in-out' 
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#93C5FD' }}>
              <span>Level 1: Daily Awareness</span>
              <span>Level 2: Active Supporter</span>
              <span>Level 3: Village Leader</span>
            </div>
          </div>

          {/* Guidelines Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
            {categories.map((category) => (
              <div key={category.id} className="card" style={{ 
                padding: '24px', 
                borderRadius: '12px', 
                border: '1px solid var(--color-border-light)', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--color-bg-alt)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {category.icon}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                    {t(category.titleKey)}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {category.actions.map((action) => {
                    const isChecked = completedActions.includes(action.id);
                    return (
                      <div 
                        key={action.id} 
                        onClick={() => handleToggleAction(action.id)}
                        style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          border: isChecked ? '1px solid rgba(19,136,8,0.2)' : '1px solid var(--color-border-light)',
                          backgroundColor: isChecked ? 'rgba(19,136,8,0.02)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          alignItems: 'flex-start'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ marginTop: '2px', color: isChecked ? 'var(--color-accent-green)' : '#9CA3AF' }}>
                          <CheckCircle size={20} fill={isChecked ? 'var(--color-accent-green)' : 'none'} color={isChecked ? '#fff' : 'currentColor'} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: isChecked ? 'var(--color-accent-green)' : 'var(--color-secondary)',
                            textDecoration: isChecked ? 'line-through' : 'none'
                          }}>
                            {t(action.titleKey)}
                          </h4>
                          <p style={{ 
                            margin: '4px 0 0 0', 
                            fontSize: '12px', 
                            color: '#6B7280',
                            lineHeight: '1.4'
                          }}>
                            {t(action.descKey)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Ranking Advisory Note */}
          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            backgroundColor: '#FFFBEB', 
            border: '1px solid #F59E0B', 
            borderRadius: '8px', 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'flex-start' 
          }}>
            <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#B45309' }}>
                Why Clean Air Actions Matter
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#D97706', lineHeight: '1.4' }}>
                Each action you check contributes to real air quality improvements in your village. When nodes register cleaner air over time, your village score increases, propelling you higher on the rankings and unlocking official clean-air rewards.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default MeasuresPage;
