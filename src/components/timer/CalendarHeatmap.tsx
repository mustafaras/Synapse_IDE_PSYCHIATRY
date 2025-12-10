import React, { useMemo, useState } from 'react';
import { addDays, format, isSameDay, subDays } from 'date-fns';

interface TimerSession {
  id: string;
  startTime: number;
  endTime: number;
  totalDuration: number;
  laps?: Array<unknown>;
}

interface CalendarHeatmapProps {
  sessions: TimerSession[];
  onDayClick?: (date: Date, daySessions: TimerSession[]) => void;
  radicalMode?: boolean;
  reduceMotion?: boolean;
}

interface DayData {
  date: Date;
  sessions: TimerSession[];
  sessionCount: number;
  totalDurationMin: number;
  focusIndex: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ sessions, onDayClick, radicalMode = false, reduceMotion: _reduceMotion = true }) => {
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dateOffset, setDateOffset] = useState(0);

  const overallStats = useMemo(() => {
    if (!sessions?.length) return { avgFocus: 0, maxFocus: 0, totalSessions: 0 };
    
    const totalLaps = sessions.reduce((sum, s) => sum + (s.laps?.length || 0), 0);
    const totalDurationMin = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / 60000;
    const avgFocus = totalDurationMin > 0 ? Math.round((totalLaps / totalDurationMin) * 100) : 0;
    
    const dailyFocus = sessions.map(s => {
      const durMin = s.totalDuration / 60000;
      return durMin > 0 ? Math.round(((s.laps?.length || 0) / durMin) * 100) : 0;
    });
    const maxFocus = Math.max(...dailyFocus, avgFocus, 1);
    
    return { avgFocus, maxFocus, totalSessions: sessions.length };
  }, [sessions]);

  const heatmapData = useMemo<DayData[]>(() => {
    const today = new Date();
    const adjustedEnd = addDays(today, dateOffset * 30);
    const monthStart = subDays(adjustedEnd, 29);
    
    return Array.from({ length: 30 }, (_, i) => {
      const date = addDays(monthStart, i);
      const daySessions = sessions.filter(s => 
        isSameDay(new Date(s.startTime), date)
      );
      
      const sessionCount = daySessions.length;
      
      if (sessionCount === 0) {
        return {
          date,
          sessions: [],
          sessionCount: 0,
          totalDurationMin: 0,
          focusIndex: 0,
          level: 0 as const,
        };
      }
      
      const totalDurationMin = daySessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / 60000;
      const totalLaps = daySessions.reduce((sum, s) => sum + (s.laps?.length || 0), 0);
      const focusIndex = totalDurationMin > 0 ? Math.round((totalLaps / totalDurationMin) * 100) : 0;

      let level: DayData['level'] = 1;
      const { maxFocus } = overallStats;
      const normalizedFocus = maxFocus > 0 ? focusIndex / maxFocus : 0;
      
      if (normalizedFocus >= 0.8) level = 4;
      else if (normalizedFocus >= 0.6) level = 3;
      else if (normalizedFocus >= 0.4) level = 2;
      else if (normalizedFocus > 0) level = 1;
      
      return { date, sessions: daySessions, sessionCount, totalDurationMin, focusIndex, level };
    });
  }, [sessions, overallStats, dateOffset]);

  const handleDayClick = (dayData: DayData) => {
    if (dayData.sessionCount === 0) return;
    setSelectedDay(dayData.date);
    onDayClick?.(dayData.date, dayData.sessions);
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const selectedData = selectedDay 
    ? heatmapData.find(d => isSameDay(d.date, selectedDay)) 
    : null;

  const scientificMetrics = useMemo(() => {
    const activeDays = heatmapData.filter(d => d.sessionCount > 0);
    if (activeDays.length === 0) return null;

    const totalMinutes = activeDays.reduce((sum, d) => sum + d.totalDurationMin, 0);
    const avgDuration = totalMinutes / activeDays.length;
    const totalLaps = sessions.reduce((sum, s) => sum + (s.laps?.length || 0), 0);

    const dayDistribution = activeDays.length / 30;
    const consistencyScore = Math.round(dayDistribution * 100);

    const focusScores = activeDays.map(d => d.focusIndex);
    const avgFocusScore = focusScores.reduce((sum, f) => sum + f, 0) / focusScores.length;
    const variance = focusScores.reduce((sum, f) => sum + Math.pow(f - avgFocusScore, 2), 0) / focusScores.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgFocusScore > 0 ? (stdDev / avgFocusScore) * 100 : 0;

    const xMean = activeDays.length / 2;
    const yMean = avgFocusScore;
    let numerator = 0;
    let denominator = 0;
    activeDays.forEach((d, i) => {
      numerator += (i - xMean) * (d.focusIndex - yMean);
      denominator += Math.pow(i - xMean, 2);
    });
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const trendDirection = slope > 0.5 ? 'Improving' : slope < -0.5 ? 'Declining' : 'Stable';

    const peakDay = activeDays.reduce((max, d) => d.focusIndex > max.focusIndex ? d : max, activeDays[0]);

    const totalSessions = activeDays.reduce((sum, d) => sum + d.sessionCount, 0);
    const sessionDensity = totalSessions / activeDays.length;

    return {
      consistencyScore,
      coefficientOfVariation: Math.round(coefficientOfVariation),
      trendDirection,
      avgDuration: Math.round(avgDuration),
      peakDay,
      sessionDensity: sessionDensity.toFixed(1),
      totalLaps,
      stdDev: Math.round(stdDev),
    };
  }, [heatmapData, sessions]);

  return (
    <div className="calendar-heatmap" style={styles.wrapper}>
      {}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Activity Heatmap</h3>
          <p style={styles.subtitle}>
            {format(heatmapData[0].date, 'MMM d')} - {format(heatmapData[29].date, 'MMM d, yyyy')} • {heatmapData.filter(d => d.sessionCount > 0).length} active days
          </p>
        </div>
        <div style={styles.dateControls}>
          <button
            onClick={() => setDateOffset(dateOffset - 1)}
            style={styles.navBtn}
            aria-label="Previous 30 days"
          >
            ←
          </button>
          <button
            onClick={() => setDateOffset(0)}
            style={{...styles.navBtn, opacity: dateOffset === 0 ? 0.5 : 1}}
            disabled={dateOffset === 0}
            aria-label="Current period"
          >
            Today
          </button>
          <button
            onClick={() => setDateOffset(dateOffset + 1)}
            style={{...styles.navBtn, opacity: dateOffset >= 0 ? 0.5 : 1}}
            disabled={dateOffset >= 0}
            aria-label="Next 30 days"
          >
            →
          </button>
          {selectedData && (
            <button
              onClick={() => setSelectedDay(null)}
              style={styles.clearBtn}
              aria-label="Clear selection"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {}
      <div style={styles.gridWrapper}>
        <div style={styles.grid}>
          {heatmapData.map((dayData) => {
            const isHovered = hoveredDay && isSameDay(dayData.date, hoveredDay);
            const isSelected = selectedDay && isSameDay(dayData.date, selectedDay);
            const isToday = isSameDay(dayData.date, new Date());
            const hasData = dayData.sessionCount > 0;
            
            return (
              <div
                key={dayData.date.toISOString()}
                style={{
                  ...styles.cell,
                  ...getCellStyle(dayData.level, radicalMode),
                  ...(isSelected && styles.cellSelected),
                  ...(isToday && styles.cellToday),
                  cursor: hasData ? 'pointer' : 'default',
                  opacity: selectedData && !isSelected ? 0.4 : 1,
                }}
                onClick={() => handleDayClick(dayData)}
                onMouseEnter={() => setHoveredDay(dayData.date)}
                onMouseLeave={() => setHoveredDay(null)}
                role={hasData ? "button" : undefined}
                tabIndex={hasData ? 0 : -1}
                aria-label={
                  hasData 
                    ? `${format(dayData.date, 'MMM d')}: ${dayData.sessionCount} session${dayData.sessionCount > 1 ? 's' : ''}`
                    : `${format(dayData.date, 'MMM d')}: No activity`
                }
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && hasData) {
                    e.preventDefault();
                    handleDayClick(dayData);
                  }
                }}
              >
                {}
                <div style={styles.cellDate}>
                  {format(dayData.date, 'd')}
                </div>
                
                {}
                {hasData && (
                  <div style={styles.cellBadge}>
                    {dayData.sessionCount}
                  </div>
                )}
                
                {}
                {isHovered && (
                  <div style={styles.tooltip}>
                    <div style={styles.tooltipDate}>{format(dayData.date, 'EEE, MMM d')}</div>
                    {hasData ? (
                      <>
                        <div style={styles.tooltipStat}>
                          <span>{dayData.sessionCount} session{dayData.sessionCount > 1 ? 's' : ''}</span>
                        </div>
                        <div style={styles.tooltipStat}>
                          <span>{formatDuration(dayData.totalDurationMin)}</span>
                        </div>
                        <div style={styles.tooltipStat}>
                          <span style={{ opacity: 0.7 }}>Focus:</span>
                          <strong>{dayData.focusIndex}</strong>
                        </div>
                      </>
                    ) : (
                      <div style={{ ...styles.tooltipStat, opacity: 0.5 }}>No activity</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {}
        <div style={styles.statsPanel}>
          {selectedData ? (
            <>
              {}
              <div style={styles.selectedDayHeader}>
                <div style={styles.selectedDayDate}>{format(selectedData.date, 'd')}</div>
                <div style={styles.selectedDayMeta}>
                  <div style={styles.selectedDayLabel}>{format(selectedData.date, 'EEE')}</div>
                  <div style={styles.selectedDayMonth}>{format(selectedData.date, 'MMM yyyy')}</div>
                </div>
              </div>
              
              <div style={styles.selectedMetricsStack}>
                <div style={styles.metricItem}>
                  <div style={styles.metricItemValue}>{selectedData.sessionCount}</div>
                  <div style={styles.metricItemLabel}>Sessions</div>
                </div>
                <div style={styles.metricItem}>
                  <div style={styles.metricItemValue}>{formatDuration(selectedData.totalDurationMin)}</div>
                  <div style={styles.metricItemLabel}>Total Time</div>
                </div>
                <div style={styles.metricItem}>
                  <div style={styles.metricItemValue}>{selectedData.focusIndex}</div>
                  <div style={styles.metricItemLabel}>Focus Index</div>
                </div>
                <div style={styles.metricItem}>
                  <div style={styles.metricItemValue}>
                    <span style={{opacity: 0.6}}>L</span>{selectedData.level}<span style={{opacity: 0.4}}>/4</span>
                  </div>
                  <div style={styles.metricItemLabel}>Activity Level</div>
                </div>
              </div>
            </>
          ) : scientificMetrics ? (
            <>
              {}
              <div style={styles.analyticsHeader}>
                <div style={styles.analyticsTitle}>Clinical Analytics</div>
                <div style={styles.analyticsPeriod}>30-day period</div>
              </div>
              
              {}
              <div style={styles.heroMetric}>
                <div style={styles.heroValue}>{scientificMetrics.consistencyScore}<span style={styles.heroUnit}>%</span></div>
                <div style={styles.heroLabel}>Consistency Score</div>
                <div style={styles.heroDescription}>
                  {scientificMetrics.consistencyScore >= 70 ? 'Excellent adherence' : 
                   scientificMetrics.consistencyScore >= 50 ? 'Good consistency' : 
                   scientificMetrics.consistencyScore >= 30 ? 'Moderate activity' : 'Low engagement'}
                </div>
              </div>
              
              {}
              <div style={{
                ...styles.trendIndicator,
                backgroundColor: scientificMetrics.trendDirection === 'Improving' ? 'rgba(34, 197, 94, 0.15)' :
                                scientificMetrics.trendDirection === 'Declining' ? 'rgba(239, 68, 68, 0.15)' :
                                'rgba(251, 191, 36, 0.15)',
                borderLeft: `3px solid ${scientificMetrics.trendDirection === 'Improving' ? 'rgba(34, 197, 94, 0.8)' :
                                        scientificMetrics.trendDirection === 'Declining' ? 'rgba(239, 68, 68, 0.8)' :
                                        'rgba(251, 191, 36, 0.8)'}`
              }}>
                <div style={styles.trendLabel}>Engagement Trend</div>
                <div style={styles.trendValue}>{scientificMetrics.trendDirection}</div>
              </div>
              
              {}
              <div style={styles.metricsStack}>
                <div style={styles.stackItem}>
                  <div style={styles.stackLabel}>Avg Duration</div>
                  <div style={styles.stackValue}>{scientificMetrics.avgDuration}<span style={styles.stackUnit}>min</span></div>
                </div>
                
                <div style={styles.stackItem}>
                  <div style={styles.stackLabel}>Session Density</div>
                  <div style={styles.stackValue}>{scientificMetrics.sessionDensity}<span style={styles.stackUnit}>/day</span></div>
                </div>
                
                <div style={styles.stackItem}>
                  <div style={styles.stackLabel}>Variability (CV)</div>
                  <div style={styles.stackValue}>{scientificMetrics.coefficientOfVariation}<span style={styles.stackUnit}>%</span></div>
                </div>
                
                <div style={styles.stackItem}>
                  <div style={styles.stackLabel}>Std Deviation</div>
                  <div style={styles.stackValue}>±{scientificMetrics.stdDev}</div>
                </div>
                
                <div style={styles.stackItem}>
                  <div style={styles.stackLabel}>Total Checkpoints</div>
                  <div style={styles.stackValue}>{scientificMetrics.totalLaps}</div>
                </div>
              </div>
              
              {}
              <div style={styles.peakHighlight}>
                <div style={styles.peakIcon}>★</div>
                <div style={styles.peakContent}>
                  <div style={styles.peakTitle}>Peak Performance</div>
                  <div style={styles.peakDate}>{format(scientificMetrics.peakDay.date, 'MMM d, yyyy')}</div>
                  <div style={styles.peakMetrics}>
                    {scientificMetrics.peakDay.sessionCount} sessions • Focus {scientificMetrics.peakDay.focusIndex}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📊</div>
                <div style={styles.emptyTitle}>No Data Available</div>
                <div style={styles.emptyText}>No sessions recorded in this period</div>
              </div>
            </>
          )}
        </div>
      </div>

      {}
      <div style={styles.legend}>
        <span style={styles.legendLabel}>Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            style={{ ...styles.legendBox, ...getCellStyle(level as DayData['level'], radicalMode) }}
            title={level === 0 ? 'No activity' : `Level ${level}`}
          />
        ))}
        <span style={styles.legendLabel}>More</span>
      </div>
    </div>
  );
};

function getCellStyle(level: DayData['level'], radicalMode: boolean): React.CSSProperties {
  if (level === 0) {
    return {
      backgroundColor: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    };
  }

  const colors = radicalMode ? [
    'rgba(14, 165, 233, 0.25)',  // level 1 - sky-500 low
    'rgba(14, 165, 233, 0.5)',   // level 2 - sky-500 medium
    'rgba(14, 165, 233, 0.75)',  // level 3 - sky-500 high
    'rgba(14, 165, 233, 1)',     // level 4 - sky-500 full
  ] : [
    'rgba(34, 197, 94, 0.25)',   // level 1 - green-500 low
    'rgba(34, 197, 94, 0.5)',    // level 2 - green-500 medium
    'rgba(34, 197, 94, 0.75)',   // level 3 - green-500 high
    'rgba(34, 197, 94, 1)',      // level 4 - green-500 full
  ];
  
  return {
    backgroundColor: colors[level - 1],
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#000000',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '12px',
  },
  dateControls: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  navBtn: {
    background: '#0a0a0a',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
  },
  clearBtn: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '4px',
    color: 'rgba(239, 68, 68, 0.9)',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 140px',
    gap: '16px',
    marginBottom: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '6px',
  },
  cell: {
    aspectRatio: '1',
    borderRadius: '6px',
    position: 'relative',
    transition: 'transform 0.15s ease, opacity 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDate: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#ffffff',
    fontVariantNumeric: 'tabular-nums',
  },
  cellBadge: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: '4px',
    lineHeight: 1.2,
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  cellSelected: {
    transform: 'scale(1.1)',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.6)',
    zIndex: 10,
  },
  cellToday: {
    outline: '2px solid rgba(251, 191, 36, 0.5)',
    outlineOffset: '-1px',
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#000000',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    minWidth: '130px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  tooltipDate: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '6px',
    paddingBottom: '4px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  },
  tooltipStat: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: '3px',
  },
  statsPanel: {
    backgroundColor: 'transparent',
    borderRadius: '0',
    padding: '16px 0',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  selectedDayHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  selectedDayDate: {
    fontSize: '48px',
    fontWeight: 900,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  selectedDayMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  selectedDayLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  selectedDayMonth: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  selectedMetricsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  metricItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  metricItemValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.95)',
    fontVariantNumeric: 'tabular-nums',
  },
  metricItemLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  analyticsHeader: {
    paddingBottom: '12px',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
  },
  analyticsTitle: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.95)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '2px',
  },
  analyticsPeriod: {
    fontSize: '9px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  heroMetric: {
    padding: '20px 0',
    textAlign: 'center',
    background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.08) 0%, transparent 100%)',
    borderRadius: '8px',
  },
  heroValue: {
    fontSize: '56px',
    fontWeight: 900,
    color: 'rgba(34, 197, 94, 0.95)',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-2px',
  },
  heroUnit: {
    fontSize: '32px',
    fontWeight: 800,
    opacity: 0.7,
  },
  heroLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginTop: '8px',
  },
  heroDescription: {
    fontSize: '10px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '6px',
    fontStyle: 'italic',
  },

  trendIndicator: {
    padding: '12px 16px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  trendValue: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'rgba(255, 255, 255, 0.95)',
  },

  metricsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  stackItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  stackLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  stackValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.95)',
    fontVariantNumeric: 'tabular-nums',
  },
  stackUnit: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: '2px',
  },

  peakHighlight: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.04) 100%)',
    borderRadius: '8px',
    border: '1px solid rgba(251, 191, 36, 0.2)',
  },
  peakIcon: {
    fontSize: '24px',
    lineHeight: 1,
    opacity: 0.9,
  },
  peakContent: {
    flex: 1,
  },
  peakTitle: {
    fontSize: '9px',
    fontWeight: 700,
    color: 'rgba(251, 191, 36, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '4px',
  },
  peakDate: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '4px',
  },
  peakMetrics: {
    fontSize: '10px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '6px',
  },
  emptyText: {
    fontSize: '10px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  statsPanelTitle: {
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '8px',
  },
  bigNumber: {
    fontSize: '32px',
    fontWeight: 800,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  bigNumberLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '4px',
    marginBottom: '12px',
    fontWeight: 600,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  miniStat: {
    textAlign: 'center',
  },
  miniStatValue: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.9)',
    fontVariantNumeric: 'tabular-nums',
  },
  miniStatLabel: {
    fontSize: '8px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    fontWeight: 600,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  legendLabel: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
    margin: '0 4px',
  },
  legendBox: {
    width: '14px',
    height: '14px',
    borderRadius: '2px',
  },
};
