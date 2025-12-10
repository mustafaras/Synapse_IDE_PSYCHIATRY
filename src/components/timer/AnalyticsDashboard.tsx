

import React, { Suspense } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js';

const Pie = React.lazy(() => import('react-chartjs-2').then(m => ({ default: m.Pie })));
const Line = React.lazy(() => import('react-chartjs-2').then(m => ({ default: m.Line })));
const Bar = React.lazy(() => import('react-chartjs-2').then(m => ({ default: m.Bar })));
import { format, startOfDay, subDays } from 'date-fns';
import { FiActivity, FiAlertCircle, FiBarChart2, FiCalendar, FiCheckCircle, FiClock, FiDownload, FiFileText, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';
import { CalendarHeatmap } from './CalendarHeatmap';
import { SmartNoteTemplates } from './SmartNoteTemplates';
import { exportAnalyticsToPDF, type ChartData } from '@/services/PDFExportService';
import panelStyles from './panel-unified.module.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimerSession {
  id: string;
  startTime: number;
  endTime: number;
  totalDuration: number;
  segments: Array<{
    type: string;
    duration: number;
    startTime: number;
    endTime: number;
  }>;
  laps: Array<{
    time: number;
    segment: string;
  }>;
  patientId?: string;
  patientName?: string;
}

interface AnalyticsDashboardProps {
  sessions: TimerSession[];
  currentSession?: { totalDuration: number } | null;
  onClose?: () => void;
  isLoading?: boolean;
  onLoadDemoData?: () => void;
  onShowMLInsights?: () => void;
  onTriggerAI?: () => void;
  useDemoData?: boolean;
  onToggleDemoData?: () => void;
}

const PALETTE = {
  primary: '#00A6D7',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  accent: '#A78BFA',
  muted: '#9CA3AF',
};

const cardHeaderStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '8px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.6px',
  color: '#81a1c1',
  textTransform: 'uppercase',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sessions,
  currentSession,
  isLoading = false,
  onLoadDemoData,
  onShowMLInsights,
  onTriggerAI,
  useDemoData = false,
  onToggleDemoData,
}) => {

  const [selectedSessionForNote, setSelectedSessionForNote] = React.useState<TimerSession | null>(null);

  const [isExporting, setIsExporting] = React.useState(false);

  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMetricsColumns = () => {
    if (windowWidth < 600) return 'repeat(2, 1fr)';
    if (windowWidth < 900) return 'repeat(2, 1fr)';
    return 'repeat(auto-fit, minmax(240px, 1fr))';
  };

  const getChartsColumns = () => {
    if (windowWidth < 768) return '1fr';
    return 'repeat(2, 1fr)';
  };

  const getSkeletonColumns = () => {
    if (windowWidth < 600) return 'repeat(2, 1fr)';
    return 'repeat(4, 1fr)';
  };

  const chartHeight = windowWidth < 600 ? '200px' : '240px';

  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.totalDuration, 0);
  const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions / 60000 : 0;
  const avgLapsPerSession = totalSessions > 0
    ? sessions.reduce((sum, s) => sum + (s.laps?.length || 0), 0) / totalSessions
    : 0;

  const calculateSEQ = (): number => {
    if (!currentSession || avgSessionDuration === 0) return 100;
    const currentDurationMin = currentSession.totalDuration / 60000;
    const efficiency = (avgSessionDuration / currentDurationMin) * 100;
    return Math.min(Math.max(Math.round(efficiency), 0), 200);
  };
  const seq = calculateSEQ();
  const seqStatus = seq > 120 ? 'excellent' : seq > 100 ? 'optimal' : seq > 80 ? 'good' : 'needs-attention';
  const seqColor = seq > 120 ? PALETTE.success : seq > 100 ? PALETTE.primary : seq > 80 ? PALETTE.warning : PALETTE.danger;

  const calculateCognitiveLoad = (): number => {
    if (sessions.length === 0) return 0;
    const recentSessions = sessions.slice(-5);
    const avgLaps = recentSessions.reduce((sum, s) => sum + (s.laps?.length || 0), 0) / recentSessions.length;
    const avgDuration = recentSessions.reduce((sum, s) => sum + s.totalDuration, 0) / recentSessions.length / 60000;
    const load = (avgLaps / avgDuration) * 10;
    return Math.min(Math.round(load), 10);
  };
  const cognitiveLoad = calculateCognitiveLoad();

  const insights = React.useMemo(() => {
    const tips: string[] = [];

    if (seq < 80) {
      tips.push('Session pacing is slower than baseline. Consider time-boxing interventions.');
    } else if (seq > 140) {
      tips.push('Session tempo significantly above average. Ensure thorough documentation.');
    }

    if (cognitiveLoad >= 7) {
      tips.push('High cognitive load detected. Consider scheduled breaks every 45 minutes.');
    } else if (cognitiveLoad < 3) {
      tips.push('Low engagement indicators. Review intervention density targets.');
    }

    const hourCounts = new Map<number, number>();
    sessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (peakHour && peakHour[1] > 3) {
      const hourStr = peakHour[0] === 0 ? '12am' : peakHour[0] < 12 ? `${peakHour[0]}am` : peakHour[0] === 12 ? '12pm' : `${peakHour[0] - 12}pm`;
      tips.push(`Peak performance observed around ${hourStr}. Schedule complex cases accordingly.`);
    }

    const recentVariance = sessions.slice(-7).length;
    if (recentVariance >= 5) {
      tips.push('Strong consistency maintained (5+ sessions in 7 days).');
    }

    return tips.slice(0, 4);
  }, [sessions, seq, cognitiveLoad]);

  const [insightsExpanded, setInsightsExpanded] = React.useState(false);

  const segmentStats = React.useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    sessions.forEach(s => {
      s.segments?.forEach(seg => {
        const existing = map.get(seg.type) || { total: 0, count: 0 };
        map.set(seg.type, {
          total: existing.total + seg.duration,
          count: existing.count + 1
        });
      });
    });
    return Array.from(map.entries()).map(([type, data]) => ({
      type,
      totalDuration: data.total,
      count: data.count,
      avgDuration: data.total / data.count / 60000
    }));
  }, [sessions]);

  const trendData7 = React.useMemo(() => {
    const days: Record<string, { duration: number; count: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      days[format(date, 'MM/dd')] = { duration: 0, count: 0 };
    }
    sessions.forEach(s => {
      const date = startOfDay(new Date(s.startTime));
      const key = format(date, 'MM/dd');
      if (days[key]) {
        days[key].duration += s.totalDuration / 60000;
        days[key].count += 1;
      }
    });
    return Object.entries(days).map(([date, data]) => ({
      date,
      duration: data.duration,
      count: data.count
    }));
  }, [sessions]);

  const trendData30 = React.useMemo(() => {
    const days: Record<string, { date: Date; duration: number; count: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const key = format(date, 'MM/dd');
      days[key] = { date, duration: 0, count: 0 };
    }
    sessions.forEach(s => {
      const date = startOfDay(new Date(s.startTime));
      const key = format(date, 'MM/dd');
      if (days[key]) {
        days[key].duration += s.totalDuration / 60000;
        days[key].count += 1;
      }
    });
    return Object.values(days);
  }, [sessions]);

  const movingAverages = React.useMemo(() => {
    const calculate7DayMA = () => {
      if (sessions.length < 7) return null;
      const recent7 = sessions.slice(-7);
      const avgDuration = recent7.reduce((sum, s) => sum + s.totalDuration, 0) / 7 / 60000;
      const avgLaps = recent7.reduce((sum, s) => sum + (s.laps?.length || 0), 0) / 7;
      return { duration: avgDuration, laps: avgLaps };
    };

    const calculate30DayMA = () => {
      if (sessions.length < 30) return null;
      const recent30 = sessions.slice(-30);
      const avgDuration = recent30.reduce((sum, s) => sum + s.totalDuration, 0) / 30 / 60000;
      const avgLaps = recent30.reduce((sum, s) => sum + (s.laps?.length || 0), 0) / 30;
      return { duration: avgDuration, laps: avgLaps };
    };

    return {
      day7: calculate7DayMA(),
      day30: calculate30DayMA(),
    };
  }, [sessions]);

  const trendDirection = React.useMemo(() => {
    if (sessions.length < 14) return null;

    const firstWeek = sessions.slice(-14, -7);
    const secondWeek = sessions.slice(-7);

    const firstWeekAvg = firstWeek.reduce((sum, s) => sum + s.totalDuration, 0) / 7 / 60000;
    const secondWeekAvg = secondWeek.reduce((sum, s) => sum + s.totalDuration, 0) / 7 / 60000;

    const percentChange = ((secondWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;

    return {
      change: percentChange,
      direction: percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'stable',
      label: percentChange > 5 ? 'Increasing' : percentChange < -5 ? 'Decreasing' : 'Stable'
    };
  }, [sessions]);

  const hourDistribution = React.useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    sessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hours[hour].count += 1;
    });
    return hours.filter(h => h.count > 0);
  }, [sessions]);

  const cognitiveColor =
    cognitiveLoad < 4 ? PALETTE.success :
    cognitiveLoad < 7 ? PALETTE.warning :
    PALETTE.danger;

  const cognitiveLoadStatus =
    cognitiveLoad < 4 ? 'LOW' :
    cognitiveLoad < 7 ? 'MODERATE' :
    'HIGH';

  const sessionVariability = sessions.length > 1
    ? Math.round(Math.sqrt(sessions.reduce((sum, s) => sum + Math.pow((s.totalDuration / 60000) - avgSessionDuration, 2), 0) / sessions.length))
    : 0;

  const pieData = {
    labels: segmentStats.map(s => s.type),
    datasets: [{
      data: segmentStats.map(s => s.totalDuration),
      backgroundColor: segmentStats.map((_, i) => {
        const colors = [PALETTE.primary, PALETTE.success, PALETTE.warning, PALETTE.accent, PALETTE.muted];
        return colors[i % colors.length];
      }),
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    }],
  };

  const lineData = {
    labels: trendData7.map(d => d.date),
    datasets: [
      {
        label: 'Avg Duration (min)',
        data: trendData7.map(d => d.count > 0 ? d.duration / d.count : 0),
        borderColor: PALETTE.primary,
        backgroundColor: `${PALETTE.primary}20`,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Session Count',
        data: trendData7.map(d => d.count),
        borderColor: PALETTE.success,
        backgroundColor: `${PALETTE.success}20`,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      }
    ],
  };

  const barData = {
    labels: hourDistribution.map(h => `${h.hour}:00`),
    datasets: [{
      label: 'Sessions by Hour',
      data: hourDistribution.map(h => h.count),
      backgroundColor: PALETTE.accent,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    }],
  };

  const commonLegend = {
    display: true,
    position: 'top' as const,
    labels: {
      font: { size: 9 },
      padding: 6,
      color: 'rgba(255,255,255,0.8)',
      usePointStyle: true,
      boxWidth: 6,
      boxHeight: 6,
    },
  };

  const formatTooltip = (val: number | string, datasetLabel?: string) => {
    const prefix = datasetLabel ? `${datasetLabel}: ` : '';
    if (typeof val === 'number') {
      return `${prefix}${Math.abs(val) >= 10 ? Math.round(val) : val.toFixed(1)}`;
    }
    return `${prefix}${val}`;
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'auto',
      padding: 0,
    }} role="region" aria-label="Clinical analytics dashboard">
      {}
      {sessions.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px 20px',
        }}>
          {}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 166, 215, 0.2), rgba(0, 166, 215, 0.05))',
            border: '2px solid rgba(0, 166, 215, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <FiBarChart2 size={36} style={{ color: 'rgba(0, 166, 215, 0.8)' }} />
          </div>

          {}
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.95)',
            letterSpacing: '0.2px',
          }}>
            No Session Data Yet
          </h3>

          {}
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            maxWidth: '320px',
            lineHeight: 1.5,
          }}>
            Start a clinical session to see real-time analytics, evidence-based metrics, and performance insights.
          </p>

          {}
          <button
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, rgba(0, 166, 215, 1), rgba(16, 185, 129, 1))',
              border: 'none',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.98)',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 166, 215, 0.3)',
              transition: 'all 0.2s ease',
            }}
            type="button"
            aria-label="View demo data for analytics"
            onClick={async () => {
              if (onLoadDemoData) {
                onLoadDemoData();
                const { toastSuccess } = await import('@/ui/toast/api');
                toastSuccess('Demo analytics data loaded', {
                  title: 'Demo Mode',
                  duration: 3000,
                });
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 166, 215, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 166, 215, 0.3)';
            }}
          >
            <FiBarChart2 size={16} style={{ marginRight: '6px' }} />
            View Demo Data
          </button>

          {}
          <div style={{
            marginTop: '32px',
            display: 'grid',
            gridTemplateColumns: getSkeletonColumns(),
            gap: '12px',
            maxWidth: '800px',
            width: '100%',
          }}>
            {[
              { Icon: FiZap, label: 'Session Efficiency', color: 'rgba(0, 166, 215, 0.8)' },
              { Icon: FiActivity, label: 'Cognitive Load', color: 'rgba(255, 187, 51, 0.8)' },
              { Icon: FiTrendingUp, label: 'Trend Analysis', color: 'rgba(0, 255, 136, 0.8)' },
              { Icon: FiTarget, label: 'Clinical Insights', color: 'rgba(168, 139, 250, 0.8)' },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{
                  marginBottom: '6px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <feature.Icon size={24} style={{ color: feature.color }} />
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}>
                  {feature.label}
                </div>
              </div>
            ))}
          </div>

          {}
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }
          `}</style>
        </div>
      ) : isLoading ? (
        <>
        {}
        <style>{`
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
        `}</style>

        <div style={{ padding: '12px 16px' }}>
          {}
          <div style={{
            height: '24px',
            width: '180px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.08) 75%)',
            backgroundSize: '1000px 100%',
            animation: 'shimmer 2s infinite linear',
            borderRadius: '4px',
            marginBottom: '16px',
          }} />

          {}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '8px',
            marginBottom: '8px',
          }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  gridRow: 'span 2',
                  height: '180px',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)',
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '8px',
            marginBottom: '8px',
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  height: '76px',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)',
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
          }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: '220px',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)',
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        </div>
        </>
      ) : (
        <>
      <div className={panelStyles.actionPanel}>
        <div className={panelStyles.actionPanelContent}>
          <div className={panelStyles.actionButtonGroup}>
            <button
              type="button"
              onClick={() => {
                console.log('[Analytics] REAL/DEMO toggle clicked', { useDemoData, onToggleDemoData });
                if (onToggleDemoData) {
                  onToggleDemoData();
                } else {
                  console.warn('[Analytics] onToggleDemoData callback not provided');
                }
              }}
              className={`${panelStyles.actionButton} ${useDemoData ? panelStyles.actionButtonDemo : panelStyles.actionButtonReal}`}
              title={useDemoData ? 'Using Demo Data - Click to switch to Real' : 'Using Real Data - Click to switch to Demo'}
            >
              <FiBarChart2 size={14} />
              {useDemoData ? 'Demo Mode' : 'Real Data'}
            </button>

            <button
              type="button"
              onClick={() => {
                console.log('[Analytics] +200 TEST clicked', { onLoadDemoData });
                if (onLoadDemoData) {
                  onLoadDemoData();
                } else {
                  console.warn('[Analytics] onLoadDemoData callback not provided');
                }
              }}
              className={`${panelStyles.actionButton} ${panelStyles.actionButtonPurple}`}
              title="Add 200 test sessions"
            >
              +200 Sessions
            </button>
          </div>

          <div className={panelStyles.actionButtonGroup}>
            <button
              type="button"
              onClick={() => {
                console.log('[Analytics] AI clicked', { onTriggerAI });
                if (onTriggerAI) {
                  onTriggerAI();
                } else {
                  console.warn('[Analytics] onTriggerAI callback not provided');
                }
              }}
              className={`${panelStyles.actionButton} ${panelStyles.actionButtonBlue}`}
              title="AI-powered session prediction"
            >
              <FiZap size={14} />
              AI Predict
            </button>

            <button
              type="button"
              onClick={() => {
                console.log('[Analytics] ML INSIGHTS clicked', { onShowMLInsights });
                if (onShowMLInsights) {
                  onShowMLInsights();
                } else {
                  console.warn('[Analytics] onShowMLInsights callback not provided');
                }
              }}
              className={`${panelStyles.actionButton} ${panelStyles.actionButtonGreen}`}
              title="View ML system insights"
            >
              <FiTrendingUp size={14} />
              ML Insights
            </button>

            <button
              type="button"
              disabled={sessions.length === 0}
              onClick={() => {
                console.log('[Analytics] SMART NOTE clicked', { sessions: sessions.length });
                if (sessions.length > 0) {
                  const lastSession = sessions[sessions.length - 1];
                  console.log('[Analytics] Setting selected session:', lastSession);
                  setSelectedSessionForNote(lastSession);
                } else {
                  console.warn('[Analytics] No sessions available');
                }
              }}
              className={`${panelStyles.actionButton} ${sessions.length === 0 ? panelStyles.actionButtonDisabled : panelStyles.actionButtonOrange}`}
              title="Generate clinical note for last session"
            >
              <FiFileText size={14} />
              Smart Note
            </button>
          </div>
        </div>
      </div>

      <div role="region" aria-label="Primary metrics and charts" className={panelStyles.metricsSection}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: getMetricsColumns(),
          gap: '10px',
          marginBottom: '10px',
        }} aria-label="Primary metrics" role="group">
          {}
          <div className={panelStyles.card} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderColor: seqColor,
          }}>
            <FiZap style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(136, 192, 208, 0.1)',
              borderRadius: '0.5rem',
              color: seqColor,
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue} style={{ color: seqColor }}>
                {seq}%
              </div>
              <div className={panelStyles.metricLabel}>
                {seqStatus.replace('-', ' ')}
              </div>
            </div>
            {}
            <div style={{
              marginTop: '4px',
              height: '3px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(seq, 200) / 2}%`,
                background: seqColor,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderColor: cognitiveColor,
          }}>
            <FiActivity style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(136, 192, 208, 0.1)',
              borderRadius: '0.5rem',
              color: cognitiveColor,
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue} style={{ color: cognitiveColor }}>
                {cognitiveLoad}/10
              </div>
              <div className={panelStyles.metricLabel} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '3px',
              }}>
                {cognitiveLoad < 4 ? (
                  <FiCheckCircle size={9} style={{ color: PALETTE.success }} />
                ) : cognitiveLoad < 7 ? (
                  <FiAlertCircle size={9} style={{ color: PALETTE.warning }} />
                ) : (
                  <FiAlertCircle size={9} style={{ color: PALETTE.danger }} />
                )}
                {cognitiveLoadStatus}
              </div>
            </div>
            {}
            <div style={{
              marginTop: '4px',
              display: 'flex',
              gap: '2px',
              height: '3px',
            }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: i < cognitiveLoad ? cognitiveColor : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '1px',
                    transition: 'background 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} role="group" aria-label="Total sessions">
            <FiCalendar style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(136, 192, 208, 0.1)',
              borderRadius: '0.5rem',
              color: '#88c0d0',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue}>{totalSessions}</div>
              <div className={panelStyles.metricLabel}>Total Sessions</div>
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} role="group" aria-label="Average session duration">
            <FiClock style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(136, 192, 208, 0.1)',
              borderRadius: '0.5rem',
              color: '#88c0d0',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue}>{avgSessionDuration.toFixed(1)}</div>
              <div className={panelStyles.metricLabel}>Avg Duration (min)</div>
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} role="group" aria-label="Total time">
            <FiClock style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(136, 192, 208, 0.1)',
              borderRadius: '0.5rem',
              color: '#88c0d0',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue}>{(totalDuration / 3600000).toFixed(1)}</div>
              <div className={panelStyles.metricLabel}>Total Time (hrs)</div>
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} role="group" aria-label="Average checkpoints">
            <FiTarget style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(136, 192, 208, 0.1)',
              borderRadius: '0.5rem',
              color: '#88c0d0',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue}>{avgLapsPerSession.toFixed(1)}</div>
              <div className={panelStyles.metricLabel}>Avg Checkpoints</div>
            </div>
          </div>

          {}
          {movingAverages.day7 && (
            <div className={panelStyles.card} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderColor: trendDirection && trendDirection.direction === 'up' ? PALETTE.success :
                          trendDirection && trendDirection.direction === 'down' ? PALETTE.danger :
                          'rgba(251, 191, 36, 0.4)',
            }} role="group" aria-label="7-day moving average">
              <FiTrendingUp style={{
                width: '2.5rem',
                height: '2.5rem',
                padding: '0.625rem',
                background: 'rgba(136, 192, 208, 0.1)',
                borderRadius: '0.5rem',
                color: trendDirection && trendDirection.direction === 'up' ? PALETTE.success :
                       trendDirection && trendDirection.direction === 'down' ? PALETTE.danger :
                       'rgba(251, 191, 36, 1)',
              }} />
              <div style={{ flex: 1 }}>
                <div className={panelStyles.metricValue} style={{
                  color: trendDirection && trendDirection.direction === 'up' ? PALETTE.success :
                         trendDirection && trendDirection.direction === 'down' ? PALETTE.danger :
                         'rgba(251, 191, 36, 1)',
                }}>
                  {movingAverages.day7.duration.toFixed(1)}
                </div>
                <div className={panelStyles.metricLabel} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '3px',
                }}>
                  {trendDirection && (
                    <>
                      {trendDirection.direction === 'up' ? '↗' : trendDirection.direction === 'down' ? '↘' : '→'}
                      <span>{trendDirection.label}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {}
          {movingAverages.day30 && (
            <div className={panelStyles.card} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderColor: 'rgba(168, 139, 250, 0.4)',
            }} role="group" aria-label="30-day moving average">
              <FiBarChart2 style={{
                width: '2.5rem',
                height: '2.5rem',
                padding: '0.625rem',
                background: 'rgba(168, 139, 250, 0.1)',
                borderRadius: '0.5rem',
                color: 'rgba(168, 139, 250, 1)',
              }} />
              <div style={{ flex: 1 }}>
                <div className={panelStyles.metricValue} style={{
                  color: 'rgba(168, 139, 250, 1)',
                }}>
                  {movingAverages.day30.duration.toFixed(1)}
                </div>
                <div className={panelStyles.metricLabel}>
                  30-Day Average
                </div>
              </div>
            </div>
          )}

          {}
          <div className={panelStyles.card} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderColor: 'rgba(16, 185, 129, 0.5)',
          }}>
            <FiCheckCircle style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '0.5rem',
              color: 'rgba(16, 185, 129, 1)',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue} style={{ color: 'rgba(16, 185, 129, 1)' }}>
                100%
              </div>
              <div className={panelStyles.metricLabel}>
                Completion Rate
              </div>
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} role="group" aria-label="Variability">
            <FiTrendingUp style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(136, 192, 208, 0.1)',
              borderRadius: '0.5rem',
              color: '#88c0d0',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue}>±{sessionVariability.toFixed(0)}</div>
              <div className={panelStyles.metricLabel}>Variability (std)</div>
            </div>
          </div>

          <div className={panelStyles.card} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderColor: 'rgba(208, 135, 112, 0.5)',
          }} role="group" aria-label="Peak performance time">
            <FiClock style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(208, 135, 112, 0.1)',
              borderRadius: '0.5rem',
              color: '#d08770',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue} style={{ color: '#d08770' }}>
                {(() => {
                  const hourCounts = new Map<number, number>();
                  sessions.forEach(s => {
                    const hour = new Date(s.startTime).getHours();
                    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
                  });
                  const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0];
                  if (!peakHour) return '--';
                  const h = peakHour[0];
                  return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                })()}
              </div>
              <div className={panelStyles.metricLabel}>Peak Performance</div>
            </div>
          </div>

          <div className={panelStyles.card} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderColor: 'rgba(129, 161, 193, 0.5)',
          }} role="group" aria-label="Session consistency">
            <FiActivity style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(129, 161, 193, 0.1)',
              borderRadius: '0.5rem',
              color: '#81a1c1',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue} style={{ color: '#81a1c1' }}>
                {(() => {
                  const last7 = sessions.slice(-7).length;
                  const score = Math.round((last7 / 7) * 100);
                  return `${score}%`;
                })()}
              </div>
              <div className={panelStyles.metricLabel}>7-Day Consistency</div>
            </div>
          </div>

          <div className={panelStyles.card} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderColor: 'rgba(163, 190, 140, 0.5)',
          }} role="group" aria-label="Clinical efficiency">
            <FiZap style={{
              width: '2.5rem',
              height: '2.5rem',
              padding: '0.625rem',
              background: 'rgba(163, 190, 140, 0.1)',
              borderRadius: '0.5rem',
              color: '#a3be8c',
            }} />
            <div style={{ flex: 1 }}>
              <div className={panelStyles.metricValue} style={{ color: '#a3be8c' }}>
                {(() => {
                  if (sessions.length === 0) return '--';
                  const efficiency = (avgLapsPerSession / avgSessionDuration) * 100;
                  return Math.round(efficiency);
                })()}
              </div>
              <div className={panelStyles.metricLabel}>Efficiency Index</div>
            </div>
          </div>

          {}
        </div>

        {}
        <div style={{
          display: 'grid',
          gridTemplateColumns: getChartsColumns(),
          gap: '1.25rem',
          marginBottom: '1.25rem',
          width: '100%',
        }} aria-label="Charts" role="group">
          {}
          <div className={panelStyles.card} style={{ padding: '1.5rem' }}>
            <div style={{ ...cardHeaderStyles, marginBottom: '6px' }}>
              <FiBarChart2 size={11} />
              SEGMENT DISTRIBUTION
            </div>
            <div style={{ height: chartHeight, position: 'relative' }}>
              <Suspense fallback={<div aria-hidden="true" style={{height: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.06)'}} /> }>
                <Pie
                  data={pieData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: { duration: 200 },
                    plugins: {
                      legend: { ...commonLegend, position: 'bottom' },
                      tooltip: {
                        enabled: true,
                        displayColors: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: { size: 10 },
                        bodyFont: { size: 10 },
                        padding: 6,
                        callbacks: {
                          label: (ctx: TooltipItem<'pie'>) =>
                            formatTooltip(ctx.raw as number | string, ctx.dataset.label),
                        },
                      },
                    },
                  }}
                  role="img"
                  aria-label="Pie chart showing segment distribution"
                />
              </Suspense>
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ padding: '1.5rem' }}>
            <div style={{ ...cardHeaderStyles, marginBottom: '6px' }}>
              <FiTrendingUp size={11} />
              7-DAY TREND ANALYSIS
            </div>
            <div style={{ height: chartHeight, position: 'relative' }}>
              <Suspense fallback={<div aria-hidden="true" style={{height: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.06)'}} /> }>
                <Line
                  data={lineData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: { duration: 250 },
                    plugins: {
                      legend: { ...commonLegend },
                      tooltip: {
                        enabled: true,
                        displayColors: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: { size: 10 },
                        bodyFont: { size: 10 },
                        padding: 6,
                        callbacks: {
                          label: (ctx: TooltipItem<'line'>) =>
                            formatTooltip(ctx.raw as number | string, ctx.dataset.label),
                        },
                      },
                    },
                    interaction: { mode: 'index' as const, intersect: false },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.75)', font: { size: 9 } },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.75)', font: { size: 9 } },
                      },
                    },
                  }}
                  role="img"
                  aria-label="Line chart showing 7-day trend of average duration and session counts"
                />
              </Suspense>
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ padding: '1.5rem' }}>
            <div style={{ ...cardHeaderStyles, marginBottom: '6px' }}>
              <FiTrendingUp size={11} />
              30-DAY TREND ANALYSIS
            </div>
            <div style={{ height: chartHeight, position: 'relative' }}>
              <Suspense fallback={<div aria-hidden="true" style={{height: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.06)'}} /> }>
                <Line
                  data={{
                    labels: trendData30.map(d => format(d.date, 'MMM d')),
                    datasets: [
                      {
                        label: 'Avg Duration (min)',
                        data: trendData30.map(d => d.duration),
                        borderColor: PALETTE.primary,
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 3,
                        pointBackgroundColor: PALETTE.primary,
                        fill: true,
                      },
                      {
                        label: 'Sessions',
                        data: trendData30.map(d => d.count),
                        borderColor: PALETTE.accent,
                        backgroundColor: 'rgba(34, 211, 238, 0.15)',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 3,
                        pointBackgroundColor: PALETTE.accent,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: { duration: 250 },
                    plugins: {
                      legend: { ...commonLegend },
                      tooltip: {
                        enabled: true,
                        displayColors: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: { size: 10 },
                        bodyFont: { size: 10 },
                        padding: 6,
                        callbacks: {
                          label: (ctx: TooltipItem<'line'>) =>
                            formatTooltip(ctx.raw as number | string, ctx.dataset.label),
                        },
                      },
                    },
                    interaction: { mode: 'index' as const, intersect: false },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.75)', font: { size: 9 } },
                      },
                      x: {
                        grid: { display: false },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.75)',
                          font: { size: 9 },
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                    },
                  }}
                  role="img"
                  aria-label="Line chart showing 30-day trend of average duration and session counts"
                />
              </Suspense>
            </div>
          </div>

          {}
          <div className={panelStyles.card} style={{ padding: '1.5rem' }}>
            <div style={{ ...cardHeaderStyles, marginBottom: '6px' }}>
              <FiClock size={11} />
              SESSION DISTRIBUTION BY TIME OF DAY
            </div>
            <div style={{ height: chartHeight, position: 'relative' }}>
              <Suspense fallback={<div aria-hidden="true" style={{height: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.06)'}} /> }>
                <Bar
                  data={barData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: { duration: 250 },
                    plugins: {
                      legend: { ...commonLegend },
                      tooltip: {
                        enabled: true,
                        displayColors: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: { size: 10 },
                        bodyFont: { size: 10 },
                        padding: 6,
                        callbacks: {
                          label: (ctx: TooltipItem<'bar'>) =>
                            formatTooltip(ctx.raw as number | string, ctx.dataset.label),
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.75)', font: { size: 9 }, stepSize: 1 },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.75)', font: { size: 9 } },
                      },
                    },
                  }}
                  role="img"
                  aria-label="Bar chart showing sessions by hour of day"
                />
              </Suspense>
            </div>
          </div>
        </div>

        {}
        {insights.length > 0 && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}>
            {}
            <button
              onClick={() => setInsightsExpanded(!insightsExpanded)}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.15s ease',
              }}
              type="button"
              aria-expanded={insightsExpanded}
              aria-controls="clinical-insights-content"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <FiAlertCircle
                size={11}
                style={{
                  color: 'rgba(251, 191, 36, 1)',
                  filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.4))',
                }}
              />
              <span style={{
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'rgba(255, 255, 255, 0.9)',
                flex: 1,
                textAlign: 'left',
              }}>
                Clinical Insights
              </span>
              <span style={{
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 500,
              }}>
                {insights.length} tips
              </span>
              <span style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.6)',
                transform: insightsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}>
                ▼
              </span>
            </button>

            {}
            {insightsExpanded ? (
              <div id="clinical-insights-content" style={{
                padding: '0 8px 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                animation: 'fadeIn 0.2s ease',
              }}>
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.4,
                      paddingLeft: '14px',
                      position: 'relative',
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      left: '0',
                      opacity: 0.5,
                      fontSize: '8px',
                    }}>
                      •
                    </span>
                    {insight}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {}
        <div style={{ marginTop: '10px' }}>
          <CalendarHeatmap
            sessions={sessions}
            radicalMode={true}
            reduceMotion={true}
            onDayClick={(_date, _daySessions) => {

            }}
          />
        </div>

        {}
        {sessions.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setSelectedSessionForNote(sessions[sessions.length - 1])}
              style={{
                padding: '10px 20px',
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(14, 165, 233, 0.5)',
                borderRadius: '6px',
                color: PALETTE.primary,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FiFileText size={16} />
              Generate Clinical Note
            </button>

            {}
            <button
              onClick={async () => {
                console.log('PDF Export - Sessions:', sessions);
                console.log('PDF Export - Sessions count:', sessions.length);
                setIsExporting(true);
                try {

                  const totalDuration = sessions.reduce((sum, s) => sum + s.totalDuration, 0);

                  const heatmapData = [];
                  for (let i = 29; i >= 0; i--) {
                    const date = startOfDay(subDays(new Date(), i));
                    const dateStr = format(date, 'MM/dd');
                    const daySessions = sessions.filter(s => {
                      const sDate = startOfDay(new Date(s.startTime));
                      return sDate.getTime() === date.getTime();
                    });
                    const count = daySessions.length;

                    const intensity = count === 0 ? 0 : Math.min(count, 4);
                    heatmapData.push({ date: dateStr, intensity, count });
                  }

                  const last7Days = sessions.slice(-7);
                  const consistencyScore = last7Days.length >= 5 ? 27 : Math.round((last7Days.length / 7) * 100);
                  const consistencyLabel = consistencyScore >= 80 ? 'Stable' : consistencyScore >= 50 ? 'Moderate' : 'Needs Improvement';

                  const durations = sessions.map(s => s.totalDuration / 60000);
                  const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
                  const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
                  const stdDev = Math.sqrt(variance);
                  const coefficientOfVariation = mean > 0 ? Math.round((stdDev / mean) * 100) : 0;

                  const chartData: ChartData = {
                    metrics: {
                      seq: seq,
                      consistencyLoad: Math.min(Math.round(cognitiveLoad), 10),
                      totalSessions: totalSessions,
                      avgDuration: avgSessionDuration,
                      totalTime: totalDuration / 3600000,
                      avgCheckpoints: avgLapsPerSession,
                      seqAvg: avgSessionDuration,
                      completion: 100,
                      variability: Math.round(stdDev),
                    },
                    segmentDistribution: segmentStats.map(s => ({
                      type: s.type,
                      value: s.totalDuration,
                      percentage: (s.totalDuration / totalDuration) * 100,
                    })),
                    trendData: trendData7,
                    hourDistribution: hourDistribution,
                    heatmapData: heatmapData,
                    insights: {
                      consistencyScore: consistencyScore,
                      consistencyLabel: consistencyLabel,
                      avgDuration: Math.round(avgSessionDuration),
                      sessionConsistency: Math.round((sessions.length / 30) * 100),
                      variability: coefficientOfVariation,
                      stdDeviation: Math.round(stdDev),
                      totalCheckpoints: sessions.reduce((sum, s) => sum + (s.laps?.length || 0), 0),
                    },
                  };

                  await exportAnalyticsToPDF({
                    sessions,
                    chartData,
                    clinicName: 'Clinical Practice',
                    clinicianName: 'Clinician',
                    reportTitle: 'Clinical Analytics Report',
                  });
                  console.log('PDF Export completed successfully');
                } catch (error) {
                  console.error('PDF export failed:', error);
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting}
              style={{
                padding: '10px 20px',
                background: isExporting ? 'rgba(168, 139, 250, 0.1)' : 'rgba(168, 139, 250, 0.15)',
                border: '1px solid rgba(168, 139, 250, 0.5)',
                borderRadius: '6px',
                color: isExporting ? 'rgba(168, 139, 250, 0.5)' : 'rgba(168, 139, 250, 1)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isExporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                opacity: isExporting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.background = 'rgba(168, 139, 250, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.background = 'rgba(168, 139, 250, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <FiDownload size={16} />
              {isExporting ? 'Generating PDF...' : 'Export Report'}
            </button>
          </div>
        )}
      </div>

      {}
      <div style={{
        padding: '10px 12px',
        marginTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '9px',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
      }}>
        Data analyzed from {totalSessions} clinical sessions • Metrics calculated using evidence-based protocols
      </div>

      {}
      {selectedSessionForNote && (
        <SmartNoteTemplates
          session={selectedSessionForNote}
          onClose={() => setSelectedSessionForNote(null)}
        />
      )}
      </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
