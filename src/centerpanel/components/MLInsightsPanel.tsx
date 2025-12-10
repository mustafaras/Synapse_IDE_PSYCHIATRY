

import React from 'react';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiCpu, FiDatabase, FiInfo, FiTrendingUp } from 'react-icons/fi';
import styles from './MLInsightsPanel.module.css';

interface MLInsightsPanelProps {
  isTraining: boolean;
  trainingProgress: number;
  historicalSessionCount: number;
  lastPrediction: {
    segment: string;
    duration: number;
    confidence: number;
  } | null;
  onClose: () => void;
}

export function MLInsightsPanel({
  isTraining,
  trainingProgress,
  historicalSessionCount,
  lastPrediction,
  onClose,
}: MLInsightsPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'architecture' | 'training' | 'predictions'>('overview');

  const minSessionsRequired = 10;
  const progressPercent = Math.min(100, (historicalSessionCount / minSessionsRequired) * 100);
  const isReady = historicalSessionCount >= minSessionsRequired;

  return (

    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      aria-label="Close ML Insights panel"
    >
      {}
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {}
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <FiCpu size={24} />
          </div>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Machine Learning Insights</h2>
            <p className={styles.subtitle}>
              Neural Network-Based Session Prediction System
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close panel"
          >
            ×
          </button>
        </header>

        {}
        <div className={`${styles.statusBanner} ${isReady ? styles.ready : styles.collecting}`}>
          <div className={styles.statusIcon}>
            {isReady ? <FiCheckCircle size={18} /> : <FiDatabase size={18} />}
          </div>
          <div className={styles.statusContent}>
            <div className={styles.statusLabel}>
              {isReady ? 'Model Status: Active' : 'Data Collection Phase'}
            </div>
            <div className={styles.statusText}>
              {isReady
                ? `${historicalSessionCount} sessions analyzed • Real-time predictions enabled`
                : `${historicalSessionCount}/${minSessionsRequired} sessions collected • ${Math.ceil((minSessionsRequired - historicalSessionCount) * 100 / minSessionsRequired)}% to activation`
              }
            </div>
          </div>
          {!isReady && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {}
        {Boolean(isTraining) && (
          <div className={styles.trainingAlert}>
            <FiActivity className={styles.spinner} size={16} />
            <span>Training in progress: {Math.round(trainingProgress)}% complete</span>
          </div>
        )}

        {}
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiInfo size={16} />
            Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'architecture' ? styles.active : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <FiCpu size={16} />
            Architecture
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'training' ? styles.active : ''}`}
            onClick={() => setActiveTab('training')}
          >
            <FiDatabase size={16} />
            Training
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'predictions' ? styles.active : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <FiTrendingUp size={16} />
            Predictions
          </button>
        </nav>

        {}
        <div className={styles.content}>
          {activeTab === 'overview' && (
            <OverviewTab
              isReady={isReady}
              historicalSessionCount={historicalSessionCount}
              lastPrediction={lastPrediction}
            />
          )}
          {activeTab === 'architecture' && <ArchitectureTab />}
          {activeTab === 'training' && (
            <TrainingTab
              historicalSessionCount={historicalSessionCount}
              isReady={isReady}
            />
          )}
          {activeTab === 'predictions' && (
            <PredictionsTab
              lastPrediction={lastPrediction}
              isReady={isReady}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  isReady,
  historicalSessionCount,
  lastPrediction
}: {
  isReady: boolean;
  historicalSessionCount: number;
  lastPrediction: { segment: string; duration: number; confidence: number } | null;
}) {
  return (
    <div className={styles.tabContent}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>System Purpose</h3>
        <p className={styles.text}>
          This machine learning system employs a <strong>supervised neural network</strong> trained on
          historical clinical session data to predict optimal next actions and session durations.
          The model learns temporal patterns, workflow sequences, and context-dependent behaviors
          to provide evidence-based recommendations.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Current Status</h3>
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <div className={styles.metricLabel}>Training Data</div>
            <div className={styles.metricValue}>
              {historicalSessionCount} <span className={styles.metricUnit}>sessions</span>
            </div>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricLabel}>Model State</div>
            <div className={styles.metricValue}>
              {isReady ? 'Active' : 'Collecting'}
            </div>
          </div>
          {lastPrediction != null && (
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Last Confidence</div>
              <div className={styles.metricValue}>
                {Math.round(lastPrediction.confidence * 100)}%
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Key Features</h3>
        <ul className={styles.featureList}>
          <li>
            <FiCheckCircle className={styles.featureIcon} />
            <div>
              <strong>Temporal Context Awareness:</strong> Analyzes time-of-day and day-of-week
              patterns to identify optimal scheduling windows
            </div>
          </li>
          <li>
            <FiCheckCircle className={styles.featureIcon} />
            <div>
              <strong>Sequential Pattern Recognition:</strong> Learns typical workflow progressions
              (e.g., Assessment → Therapy → Documentation)
            </div>
          </li>
          <li>
            <FiCheckCircle className={styles.featureIcon} />
            <div>
              <strong>Duration Optimization:</strong> Predicts session lengths based on segment type,
              historical averages, and engagement metrics
            </div>
          </li>
          <li>
            <FiCheckCircle className={styles.featureIcon} />
            <div>
              <strong>Client-Side Processing:</strong> All training and inference occurs locally using
              TensorFlow.js, ensuring data privacy
            </div>
          </li>
        </ul>
      </section>

      {!isReady && (
        <section className={styles.section}>
          <div className={styles.infoBox}>
            <FiAlertCircle size={20} />
            <div>
              <strong>Data Collection in Progress</strong>
              <p className={styles.infoText}>
                Complete {10 - historicalSessionCount} more clinical sessions to activate real-time
                ML predictions. Demo predictions with realistic scenarios are shown until sufficient
                training data is collected.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ArchitectureTab() {
  return (
    <div className={styles.tabContent}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Neural Network Architecture</h3>
        <p className={styles.text}>
          The prediction model implements a <strong>Sequential Deep Neural Network</strong> with
          the following topology:
        </p>

        <div className={styles.architecture}>
          <div className={styles.layer}>
            <div className={styles.layerLabel}>Input Layer</div>
            <div className={styles.layerDesc}>
              <strong>8 Features:</strong> Hour (normalized 0-1), Day of week (0-1),
              Average segment duration, Lap count, Pause count, Has therapy flag,
              Has assessment flag, Segment count
            </div>
          </div>

          <div className={styles.arrow}>↓</div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}>Hidden Layer 1</div>
            <div className={styles.layerDesc}>
              <strong>16 Units • ReLU Activation • He Normal Initialization</strong><br />
              Dense fully-connected layer extracts high-level temporal and sequential features
            </div>
          </div>

          <div className={styles.arrow}>↓</div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}>Dropout Regularization</div>
            <div className={styles.layerDesc}>
              <strong>20% Dropout Rate</strong><br />
              Prevents overfitting by randomly deactivating neurons during training
            </div>
          </div>

          <div className={styles.arrow}>↓</div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}>Hidden Layer 2</div>
            <div className={styles.layerDesc}>
              <strong>8 Units • ReLU Activation</strong><br />
              Refines learned representations for final prediction
            </div>
          </div>

          <div className={styles.arrow}>↓</div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}>Output Layer</div>
            <div className={styles.layerDesc}>
              <strong>2 Units • Linear Activation</strong><br />
              Outputs: (1) Next segment type [0-5], (2) Suggested duration [hours]
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Optimization Strategy</h3>
        <div className={styles.specGrid}>
          <div className={styles.spec}>
            <div className={styles.specLabel}>Optimizer</div>
            <div className={styles.specValue}>Adam (lr=0.001)</div>
            <div className={styles.specDesc}>Adaptive learning rate with momentum</div>
          </div>
          <div className={styles.spec}>
            <div className={styles.specLabel}>Loss Function</div>
            <div className={styles.specValue}>Mean Squared Error</div>
            <div className={styles.specDesc}>Penalizes prediction deviation quadratically</div>
          </div>
          <div className={styles.spec}>
            <div className={styles.specLabel}>Metrics</div>
            <div className={styles.specValue}>Mean Absolute Error</div>
            <div className={styles.specDesc}>Measures average prediction accuracy</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrainingTab({
  historicalSessionCount,
  isReady
}: {
  historicalSessionCount: number;
  isReady: boolean;
}) {
  return (
    <div className={styles.tabContent}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Training Methodology</h3>
        <p className={styles.text}>
          The model undergoes supervised learning using historical session data as labeled
          training examples. Each completed session is stored in <strong>browser localStorage</strong>
          and automatically triggers retraining when sufficient data accumulates.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Training Protocol</h3>
        <div className={styles.protocolGrid}>
          <div className={styles.protocolItem}>
            <div className={styles.protocolLabel}>Minimum Dataset Size</div>
            <div className={styles.protocolValue}>10 sessions</div>
            <div className={styles.protocolDesc}>
              Statistical threshold for reliable pattern detection
            </div>
          </div>
          <div className={styles.protocolItem}>
            <div className={styles.protocolLabel}>Training Epochs</div>
            <div className={styles.protocolValue}>50 iterations</div>
            <div className={styles.protocolDesc}>
              Multiple passes through dataset for convergence
            </div>
          </div>
          <div className={styles.protocolItem}>
            <div className={styles.protocolLabel}>Batch Size</div>
            <div className={styles.protocolValue}>8 samples</div>
            <div className={styles.protocolDesc}>
              Mini-batch gradient descent for stable learning
            </div>
          </div>
          <div className={styles.protocolItem}>
            <div className={styles.protocolLabel}>Validation Split</div>
            <div className={styles.protocolValue}>20% holdout</div>
            <div className={styles.protocolDesc}>
              Reserved data for generalization testing
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Data Management</h3>
        <ul className={styles.dataList}>
          <li>
            <strong>Storage:</strong> Sessions saved to <code>localStorage</code> with automatic
            pruning (maintains last 100 sessions)
          </li>
          <li>
            <strong>Persistence:</strong> Trained model saved to <code>IndexedDB</code> via
            TensorFlow.js serialization
          </li>
          <li>
            <strong>Auto-Training:</strong> Triggers every 5 minutes when ≥10 sessions available
            and model is idle
          </li>
          <li>
            <strong>Privacy:</strong> All computation occurs client-side; no data transmitted
            to external servers
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Current Training Data</h3>
        <div className={styles.dataStatus}>
          <div className={styles.dataMetric}>
            <div className={styles.dataLabel}>Sessions Collected</div>
            <div className={styles.dataValue}>{historicalSessionCount}</div>
          </div>
          <div className={styles.dataSeparator} />
          <div className={styles.dataMetric}>
            <div className={styles.dataLabel}>Training Status</div>
            <div className={styles.dataValue}>
              {isReady ? 'Active' : `${Math.round((historicalSessionCount / 10) * 100)}%`}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PredictionsTab({
  lastPrediction,
  isReady
}: {
  lastPrediction: { segment: string; duration: number; confidence: number } | null;
  isReady: boolean;
}) {
  return (
    <div className={styles.tabContent}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Prediction Mechanism</h3>
        <p className={styles.text}>
          The system generates predictions by performing <strong>forward propagation</strong> through
          the trained neural network. Input features extracted from the current session context
          are transformed through learned weight matrices to produce output predictions.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Feature Engineering</h3>
        <div className={styles.featureTable}>
          <div className={styles.featureRow}>
            <div className={styles.featureName}>Temporal Features</div>
            <div className={styles.featureDesc}>
              Hour of day (0-23 → 0-1), Day of week (0-6 → 0-1)
            </div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureName}>Session Metrics</div>
            <div className={styles.featureDesc}>
              Average duration, lap count (normalized), pause count (normalized)
            </div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureName}>Content Indicators</div>
            <div className={styles.featureDesc}>
              Binary flags: Has therapy segments, Has assessment segments
            </div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureName}>Workflow Context</div>
            <div className={styles.featureDesc}>
              Total segment count (normalized to 0-1 scale)
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Output Interpretation</h3>
        <p className={styles.text}>
          The model outputs two continuous values:
        </p>
        <ol className={styles.outputList}>
          <li>
            <strong>Segment Type (0-5 normalized):</strong> Decoded to categorical labels
            (Assessment, Therapy, Documentation, Break, Consultation, Other)
          </li>
          <li>
            <strong>Duration (hours):</strong> Denormalized and constrained to realistic
            clinical session lengths (5 minutes to 2 hours)
          </li>
        </ol>
      </section>

      {lastPrediction != null && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Last Prediction</h3>
          <div className={styles.predictionCard}>
            <div className={styles.predictionHeader}>
              <FiTrendingUp size={20} />
              <span>Most Recent Inference</span>
            </div>
            <div className={styles.predictionBody}>
              <div className={styles.predictionRow}>
                <span className={styles.predictionLabel}>Suggested Segment:</span>
                <span className={styles.predictionValue}>{lastPrediction.segment}</span>
              </div>
              <div className={styles.predictionRow}>
                <span className={styles.predictionLabel}>Predicted Duration:</span>
                <span className={styles.predictionValue}>{lastPrediction.duration} minutes</span>
              </div>
              <div className={styles.predictionRow}>
                <span className={styles.predictionLabel}>Confidence Score:</span>
                <span className={styles.predictionValue}>
                  {Math.round(lastPrediction.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {!isReady && (
        <section className={styles.section}>
          <div className={styles.infoBox}>
            <FiInfo size={20} />
            <div>
              <strong>Demo Mode Active</strong>
              <p className={styles.infoText}>
                Predictions currently use time-aware heuristic scenarios based on clinical
                best practices. Real ML predictions will activate after collecting {10} sessions.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
