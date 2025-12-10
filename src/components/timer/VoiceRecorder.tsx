


import * as React from 'react';
import {
  FaDownload,
  FaMicrophone,
  FaPause,
  FaPlay,
  FaStop,
  FaTrash,
} from 'react-icons/fa';
import styles from '../../centerpanel/styles/timer.module.css';

export interface VoiceRecording {
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
  onRecordingComplete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [recordings, setRecordings] = React.useState<VoiceRecording[]>([]);
  const [currentRecordingTime, setCurrentRecordingTime] = React.useState(0);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcriptionEnabled, setTranscriptionEnabled] = React.useState(true);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const startTimeRef = React.useRef<number>(0);
  const intervalIdRef = React.useRef<number>(0);
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
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const recording: VoiceRecording = {
          id: Date.now().toString(),
          timestamp: new Date(),
          duration: Math.floor(currentRecordingTime / 1000),
          blob,
          ...(patientId && { patientId }),
          ...(patientName && { patientName }),
          ...(sessionSegment && { sessionSegment }),
          ...(transcriptionEnabled && transcriptionBufferRef.current && {
            transcription: transcriptionBufferRef.current,
          }),
        };

        setRecordings((prev) => [recording, ...prev]);
        onRecordingComplete?.(recording);

        console.info('Recording saved:', {
          id: recording.id,
          duration: recording.duration,
          size: blob.size,
        });


        chunksRef.current = [];
        transcriptionBufferRef.current = '';
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);


      startTimeRef.current = Date.now();
      intervalIdRef.current = window.setInterval(() => {
        setCurrentRecordingTime(Date.now() - startTimeRef.current);
      }, 100);


      if (transcriptionEnabled && recognitionRef.current) {
        setIsTranscribing(true);
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recognitionRef.current) {
      mediaRecorderRef.current.pause();
      recognitionRef.current.stop();
      setIsPaused(true);
      setIsTranscribing(false);


      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recognitionRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      recognitionRef.current.start();

      setIsPaused(false);


      const now = Date.now();
      startTimeRef.current = now - currentRecordingTime;


      intervalIdRef.current = window.setInterval(() => {
        setCurrentRecordingTime(Date.now() - (startTimeRef.current || 0));
      }, 100);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setIsTranscribing(false);
      setCurrentRecordingTime(0);

      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const downloadRecording = (recording: VoiceRecording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${recording.patientName || 'unknown'}-${recording.id}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.voiceRecorderPanel}>
      <div className={styles.voiceRecorderHeader}>
        <h3>Scientific Voice Recording</h3>
        {Boolean(patientName) && (
          <div className={styles.patientBadge}>
            {patientName}
            {Boolean(sessionSegment) && ` • ${sessionSegment}`}
          </div>
        )}
      </div>

      <div className={styles.voiceControls}>
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className={styles.voiceRecordBtn}
            aria-label="Start recording"
          >
            <FaMicrophone /> Start Recording
          </button>
        ) : (
          <>
            {isRecording && !isPaused ? (
              <button
                type="button"
                onClick={pauseRecording}
                className={styles.voicePauseBtn}
                aria-label="Pause recording"
              >
                <FaPause /> Pause
              </button>
            ) : isRecording && isPaused ? (
              <button
                type="button"
                onClick={resumeRecording}
                className={styles.voiceResumeBtn}
                aria-label="Resume recording"
              >
                <FaPlay /> Resume
              </button>
            ) : null}

            <button
              type="button"
              onClick={stopRecording}
              className={styles.voiceStopBtn}
              aria-label="Stop recording"
            >
              <FaStop /> Stop
            </button>
          </>
        )}
      </div>

      {Boolean(isRecording) && (
        <div className={styles.voiceTimer}>
          {formatTime(currentRecordingTime)}
          {Boolean(isTranscribing) && (
            <span className={styles.transcribingDot}>●</span>
          )}
        </div>
      )}

      <div className={styles.voiceOptions}>
        <label htmlFor="transcriptionToggle">
          <input
            id="transcriptionToggle"
            type="checkbox"
            checked={transcriptionEnabled}
            onChange={(e) => setTranscriptionEnabled(e.target.checked)}
            disabled={isRecording}
          />
          Enable English Transcription
        </label>
      </div>

      {recordings.length > 0 && (
        <div className={styles.voiceRecordingsList}>
          <h4>Recordings ({recordings.length})</h4>
          {recordings.map((recording) => (
            <div key={recording.id} className={styles.voiceRecordingItem}>
              <div className={styles.voiceRecordingMeta}>
                <div className={styles.voiceRecordingName}>
                  {recording.patientName || 'Unknown Patient'}
                </div>
                <div className={styles.voiceRecordingDetails}>
                  {recording.timestamp.toLocaleString()} • {recording.duration}s
                  {Boolean(recording.sessionSegment) &&
                    ` • ${recording.sessionSegment as string}`}
                </div>
                {Boolean(recording.transcription) && (
                  <div className={styles.voiceTranscription}>
                    {recording.transcription as string}
                  </div>
                )}
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
