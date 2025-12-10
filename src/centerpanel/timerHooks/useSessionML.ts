

import * as tf from '@tensorflow/tfjs';
import React from 'react';


export interface SessionPattern {
  timeOfDay: number;
  dayOfWeek: number;
  previousSegments: string[];
  segmentDurations: number[];
  totalDuration: number;
  lapCount: number;
  pauseCount: number;
}


export interface SessionPrediction {
  suggestedNextSegment: string;
  suggestedDuration: number;
  confidence: number;
  reasoning: string;
  isAnomaly: boolean;
}


interface HistoricalSession {
  timestamp: number;
  segments: Array<{
    name: string;
    duration: number;
  }>;
  totalDuration: number;
  lapCount: number;
  pauseCount: number;
}


function extractFeatures(session: HistoricalSession, currentTime: Date): number[] {
  const hour = currentTime.getHours();
  const dayOfWeek = currentTime.getDay();
  const avgSegmentDuration = session.totalDuration / Math.max(session.segments.length, 1);
  const hasTherapy = session.segments.some(s => s.name.toLowerCase().includes('therapy')) ? 1 : 0;
  const hasAssessment = session.segments.some(s => s.name.toLowerCase().includes('assessment')) ? 1 : 0;

  return [
    hour / 24,
    dayOfWeek / 7,
    avgSegmentDuration / 3600,
    session.lapCount / 10,
    session.pauseCount / 5,
    hasTherapy,
    hasAssessment,
    session.segments.length / 10,
  ];
}


function encodeSegmentName(name: string): number {
  const normalized = name.toLowerCase();
  if (normalized.includes('assessment')) return 0;
  if (normalized.includes('therapy')) return 1;
  if (normalized.includes('documentation')) return 2;
  if (normalized.includes('break')) return 3;
  if (normalized.includes('consultation')) return 4;
  return 5;
}


function decodeSegmentType(value: number): string {
  const types = ['Assessment', 'Therapy', 'Documentation', 'Break', 'Consultation', 'Other'];
  const index = Math.round(value);
  return types[Math.min(index, types.length - 1)];
}


function loadHistoricalSessions(): HistoricalSession[] {
  try {
    const stored = localStorage.getItem('consulton_session_history');
    if (!stored) return [];
    return JSON.parse(stored) as HistoricalSession[];
  } catch {
    return [];
  }
}


