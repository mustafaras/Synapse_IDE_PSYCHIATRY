

import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';


export interface ChartData {

  metrics: {
    seq: number;
    consistencyLoad: number;
    totalSessions: number;
    avgDuration: number;
    totalTime: number;
    avgCheckpoints: number;
    seqAvg: number;
    completion: number;
    variability: number;
  };

  segmentDistribution: Array<{ type: string; value: number; percentage: number }>;
  trendData: Array<{ date: string; duration: number; count: number }>;
  hourDistribution: Array<{ hour: number; count: number }>;

  heatmapData: Array<{ date: string; intensity: number; count: number }>;

  insights: {
    consistencyScore: number;
    consistencyLabel: string;
    avgDuration: number;
    sessionConsistency: number;
    variability: number;
    stdDeviation: number;
    totalCheckpoints: number;
  };
}

export interface ExportOptions {

  sessions: Array<{
    id: string;
    startTime: number;
    endTime: number;
    totalDuration: number;
    segments: Array<{ type: string; duration: number }>;
    laps: Array<{ time: number; segment: string }>;
  }>;

  chartData?: ChartData;

  clinicName?: string;

  clinicianName?: string;

  reportTitle?: string;
}


function generatePieChart(data: Array<{ type: string; value: number; percentage: number }>): string {
  const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const size = 200;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90;
  const paths = data.map((item, index) => {
    const percentage = item.percentage;
    const angle = (percentage / 100) * 360;
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;

    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;

    currentAngle += angle;

    return `<path d="${pathData}" fill="${colors[index % colors.length]}" />`;
  }).join('');

  const legend = data.map((item, index) => `
    <div style="display: flex; align-items: center; margin: 4px 0; font-size: 11px;">
      <div style="width: 12px; height: 12px; background: ${colors[index % colors.length]}; margin-right: 6px; border-radius: 2px;"></div>
      <span style="color: #1f2937;">${item.type}: ${item.percentage.toFixed(1)}%</span>
    </div>
  `).join('');

  return `
    <div class="chart-container">
      <div class="chart-title">Segment Distribution</div>
      <svg viewBox="0 0 ${size} ${size}" style="width: 200px; height: 200px; margin: 0 auto; display: block;">
        ${paths}
      </svg>
      <div class="chart-legend">
        ${legend}
      </div>
    </div>
  `;
}


