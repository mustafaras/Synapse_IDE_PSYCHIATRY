

import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiClock, FiCoffee, FiEdit3, FiX, FiZap, FiUsers, FiBookOpen, FiTrendingUp, FiAward, FiTarget, FiCheckCircle } from 'react-icons/fi';

interface CoachingAlert {
  id: string;
  type: 'pacing' | 'break' | 'documentation' | 'burnout' | 'collaboration' | 'evidence-based' | 'supervision' | 'workflow' | 'quality' | 'achievement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  action?: {
    label: string;
    callback: () => void;
  };
  dismissable: boolean;
  timestamp: number;
  category?: 'clinical' | 'productivity' | 'wellbeing' | 'collaboration' | 'learning';
  tags?: string[];
}

interface RealTimeCoachingProps {
  sessionDuration: number;
  isRunning: boolean;
  lapCount: number;
  avgLapDuration?: number | undefined;
  onBreakRequest?: (() => void) | undefined;
  onDocumentationRequest?: (() => void) | undefined;
  enabled?: boolean | undefined;
  pendingWorkflowCount?: number;
  unreadTemplateCount?: number;
  activeTeamMembers?: number;
  sessionType?: 'individual' | 'supervision' | 'consultation' | 'documentation';
  clinicalComplexity?: 'routine' | 'moderate' | 'complex' | 'crisis';
  onCollaborationRequest?: (() => void) | undefined;
  onWorkflowCheck?: (() => void) | undefined;
  onEvidenceBasedGuidance?: (() => void) | undefined;
}

const ALERT_THRESHOLDS = {
  PACING_SLOW: 15 * 60 * 1000,
  PACING_FAST: 5 * 60 * 1000,
  BREAK_REMINDER: 45 * 60 * 1000,
  DOCUMENTATION_PROMPT: 50 * 60 * 1000,
  BURNOUT_WARNING: 90 * 60 * 1000,
  SUPERVISION_CHECK: 30 * 60 * 1000,
  WORKFLOW_REMINDER: 20 * 60 * 1000,
  COLLABORATION_PROMPT: 35 * 60 * 1000,
  EVIDENCE_REVIEW: 25 * 60 * 1000,
  QUALITY_CHECKPOINT: 40 * 60 * 1000,
  ACHIEVEMENT_MILESTONE: 60 * 60 * 1000,
};