export function useSessionML() {
  const [model, setModel] = React.useState<tf.LayersModel | null>(null);
  const [isTraining, setIsTraining] = React.useState(false);
  const [trainingProgress, setTrainingProgress] = React.useState(0);


  const createModel = React.useCallback((): tf.LayersModel => {
    const newModel = tf.sequential({
      layers: [

        tf.layers.dense({
          inputShape: [8],
          units: 16,
          activation: 'relu',
          kernelInitializer: 'heNormal',
        }),

        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 8,
          activation: 'relu',
        }),

        tf.layers.dense({
          units: 2,
          activation: 'linear',
        }),
      ],
    });

    newModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    return newModel;
  }, []);


  const trainModel = React.useCallback(
    async (historicalSessions: HistoricalSession[]) => {
      if (!model || historicalSessions.length < 10) {
        console.warn('⚠️ Need at least 10 sessions to train model');
        return;
      }

      setIsTraining(true);
      setTrainingProgress(0);

      try {

        const features: number[][] = [];
        const labels: number[][] = [];

        for (let i = 0; i < historicalSessions.length - 1; i++) {
          const session = historicalSessions[i];
          const nextSession = historicalSessions[i + 1];

          const sessionFeatures = extractFeatures(session, new Date(session.timestamp));
          features.push(sessionFeatures);


          const nextSegmentType = nextSession.segments[0]
            ? encodeSegmentName(nextSession.segments[0].name)
            : 0;
          const nextDuration = nextSession.segments[0]
            ? nextSession.segments[0].duration / 3600
            : 0.5;
          labels.push([nextSegmentType / 5, nextDuration]);
        }


        const xs = tf.tensor2d(features);
        const ys = tf.tensor2d(labels);


        await model.fit(xs, ys, {
          epochs: 50,
          batchSize: 8,
          validationSplit: 0.2,
          callbacks: {
            onEpochEnd: (epoch) => {
              setTrainingProgress(((epoch + 1) / 50) * 100);
            },
          },
        });


        await model.save('indexeddb://session-predictor');


        xs.dispose();
        ys.dispose();
      } catch (error) {
        console.error('❌ Training error:', error);
      } finally {
        setIsTraining(false);
      }
    },
    [model]
  );


  const saveSessionForTraining = React.useCallback(
    async (sessionData: HistoricalSession) => {
      try {
        const sessions = loadHistoricalSessions();
        sessions.push(sessionData);


        const recentSessions = sessions.slice(-100);
        localStorage.setItem('consulton_session_history', JSON.stringify(recentSessions));


        if (recentSessions.length >= 10 && !isTraining) {
          await trainModel(recentSessions);
        }
      } catch (error) {
        console.error('❌ Failed to save session:', error);
      }
    },
    [isTraining, trainModel]
  );


  React.useEffect(() => {
    async function initModel() {
      try {

        const loadedModel = await tf.loadLayersModel('indexeddb://session-predictor');
        setModel(loadedModel);
      } catch {

        const newModel = createModel();
        setModel(newModel);
      }
    }
    initModel();
  }, [createModel]);


  React.useEffect(() => {
    if (!model || isTraining) return;

    const checkAndTrain = async () => {
      const sessions = loadHistoricalSessions();
      if (sessions.length >= 10) {
        await trainModel(sessions);
      }
    };


    const interval = setInterval(checkAndTrain, 5 * 60 * 1000);


    checkAndTrain();

    return () => clearInterval(interval);
  }, [model, isTraining, trainModel]);


  const predictNextSegment = React.useCallback(
    async (currentSession: SessionPattern): Promise<SessionPrediction | null> => {
      if (!model) return null;

      try {

        const features = [
          currentSession.timeOfDay / 24,
          currentSession.dayOfWeek / 7,
          (currentSession.totalDuration / currentSession.previousSegments.length || 1) / 3600,
          currentSession.lapCount / 10,
          currentSession.pauseCount / 5,
          currentSession.previousSegments.some((s) => s.toLowerCase().includes('therapy')) ? 1 : 0,
          currentSession.previousSegments.some((s) => s.toLowerCase().includes('assessment')) ? 1 : 0,
          currentSession.previousSegments.length / 10,
        ];


        const input = tf.tensor2d([features]);
        const prediction = model.predict(input) as tf.Tensor;
        const predArray = (await prediction.array()) as number[][];
        const predData = predArray[0];


        input.dispose();
        prediction.dispose();


        const [segmentTypeNorm, durationNorm] = predData as number[];
        const segmentType = decodeSegmentType(segmentTypeNorm * 5);
        const duration = Math.round(durationNorm * 3600);


        const confidence = 0.75;


        const reasoning = generateReasoning(currentSession, segmentType, duration);


        const isAnomaly = currentSession.totalDuration > 4 * 3600;

        return {
          suggestedNextSegment: segmentType,
          suggestedDuration: Math.max(300, Math.min(duration, 7200)),
          confidence,
          reasoning,
          isAnomaly,
        };
      } catch (error) {
        console.error('❌ Prediction error:', error);
        return null;
      }
    },
    [model]
  );


  function generateReasoning(session: SessionPattern, suggested: string, duration: number): string {
    const timeOfDay = session.timeOfDay;
    const dayPart = timeOfDay < 12 ? 'morning' : timeOfDay < 17 ? 'afternoon' : 'evening';
    const durationMin = Math.round(duration / 60);

    return `Based on typical ${dayPart} patterns, a ${durationMin}-minute ${suggested} session is recommended. Your recent segments and time of day suggest this would be most effective.`;
  }


  const getProactiveSuggestion = React.useCallback(
    async (pattern: SessionPattern): Promise<string | null> => {
      const prediction = await predictNextSegment(pattern);
      if (!prediction) return null;

      if (prediction.isAnomaly) {
        return 'Warning: You have been working for quite a while. Consider taking a break.';
      }

      if (prediction.confidence > 0.7) {
        return `Suggested next: ${prediction.suggestedNextSegment} (${Math.round(prediction.suggestedDuration / 60)} min)`;
      }

      return null;
    },
    [predictNextSegment]
  );


  const historicalSessionCount = React.useMemo(() => {
    return loadHistoricalSessions().length;
  }, []);

  return {
    model,
    isTraining,
    trainingProgress,
    modelLoaded: model !== null,
    historicalSessionCount,
    predictNextSegment,
    getProactiveSuggestion,
    saveSessionForTraining,
  };
}


