

import React from 'react';
import { format } from 'date-fns';
import { FiCopy, FiFileText, FiEdit2, FiSave, FiPlus, FiTrash2, FiRefreshCw, FiDownload, FiUpload } from 'react-icons/fi';

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

interface SmartNoteTemplatesProps {
  session: TimerSession;
  onClose: () => void;
}

interface CustomNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  modifiedAt: number;
}

const PALETTE = {
  primary: 'rgba(14, 165, 233, 1)',
  success: 'rgba(16, 185, 129, 1)',
  warning: 'rgba(245, 158, 11, 1)',
  accent: 'rgba(167, 139, 250, 1)',
  danger: 'rgba(239, 68, 68, 1)',
};

export const SmartNoteTemplates: React.FC<SmartNoteTemplatesProps> = ({ session, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<'soap' | 'progress' | 'brief' | 'custom'>('soap');
  const [copied, setCopied] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState('');
  const [customNotes, setCustomNotes] = React.useState<CustomNote[]>([]);
  const [selectedCustomNote, setSelectedCustomNote] = React.useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [newNoteTitle, setNewNoteTitle] = React.useState('');
  const [showCustomNotesList, setShowCustomNotesList] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('smartNotes_custom');
    if (saved) {
      try {
        setCustomNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse custom notes:', e);
      }
    }
  }, []);

  const saveCustomNotes = React.useCallback((notes: CustomNote[]) => {
    localStorage.setItem('smartNotes_custom', JSON.stringify(notes));
    setCustomNotes(notes);
  }, []);

  const metrics = React.useMemo(() => {
    const totalMinutes = Math.round(session.totalDuration / 60000);
    const segmentStats = session.segments.reduce((acc, seg) => {
      const minutes = Math.round(seg.duration / 60000);
      acc[seg.type] = (acc[seg.type] || 0) + minutes;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMinutes,
      date: format(new Date(session.startTime), 'MMMM dd, yyyy'),
      time: format(new Date(session.startTime), 'h:mm a'),
      segmentStats,
      checkpointCount: session.laps.length,
    };
  }, [session]);

  const generateSOAPNote = React.useCallback(() => {
    const { totalMinutes, date, time, segmentStats, checkpointCount } = metrics;

    const sections = {
      subjective: `Patient presented for ${totalMinutes}-minute session on ${date} at ${time}. Session included ${checkpointCount} documented checkpoints across ${Object.keys(segmentStats).length} clinical segments.`,

      objective: [
        `Session Structure:`,
        ...Object.entries(segmentStats).map(([type, mins]) =>
          `  • ${type.charAt(0).toUpperCase() + type.slice(1)}: ${mins} minutes`
        ),
        ``,
        `Clinical Checkpoints: ${checkpointCount} documented`,
        `Total Duration: ${totalMinutes} minutes`,
      ].join('\n'),

      assessment: `Patient engaged throughout ${totalMinutes}-minute structured session. ${
        checkpointCount > 0
          ? `Multiple checkpoints (n=${checkpointCount}) indicate active participation and progress monitoring.`
          : 'Session completed without formal checkpoints.'
      } ${
        totalMinutes < 45
          ? 'Brief session format utilized.'
          : totalMinutes > 60
          ? 'Extended session format to address complex clinical needs.'
          : 'Standard 45-60 minute session format maintained.'
      }`,

      plan: `Continue evidence-based treatment approach. ${
        Object.keys(segmentStats).length > 3
          ? 'Multi-modal intervention strategy shows appropriate therapeutic diversity.'
          : 'Consider expanding intervention modalities in future sessions.'
      } Schedule follow-up session. Monitor progress on identified treatment goals.`,
    };

    return `CLINICAL NOTE - SOAP FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${date}
Session Time: ${time}
Duration: ${totalMinutes} minutes
Patient: ${session.patientName || 'Patient ID: ' + session.patientId}

SUBJECTIVE:
${sections.subjective}

OBJECTIVE:
${sections.objective}

ASSESSMENT:
${sections.assessment}

PLAN:
${sections.plan}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Note Generated: ${format(new Date(), 'MMMM dd, yyyy h:mm a')}
Session ID: ${session.id}`;
  }, [metrics, session]);

  const generateProgressNote = React.useCallback(() => {
    const { totalMinutes, date, time, segmentStats, checkpointCount } = metrics;

    return `PROGRESS NOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${date} at ${time}
Patient: ${session.patientName || `Patient ID: ${session.patientId}`}
Session Duration: ${totalMinutes} minutes

INTERVENTIONS PROVIDED:
${Object.entries(segmentStats)
  .map(([type, mins]) => `  • ${type.charAt(0).toUpperCase() + type.slice(1)} (${mins} min)`)
  .join('\n')}

CLINICAL OBSERVATIONS:
Patient completed ${totalMinutes}-minute structured therapy session with ${checkpointCount} documented progress checkpoints. ${
      totalMinutes >= 45
        ? 'Session duration appropriate for therapeutic depth.'
        : 'Brief session format utilized per clinical indication.'
    }

PROGRESS INDICATORS:
${checkpointCount > 0 ? `• ${checkpointCount} checkpoints documented throughout session` : '• Session completed without formal checkpoints'}
• ${Object.keys(segmentStats).length} distinct intervention modalities utilized
• ${totalMinutes >= 50 ? 'Adequate time for therapeutic processing' : 'Focused brief intervention approach'}

TREATMENT PLAN:
Continue current treatment approach. Patient to return for follow-up session. Monitor response to interventions and adjust treatment plan as clinically indicated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: ${format(new Date(), 'MM/dd/yyyy h:mm a')}`;
  }, [metrics, session]);

  const generateBriefNote = React.useCallback(() => {
    const { totalMinutes, date, time, segmentStats } = metrics;

    return `BRIEF CLINICAL NOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${date} • ${time} • ${totalMinutes} min
Patient: ${session.patientName || session.patientId || 'N/A'}

Session included: ${Object.entries(segmentStats)
      .map(([type, mins]) => `${type} (${mins}m)`)
      .join(', ')}

Patient engaged appropriately. Treatment plan continues. Follow-up scheduled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${format(new Date(), 'MM/dd/yyyy h:mm a')}`;
  }, [metrics, session]);

  const getNoteContent = () => {
    if (selectedTemplate === 'custom') {
      const note = customNotes.find(n => n.id === selectedCustomNote);
      return note?.content || '';
    }
    
    switch (selectedTemplate) {
      case 'soap':
        return generateSOAPNote();
      case 'progress':
        return generateProgressNote();
      case 'brief':
        return generateBriefNote();
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    const content = isEditing ? editedContent : getNoteContent();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditedContent(getNoteContent());
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSaveEdit = () => {
    if (selectedTemplate === 'custom' && selectedCustomNote) {
      const updated = customNotes.map(note =>
        note.id === selectedCustomNote
          ? { ...note, content: editedContent, modifiedAt: Date.now() }
          : note
      );
      saveCustomNotes(updated);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleCreateNewNote = () => {
    if (!newNoteTitle.trim()) return;
    
    const newNote: CustomNote = {
      id: `custom-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: `# ${newNoteTitle}\n\nDate: ${format(new Date(), 'MMMM dd, yyyy h:mm a')}\nSession ID: ${session.id}\n\n---\n\n[Your notes here]`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    
    const updated = [...customNotes, newNote];
    saveCustomNotes(updated);
    setSelectedTemplate('custom');
    setSelectedCustomNote(newNote.id);
    setNewNoteTitle('');
    setIsCreatingNew(false);
    setEditedContent(newNote.content);
    setIsEditing(true);
  };

  const handleDeleteCustomNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const updated = customNotes.filter(n => n.id !== noteId);
      saveCustomNotes(updated);
      if (selectedCustomNote === noteId) {
        setSelectedCustomNote(null);
        setSelectedTemplate('soap');
      }
    }
  };

  const handleRegenerateTemplate = () => {
    if (selectedTemplate !== 'custom') {
      setEditedContent(getNoteContent());
      setIsEditing(true);
    }
  };

  const handleExportAllNotes = () => {
    const dataStr = JSON.stringify(customNotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-notes-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedNotes = JSON.parse(e.target?.result as string) as CustomNote[];
        if (!Array.isArray(importedNotes)) {
          alert('Invalid file format. Expected an array of notes.');
          return;
        }

        const validNotes = importedNotes.filter(note => 
          note.id && note.title && note.content && note.createdAt && note.modifiedAt
        );
        
        if (validNotes.length === 0) {
          alert('No valid notes found in file.');
          return;
        }

        const existingIds = new Set(customNotes.map(n => n.id));
        const newNotes = validNotes.filter(n => !existingIds.has(n.id));
        
        if (newNotes.length > 0) {
          const merged = [...customNotes, ...newNotes];
          saveCustomNotes(merged);
          alert(`Successfully imported ${newNotes.length} note(s). ${validNotes.length - newNotes.length} duplicate(s) skipped.`);
        } else {
          alert('All notes in file already exist.');
        }
      } catch (error) {
        alert('Failed to parse file. Please ensure it\'s a valid JSON export.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportSingleNote = (noteId: string) => {
    const note = customNotes.find(n => n.id === noteId);
    if (!note) return;
    
    const dataStr = JSON.stringify([note], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-note-title"
        tabIndex={-1}
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          width: '900px',
          height: '700px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiFileText size={22} color={PALETTE.primary} />
            <div>
              <div id="smart-note-title" style={{ fontSize: '17px', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
                Smart Clinical Notes
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)', marginTop: '2px', fontWeight: 500 }}>
                AI-Enhanced Documentation • Evidence-Based Templates
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px 10px',
              lineHeight: 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = PALETTE.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            ×
          </button>
        </div>

        {}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {(['soap', 'progress', 'brief'] as const).map((template) => (
              <button
                key={template}
                onClick={() => {
                  setSelectedTemplate(template);
                  setIsEditing(false);
                  setSelectedCustomNote(null);
                  setShowCustomNotesList(false);
                }}
                style={{
                  padding: '8px 16px',
                  background:
                    selectedTemplate === template && !showCustomNotesList
                      ? 'rgba(14, 165, 233, 0.2)'
                      : 'rgba(255, 255, 255, 0.04)',
                  border:
                    selectedTemplate === template && !showCustomNotesList
                      ? '1px solid rgba(14, 165, 233, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: selectedTemplate === template && !showCustomNotesList ? PALETTE.primary : 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
                onMouseEnter={(e) => {
                  if (!(selectedTemplate === template && !showCustomNotesList)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(selectedTemplate === template && !showCustomNotesList)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                {template === 'soap' ? 'SOAP Note' : template === 'progress' ? 'Progress Note' : 'Brief Note'}
              </button>
            ))}
            
            {}
            <button
              onClick={() => setShowCustomNotesList(!showCustomNotesList)}
              style={{
                padding: '8px 16px',
                background: showCustomNotesList ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: showCustomNotesList ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: showCustomNotesList ? PALETTE.accent : 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!showCustomNotesList) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showCustomNotesList) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <FiFileText size={13} />
              My Notes ({customNotes.length})
            </button>
          </div>

          {}
          <div style={{ display: 'flex', gap: '8px' }}>
            {showCustomNotesList && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFromFile}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid rgba(14, 165, 233, 0.4)',
                    borderRadius: '6px',
                    color: PALETTE.primary,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
                  }}
                >
                  <FiUpload size={13} />
                  Import
                </button>
                {customNotes.length > 0 && (
                  <button
                    onClick={handleExportAllNotes}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '6px',
                      color: PALETTE.warning,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                    }}
                  >
                    <FiDownload size={13} />
                    Export All
                  </button>
                )}
              </>
            )}
            {!isCreatingNew && (
              <button
                onClick={() => setIsCreatingNew(true)}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '6px',
                  color: PALETTE.success,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                }}
              >
                <FiPlus size={13} />
                New Note
              </button>
            )}
          </div>
        </div>

        {}
        {isCreatingNew && (
          <div
            style={{
              padding: '16px 24px',
              background: 'rgba(16, 185, 129, 0.05)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Enter note title..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNewNote();
                if (e.key === 'Escape') {
                  setIsCreatingNew(false);
                  setNewNoteTitle('');
                }
              }}
              autoFocus
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleCreateNewNote}
              disabled={!newNoteTitle.trim()}
              style={{
                padding: '10px 18px',
                background: newNoteTitle.trim() ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${newNoteTitle.trim() ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '6px',
                color: newNoteTitle.trim() ? PALETTE.success : 'rgba(255, 255, 255, 0.3)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: newNoteTitle.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreatingNew(false);
                setNewNoteTitle('');
              }}
              style={{
                padding: '10px 18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {showCustomNotesList ? (

            <div>
              {customNotes.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}>
                  <FiFileText size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>No Custom Notes Yet</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6 }}>Create your first note or import existing ones</div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '16px',
                }}>
                  {customNotes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative' as const,
                      }}
                      onClick={() => {
                        setSelectedTemplate('custom');
                        setSelectedCustomNote(note.id);
                        setShowCustomNotesList(false);
                        setIsEditing(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.4)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(167, 139, 250, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#fff',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <FiFileText size={14} color={PALETTE.accent} />
                          {note.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.4 }}>
                          Created: {format(new Date(note.createdAt), 'MMM dd, yyyy')}
                          <br />
                          Modified: {format(new Date(note.modifiedAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      {}
                      <div style={{
                        fontSize: '11.5px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: 1.5,
                        marginBottom: '12px',
                        maxHeight: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {note.content.substring(0, 120)}{note.content.length > 120 ? '...' : ''}
                      </div>
                      
                      {}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate('custom');
                            setSelectedCustomNote(note.id);
                            setShowCustomNotesList(false);
                            setEditedContent(note.content);
                            setIsEditing(true);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            background: 'rgba(14, 165, 233, 0.15)',
                            border: '1px solid rgba(14, 165, 233, 0.3)',
                            borderRadius: '5px',
                            color: PALETTE.primary,
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <FiEdit2 size={11} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportSingleNote(note.id);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '5px',
                            color: PALETTE.warning,
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <FiDownload size={11} />
                          Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomNote(note.id);
                          }}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '5px',
                            color: PALETTE.danger,
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.95)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '2px solid rgba(14, 165, 233, 0.3)',
                borderRadius: '8px',
                padding: '20px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          ) : (
            <pre
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: '12.5px',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.9)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {getNoteContent() || 'No content available. Create a new note or select a template.'}
            </pre>
          )}
        </div>

        {}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '10px',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedTemplate === 'custom' && selectedCustomNote && (
              <>
                <span>Modified: {format(new Date(customNotes.find(n => n.id === selectedCustomNote)?.modifiedAt || Date.now()), 'MMM dd, yyyy h:mm a')}</span>
              </>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {!isEditing && selectedTemplate !== 'custom' && (
              <button
                onClick={handleRegenerateTemplate}
                style={{
                  padding: '10px 18px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '6px',
                  color: PALETTE.warning,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                }}
              >
                <FiRefreshCw size={14} />
                Edit Template
              </button>
            )}
            
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    borderRadius: '6px',
                    color: PALETTE.success,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                  }}
                >
                  <FiSave size={14} />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                {!isCreatingNew && selectedTemplate === 'custom' && selectedCustomNote && (
                  <button
                    onClick={handleStartEdit}
                    style={{
                      padding: '10px 18px',
                      background: 'rgba(14, 165, 233, 0.15)',
                      border: '1px solid rgba(14, 165, 233, 0.4)',
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
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
                    }}
                  >
                    <FiEdit2 size={14} />
                    Edit Note
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '10px 20px',
                    background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(167, 139, 250, 0.15)',
                    border: copied ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(167, 139, 250, 0.5)',
                    borderRadius: '6px',
                    color: copied ? PALETTE.success : PALETTE.accent,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!copied) {
                      e.currentTarget.style.background = 'rgba(167, 139, 250, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!copied) {
                      e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)';
                    }
                  }}
                >
                  <FiCopy size={14} />
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
