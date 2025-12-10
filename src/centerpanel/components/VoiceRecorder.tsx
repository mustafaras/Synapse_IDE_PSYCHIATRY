


import * as React from 'react';
import styles from '../styles/timer.module.css';
import { FaDownload, FaMicrophone, FaPause, FaPlay, FaStop, FaTrash } from 'react-icons/fa';
import { MdTranscribe } from 'react-icons/md';

interface VoiceRecording {
  id: string;
  timestamp: Date;
  duration: number;
  blob: Blob;
  patientId?: string;
  patientName?: string;
  sessionSegment?: string;
  transcription?: string;
  notes?: string;
}

interface VoiceRecorderProps {
  patientId?: string;
  patientName?: string;
  sessionSegment?: string;
  onRecordingComplete?: (recording: VoiceRecording) => void;
}

export function VoiceRecorder({
  patientId,
  patientName,
  sessionSegment,
  onRecordingComplete
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [recordings, setRecordings] = React.useState<VoiceRecording[]>([]);
  const [currentRecordingTime, setCurrentRecordingTime] = React.useState(0);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcriptionEnabled, setTranscriptionEnabled] = React.useState(true);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordingStartTimeRef = React.useRef<number>(0);
  const timerIntervalRef = React.useRef<number | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const transcriptionBufferRef = React.useRef<string>('');


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const results = event.results[event.results.length - 1];
          const transcript = results[0].transcript as string;
          transcriptionBufferRef.current = `${transcriptionBufferRef.current}${transcript} `;
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 2,
          sampleRate: 48000
        }
      });


      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;

        const recording: VoiceRecording = {
          id: `rec_${Date.now()}`,
          timestamp: new Date(),
          duration,
          blob: audioBlob,
          ...(patientId ? { patientId } : {}),
          ...(patientName ? { patientName } : {}),
          ...(sessionSegment ? { sessionSegment } : {}),
          ...(transcriptionBufferRef.current ? { transcription: transcriptionBufferRef.current } : {}),
        };

        setRecordings(prev => [...prev, recording]);
        onRecordingComplete?.(recording);


        transcriptionBufferRef.current = '';
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);


      if (transcriptionEnabled && recognitionRef.current) {
        recognitionRef.current.start();
        setIsTranscribing(true);
      }


      timerIntervalRef.current = window.setInterval(() => {
        setCurrentRecordingTime((Date.now() - recordingStartTimeRef.current) / 1000);
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      console.error('Microphone access denied. Please allow microphone access to record.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsTranscribing(false);
      }

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      if (transcriptionEnabled && recognitionRef.current) {
        recognitionRef.current.start();
        setIsTranscribing(true);
      }

      recordingStartTimeRef.current = Date.now() - currentRecordingTime * 1000;

      timerIntervalRef.current = window.setInterval(() => {
        setCurrentRecordingTime((Date.now() - recordingStartTimeRef.current) / 1000);
      }, 100);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setCurrentRecordingTime(0);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsTranscribing(false);
      }

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const downloadRecording = (recording: VoiceRecording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording_${recording.patientName || 'unknown'}_${recording.timestamp.toISOString()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.voiceRecorderPanel}>
      <div className={styles.voiceRecorderHeader}>
        <h3>🎙️ Voice Recording</h3>
        {patientName ? (
          <div className={styles.patientBadge}>
            Patient: {patientName}
          </div>
        ) : null}
      </div>

      {}
      <div className={styles.voiceControls}>
        {!isRecording ? (
          <button
            type="button"
            className={styles.voiceRecordBtn}
            onClick={startRecording}
            aria-label="Start recording"
          >
            <FaMicrophone /> Start Recording
          </button>
        ) : (
          <div className={styles.voiceActiveControls}>
            <div className={styles.voiceTimer}>
              {formatTime(currentRecordingTime)}
              {isTranscribing ? <span className={styles.transcribingDot}>🔴</span> : null}
            </div>
            {!isPaused ? (
              <button
                type="button"
                className={styles.voicePauseBtn}
                onClick={pauseRecording}
                aria-label="Pause recording"
              >
                <FaPause />
              </button>
            ) : (
              <button
                type="button"
                className={styles.voiceResumeBtn}
                onClick={resumeRecording}
                aria-label="Resume recording"
              >
                <FaPlay />
              </button>
            )}
            <button
              type="button"
              className={styles.voiceStopBtn}
              onClick={stopRecording}
              aria-label="Stop recording"
            >
              <FaStop /> Stop
            </button>
          </div>
        )}

        <label className={styles.voiceTranscriptionToggle}>
          <input
            type="checkbox"
            checked={transcriptionEnabled}
            onChange={(e) => setTranscriptionEnabled(e.target.checked)}
          />
          <MdTranscribe /> Enable Transcription
        </label>
      </div>

      {}
      {recordings.length > 0 && (
        <div className={styles.voiceRecordingsList}>
          <h4>Recordings ({recordings.length})</h4>
          {recordings.map((recording) => (
            <div key={recording.id} className={styles.voiceRecordingItem}>
              <div className={styles.voiceRecordingInfo}>
                <div className={styles.voiceRecordingMeta}>
                  <strong>{recording.patientName || 'Unknown Patient'}</strong>
                  <span>{recording.sessionSegment}</span>
                  <span>{formatTime(recording.duration)}</span>
                  <span>{recording.timestamp.toLocaleString()}</span>
                </div>
                {recording.transcription ? (
                  <div className={styles.voiceTranscription}>
                    📝 {recording.transcription}
                  </div>
                ) : null}
              </div>
              <div className={styles.voiceRecordingActions}>
                <button
                  type="button"
                  onClick={() => downloadRecording(recording)}
                  aria-label="Download recording"
                  title="Download"
                >
                  <FaDownload />
                </button>
                <button
                  type="button"
                  onClick={() => deleteRecording(recording.id)}
                  aria-label="Delete recording"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