export const RealTimeCoaching: React.FC<RealTimeCoachingProps> = ({
  sessionDuration,
  isRunning,
  lapCount,
  avgLapDuration,
  onBreakRequest,
  onDocumentationRequest,
  enabled = true,
  pendingWorkflowCount = 0,
  unreadTemplateCount = 0,
  activeTeamMembers = 0,
  sessionType = 'individual',
  clinicalComplexity = 'routine',
  onCollaborationRequest,
  onWorkflowCheck,
  onEvidenceBasedGuidance,
}) => {
  const [alerts, setAlerts] = useState<CoachingAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !isRunning) return;

    const newAlerts: CoachingAlert[] = [];
    const now = Date.now();

    if (lapCount > 2 && avgLapDuration) {
      const alertId = 'pacing';
      if (!dismissedAlerts.has(alertId)) {
        if (avgLapDuration > ALERT_THRESHOLDS.PACING_SLOW) {
          newAlerts.push({
            id: alertId,
            type: 'pacing',
            priority: 'medium',
            title: 'Pacing Notice',
            message: `Average checkpoint duration: ${Math.round(avgLapDuration / 60000)} min. Consider tightening focus intervals for better flow.`,
            dismissable: true,
            timestamp: now,
          });
        } else if (avgLapDuration < ALERT_THRESHOLDS.PACING_FAST) {
          newAlerts.push({
            id: alertId,
            type: 'pacing',
            priority: 'low',
            title: 'Excellent Pacing',
            message: 'You\'re maintaining efficient checkpoint intervals. Keep up the focused work!',
            dismissable: true,
            timestamp: now,
          });
        }
      }
    }

    if (sessionDuration >= ALERT_THRESHOLDS.BREAK_REMINDER && sessionDuration < ALERT_THRESHOLDS.BREAK_REMINDER + 60000) {
      const alertId = 'break-45min';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'break',
          priority: 'high',
          title: 'Break Recommended',
          message: 'You\'ve been working for 45 minutes. A 5-minute break can improve focus and prevent fatigue.',
          action: {
            label: 'Pause Timer',
            callback: () => {
              onBreakRequest?.();
              dismissAlert(alertId);
            },
          },
          dismissable: true,
          timestamp: now,
        });
      }
    }

    if (sessionDuration >= ALERT_THRESHOLDS.DOCUMENTATION_PROMPT && sessionDuration < ALERT_THRESHOLDS.DOCUMENTATION_PROMPT + 60000) {
      const alertId = 'documentation-50min';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'documentation',
          priority: 'medium',
          title: 'Documentation Reminder',
          message: 'Consider documenting key observations before ending the session.',
          action: {
            label: 'Open Notes',
            callback: () => {
              onDocumentationRequest?.();
              dismissAlert(alertId);
            },
          },
          dismissable: true,
          timestamp: now,
        });
      }
    }

    if (sessionDuration >= ALERT_THRESHOLDS.BURNOUT_WARNING && sessionDuration < ALERT_THRESHOLDS.BURNOUT_WARNING + 60000) {
      const alertId = 'burnout-90min';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'burnout',
          priority: 'high',
          title: 'Extended Session Alert',
          message: 'You\'ve been working for 90 minutes. Extended sessions increase fatigue. Please take a break.',
          action: {
            label: 'Take Break',
            callback: () => {
              onBreakRequest?.();
              dismissAlert(alertId);
            },
          },
          dismissable: true,
          timestamp: now,
          category: 'wellbeing',
          tags: ['burnout-prevention', 'self-care'],
        });
      }
    }
    
    if (sessionType === 'individual' && clinicalComplexity === 'complex' && sessionDuration >= ALERT_THRESHOLDS.SUPERVISION_CHECK && sessionDuration < ALERT_THRESHOLDS.SUPERVISION_CHECK + 60000) {
      const alertId = 'supervision-complex';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'supervision',
          priority: 'high',
          title: 'Supervision Recommended',
          message: 'Complex case detected. Consider consulting with supervisor or peer for case conceptualization and treatment planning.',
          action: {
            label: 'Request Consultation',
            callback: () => {
              onCollaborationRequest?.();
              dismissAlert(alertId);
            },
          },
          dismissable: true,
          timestamp: now,
          category: 'clinical',
          tags: ['supervision', 'complex-case', 'consultation'],
        });
      }
    }

    if (pendingWorkflowCount > 0 && sessionDuration >= ALERT_THRESHOLDS.WORKFLOW_REMINDER && sessionDuration < ALERT_THRESHOLDS.WORKFLOW_REMINDER + 60000) {
      const alertId = 'workflow-pending';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'workflow',
          priority: 'medium',
          title: 'Pending Workflows',
          message: `You have ${pendingWorkflowCount} pending workflow${pendingWorkflowCount > 1 ? 's' : ''} requiring attention. Review consultations, peer reviews, or supervision requests.`,
          action: {
            label: 'Review Workflows',
            callback: () => {
              onWorkflowCheck?.();
              dismissAlert(alertId);
            },
          },
          dismissable: true,
          timestamp: now,
          category: 'collaboration',
          tags: ['workflow', 'team', 'pending-tasks'],
        });
      }
    }

    if (activeTeamMembers > 0 && sessionDuration >= ALERT_THRESHOLDS.COLLABORATION_PROMPT && sessionDuration < ALERT_THRESHOLDS.COLLABORATION_PROMPT + 60000) {
      const alertId = 'team-collaboration';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'collaboration',
          priority: 'low',
          title: 'Team Available',
          message: `${activeTeamMembers} team member${activeTeamMembers > 1 ? 's are' : ' is'} currently online. Consider collaborative case discussion or template sharing.`,
          action: {
            label: 'Open Hub',
            callback: () => {
              onCollaborationRequest?.();
              dismissAlert(alertId);
            },
          },
          dismissable: true,
          timestamp: now,
          category: 'collaboration',
          tags: ['team', 'real-time', 'collaboration'],
        });
      }
    }

    if (unreadTemplateCount > 0 && sessionDuration >= ALERT_THRESHOLDS.EVIDENCE_REVIEW && sessionDuration < ALERT_THRESHOLDS.EVIDENCE_REVIEW + 60000) {
      const alertId = 'evidence-templates';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'evidence-based',
          priority: 'medium',
          title: 'Evidence-Based Resources',
          message: `${unreadTemplateCount} new evidence-based template${unreadTemplateCount > 1 ? 's' : ''} available. Review protocols for EMDR, DBT, Schema Therapy, and more.`,
          action: {
            label: 'Browse Templates',
            callback: () => {
              onEvidenceBasedGuidance?.();
              dismissAlert(alertId);
            },
          },
          dismissable: true,
          timestamp: now,
          category: 'learning',
          tags: ['evidence-based', 'templates', 'protocols'],
        });
      }
    }

    if (lapCount >= 3 && sessionDuration >= ALERT_THRESHOLDS.QUALITY_CHECKPOINT && sessionDuration < ALERT_THRESHOLDS.QUALITY_CHECKPOINT + 60000) {
      const alertId = 'quality-check';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'quality',
          priority: 'medium',
          title: 'Clinical Quality Check',
          message: 'Mid-session checkpoint: Review therapeutic alliance, treatment plan adherence, and risk assessment updates.',
          dismissable: true,
          timestamp: now,
          category: 'clinical',
          tags: ['quality', 'best-practices', 'clinical-excellence'],
        });
      }
    }

    if (sessionDuration >= ALERT_THRESHOLDS.ACHIEVEMENT_MILESTONE && sessionDuration < ALERT_THRESHOLDS.ACHIEVEMENT_MILESTONE + 60000) {
      const alertId = 'achievement-60min';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'achievement',
          priority: 'low',
          title: '🎯 Session Milestone',
          message: `60-minute focused session completed! ${lapCount} checkpoints achieved. Excellent sustained concentration and clinical presence.`,
          dismissable: true,
          timestamp: now,
          category: 'wellbeing',
          tags: ['achievement', 'milestone', 'motivation'],
        });
      }
    }

    if (clinicalComplexity === 'crisis' && sessionDuration >= 5 * 60 * 1000) {
      const alertId = 'crisis-protocol';
      if (!dismissedAlerts.has(alertId)) {
        newAlerts.push({
          id: alertId,
          type: 'supervision',
          priority: 'critical',
          title: '⚠️ Crisis Protocol Active',
          message: 'Crisis session detected. Ensure: (1) Safety plan documented, (2) Collateral contact made, (3) Supervisor notified, (4) Follow-up scheduled.',
          dismissable: false,
          timestamp: now,
          category: 'clinical',
          tags: ['crisis', 'safety', 'protocol', 'urgent'],
        });
      }
    }

    setAlerts(newAlerts);
  }, [
    sessionDuration,
    isRunning,
    lapCount,
    avgLapDuration,
    enabled,
    dismissedAlerts,
    onBreakRequest,
    onDocumentationRequest,
    pendingWorkflowCount,
    unreadTemplateCount,
    activeTeamMembers,
    sessionType,
    clinicalComplexity,
    onCollaborationRequest,
    onWorkflowCheck,
    onEvidenceBasedGuidance,
  ]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.priority !== 'low'));
    }, 10000);
    return () => clearTimeout(timer);
  }, [alerts]);

  if (!enabled || alerts.length === 0) return null;

  const getAlertIcon = (type: CoachingAlert['type']) => {
    switch (type) {
      case 'pacing':
        return <FiZap size={18} />;
      case 'break':
        return <FiCoffee size={18} />;
      case 'documentation':
        return <FiEdit3 size={18} />;
      case 'burnout':
        return <FiAlertCircle size={18} />;
      case 'collaboration':
        return <FiUsers size={18} />;
      case 'evidence-based':
        return <FiBookOpen size={18} />;
      case 'supervision':
        return <FiTrendingUp size={18} />;
      case 'workflow':
        return <FiTarget size={18} />;
      case 'quality':
        return <FiCheckCircle size={18} />;
      case 'achievement':
        return <FiAward size={18} />;
      default:
        return <FiAlertCircle size={18} />;
    }
  };

  const getAlertColor = (priority: CoachingAlert['priority']) => {
    switch (priority) {
      case 'low':
        return 'rgba(163, 190, 140, 1)';
      case 'medium':
        return 'rgba(180, 180, 180, 1)';
      case 'high':
        return 'rgba(208, 135, 112, 1)';
      case 'critical':
        return 'rgba(191, 97, 106, 1)';
      default:
        return 'rgba(180, 180, 180, 1)';
    }
  };

  const getCategoryBadgeColor = (category: CoachingAlert['category']) => {
    switch (category) {
      case 'clinical':
        return 'rgba(140, 140, 140, 0.15)';
      case 'productivity':
        return 'rgba(140, 140, 140, 0.15)';
      case 'wellbeing':
        return 'rgba(163, 190, 140, 0.2)';
      case 'collaboration':
        return 'rgba(140, 140, 140, 0.15)';
      case 'learning':
        return 'rgba(140, 140, 140, 0.15)';
      default:
        return 'rgba(140, 140, 140, 0.15)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2147483645,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
      }}
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(13, 13, 13, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `2px solid ${getAlertColor(alert.priority)}40`,
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: `0 0 30px ${getAlertColor(alert.priority)}60, 0 8px 32px rgba(0, 0, 0, 0.6)`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              borderRadius: '12px 12px 0 0',
              background: `linear-gradient(90deg, transparent, ${getAlertColor(alert.priority)}, transparent)`,
            }}
          />
          {}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ color: getAlertColor(alert.priority), flexShrink: 0, marginTop: '2px' }}>
              {getAlertIcon(alert.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.95)',
                    letterSpacing: '0.3px',
                  }}
                >
                  {alert.title}
                </div>
                {alert.category && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: getCategoryBadgeColor(alert.category),
                    color: getAlertColor(alert.priority),
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {alert.category}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: 'rgba(255, 255, 255, 0.75)',
                }}
              >
                {alert.message}
              </div>
              {alert.tags && alert.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {alert.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '10px',
                        padding: '3px 7px',
                        borderRadius: '4px',
                        background: 'rgba(140, 140, 140, 0.15)',
                        color: 'rgba(200, 200, 200, 0.9)',
                        border: '1px solid rgba(140, 140, 140, 0.3)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {alert.dismissable === true && (
              <button
                type="button"
                onClick={() => dismissAlert(alert.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
                aria-label="Dismiss alert"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {}
          {alert.action != null && (
            <button
              type="button"
              onClick={alert.action.callback}
              style={{
                background: `linear-gradient(135deg, ${getAlertColor(alert.priority)}20, ${getAlertColor(alert.priority)}30)`,
                border: `1px solid ${getAlertColor(alert.priority)}60`,
                color: getAlertColor(alert.priority),
                fontSize: '13px',
                fontWeight: 600,
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                alignSelf: 'flex-start',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${getAlertColor(alert.priority)}30, ${getAlertColor(alert.priority)}40)`;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${getAlertColor(alert.priority)}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${getAlertColor(alert.priority)}20, ${getAlertColor(alert.priority)}30)`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {alert.action.label}
            </button>
          )}

          {}
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FiClock size={11} />
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}

      {}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