function generateLineChart(data: Array<{ date: string; duration: number; count: number }>): string {
  const width = 280;
  const height = 150;
  const padding = { top: 10, right: 10, bottom: 25, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxDuration = Math.max(...data.map(d => d.duration), 1);
  const xStep = chartWidth / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + chartHeight - (d.duration / maxDuration) * chartHeight;
    return { x, y, ...d };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const circles = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#0ea5e9" />`).join('');


  const xLabels = points.map((p, i) =>
    i % 2 === 0 ? `<text x="${p.x}" y="${height - 5}" text-anchor="middle" font-size="9" fill="#64748b">${p.date}</text>` : ''
  ).join('');


  const yTicks = [0, maxDuration / 2, maxDuration];
  const yLabels = yTicks.map(val => {
    const y = padding.top + chartHeight - (val / maxDuration) * chartHeight;
    return `<text x="${padding.left - 5}" y="${y}" text-anchor="end" font-size="9" fill="#64748b">${Math.round(val)}m</text>`;
  }).join('');

  return `
    <div class="chart-container">
      <div class="chart-title">Session Duration Trend (7 days)</div>
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;">
        <!-- Grid lines -->
        ${yTicks.map(val => {
          const y = padding.top + chartHeight - (val / maxDuration) * chartHeight;
          return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
        }).join('')}

        <!-- Line -->
        <path d="${pathData}" fill="none" stroke="#0ea5e9" stroke-width="2" />

        <!-- Points -->
        ${circles}

        <!-- Labels -->
        ${xLabels}
        ${yLabels}
      </svg>
    </div>
  `;
}


function generateHeatmap(data: Array<{ date: string; intensity: number; count: number }>): string {
  const cellSize = 35;
  const gap = 4;
  const cols = 7;
  const rows = Math.ceil(data.length / cols);
  const width = cols * (cellSize + gap);
  const height = rows * (cellSize + gap) + 40;


  const getColor = (intensity: number) => {
    const colors = ['#1e293b', '#164e63', '#0e7490', '#0891b2', '#06b6d4'];
    return colors[Math.min(Math.floor(intensity), 4)];
  };

  const cells = data.map((d, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellSize + gap);
    const y = row * (cellSize + gap) + 30;
    const color = getColor(d.intensity);
    const dateLabel = d.date.split('/')[1];

    return `
      <g>
        <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}"
              fill="${color}" rx="4" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <text x="${x + cellSize/2}" y="${y + cellSize/2 + 5}"
              text-anchor="middle" font-size="12" fill="#fff" font-weight="600">${dateLabel}</text>
        ${d.count > 0 ? `<text x="${x + cellSize - 4}" y="${y + 10}" text-anchor="end" font-size="8" fill="#fff" opacity="0.7">${d.count}</text>` : ''}
      </g>
    `;
  }).join('');


  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLabelElements = dayLabels.map((day, i) => `
    <text x="${i * (cellSize + gap) + cellSize/2}" y="20"
          text-anchor="middle" font-size="11" fill="#64748b" font-weight="600">${day}</text>
  `).join('');

  return `
    <div class="heatmap-container">
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;">
        ${dayLabelElements}
        ${cells}
      </svg>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; font-size: 11px; color: #64748b;">
        <span>Less</span>
        <div style="display: flex; gap: 3px;">
          ${[0,1,2,3,4].map(i => `<div style="width: 12px; height: 12px; background: ${getColor(i)}; border-radius: 2px;"></div>`).join('')}
        </div>
        <span>More</span>
      </div>
    </div>
  `;
}