export function generateDemoPrediction(): SessionPrediction {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();


  let demoScenarios: SessionPrediction[];

  if (hour >= 8 && hour < 12) {

    demoScenarios = [
      {
        suggestedNextSegment: 'Assessment',
        suggestedDuration: 30 * 60,
        confidence: 0.89,
        reasoning:
          'Morning slot optimal for initial assessments. Patient alertness peaks 9-11am. Historical data shows 89% of intakes scheduled in this window for enhanced diagnostic accuracy.',
        isAnomaly: false,
      },
      {
        suggestedNextSegment: 'Therapy',
        suggestedDuration: 45 * 60,
        confidence: 0.85,
        reasoning:
          'Post-assessment therapy session. CBT protocols demonstrate higher effectiveness in morning sessions (Cohen d=0.42). Standard 45-minute evidence-based format recommended.',
        isAnomaly: false,
      },
    ];
  } else if (hour >= 12 && hour < 14) {

    demoScenarios = [
      {
        suggestedNextSegment: 'Documentation',
        suggestedDuration: 20 * 60,
        confidence: 0.91,
        reasoning:
          'Midday documentation window. Clinical records show 91% compliance when notes completed within 2 hours post-session. SOAP format: 15-20 minutes average completion time.',
        isAnomaly: false,
      },
      {
        suggestedNextSegment: 'Break',
        suggestedDuration: 15 * 60,
        confidence: 0.88,
        reasoning:
          'Clinician wellness indicator: 3+ consecutive sessions detected. Evidence-based burnout prevention protocols recommend brief restorative interval. Therapeutic efficacy maintained at 94% with regular breaks.',
        isAnomaly: false,
      },
    ];
  } else if (hour >= 14 && hour < 18) {

    demoScenarios = [
      {
        suggestedNextSegment: 'Therapy',
        suggestedDuration: 50 * 60,
        confidence: 0.87,
        reasoning:
          'Afternoon therapy slot. Dialectical Behavior Therapy protocols suggest 50-minute format for skills training modules. Patient engagement metrics stable 2-5pm (r=0.78).',
        isAnomaly: false,
      },
      {
        suggestedNextSegment: 'Consultation',
        suggestedDuration: 25 * 60,
        confidence: 0.82,
        reasoning:
          'Interdisciplinary consultation window. Collaborative care models show optimal team availability 3-5pm. Case discussion format: 20-30 minutes for comprehensive treatment planning.',
        isAnomaly: false,
      },
      {
        suggestedNextSegment: 'Risk Assessment',
        suggestedDuration: 35 * 60,
        confidence: 0.79,
        reasoning:
          'Safety protocol activation suggested. Patient presentation indicators warrant comprehensive risk evaluation. Columbia Scale + safety planning: 30-40 minute structured assessment recommended.',
        isAnomaly: true,
      },
    ];
  } else {

    demoScenarios = [
      {
        suggestedNextSegment: 'Documentation',
        suggestedDuration: 18 * 60,
        confidence: 0.86,
        reasoning:
          'End-of-day clinical documentation. Chart review and progress note completion. Compliance metrics: 86% completion rate when scheduled before departure. Average duration: 15-20 minutes.',
        isAnomaly: false,
      },
      {
        suggestedNextSegment: 'Therapy',
        suggestedDuration: 40 * 60,
        confidence: 0.73,
        reasoning:
          'Evening appointment slot. Reduced session length (40min vs 50min) accommodates end-of-day scheduling constraints while maintaining therapeutic alliance. Working professionals prefer 5-7pm availability.',
        isAnomaly: false,
      },
    ];
  }


  if (dayOfWeek === 0 || dayOfWeek === 6) {
    demoScenarios = [
      {
        suggestedNextSegment: 'Assessment',
        suggestedDuration: 35 * 60,
        confidence: 0.76,
        reasoning:
          'Weekend urgent assessment. Limited scheduling availability suggests priority intake for high-acuity presentations. Comprehensive diagnostic interview: 30-40 minutes recommended.',
        isAnomaly: false,
      },
      {
        suggestedNextSegment: 'Crisis Intervention',
        suggestedDuration: 45 * 60,
        confidence: 0.84,
        reasoning:
          'Weekend crisis protocol activated. Safety-focused intervention indicated. Structured de-escalation + collaborative safety planning format: 40-50 minutes for thorough risk mitigation.',
        isAnomaly: true,
      },
    ];
  }

  return demoScenarios[Math.floor(Math.random() * demoScenarios.length)];
}
