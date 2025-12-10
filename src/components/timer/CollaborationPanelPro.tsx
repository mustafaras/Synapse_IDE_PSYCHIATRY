import * as React from 'react';
import { useCollaborationStore } from '@/store/useCollaborationStore';
import { 
  FiActivity, FiAlertCircle, FiBookOpen, FiCheck, FiClock, FiDownload,
  FiEdit3, FiEye, FiFileText, FiMessageSquare, FiPlus, FiShare2,
  FiShield, FiStar, FiTrendingUp, FiUsers, FiX
} from 'react-icons/fi';
import { useToast } from '@/hooks/useToast';
import styles from './collaboration-pro.module.css';

type CollabTab = 'templates' | 'workflows' | 'activity' | 'team' | 'session';

export function CollaborationPanel() {
  const {
    currentUser,
    coTherapySession,
    participants,
    sharedTemplates,
    workflows,
    recentActivity,
    startCoTherapy,
    addParticipant,
    addSharedTemplate,
    createWorkflow,
    approveWorkflow,
    markWorkflowRead,
    incrementTemplateUsage,
    shareTemplate,

  } = useCollaborationStore();

  const toast = useToast();

  const [inviteEmail, setInviteEmail] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState<CollabTab>('templates');

  React.useEffect(() => {

  }, []);

  React.useEffect(() => {

    const store = useCollaborationStore.getState();

    if (store.isInitialized || store.sharedTemplates.length > 0 || store.workflows.length > 0) {
      console.warn('[CollaborationPanelPro] Initialization skipped (already initialized or data present)');
      return;
    }

    console.warn('[CollaborationPanelPro] Initializing demo data...');

    store.setInitialized(true);

    addSharedTemplate({
        id: 'tpl-1',
        name: 'Initial Psychiatric Assessment',
        category: 'assessment',
        description: 'Comprehensive initial evaluation template for adult psychiatric assessment',
        content: '# Initial Psychiatric Assessment\\n\\n## Chief Complaint\\n\\n## History of Present Illness\\n\\n## Past Psychiatric History\\n\\n## Medical History\\n\\n## Mental Status Examination\\n\\n## Risk Assessment\\n\\n## Diagnostic Impression\\n\\n## Treatment Plan',
        visibility: 'team',
        tags: ['assessment', 'initial-eval', 'psychiatric'],
        ownerId: 'user-1',
        ownerName: 'Dr. Sarah Mitchell',
        version: 3,
        versionHistory: [],
        sharedWith: [],
        usageCount: 142,
        rating: 4.8,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-11-01'),
      });

      addSharedTemplate({
        id: 'tpl-2',
        name: 'Progress Note - CBT Session',
        category: 'note',
        description: 'Structured progress note for cognitive behavioral therapy sessions',
        content: '# CBT Progress Note\\n\\n## Session Information\\nDate: [DATE]\\nSession #: [NUMBER]\\n\\n## Session Objectives\\n\\n## Interventions Used\\n\\n## Client Progress\\n\\n## Homework Assigned\\n\\n## Next Session Plan',
        visibility: 'team',
        tags: ['progress-note', 'cbt', 'therapy'],
        ownerId: 'user-2',
        ownerName: 'Dr. James Chen',
        version: 5,
        versionHistory: [],
        sharedWith: [],
        usageCount: 89,
        rating: 4.6,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-10-28'),
      });

      addSharedTemplate({
        id: 'tpl-3',
        name: 'Medication Review Template',
        category: 'assessment',
        description: 'Systematic medication review and monitoring template',
        content: '# Medication Review\\n\\n## Current Medications\\n\\n## Efficacy Assessment\\n\\n## Side Effects Review\\n\\n## Drug Interactions Check\\n\\n## Adherence Assessment\\n\\n## Recommendations',
        visibility: 'organization',
        tags: ['medication', 'pharmacology', 'monitoring'],
        ownerId: 'user-1',
        ownerName: 'Dr. Sarah Mitchell',
        version: 2,
        versionHistory: [],
        sharedWith: [],
        usageCount: 67,
        rating: 4.9,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-11-10'),
      });

      addSharedTemplate({
        id: 'tpl-4',
        name: 'Crisis Intervention Protocol',
        category: 'intervention',
        description: 'Evidence-based crisis intervention and safety planning template',
        content: '# Crisis Intervention\\n\\n## Crisis Assessment\\n\\n## Immediate Safety Concerns\\n\\n## Safety Plan\\n\\n## Support System Activation\\n\\n## Follow-up Arrangements\\n\\n## Documentation',
        visibility: 'team',
        tags: ['crisis', 'safety-plan', 'emergency'],
        ownerId: 'user-3',
        ownerName: 'Dr. Emily Rodriguez',
        version: 4,
        versionHistory: [],
        sharedWith: [],
        usageCount: 34,
        rating: 5.0,
        createdAt: new Date('2024-04-05'),
        updatedAt: new Date('2024-11-15'),
      });

      addSharedTemplate({
        id: 'tpl-5',
        name: 'Family Therapy Session Note',
        category: 'note',
        description: 'Comprehensive family therapy session documentation template',
        content: '# Family Therapy Session\\n\\n## Attendees\\n\\n## Session Focus\\n\\n## Family Dynamics Observed\\n\\n## Interventions\\n\\n## Between-Session Tasks\\n\\n## Treatment Progress',
        visibility: 'team',
        tags: ['family-therapy', 'systemic', 'session-note'],
        ownerId: 'user-2',
        ownerName: 'Dr. James Chen',
        version: 1,
        versionHistory: [],
        sharedWith: [],
        usageCount: 23,
        rating: 4.7,
        createdAt: new Date('2024-05-12'),
        updatedAt: new Date('2024-11-12'),
      });

      addSharedTemplate({
        id: 'tpl-6',
        name: 'EMDR Therapy Session Protocol',
        category: 'intervention',
        description: 'Complete EMDR 8-phase protocol following Shapiro model with bilateral stimulation tracking',
        content: '# EMDR Therapy Session\\n\\n## Session: _____ Date: _____\\nPhase: [1-8]\\n\\n## Phase 1-2: History & Preparation (Complete)\\n\\n## Phase 3: Assessment\\n### Target Memory\\nImage: _____\\nNegative Cognition (NC): _____\\nPositive Cognition (PC): _____\\nVoC: [1-7] Current: ___\\n\\n### Emotions & Body\\nEmotions: _____\\nSUD: [0-10] _____\\nBody Sensation: _____\\n\\n## Phase 4: Desensitization\\n### Bilateral Stimulation\\nType: □ Eye movements □ Taps □ Tones\\nSets: _____\\n\\n### Processing\\nAssociations: _____\\nCognitive shifts: _____\\nSUD tracking: _____\\n\\n## Phase 5: Installation\\nPC strengthening\\nFinal VoC: [1-7]\\n\\n## Phase 6: Body Scan\\nResidual tension: _____\\n\\n## Phase 7: Closure\\nSelf-care plan: _____\\n\\n## Phase 8: Reevaluation\\nNext session focus: _____',
        visibility: 'team',
        tags: ['emdr', 'trauma', 'shapiro', 'bilateral-stimulation', 'protocol'],
        ownerId: 'user-3',
        ownerName: 'Dr. Emily Rodriguez',
        version: 4,
        versionHistory: [],
        sharedWith: [],
        usageCount: 143,
        rating: 4.9,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-11-17'),
      });

      addSharedTemplate({
        id: 'tpl-7',
        name: 'Motivational Interviewing (MI) Session',
        category: 'note',
        description: 'MI session note with OARS techniques, change talk analysis, and stage of change assessment',
        content: '# Motivational Interviewing Session\\n\\n## Stage of Change\\n□ Precontemplation □ Contemplation □ Preparation □ Action □ Maintenance\\n\\n## OARS Techniques\\n### Open Questions\\nExamples: _____\\n\\n### Affirmations\\nExamples: _____\\n\\n### Reflective Listening\\n- Simple reflections\\n- Complex reflections\\n- Double-sided reflections\\n\\n### Summaries\\nTransitional summaries: _____\\n\\n## Change Talk (DARN-CAT)\\n- Desire: _____\\n- Ability: _____\\n- Reasons: _____\\n- Need: _____\\n- Commitment: _____\\n- Activation: _____\\n- Taking Steps: _____\\n\\n## Sustain Talk\\nBarriers: _____\\nStrategies: _____\\n\\n## Ambivalence Exploration\\nPros of change: _____\\nCons of change: _____\\n\\n## MI Spirit Adherence\\n□ Partnership □ Acceptance □ Compassion □ Evocation\\n\\n## Change Plan\\nGoal: _____\\nSteps: _____\\nConfidence: [0-10]\\nImportance: [0-10]',
        visibility: 'team',
        tags: ['motivational-interviewing', 'mi', 'change-talk', 'miller-rollnick', 'oars'],
        ownerId: 'user-2',
        ownerName: 'Dr. James Chen',
        version: 3,
        versionHistory: [],
        sharedWith: [],
        usageCount: 192,
        rating: 4.8,
        createdAt: new Date('2024-04-10'),
        updatedAt: new Date('2024-11-17'),
      });

      addSharedTemplate({
        id: 'tpl-8',
        name: 'Acceptance & Commitment Therapy (ACT) Formulation',
        category: 'assessment',
        description: 'ACT hexaflex case conceptualization with psychological flexibility assessment',
        content: '# ACT Case Formulation\\n\\n## Psychological Flexibility Hexaflex\\n\\n### 1. Present Moment Awareness\\nDeficits: _____\\nStrengths: _____\\n\\n### 2. Acceptance\\nExperiential avoidance patterns: _____\\nWillingness level: _____\\n\\n### 3. Cognitive Defusion\\nFusion with thoughts: _____\\nDefusion skills: _____\\n\\n### 4. Self-as-Context\\nSelf-concept: _____\\nObserver perspective: _____\\n\\n### 5. Values Clarification\\n#### Life Domains\\n- Relationships: _____\\n- Work: _____\\n- Personal Growth: _____\\n- Health: _____\\n- Leisure: _____\\n- Spirituality: _____\\n\\n### 6. Committed Action\\nValued directions: _____\\nBehavioral patterns: _____\\nBarriers: _____\\n\\n## Metaphors Used\\n- _____\\n- _____\\n\\n## Experiential Exercises\\n- _____\\n- _____\\n\\n## Creative Hopelessness\\nUnworkable strategies: _____\\nCosts of avoidance: _____\\n\\n## Treatment Focus\\n1. _____\\n2. _____\\n3. _____\\n\\n## Outcome Measures\\nAAQ-II: _____\\nVLQ: _____\\nPsych flexibility: _____',
        visibility: 'team',
        tags: ['act', 'acceptance', 'values', 'mindfulness', 'hayes', 'hexaflex'],
        ownerId: 'user-3',
        ownerName: 'Dr. Emily Rodriguez',
        version: 3,
        versionHistory: [],
        sharedWith: [],
        usageCount: 176,
        rating: 4.8,
        createdAt: new Date('2024-05-05'),
        updatedAt: new Date('2024-11-17'),
      });

      addSharedTemplate({
        id: 'tpl-9',
        name: 'Psychopharmacology Consultation',
        category: 'assessment',
        description: 'Comprehensive medication management with pharmacogenomics and evidence-based prescribing',
        content: '# Psychopharmacology Consultation\\n\\n## Current Medications\\n| Medication | Dose | Frequency | Duration | Response |\\n|------------|------|-----------|----------|----------|\\n| | | | | |\\n\\n## Target Symptoms\\n1. _____\\n2. _____\\n3. _____\\n\\n## Efficacy Analysis\\nSymptom reduction: [0-100%]\\nFunctional improvement: _____\\nQoL impact: _____\\n\\n## Tolerability\\n### Adverse Effects\\n- Sedation: _____\\n- Weight: _____\\n- Sexual: _____\\n- Metabolic: _____\\n- Cardiovascular: _____\\n\\n## Pharmacogenomics\\nCYP450 metabolism: _____\\nGenetic variants: _____\\nMedication sensitivities: _____\\n\\n## Drug Interactions\\n### Pharmacokinetic\\n- Absorption: _____\\n- Metabolism: _____\\n\\n### Pharmacodynamic\\n- Synergistic: _____\\n- QTc risk: _____\\n\\n## Evidence-Based Rationale\\nFirst-line: _____\\nRCT support: _____\\nMeta-analysis: _____\\n\\n## Medication Changes\\n□ No changes □ Dose adjust □ Addition □ D/C □ Switch\\n\\nRationale: _____\\nTitration: _____\\n\\n## Safety Monitoring\\nBaseline labs: _____\\nFollow-up: _____\\nVital signs: _____\\n\\n## Patient Education\\nExpected benefits: _____\\nSide effects: _____\\nTime to effect: _____\\nWarning signs: _____\\n\\n## Follow-up\\nNext visit: _____\\nMonitoring: _____',
        visibility: 'organization',
        tags: ['medication', 'pharmacology', 'prescribing', 'evidence-based', 'pharmacogenomics'],
        ownerId: 'user-1',
        ownerName: 'Dr. Sarah Mitchell',
        version: 6,
        versionHistory: [],
        sharedWith: [],
        usageCount: 412,
        rating: 4.9,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-11-17'),
      });

      addSharedTemplate({
        id: 'tpl-10',
        name: 'Child & Adolescent Psychiatric Evaluation',
        category: 'assessment',
        description: 'Developmentally appropriate assessment for ages 6-17 with family and school integration',
        content: '# Child/Adolescent Assessment\\n\\n## Identifying Information\\nAge: _____ Grade: _____\\nSchool: _____\\nLiving situation: _____\\n\\n## Chief Complaint\\nParent/Guardian: _____\\nChild/Adolescent: _____\\n\\n## Developmental History\\n### Prenatal/Perinatal\\n- Pregnancy: _____\\n- Birth: _____\\n- APGAR: _____\\n\\n### Early Development\\n- Motor milestones: _____\\n- Language: _____\\n- Social: _____\\n- Toilet training: _____\\n\\n### School History\\n- Academic: _____\\n- Learning: _____\\n- IEP/504: _____\\n- Peer relationships: _____\\n- Behavioral issues: _____\\n\\n## Family Assessment\\n### Structure\\n- Parents: _____\\n- Siblings: _____\\n- Custody: _____\\n\\n### Psychiatric History\\n- Mood disorders: _____\\n- Anxiety: _____\\n- ADHD: _____\\n- Autism: _____\\n- Substance use: _____\\n- Suicide: _____\\n\\n## Psychosocial\\n- Trauma: _____\\n- Abuse/neglect: _____\\n- Bullying: _____\\n- Social support: _____\\n- Cultural factors: _____\\n\\n## Mental Status\\n### Appearance\\nAge-appropriate: _____\\nGrooming: _____\\nEye contact: _____\\n\\n### Behavior\\nActivity: _____\\nAttention: _____\\nCooperation: _____\\nImpulse control: _____\\n\\n### Mood & Affect\\nReported: _____\\nObserved: _____\\nRange: _____\\n\\n### Cognitive\\nIntellectual: _____\\nAcademic: _____\\nExecutive function: _____\\n\\n## Risk Assessment\\n- Self-harm: _____\\n- Suicidal: _____\\n- Aggression: _____\\n- Running away: _____\\n\\n## Diagnostic Impression\\nPrimary: _____\\nDifferential: _____\\nRule out: _____\\n\\n## Treatment Plan\\n### Individual Therapy\\nApproach: _____\\nFrequency: _____\\n\\n### Family Therapy\\nParent training: _____\\nFamily sessions: _____\\n\\n### School\\nAccommodations: _____\\nBehavioral support: _____\\n\\n### Medication\\nIndicated: □ Yes □ No\\nRationale: _____\\n\\n### Collateral\\n- School: _____\\n- Pediatrician: _____\\n- Other: _____',
        visibility: 'organization',
        tags: ['child', 'adolescent', 'developmental', 'pediatric', 'family'],
        ownerId: 'user-2',
        ownerName: 'Dr. James Chen',
        version: 4,
        versionHistory: [],
        sharedWith: [],
        usageCount: 267,
        rating: 4.8,
        createdAt: new Date('2024-04-25'),
        updatedAt: new Date('2024-11-17'),
      });

      addSharedTemplate({
        id: 'tpl-11',
        name: 'Schema Therapy Conceptualization',
        category: 'intervention',
        description: 'Comprehensive schema therapy case formulation with mode identification and treatment planning',
        content: '# Schema Therapy Conceptualization\\n\\n## Early Maladaptive Schemas\\n### Domain I: Disconnection & Rejection\\n- Abandonment/Instability: _____\\n- Mistrust/Abuse: _____\\n- Emotional Deprivation: _____\\n- Defectiveness/Shame: _____\\n- Social Isolation: _____\\n\\n### Domain II: Impaired Autonomy\\n- Dependence/Incompetence: _____\\n- Vulnerability to Harm: _____\\n- Enmeshment/Undeveloped Self: _____\\n- Failure: _____\\n\\n### Domain III: Impaired Limits\\n- Entitlement/Grandiosity: _____\\n- Insufficient Self-Control: _____\\n\\n### Domain IV: Other-Directedness\\n- Subjugation: _____\\n- Self-Sacrifice: _____\\n- Approval-Seeking: _____\\n\\n### Domain V: Overvigilance\\n- Negativity/Pessimism: _____\\n- Emotional Inhibition: _____\\n- Unrelenting Standards: _____\\n- Punitiveness: _____\\n\\n## Schema Modes\\n### Child Modes\\n- Vulnerable Child: _____\\n- Angry Child: _____\\n- Impulsive Child: _____\\n- Undisciplined Child: _____\\n- Happy Child: _____\\n\\n### Maladaptive Coping\\n- Compliant Surrenderer: _____\\n- Detached Protector: _____\\n- Overcompensator: _____\\n\\n### Maladaptive Parent\\n- Punitive Parent: _____\\n- Demanding Parent: _____\\n\\n### Healthy Adult\\nStrength: _____\\nDevelopment: _____\\n\\n## Origins\\n### Childhood Experiences\\nCore needs unmet: _____\\nTraumatic events: _____\\nFamily patterns: _____\\n\\n### Temperament\\nBiological: _____\\nEmotional: _____\\n\\n## Maintenance\\nSchema perpetuation: _____\\nAvoidance strategies: _____\\nRelationship patterns: _____\\n\\n## Treatment Plan\\n### Phase I: Bond & Emotional Regulation\\n- Limited reparenting: _____\\n- Empathic confrontation: _____\\n- Emotional regulation: _____\\n\\n### Phase II: Mode Change\\n- Experiential techniques: _____\\n- Imagery rescripting: _____\\n- Chair work: _____\\n\\n### Phase III: Autonomy\\n- Behavioral pattern breaking: _____\\n- Real-world testing: _____\\n- Healthy Adult strengthening: _____',
        visibility: 'team',
        tags: ['schema-therapy', 'personality', 'young', 'experiential', 'modes'],
        ownerId: 'user-1',
        ownerName: 'Dr. Sarah Mitchell',
        version: 2,
        versionHistory: [],
        sharedWith: [],
        usageCount: 89,
        rating: 4.9,
        createdAt: new Date('2024-06-10'),
        updatedAt: new Date('2024-11-16'),
      });

      addSharedTemplate({
        id: 'tpl-12',
        name: 'DBT Skills Training Session',
        category: 'intervention',
        description: 'Dialectical Behavior Therapy skills teaching module with homework and practice',
        content: '# DBT Skills Training Session\\n\\n## Session Information\\nModule: □ Mindfulness □ Distress Tolerance □ Emotion Regulation □ Interpersonal Effectiveness\\nSkill: _____\\nWeek: _____\\n\\n## Check-In\\n### Diary Card Review\\n- Target behaviors: _____\\n- Skills used: _____\\n- Urges: _____\\n- Emotions: _____\\n\\n### Previous Homework\\nCompleted: □ Yes □ No □ Partial\\nObstacles: _____\\nLearning: _____\\n\\n## Mindfulness (if primary)\\n### Core Skills\\n- Wise Mind: _____\\n- What Skills: Observe, Describe, Participate\\n- How Skills: Nonjudgmentally, One-mindfully, Effectively\\n\\n### Practice\\nExercise: _____\\nExperience: _____\\n\\n## Distress Tolerance (if primary)\\n### Crisis Survival\\n- STOP: _____\\n- TIP: Temperature, Intense exercise, Paced breathing, Paired muscle relaxation\\n- ACCEPTS: _____\\n- Self-Soothe: _____\\n- IMPROVE: _____\\n\\n### Reality Acceptance\\n- Radical Acceptance: _____\\n- Turning the Mind: _____\\n- Willingness: _____\\n\\n## Emotion Regulation (if primary)\\n### Understanding Emotions\\n- Function: _____\\n- Prompting events: _____\\n- Vulnerability factors: _____\\n\\n### Changing Emotions\\n- Check the Facts: _____\\n- Opposite Action: _____\\n- Problem Solving: _____\\n\\n### Reducing Vulnerability\\n- PLEASE: Physical illness, Eating, Avoid mood-altering drugs, Sleep, Exercise\\n- ABC: Accumulate positives, Build mastery, Cope ahead\\n\\n## Interpersonal Effectiveness (if primary)\\n### DEAR MAN\\n- Describe: _____\\n- Express: _____\\n- Assert: _____\\n- Reinforce: _____\\n- Mindful: _____\\n- Appear confident: _____\\n- Negotiate: _____\\n\\n### GIVE\\n- Gentle: _____\\n- Interested: _____\\n- Validate: _____\\n- Easy manner: _____\\n\\n### FAST\\n- Fair: _____\\n- Apologies (no excessive): _____\\n- Stick to values: _____\\n- Truthful: _____\\n\\n## Practice Exercise\\nSkill demonstrated: _____\\nClient participation: _____\\nObservations: _____\\n\\n## Homework\\nSkill practice: _____\\nDiary card: □ Daily\\nNext session: _____',
        visibility: 'team',
        tags: ['dbt', 'linehan', 'skills-training', 'borderline', 'emotional-regulation'],
        ownerId: 'user-3',
        ownerName: 'Dr. Emily Rodriguez',
        version: 3,
        versionHistory: [],
        sharedWith: [],
        usageCount: 156,
        rating: 4.9,
        createdAt: new Date('2024-07-08'),
        updatedAt: new Date('2024-11-15'),
      });

      addSharedTemplate({
        id: 'tpl-13',
        name: 'Neuropsychological Assessment Report',
        category: 'assessment',
        description: 'Comprehensive neuropsych testing results with cognitive domain analysis',
        content: '# Neuropsychological Evaluation\\n\\n## Reason for Referral\\nReferring provider: _____\\nQuestion(s): _____\\n\\n## Background\\n### Medical History\\n- Neurological: _____\\n- Head injury: _____\\n- Seizures: _____\\n- Stroke: _____\\n- Other: _____\\n\\n### Psychiatric\\n- Mood: _____\\n- Anxiety: _____\\n- Psychosis: _____\\n- Treatment: _____\\n\\n### Developmental\\n- Academic: _____\\n- Learning disabilities: _____\\n- ADHD: _____\\n\\n### Substance Use\\nHistory: _____\\nCurrent: _____\\n\\n### Medications\\nPsychotropic: _____\\nOther: _____\\n\\n## Behavioral Observations\\nCooperation: _____\\nEffort: _____\\nTest-taking attitude: _____\\nValidity indicators: _____\\n\\n## Test Results\\n### Premorbid Functioning\\n- WTAR/TOPF: _____\\n- Estimated IQ: _____\\n\\n### General Cognitive\\n#### WAIS-IV\\n- FSIQ: _____\\n- VCI: _____\\n- PRI: _____\\n- WMI: _____\\n- PSI: _____\\n\\n### Attention/Concentration\\n- CPT-3: _____\\n- Digit Span: _____\\n- Trail Making A: _____\\n\\n### Executive Function\\n- WCST: _____\\n- Stroop: _____\\n- Trail Making B: _____\\n- FAS/Animals: _____\\n- Tower of London: _____\\n\\n### Memory\\n#### Verbal\\n- CVLT-3: _____\\n- Immediate: _____\\n- Delayed: _____\\n- Recognition: _____\\n\\n#### Visual\\n- RCFT: _____\\n- BVMT-R: _____\\n\\n#### Working Memory\\n- Digit Span: _____\\n- Letter-Number: _____\\n\\n### Language\\n- BNT: _____\\n- Comprehension: _____\\n- Repetition: _____\\n\\n### Visuospatial\\n- RCFT Copy: _____\\n- Clock Drawing: _____\\n- Block Design: _____\\n\\n### Processing Speed\\n- Coding: _____\\n- Symbol Search: _____\\n- Trail Making A: _____\\n\\n### Emotional/Personality\\n- MMPI-3: _____\\n- PAI: _____\\n- BDI-II: _____\\n- BAI: _____\\n\\n## Summary & Interpretation\\n### Cognitive Profile\\nStrengths: _____\\nWeaknesses: _____\\nPattern: _____\\n\\n### Clinical Significance\\nImpairment level: _____\\nFunctional impact: _____\\nChange from baseline: _____\\n\\n## Diagnostic Impressions\\nPrimary: _____\\nContributing: _____\\nRule out: _____\\n\\n## Recommendations\\n### Treatment\\n- Cognitive remediation: _____\\n- Psychotherapy: _____\\n- Medication: _____\\n\\n### Academic/Vocational\\n- Accommodations: _____\\n- Modifications: _____\\n\\n### Follow-up\\n- Re-evaluation: _____\\n- Imaging: _____\\n- Consultation: _____',
        visibility: 'organization',
        tags: ['neuropsych', 'cognitive', 'testing', 'assessment', 'wais'],
        ownerId: 'user-4',
        ownerName: 'Dr. Michael Park',
        version: 5,
        versionHistory: [],
        sharedWith: [],
        usageCount: 78,
        rating: 5.0,
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-11-14'),
      });

      addSharedTemplate({
        id: 'tpl-14',
        name: 'Couples Therapy Initial Assessment',
        category: 'assessment',
        description: 'Comprehensive relationship assessment with attachment and communication patterns',
        content: '# Couples Therapy Assessment\\n\\n## Couple Information\\n### Partner 1\\nName: _____\\nAge: _____\\nOccupation: _____\\n\\n### Partner 2\\nName: _____\\nAge: _____\\nOccupation: _____\\n\\n## Relationship History\\n### Timeline\\n- Met: _____\\n- Dating: _____\\n- Committed: _____\\n- Married/Partnered: _____\\n- Children: _____\\n\\n### Presenting Problems\\nPartner 1 perspective: _____\\nPartner 2 perspective: _____\\nAreas of agreement: _____\\nAreas of disagreement: _____\\n\\n## Current Functioning\\n### Communication\\n- Frequency: _____\\n- Quality: _____\\n- Conflict style: _____\\n- Repair attempts: _____\\n\\n### Intimacy\\n#### Emotional\\n- Connection: _____\\n- Vulnerability: _____\\n- Trust: _____\\n\\n#### Physical\\n- Affection: _____\\n- Sexual: _____\\n- Satisfaction: _____\\n\\n### Roles & Responsibilities\\n- Household: _____\\n- Financial: _____\\n- Parenting: _____\\n- Decision-making: _____\\n\\n## Attachment Patterns\\n### Partner 1\\n- Style: □ Secure □ Anxious □ Avoidant □ Disorganized\\n- Childhood experiences: _____\\n- Current behaviors: _____\\n\\n### Partner 2\\n- Style: □ Secure □ Anxious □ Avoidant □ Disorganized\\n- Childhood experiences: _____\\n- Current behaviors: _____\\n\\n### Couple Dynamic\\nPursuit-withdrawal: _____\\nDemand-withdraw: _____\\nMutual avoidance: _____\\n\\n## Gottman Assessment\\n### Four Horsemen\\n- Criticism: _____\\n- Contempt: _____\\n- Defensiveness: _____\\n- Stonewalling: _____\\n\\n### Positive Indicators\\n- Fondness/admiration: _____\\n- Turning toward: _____\\n- Positive sentiment override: _____\\n\\n## External Stressors\\n- Work: _____\\n- Extended family: _____\\n- Financial: _____\\n- Health: _____\\n- Children: _____\\n\\n## Individual Factors\\n### Partner 1\\n- Mental health: _____\\n- Substance use: _____\\n- Trauma: _____\\n\\n### Partner 2\\n- Mental health: _____\\n- Substance use: _____\\n- Trauma: _____\\n\\n## Strengths\\nRelationship: _____\\nIndividual: _____\\nSupport system: _____\\n\\n## Treatment Plan\\n### Goals\\n1. _____\\n2. _____\\n3. _____\\n\\n### Approach\\n□ Emotionally Focused Therapy (EFT)\\n□ Gottman Method\\n□ Integrative Behavioral Couples Therapy\\n□ Other: _____\\n\\n### Structure\\nFrequency: _____\\nConjoint sessions: _____\\nIndividual sessions: _____\\n\\n### Focus Areas\\n- Communication skills: _____\\n- Emotional regulation: _____\\n- Attachment security: _____\\n- Conflict resolution: _____',
        visibility: 'team',
        tags: ['couples', 'eft', 'gottman', 'relationship', 'attachment'],
        ownerId: 'user-2',
        ownerName: 'Dr. James Chen',
        version: 2,
        versionHistory: [],
        sharedWith: [],
        usageCount: 134,
        rating: 4.7,
        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-11-13'),
      });

      addSharedTemplate({
        id: 'tpl-15',
        name: 'Substance Use Disorder Assessment',
        category: 'assessment',
        description: 'Comprehensive addiction assessment with ASAM criteria and stage of change',
        content: '# Substance Use Disorder Assessment\\n\\n## Presenting Concern\\nPrimary substance: _____\\nSecondary: _____\\nRoute: _____\\nReason for assessment: _____\\n\\n## Substance Use History\\n### Current Use\\n#### Primary Substance\\n- First use: _____\\n- Regular use began: _____\\n- Current frequency: _____\\n- Amount: _____\\n- Last use: _____\\n- Spending: _____\\n\\n#### Pattern\\n- Binge: □ Yes □ No\\n- Daily: □ Yes □ No\\n- Solitary: □ Yes □ No\\n- Morning use: □ Yes □ No\\n\\n### Other Substances\\n- Alcohol: _____\\n- Cannabis: _____\\n- Stimulants: _____\\n- Opioids: _____\\n- Benzodiazepines: _____\\n- Hallucinogens: _____\\n- Other: _____\\n\\n## DSM-5-TR Criteria\\n### Impaired Control\\n1. Larger amounts/longer: □\\n2. Persistent desire/unsuccessful efforts: □\\n3. Great deal of time: □\\n4. Craving: □\\n\\n### Social Impairment\\n5. Failure to fulfill obligations: □\\n6. Continued despite problems: □\\n7. Activities given up: □\\n\\n### Risky Use\\n8. Hazardous situations: □\\n9. Physical/psychological problems: □\\n\\n### Pharmacological\\n10. Tolerance: □\\n11. Withdrawal: □\\n\\nSeverity: □ Mild (2-3) □ Moderate (4-5) □ Severe (6+)\\n\\n## Consequences\\n### Medical\\n- Overdoses: _____\\n- ER visits: _____\\n- Hospitalizations: _____\\n- HIV/HCV: _____\\n- Other: _____\\n\\n### Legal\\n- DUI/DWI: _____\\n- Arrests: _____\\n- Incarceration: _____\\n- Probation: _____\\n\\n### Social\\n- Relationships: _____\\n- Employment: _____\\n- Housing: _____\\n- Financial: _____\\n\\n## Treatment History\\n### Previous Attempts\\n- Detox: _____\\n- Residential: _____\\n- IOP/PHP: _____\\n- Outpatient: _____\\n- Medication-assisted: _____\\n- 12-step: _____\\n- Other: _____\\n\\n### Outcomes\\n- Longest sobriety: _____\\n- Relapse triggers: _____\\n- What helped: _____\\n- Barriers: _____\\n\\n## ASAM Criteria\\n### Dimension 1: Withdrawal\\nRisk: □ None □ Mild □ Moderate □ Severe\\nManagement: _____\\n\\n### Dimension 2: Biomedical\\nConditions: _____\\nStability: _____\\n\\n### Dimension 3: Emotional/Behavioral\\nPsychiatric: _____\\nSuicidality: _____\\nStability: _____\\n\\n### Dimension 4: Readiness to Change\\nStage: □ Precontemplation □ Contemplation □ Preparation □ Action □ Maintenance\\nMotivation: _____\\n\\n### Dimension 5: Relapse Potential\\nRisk: _____\\nCoping skills: _____\\nInsight: _____\\n\\n### Dimension 6: Recovery Environment\\nSupports: _____\\nRisks: _____\\nStability: _____\\n\\n## Level of Care Recommendation\\n□ 0.5: Early intervention\\n□ 1: Outpatient\\n□ 2.1: Intensive outpatient\\n□ 2.5: Partial hospitalization\\n□ 3.1: Clinically managed low-intensity residential\\n□ 3.3: Clinically managed medium-intensity residential\\n□ 3.5: Clinically managed high-intensity residential\\n□ 3.7: Medically monitored intensive inpatient\\n□ 4: Medically managed intensive inpatient\\n\\nRationale: _____\\n\\n## Treatment Plan\\n### Immediate\\n- Detox: _____\\n- Medication: _____\\n- Safety: _____\\n\\n### Short-term\\n- Level of care: _____\\n- Frequency: _____\\n- Approach: _____\\n\\n### Medications\\n□ Naltrexone □ Buprenorphine □ Methadone\\n□ Disulfiram □ Acamprosate\\n□ Other: _____\\n\\n### Psychosocial\\n- Individual: _____\\n- Group: _____\\n- Family: _____\\n- 12-step: _____\\n- MAT: _____\\n\\n### Supports\\n- Housing: _____\\n- Employment: _____\\n- Legal: _____\\n- Medical: _____',
        visibility: 'organization',
        tags: ['sud', 'addiction', 'asam', 'substance-use', 'recovery'],
        ownerId: 'user-5',
        ownerName: 'Dr. Lisa Thompson',
        version: 3,
        versionHistory: [],
        sharedWith: [],
        usageCount: 198,
        rating: 4.8,
        createdAt: new Date('2024-09-20'),
        updatedAt: new Date('2024-11-12'),
      });

      createWorkflow({
        id: 'wf-1',
        type: 'consultation',
        title: 'Consultation Request: Complex PTSD Case',
        description: 'Seeking second opinion on treatment approach for 35-year-old patient with complex PTSD and comorbid depression. Patient has not responded to initial CBT protocol.',
        requesterId: 'user-2',
        requesterName: 'Dr. James Chen',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'high',
        status: 'pending',
        sessionId: 'session-2024-1115-001',
        dueDate: new Date('2024-11-20'),
        comments: [
          {
            id: 'cmt-1',
            userId: 'user-2',
            userName: 'Dr. James Chen',
            content: 'Patient has completed 8 sessions with minimal improvement. Considering EMDR or prolonged exposure therapy as alternatives.',
            timestamp: new Date('2024-11-15T10:30:00'),
          }
        ],
        createdAt: new Date('2024-11-15T10:30:00'),
        updatedAt: new Date('2024-11-15T10:30:00'),
      });

      createWorkflow({
        id: 'wf-2',
        type: 'peer_review',
        title: 'Peer Review: Medication Adjustment Protocol',
        description: 'Request for peer review of proposed medication adjustments for patient with treatment-resistant depression.',
        requesterId: 'user-1',
        requesterName: 'Dr. Sarah Mitchell',
        assignedTo: 'user-3',
        assignedToName: 'Dr. Emily Rodriguez',
        priority: 'medium',
        status: 'pending',
        sessionId: 'session-2024-1114-023',
        dueDate: new Date('2024-11-18'),
        comments: [],
        createdAt: new Date('2024-11-14T14:20:00'),
        updatedAt: new Date('2024-11-14T14:20:00'),
      });

      createWorkflow({
        id: 'wf-3',
        type: 'supervision',
        title: 'Clinical Supervision: Transference Management',
        description: 'Supervision session needed to discuss management of strong transference reactions in therapy with borderline personality disorder patient.',
        requesterId: 'user-4',
        requesterName: 'Dr. Michael Thompson',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'low',
        status: 'approved',
        comments: [
          {
            id: 'cmt-2',
            userId: 'user-1',
            userName: 'Dr. Sarah Mitchell',
            content: 'Approved. Let\'s schedule for Friday 2pm. Please prepare case formulation notes.',
            timestamp: new Date('2024-11-13T16:45:00'),
          }
        ],
        createdAt: new Date('2024-11-13T11:15:00'),
        updatedAt: new Date('2024-11-13T16:45:00'),
      });

      createWorkflow({
        id: 'wf-4',
        type: 'peer_review',
        title: 'Research Protocol: Ketamine for Treatment-Resistant Depression',
        description: 'Peer review of RCT protocol for IV ketamine vs. ECT in TRD patients. Need IRB review and statistical consultation. Study powered for n=80, primary outcome MADRS reduction at 4 weeks.',
        requesterId: 'user-1',
        requesterName: 'Dr. Sarah Mitchell',
        assignedTo: 'user-5',
        assignedToName: 'Dr. Robert Chen',
        priority: 'high',
        status: 'pending',
        sessionId: 'research-2024-ketamine-trd',
        dueDate: new Date('2024-11-22'),
        comments: [
          {
            id: 'cmt-3',
            userId: 'user-1',
            userName: 'Dr. Sarah Mitchell',
            content: 'Protocol includes CADSS for dissociative symptoms, comprehensive safety monitoring. Power analysis: 80% power, alpha=0.05, effect size d=0.65. Need biostatistics review.',
            timestamp: new Date('2024-11-17T09:30:00'),
          }
        ],
        createdAt: new Date('2024-11-17T09:30:00'),
        updatedAt: new Date('2024-11-17T09:30:00'),
      });

      createWorkflow({
        id: 'wf-5',
        type: 'consultation',
        title: 'First-Episode Psychosis: NAVIGATE Protocol',
        description: '19yo male, first-episode psychosis, 6-month DUP. Auditory hallucinations, persecutory delusions. Family hx schizophrenia. PANSS: P=24, N=18, G=42. Seeking guidance on NAVIGATE vs standard care.',
        requesterId: 'user-4',
        requesterName: 'Dr. Michael Thompson',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'high',
        status: 'pending',
        sessionId: 'case-2024-fep-019',
        dueDate: new Date('2024-11-19'),
        comments: [
          {
            id: 'cmt-4',
            userId: 'user-4',
            userName: 'Dr. Michael Thompson',
            content: 'High premorbid functioning. No substance use. Family very engaged. Considering low-dose risperidone + NAVIGATE comprehensive package (CBT, family psychoed, supported employment/education).',
            timestamp: new Date('2024-11-17T14:20:00'),
          }
        ],
        createdAt: new Date('2024-11-17T14:20:00'),
        updatedAt: new Date('2024-11-17T14:20:00'),
      });

      createWorkflow({
        id: 'wf-6',
        type: 'supervision',
        title: 'Differential: Prolonged Grief vs Major Depression',
        description: 'Patient lost spouse 18mo ago. Meets PGD criteria (DSM-5-TR) but also significant depressive sx. ICG-R=52, PHQ-9=18. Uncertain if comorbid MDD or grief-related depression. Treatment sequencing question.',
        requesterId: 'user-6',
        requesterName: 'Dr. Lisa Anderson',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-11-21'),
        comments: [
          {
            id: 'cmt-5',
            userId: 'user-6',
            userName: 'Dr. Lisa Anderson',
            content: 'Persistent yearning, difficulty accepting death, meaninglessness. Literature suggests combined approach (antidepressant + grief-focused CBT) but unclear optimal sequencing. Need supervision guidance.',
            timestamp: new Date('2024-11-17T16:00:00'),
          }
        ],
        createdAt: new Date('2024-11-17T16:00:00'),
        updatedAt: new Date('2024-11-17T16:00:00'),
      });

      createWorkflow({
        id: 'wf-7',
        type: 'peer_review',
        title: 'Case Conference: Treatment-Resistant OCD - DBS Candidacy',
        description: 'Severe OCD (Y-BOCS=32) failed: fluoxetine 80mg, clomipramine 250mg, fluoxetine+aripiprazole, 20 ERP sessions. Contamination obsessions 6-8h/day. Considering DBS vs intensive residential. Need multidisciplinary review.',
        requesterId: 'user-2',
        requesterName: 'Dr. James Chen',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'high',
        status: 'pending',
        sessionId: 'case-2024-ocd-dbs-eval',
        dueDate: new Date('2024-11-20'),
        comments: [
          {
            id: 'cmt-6',
            userId: 'user-2',
            userName: 'Dr. James Chen',
            content: 'Good insight maintained. Unable to work, relationships deteriorated. Meets McLean criteria for DBS. Need neurosurgery consultation for ventral capsule/ventral striatum targeting evaluation.',
            timestamp: new Date('2024-11-17T10:15:00'),
          },
          {
            id: 'cmt-7',
            userId: 'user-7',
            userName: 'Dr. Patricia Wong',
            content: 'Will join conference. Recent meta-analysis shows DBS 50-60% response rate. Assess comorbid depression, personality factors, family support before surgical referral. Consider augmented ERP trial first?',
            timestamp: new Date('2024-11-17T11:30:00'),
          }
        ],
        createdAt: new Date('2024-11-17T10:15:00'),
        updatedAt: new Date('2024-11-17T11:30:00'),
      });

      createWorkflow({
        id: 'wf-8',
        type: 'consultation',
        title: 'TMS Protocol Design: Post-Stroke Depression with Aphasia',
        description: '67yo male, 3-month post left MCA stroke. Broca aphasia improving, severe depression (PHQ-9=21) impacting rehab. Failed sertraline, mirtazapine. Apraxia limits therapy. TMS parameters for post-stroke safety?',
        requesterId: 'user-5',
        requesterName: 'Dr. Lisa Thompson',
        assignedTo: 'user-4',
        assignedToName: 'Dr. Michael Park',
        priority: 'high',
        status: 'pending',
        sessionId: 'neuro-2024-tms-stroke',
        dueDate: new Date('2024-11-21'),
        comments: [
          {
            id: 'cmt-8a',
            userId: 'user-5',
            userName: 'Dr. Lisa Thompson',
            content: 'MRI shows small left frontal lesion, no hemorrhagic transformation. Seizure risk low per neurology. Patient motivated, good family support. Need DLPFC targeting away from lesion, conservative parameters.',
            timestamp: new Date('2024-11-17T13:45:00'),
          },
          {
            id: 'cmt-8b',
            userId: 'user-4',
            userName: 'Dr. Michael Park',
            content: 'Review neuronavigation with recent MRI. Recommend right DLPFC (contralesional) 10Hz, 80% MT, conservative intensity. Monitor for neurological changes. Evidence shows TMS safe 3+ months post-stroke, can enhance neuroplasticity.',
            timestamp: new Date('2024-11-17T14:20:00'),
          },
          {
            id: 'cmt-8c',
            userId: 'user-1',
            userName: 'Dr. Sarah Mitchell',
            content: 'Agree with right DLPFC approach. Consider bilateral protocol once tolerance established. Coordinate with speech therapy - TMS may enhance aphasia recovery too. Monitor NIH Stroke Scale weekly.',
            timestamp: new Date('2024-11-17T15:00:00'),
          }
        ],
        createdAt: new Date('2024-11-17T13:45:00'),
        updatedAt: new Date('2024-11-17T15:00:00'),
      });

      createWorkflow({
        id: 'wf-9',
        type: 'supervision',
        title: 'Supervision: Therapeutic Rupture with Borderline PD Client',
        description: 'Supervisee struggling with 24yo BPD client. Multiple crises, frequent texts, threats when boundaries set. Recent session: client accused therapist of "not caring," stormed out. Supervisee feeling burned out, questioning competence.',
        requesterId: 'user-3',
        requesterName: 'Dr. Emily Rodriguez',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'medium',
        status: 'pending',
        sessionId: 'supervision-2024-rupture-bpd',
        dueDate: new Date('2024-11-19'),
        comments: [
          {
            id: 'cmt-9a',
            userId: 'user-3',
            userName: 'Dr. Emily Rodriguez',
            content: 'This is my third BPD case. Feel like walking on eggshells. Client canceled next appointment after rupture. Should I reach out? Worry I\'m causing harm. DBT training helped but not enough.',
            timestamp: new Date('2024-11-17T09:30:00'),
          },
          {
            id: 'cmt-9b',
            userId: 'user-1',
            userName: 'Dr. Sarah Mitchell',
            content: 'Ruptures are opportunities! Normal in BPD treatment. Let\'s process: What was activated in you? Client testing if you\'ll abandon them like others. Reaching out (brief, warm) shows you\'re not leaving. We\'ll role-play repair in supervision.',
            timestamp: new Date('2024-11-17T10:45:00'),
          },
          {
            id: 'cmt-9c',
            userId: 'user-3',
            userName: 'Dr. Emily Rodriguez',
            content: 'Sent brief text: "I care about our work together. Looking forward to continuing next week." She responded positively! Realized I was fearing abandonment too (countertransference). Let\'s definitely role-play.',
            timestamp: new Date('2024-11-17T14:30:00'),
          }
        ],
        createdAt: new Date('2024-11-17T09:30:00'),
        updatedAt: new Date('2024-11-17T14:30:00'),
      });

      createWorkflow({
        id: 'wf-10',
        type: 'peer_review',
        title: 'Ethics Consultation: Dual Relationship in Rural Practice',
        description: 'Rural psychiatrist (only provider 100mi radius) new patient is best friend\'s sister. Patient has bipolar I, recent hospitalization. Friend unaware. Patient insists "you\'re the only option." What are ethical boundaries here?',
        requesterId: 'user-6',
        requesterName: 'Dr. Alex Kumar',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'high',
        status: 'pending',
        sessionId: 'ethics-2024-dual-rural',
        dueDate: new Date('2024-11-18'),
        comments: [
          {
            id: 'cmt-10a',
            userId: 'user-6',
            userName: 'Dr. Alex Kumar',
            content: 'Patient needs care. Nearest psychiatrist 3h away, no telepsych coverage. Multiple boundaries: social events, mutual friends, friend might ask about sister. Could I treat with clear boundaries? Or refer despite access issues?',
            timestamp: new Date('2024-11-17T11:00:00'),
          },
          {
            id: 'cmt-10b',
            userId: 'user-1',
            userName: 'Dr. Sarah Mitchell',
            content: 'APA ethics recognizes rural exceptions when refusal causes harm. Recommendations: 1) Full disclosure to patient about dual relationship. 2) Written agreement: friend not discussed, social encounters managed. 3) Regular ethics consultation. 4) Document thoroughly.',
            timestamp: new Date('2024-11-17T12:15:00'),
          },
          {
            id: 'cmt-10c',
            userId: 'user-7',
            userName: 'Dr. Patricia Wong',
            content: 'Also explore telepsych backup for crises, peer consultation group for ongoing ethics support. Consider time-limited treatment with transition plan when alternatives available. Your awareness of risk is protective.',
            timestamp: new Date('2024-11-17T13:00:00'),
          }
        ],
        createdAt: new Date('2024-11-17T11:00:00'),
        updatedAt: new Date('2024-11-17T13:00:00'),
      });

      createWorkflow({
        id: 'wf-11',
        type: 'peer_review',
        title: 'Integrated Care: Teen with AN + T1DM - Dangerous Insulin Omission',
        description: '16yo F, anorexia nervosa + type 1 diabetes. Psychiatry managing AN, endocrinology managing diabetes. Recent discovery: deliberately omitting insulin to lose weight (diabulimia). HbA1c 12.3%, at risk for DKA. Need coordinated crisis plan.',
        requesterId: 'user-2',
        requesterName: 'Dr. James Chen',
        assignedTo: 'user-8',
        assignedToName: 'Dr. Rachel Green (Endocrinology)',
        priority: 'high',
        status: 'pending',
        sessionId: 'integrated-2024-diabulimia',
        dueDate: new Date('2024-11-18'),
        comments: [
          {
            id: 'cmt-11a',
            userId: 'user-2',
            userName: 'Dr. James Chen',
            content: 'Parents devastated. Teen admits omitting 50% of insulin doses for weight control. Understands risks but "can\'t stop." Need: 1) Medical stabilization. 2) Supervised insulin. 3) Specialized ED program familiar with diabetes.',
            timestamp: new Date('2024-11-17T08:30:00'),
          },
          {
            id: 'cmt-11b',
            userId: 'user-8',
            userName: 'Dr. Rachel Green',
            content: 'Severe DKA risk, already seeing retinopathy changes. Recommend residential ED program with endocrine consultation (ACUTE center, Denver EDTC). Transition to insulin pump with CGM when medically stable for better monitoring.',
            timestamp: new Date('2024-11-17T10:00:00'),
          },
          {
            id: 'cmt-11c',
            userId: 'user-5',
            userName: 'Dr. Lisa Thompson',
            content: 'Have contact at Park Nicollet Melrose (ED + diabetes specialty). They use behavioral contracts, family-based treatment modified for T1DM. Can facilitate referral if family interested.',
            timestamp: new Date('2024-11-17T11:30:00'),
          },
          {
            id: 'cmt-11d',
            userId: 'user-2',
            userName: 'Dr. James Chen',
            content: 'Family wants Melrose option. @Lisa can you send contact info? Will coordinate medical clearance. Plan: stabilize glucose, get insurance authorization, aim for admission within 1 week.',
            timestamp: new Date('2024-11-17T13:45:00'),
          }
        ],
        createdAt: new Date('2024-11-17T08:30:00'),
        updatedAt: new Date('2024-11-17T13:45:00'),
      });

      createWorkflow({
        id: 'wf-12',
        type: 'peer_review',
        title: 'Clozapine Management: Myocarditis vs Viral Illness Differentiation',
        description: '28yo M, treatment-resistant schizophrenia, day 18 of clozapine titration (200mg). New fever 101.2°F, tachycardia HR 115, chest discomfort. Labs: elevated troponin 0.8, CRP 45. Myocarditis? Stop clozapine or continue with close monitoring?',
        requesterId: 'user-4',
        requesterName: 'Dr. Michael Park',
        assignedTo: 'user-1',
        assignedToName: 'Dr. Sarah Mitchell',
        priority: 'high',
        status: 'pending',
        sessionId: 'cardiac-2024-clozapine-myocarditis',
        dueDate: new Date('2024-11-18'),
        comments: [
          {
            id: 'cmt-12a',
            userId: 'user-4',
            userName: 'Dr. Michael Park',
            content: 'Patient responding well psychiatrically (first improvement in 2 years). But timing concerning for clozapine-induced myocarditis (peak risk weeks 2-4). Cardiology ordered echo, ECG shows sinus tach. Respiratory symptoms minimal.',
            timestamp: new Date('2024-11-17T15:30:00'),
          },
          {
            id: 'cmt-12b',
            userId: 'user-1',
            userName: 'Dr. Sarah Mitchell',
            content: 'Critical decision. If myocarditis, must stop immediately - rechallenge contraindicated. But stopping means losing only effective medication. Need definitive diagnosis: BNP, echo with strain imaging, cardiac MRI if equivocal. Hold clozapine pending results.',
            timestamp: new Date('2024-11-17T16:00:00'),
          },
          {
            id: 'cmt-12c',
            userId: 'user-8',
            userName: 'Dr. Rachel Green',
            content: 'From cards perspective: troponin + CRP + timing = presumptive myocarditis until proven otherwise. Echo showed mild dysfunction, EF 50%. Recommend holding clozapine, supportive care, repeat echo in 1 week. Can try alternatives: olanzapine, ECT?',
            timestamp: new Date('2024-11-17T16:45:00'),
          }
        ],
        createdAt: new Date('2024-11-17T15:30:00'),
        updatedAt: new Date('2024-11-17T16:45:00'),
      });

  }, []); // Only run once on mount - intentionally ignoring deps

  const handleInvite = () => {
    if (inviteEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      const newParticipant = {
        id: crypto.randomUUID(),
        name: inviteEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: inviteEmail.trim(),
        role: 'therapist' as const,
        isOnline: false,
        lastSeen: new Date(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      };
      addParticipant(newParticipant);
      setInviteEmail('');
    }
  };

  const filteredTemplates = React.useMemo(() => {
    return sharedTemplates.filter(t => {
      const matchesSearch = searchQuery === '' || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sharedTemplates, searchQuery, filterCategory]);

  const unreadWorkflowCount = workflows.filter(w => w.status === 'pending').length;
  const activeSessionCount = coTherapySession ? 1 : 0;

  return (
    <div className={styles.container}>
      {}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <FiUsers className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{participants.length}</div>
            <div className={styles.statLabel}>Active Clinicians</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiFileText className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{sharedTemplates.length}</div>
            <div className={styles.statLabel}>Shared Templates</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiActivity className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{activeSessionCount}</div>
            <div className={styles.statLabel}>Live Sessions</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${unreadWorkflowCount > 0 ? styles.statCardAlert : ''}`}>
          <FiAlertCircle className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{unreadWorkflowCount}</div>
            <div className={styles.statLabel}>Pending Reviews</div>
          </div>
        </div>
      </div>

      {}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'templates' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('templates')}
          data-active={activeTab === 'templates'}
        >
          <FiBookOpen size={16} />
          <span>Templates</span>
          <span className={styles.tabBadge}>{sharedTemplates.length}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'workflows' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('workflows')}
          data-active={activeTab === 'workflows'}
        >
          <FiTrendingUp size={16} />
          <span>Workflows</span>
          <span className={styles.tabBadge}>{workflows.length}</span>
          {unreadWorkflowCount > 0 && (
            <span className={styles.tabBadgeAlert}>{unreadWorkflowCount}</span>
          )}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'activity' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('activity')}
          data-active={activeTab === 'activity'}
        >
          <FiActivity size={16} />
          <span>Activity</span>
          <span className={styles.tabBadge}>{Math.min(recentActivity.length, 10)}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'team' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('team')}
          data-active={activeTab === 'team'}
        >
          <FiUsers size={16} />
          <span>Team</span>
          <span className={styles.tabBadge}>{participants.length}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'session' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('session')}
          data-active={activeTab === 'session'}
        >
          <FiShield size={16} />
          <span>Co-Therapy</span>
          {coTherapySession !== null && <span className={styles.tabBadgeActive}>●</span>}
        </button>
      </div>

      {}
      <div className={styles.tabContent}>
        
        {}
        {activeTab === 'session' && (
          <div className={styles.tabPane}>
            {coTherapySession ? (
        <div className={styles.activeSession}>
          <div className={styles.sessionHeader}>
            <div className={styles.sessionHeaderLeft}>
              <FiActivity className={styles.sessionPulse} />
              <div>
                <h4 className={styles.sessionTitle}>Active Co-Therapy Session</h4>
                <p className={styles.sessionMeta}>
                  <FiClock size={12} />
                  <span>Started {new Date(coTherapySession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => useCollaborationStore.getState().endCoTherapy()} 
              className={styles.endSessionBtn}
            >
              <FiX size={16} />
              <span>End Session</span>
            </button>
          </div>
          
          <div className={styles.sessionParticipants}>
            <span className={styles.sessionLabel}>Participating Clinicians:</span>
            <div className={styles.participantChips}>
              {coTherapySession.participants.map((p, idx) => {
                const participant = participants.find(part => part.id === p.userId);
                return (
                  <div key={idx} className={styles.participantChip}>
                    <div className={styles.participantAvatar}>
                      {p.role === 'lead' ? '★' : p.role === 'support' ? '◆' : '○'}
                    </div>
                    <span>{participant?.name || p.userId}</span>
                    <span className={styles.participantRole}>{p.role}</span>
                    {p.role !== 'lead' && (
                      <button
                        className={styles.removeParticipantBtn}
                        onClick={() => {

                          useCollaborationStore.getState().kickFromSession(p.userId);
                          toast.success('Participant removed from session');
                        }}
                        title="Remove from session"
                      >
                        <FiX size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {}
          <div className={styles.sessionPermissions}>
            <h5 className={styles.sessionPermissionsTitle}>
              <FiShield size={14} />
              Session Permissions
            </h5>
            <div className={styles.permissionsGrid}>
              {coTherapySession.participants.map((p, idx) => {
                const participant = participants.find(part => part.id === p.userId);
                return (
                  <div key={idx} className={styles.permissionCard}>
                    <strong>{participant?.name || p.userId}</strong>
                    <ul className={styles.permissionList}>
                      {p.permissions.canEditNotes ? <li>✓ Edit notes</li> : null}
                      {p.permissions.canControlTimer ? <li>✓ Control timer</li> : null}
                      {p.permissions.canExportData ? <li>✓ Export data</li> : null}
                      {p.permissions.canInviteOthers ? <li>✓ Invite others</li> : null}
                      {p.permissions.canEndSession ? <li>✓ End session</li> : null}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
          
          {}
          <div className={styles.sessionInviteSection}>
            <p className={styles.sessionNote}>
              <FiPlus size={16} />
              <span>Invite participants from the Team tab</span>
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            if (currentUser) {
              startCoTherapy({
                id: crypto.randomUUID(),
                sessionId: crypto.randomUUID(),
                participants: [{
                  userId: currentUser.id,
                  role: 'lead',
                  joinedAt: new Date(),
                  permissions: {
                    canEditNotes: true,
                    canControlTimer: true,
                    canExportData: true,
                    canInviteOthers: true,
                    canEndSession: true,
                  }
                }],
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }}
          className={styles.startSessionBtn}
        >
          <FiPlus size={18} />
          <span>Initiate Co-Therapy Session</span>
        </button>
      )}

            {}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <FiShield className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Invite Clinical Colleague</h3>
                </div>
              </div>
              <div className={styles.inviteForm}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@institution.edu"
                  className={styles.inviteInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInvite();
                  }}
                  aria-label="Enter colleague email address"
                />
                <button 
                  onClick={handleInvite} 
                  className={styles.inviteBtn}
                  disabled={!inviteEmail.trim()}
                  aria-label="Send invitation"
                >
                  <FiPlus size={16} />
                  <span>Send Invitation</span>
                </button>
              </div>
              <p className={styles.inviteHelper}>
                Invitations are sent via secure institutional email with role-based access controls
              </p>
            </section>
          </div>
        )}

        {}
        {activeTab === 'team' && (
          <div className={styles.tabPane}>
            {}
            <div className={styles.teamHeader}>
              <h3 className={styles.teamTitle}>
                <FiUsers size={20} />
                Team Members ({participants.length})
              </h3>
              <button 
                className={styles.inviteTeamBtn}
                onClick={() => {
                  toast.info('Team invite feature coming soon');
                }}
                title="Invite a new team member"
              >
                <FiPlus size={16} />
                <span>Invite Member</span>
              </button>
            </div>
            
            {participants.length === 0 ? (
              <div className={styles.emptyState}>
                <FiUsers size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No team members yet</p>
                <p className={styles.emptySubtext}>Invite colleagues to collaborate</p>
              </div>
            ) : (
            <div className={styles.teamGrid}>
              {participants.map(p => (
                <div key={p.id} className={styles.clinicianCard}>
                  <div className={styles.clinicianHeader}>
                    <div 
                      className={styles.clinicianAvatar}
                    >
                      {p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className={styles.clinicianInfo}>
                      <h4 className={styles.clinicianName}>{p.name}</h4>
                      <p className={styles.clinicianRole}>{p.role}</p>
                    </div>
                    <div className={`${styles.statusIndicator} ${p.isOnline ? styles.statusOnline : styles.statusOffline}`}>
                      {p.isOnline ? 'Active' : 'Away'}
                    </div>
                  </div>
                  <div className={styles.clinicianFooter}>
                    <span className={styles.clinicianEmail}>{p.email}</span>
                    <span className={styles.clinicianLastSeen}>
                      Last active: {new Date(p.lastSeen).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {}
                  <div className={styles.clinicianActions}>
                    <button 
                      className={styles.clinicianActionBtn}
                      onClick={() => {

                        toast.info(`${p.name} status updated`);
                      }}
                      title="Send message"
                    >
                      <FiMessageSquare size={14} />
                      <span>Message</span>
                    </button>
                    {currentUser && p.id !== currentUser.id ? (
                      <button 
                        className={styles.clinicianActionBtnDanger}
                        onClick={() => {
                          if (window.confirm(`Remove ${p.name} from team?`)) {
                            useCollaborationStore.getState().removeParticipant(p.id);
                            toast.success(`${p.name} removed from team`);
                          }
                        }}
                        title="Remove from team"
                      >
                        <FiX size={14} />
                        <span>Remove</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'templates' && (
          <div className={styles.tabPane}>
            {}
            <div className={styles.templateControlBar}>
              <div className={styles.searchFilterGroup}>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className={styles.searchInput}
                  aria-label="Search templates"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={styles.filterSelect}
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  <option value="note">Clinical Notes</option>
                  <option value="assessment">Assessments</option>
                  <option value="intervention">Interventions</option>
                  <option value="report">Reports</option>
                </select>
              </div>
              <button 
                className={styles.createTemplateBtn}
                onClick={() => {
                  toast.info('Template creation feature coming soon');
                }}
                title="Create a new template from scratch"
              >
                <FiPlus size={18} />
                <span>Create New Template</span>
              </button>
            </div>
            {filteredTemplates.length === 0 ? (
              <div className={styles.emptyState}>
                <FiFileText size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No templates available</p>
                <p className={styles.emptySubtext}>Create or request access to institutional templates</p>
              </div>
            ) : (
              <div className={styles.templatesGrid}>
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.templateCardSelected : ''}`}
                    onClick={() => {
                      const newSelection = selectedTemplate === template.id ? null : template.id;
                      setSelectedTemplate(newSelection);

                      if (newSelection) {
                        toast.success(`👁️ Expanded: ${template.name}`);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTemplate(selectedTemplate === template.id ? null : template.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedTemplate === template.id}
                  >
                    <div className={styles.templateCardHeader}>
                      <div className={styles.templateIcon}>
                        <FiFileText size={20} />
                      </div>
                      <div className={styles.templateMeta}>
                        <h4 className={styles.templateTitle}>{template.name}</h4>
                        <div className={styles.templateTags}>
                          <span className={styles.templateCategory}>{template.category}</span>
                          {template.rating !== undefined && (
                            <span className={styles.templateRating}>
                              <FiStar size={12} />
                              {template.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      {}
                      {currentUser && template.ownerId === currentUser.id ? (
                        <button
                          className={styles.templateEditBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info('Template editing coming soon');
                          }}
                          title="Edit this template"
                        >
                          <FiEdit3 size={16} />
                        </button>
                      ) : null}
                    </div>
                    {!!template.description && (
                      <p className={styles.templateDescription}>{template.description}</p>
                    )}
                    <div className={styles.templateStats}>
                      <span className={styles.templateStat}>
                        <FiEye size={14} />
                        {template.usageCount} uses
                      </span>
                      <span className={styles.templateStat}>
                        <FiClock size={14} />
                        v{template.version}
                      </span>
                      {}
                      <span className={styles.templateExpandHint}>
                        {selectedTemplate === template.id ? '▼ EXPANDED - See buttons below' : '▶ CLICK CARD TO EXPAND'}
                      </span>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className={styles.templateExpanded}>
                        <div className={styles.templateContent}>
                          <h5>Template Preview</h5>
                          <pre className={styles.templatePreview}>{template.content}</pre>
                        </div>
                        <div className={styles.templateMetadata}>
                          <div className={styles.metadataRow}>
                            <span className={styles.metadataLabel}>Author:</span>
                            <span className={styles.metadataValue}>{template.ownerName}</span>
                          </div>
                          <div className={styles.metadataRow}>
                            <span className={styles.metadataLabel}>Visibility:</span>
                            <span className={styles.metadataValue}>{template.visibility}</span>
                          </div>
                          <div className={styles.metadataRow}>
                            <span className={styles.metadataLabel}>Last Updated:</span>
                            <span className={styles.metadataValue}>
                              {new Date(template.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className={styles.templateActions}>
                          <button 
                            className={styles.templateActionBtn}
                            onClick={async (e) => {
                              console.warn('APPLY TEMPLATE CLICKED:', template.name);
                              e.stopPropagation();
                              try {

                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  await navigator.clipboard.writeText(template.content);
                                } else {

                                  const textArea = document.createElement('textarea');
                                  textArea.value = template.content;
                                  textArea.style.position = 'fixed';
                                  textArea.style.left = '-999999px';
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(textArea);
                                }
                                incrementTemplateUsage(template.id);
                                toast.success(`✅ "${template.name}" copied to clipboard!`);
                              } catch (err) {
                                console.error(err);
                                toast.error('Failed to copy template. Please try again.');
                              }
                            }}
                            title="Copy template content to clipboard"
                          >
                            <FiDownload size={16} />
                            <span>Apply Template</span>
                          </button>
                          <button 
                            className={styles.templateActionBtnSecondary}
                            onClick={(e) => {
                              console.warn('CUSTOMIZE CLICKED:', template.name);
                              e.stopPropagation();
                              toast.info('Template customization coming soon');
                            }}
                            title="Create a customized version of this template"
                          >
                            <FiEdit3 size={16} />
                            <span>Customize</span>
                          </button>
                          <button 
                            className={styles.templateActionBtnSecondary}
                            onClick={(e) => {
                              console.warn('SHARE CLICKED:', template.name);
                              e.stopPropagation();
                              try {
                                shareTemplate(template.id, []);
                                toast.success(`✅ "${template.name}" shared with team!`);
                              } catch (err) {
                                console.error(err);
                                toast.error('Failed to share template. Please try again.');
                              }
                            }}
                            title="Share this template with your team"
                          >
                            <FiShare2 size={16} />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'workflows' && (
          <div className={styles.tabPane}>
            {workflows.length === 0 ? (
              <div className={styles.emptyState}>
                <FiActivity size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No active workflows</p>
                <p className={styles.emptySubtext}>Consultation requests and supervision tasks will appear here</p>
              </div>
            ) : (
              <div className={styles.workflowsList}>
                {workflows.map(workflow => (
                  <div
                    key={workflow.id}
                    className={`${styles.workflowCard} ${styles[`priority-${workflow.priority}`]} ${workflow.status === 'pending' ? styles.workflowUnread : ''}`}
                    onClick={() => {
                      setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id);
                      if (workflow.status === 'pending') markWorkflowRead(workflow.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id);
                        if (workflow.status === 'pending') markWorkflowRead(workflow.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedWorkflow === workflow.id}
                  >
                    <div className={styles.workflowHeader}>
                      <div className={styles.workflowType}>
                        <FiMessageSquare size={16} />
                        <span>{workflow.type.replace('_', ' ')}</span>
                      </div>
                      <span className={`${styles.workflowStatus} ${styles[`status-${workflow.status}`]}`}>
                        {workflow.status}
                      </span>
                    </div>
                    <h4 className={styles.workflowTitle}>{workflow.title}</h4>
                    <p className={styles.workflowDescription}>{workflow.description}</p>
                    <div className={styles.workflowMeta}>
                      <span className={styles.workflowMetaItem}>
                        <strong>From:</strong> {workflow.requesterName}
                      </span>
                      <span className={styles.workflowMetaItem}>
                        <strong>To:</strong> {workflow.assignedToName}
                      </span>
                      <span className={styles.workflowMetaItem}>
                        <FiClock size={14} />
                        {new Date(workflow.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedWorkflow === workflow.id && (
                      <div className={styles.workflowExpanded}>
                        {!!workflow.sessionId && (
                          <div className={styles.workflowDetail}>
                            <span className={styles.workflowDetailLabel}>Session ID:</span>
                            <code className={styles.workflowDetailValue}>{workflow.sessionId}</code>
                          </div>
                        )}
                        {!!workflow.dueDate && (
                          <div className={styles.workflowDetail}>
                            <span className={styles.workflowDetailLabel}>Due Date:</span>
                            <span className={styles.workflowDetailValue}>
                              {new Date(workflow.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {workflow.comments.length > 0 && (
                          <div className={styles.workflowComments}>
                            <h5 className={styles.workflowCommentsTitle}>Clinical Discussion</h5>
                            {workflow.comments.map(comment => (
                              <div key={comment.id} className={styles.workflowComment}>
                                <div className={styles.commentHeader}>
                                  <strong>{comment.userName}</strong>
                                  <span className={styles.commentTime}>
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className={styles.commentContent}>{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {workflow.status === 'pending' && (
                          <div className={styles.workflowActions}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                approveWorkflow(workflow.id, 'Approved - clinical rationale documented');
                              }}
                              className={styles.workflowActionBtn}
                            >
                              <FiCheck size={16} />
                              <span>Approve & Document</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const message = window.prompt('Enter clarification request:');
                                if (message) {
                                  useCollaborationStore.getState().requestClarification(workflow.id, message);
                                  toast.success('Clarification request sent');
                                }
                              }}
                              className={styles.workflowActionBtnSecondary}
                              title="Click to request clarification on this workflow"
                            >
                              <FiMessageSquare size={16} />
                              <span>Request Clarification</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const reason = window.prompt('Enter reason for declining:');
                                if (reason) {
                                  useCollaborationStore.getState().rejectWorkflow(workflow.id, reason);
                                  toast.success('Workflow declined');
                                }
                              }}
                              className={styles.workflowActionBtnDanger}
                              title="Click to decline this workflow with a reason"
                            >
                              <FiX size={16} />
                              <span>Decline with Rationale</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'activity' && recentActivity.length > 0 && (
          <div className={styles.tabPane}>
            <div className={styles.activityLog}>
              {recentActivity.slice(0, 10).map((activity, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <FiActivity size={14} />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      <strong>{activity.userName}</strong> {activity.description}
                    </p>
                    <span className={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>{}

      {}
      <footer className={styles.footer}>
        <div className={styles.footerNote}>
          <FiShield size={14} />
          <span>All collaboration activities are HIPAA-compliant and logged for quality assurance</span>
        </div>
      </footer>
    </div>
  );
}
