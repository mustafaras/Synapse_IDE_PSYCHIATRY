


import * as React from 'react';

interface VoiceCommand {
  phrases: string[];
  action: () => void;
  description: string;
}

interface UseVoiceCommandsOptions {
  enabled: boolean;
  onCommandRecognized?: (command: string) => void;
}

export function useVoiceCommands(
  commands: VoiceCommand[],
  options: UseVoiceCommandsOptions = { enabled: true }
) {
  const [isListening, setIsListening] = React.useState(false);
  const [lastCommand, setLastCommand] = React.useState<string>('');
  const [isSupported, setIsSupported] = React.useState(false);

  const recognitionRef = React.useRef<any>(null);


  React.useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
  }, []);


  React.useEffect(() => {
    if (!isSupported || !options.enabled) return undefined;

    const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognitionClass) return undefined;

    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (options.enabled) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {

          }
        }, 100);
      }
    };

    recognition.onresult = (event: any) => {
      const results = event.results[event.results.length - 1];
      const transcript = results[0].transcript.toLowerCase().trim();

      setLastCommand(transcript);
      options.onCommandRecognized?.(transcript);


      for (const cmd of commands) {
        for (const phrase of cmd.phrases) {
          if (transcript.includes(phrase.toLowerCase())) {
            cmd.action();
            return;
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognitionRef.current = recognition;


    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start voice recognition:', e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, options.enabled, commands, options]);

  const startListening = React.useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch {

      }
    }
  }, [isListening]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    lastCommand,
    startListening,
    stopListening,
  };
}