function generateBarChart(data: Array<{ hour: number; count: number }>): string {
  const width = 280;
  const height = 150;
  const padding = { top: 10, right: 10, bottom: 25, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = chartWidth / data.length * 0.7;
  const gap = chartWidth / data.length * 0.3;

  const bars = data.map((d, i) => {
    const x = padding.left + i * (barWidth + gap);
    const barHeight = (d.count / maxCount) * chartHeight;
    const y = padding.top + chartHeight - barHeight;
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#8b5cf6" />
      <text x="${x + barWidth / 2}" y="${height - 5}" text-anchor="middle" font-size="9" fill="#64748b">${d.hour}h</text>
    `;
  }).join('');


  const yTicks = [0, maxCount / 2, maxCount];
  const yLabels = yTicks.map(val => {
    const y = padding.top + chartHeight - (val / maxCount) * chartHeight;
    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />
      <text x="${padding.left - 5}" y="${y}" text-anchor="end" font-size="9" fill="#64748b">${Math.round(val)}</text>
    `;
  }).join('');

  return `
    <div class="chart-container">
      <div class="chart-title">Sessions by Hour of Day</div>
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;">
        ${yLabels}
        ${bars}
      </svg>
    </div>
  `;
}


function generateReportHTML(options: ExportOptions): string {
  const { sessions, chartData, clinicName = 'Clinical Practice', clinicianName = 'Clinician', reportTitle = 'Clinical Analytics Report' } = options;


  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.totalDuration, 0);
  const avgSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions / 60000) : 0;
  const totalCheckpoints = sessions.reduce((sum, s) => sum + (s.laps?.length || 0), 0);


  const segmentStats = sessions.reduce((acc, session) => {
    session.segments?.forEach((seg) => {
      if (!acc[seg.type]) {
        acc[seg.type] = { count: 0, duration: 0 };
      }
      acc[seg.type].count++;
      acc[seg.type].duration += seg.duration;
    });
    return acc;
  }, {} as Record<string, { count: number; duration: number }>);

  const segmentRows = Object.entries(segmentStats)
    .sort((a, b) => b[1].duration - a[1].duration)
    .map(([type, stats]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${type}</td>
        <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${stats.count}</td>
        <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${Math.round(stats.duration / 60000)} min</td>
        <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${Math.round((stats.duration / totalDuration) * 100)}%</td>
      </tr>
    `)
    .join('');


  const recentSessions = sessions.slice(-10).reverse();
  const sessionRows = recentSessions
    .map((session) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">
          ${format(new Date(session.startTime), 'MMM dd, yyyy HH:mm')}
        </td>
        <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          ${Math.round(session.totalDuration / 60000)} min
        </td>
        <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          ${session.laps?.length || 0}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">
          ${session.segments?.map((s) => s.type).join(', ') || 'N/A'}
        </td>
      </tr>
    `)
    .join('');


  let metricsSection = '';
  let chartsSection = '';
  let heatmapSection = '';
  let insightsSection = '';

  if (chartData) {

    metricsSection = `
      <div class="section">
        <div class="section-title">Performance Metrics</div>
        <div class="enhanced-metrics-grid">
          <div class="enhanced-metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-label">SEQ</div>
            <div class="metric-value" style="color: #0ea5e9;">${chartData.metrics.seq}%</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">⚡</div>
            <div class="metric-label">CONSISTENCY LOAD</div>
            <div class="metric-value" style="color: #10b981;">${chartData.metrics.consistencyLoad}/10</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-label">TOTAL SESSIONS</div>
            <div class="metric-value" style="color: #8b5cf6;">${chartData.metrics.totalSessions}</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">⏱️</div>
            <div class="metric-label">AVG DURATION</div>
            <div class="metric-value" style="color: #f59e0b;">${chartData.metrics.avgDuration.toFixed(1)}</div>
            <div class="metric-unit">min</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">🕐</div>
            <div class="metric-label">TOTAL TIME</div>
            <div class="metric-value" style="color: #ef4444;">${chartData.metrics.totalTime.toFixed(1)}</div>
            <div class="metric-unit">hr</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">✓</div>
            <div class="metric-label">AVG CHECKPOINTS</div>
            <div class="metric-value" style="color: #ec4899;">${chartData.metrics.avgCheckpoints.toFixed(1)}</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-label">7-DAY AVG</div>
            <div class="metric-value" style="color: #0ea5e9;">${chartData.metrics.seqAvg.toFixed(1)}</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">✅</div>
            <div class="metric-label">COMPLETION</div>
            <div class="metric-value" style="color: #10b981;">${chartData.metrics.completion}%</div>
          </div>
          <div class="enhanced-metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-label">VARIABILITY</div>
            <div class="metric-value" style="color: #64748b;">±${chartData.metrics.variability}</div>
            <div class="metric-unit">min</div>
          </div>
        </div>
      </div>
    `;


    chartsSection = `
      <div class="section">
        <div class="section-title">Visual Analytics</div>
        <div class="charts-grid">
          ${generatePieChart(chartData.segmentDistribution)}
          ${generateLineChart(chartData.trendData)}
          ${generateBarChart(chartData.hourDistribution)}
        </div>
      </div>
    `;


    heatmapSection = `
      <div class="section">
        <div class="section-title">Activity Heatmap</div>
        ${generateHeatmap(chartData.heatmapData)}
      </div>
    `;


    insightsSection = `
      <div class="section">
        <div class="section-title">Clinical Insights</div>
        <div class="insights-grid">
          <div class="insight-card">
            <div class="insight-header">CONSISTENCY SCORE</div>
            <div class="insight-value" style="color: #10b981; font-size: 48px; font-weight: 700;">${chartData.insights.consistencyScore}%</div>
            <div class="insight-label">${chartData.insights.consistencyLabel}</div>
          </div>
          <div class="insight-metrics">
            <div class="insight-item">
              <span class="insight-item-label">AVG DURATION</span>
              <span class="insight-item-value">${chartData.insights.avgDuration} min</span>
            </div>
            <div class="insight-item">
              <span class="insight-item-label">SESSION CONSISTENCY</span>
              <span class="insight-item-value">${chartData.insights.sessionConsistency}%/day</span>
            </div>
            <div class="insight-item">
              <span class="insight-item-label">VARIABILITY (CV)</span>
              <span class="insight-item-value">${chartData.insights.variability}%</span>
            </div>
            <div class="insight-item">
              <span class="insight-item-label">STD DEVIATION</span>
              <span class="insight-item-value">±${chartData.insights.stdDeviation}</span>
            </div>
            <div class="insight-item">
              <span class="insight-item-label">TOTAL CHECKPOINTS</span>
              <span class="insight-item-value">${chartData.insights.totalCheckpoints}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      padding: 40px;
      background: #ffffff;
    }
    .header {
      border-bottom: 3px solid #0ea5e9;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .header .clinic-name {
      font-size: 16px;
      color: #0ea5e9;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .header .meta {
      font-size: 12px;
      color: #64748b;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }
    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #0ea5e9;
      line-height: 1;
    }
    .metric-unit {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    thead {
      background: #f8fafc;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e5e7eb;
    }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) {
      text-align: center;
    }
    td {
      color: #1f2937;
    }
    .enhanced-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 16px 0;
    }
    .enhanced-metric-card {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    .metric-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .chart-container {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }
    .chart-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
      text-align: center;
    }
    .chart-legend {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .heatmap-container {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .insights-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
    }
    .insight-card {
      background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
      border: 2px solid #0ea5e9;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
    }
    .insight-header {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .insight-value {
      line-height: 1;
      margin-bottom: 8px;
    }
    .insight-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .insight-metrics {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .insight-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .insight-item:last-child {
      border-bottom: none;
    }
    .insight-item-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .insight-item-value {
      font-size: 14px;
      color: #0f172a;
      font-weight: 700;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
    .footer .generated {
      margin-bottom: 8px;
    }
    .footer .clinician {
      font-weight: 600;
      color: #475569;
    }
    @media print {
      body {
        padding: 20px;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-name">${clinicName}</div>
    <h1>${reportTitle}</h1>
    <div class="meta">
      Report Period: ${sessions.length > 0 ? format(new Date(sessions[0].startTime), 'MMM dd, yyyy') : 'N/A'} - ${sessions.length > 0 ? format(new Date(sessions[sessions.length - 1].endTime), 'MMM dd, yyyy') : 'N/A'}
    </div>
  </div>

  ${metricsSection}

  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Sessions</div>
        <div class="metric-value">${totalSessions}</div>
        <div class="metric-unit">completed</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Duration</div>
        <div class="metric-value">${Math.round(totalDuration / 3600000)}</div>
        <div class="metric-unit">hours</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Avg Session</div>
        <div class="metric-value">${avgSessionDuration}</div>
        <div class="metric-unit">minutes</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Checkpoints</div>
        <div class="metric-value">${totalCheckpoints}</div>
        <div class="metric-unit">total</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Activity Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Activity Type</th>
          <th>Count</th>
          <th>Duration</th>
          <th>% of Total</th>
        </tr>
      </thead>
      <tbody>
        ${segmentRows}
      </tbody>
    </table>
  </div>

  ${chartsSection}

  ${heatmapSection}

  <div class="section">
    <div class="section-title">Recent Sessions</div>
    <table>
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Duration</th>
          <th>Checkpoints</th>
          <th>Activities</th>
        </tr>
      </thead>
      <tbody>
        ${sessionRows}
      </tbody>
    </table>
  </div>

  ${insightsSection}

  <div class="footer">
    <div class="generated">
      Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}
    </div>
    <div class="clinician">
      Prepared by: ${clinicianName}
    </div>
    <div style="margin-top: 12px; font-size: 10px;">
      This report contains confidential clinical data. Handle in accordance with HIPAA regulations.
    </div>
  </div>
</body>
</html>
  `;
}


export async function exportAnalyticsToPDF(options: ExportOptions): Promise<void> {
  try {
    const html = generateReportHTML(options);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `clinical-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: true,
        width: 794,
        windowWidth: 794,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    };

    console.warn('[PDF Export] Using html2pdf with HTML string, length:', html.length);

    try {

      const element = document.createElement('div');
      element.innerHTML = html;
      element.style.width = '210mm';
      element.style.padding = '20px';
      element.style.background = 'white';

      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error('[PDF Export] Generation failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to generate PDF report. Please try again.');
  }
}
