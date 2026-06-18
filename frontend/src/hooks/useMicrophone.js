import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useMicrophone
 *
 * Handles microphone permission, recording, and real-time audio level
 * detection for the MicButton visualizer.
 *
 * Returns:
 *   isRecording    — bool
 *   audioLevel     — 0–1 float (average frequency energy, for the ring viz)
 *   hasPermission  — true | false | null (null = not yet asked)
 *   startRecording — async () => void
 *   stopRecording  — async () => Blob | null
 */
export function useMicrophone() {
   const [isRecording, setIsRecording] = useState(false);
   const [audioLevel, setAudioLevel] = useState(0);
   const [hasPermission, setHasPermission] = useState(null);

   const mediaRecorderRef = useRef(null);
   const chunksRef = useRef([]);
   const analyserRef = useRef(null);
   const audioCtxRef = useRef(null);
   const animFrameRef = useRef(null);
   const streamRef = useRef(null);

   useEffect(() => {
      return () => {
         cancelAnimationFrame(animFrameRef.current);
         streamRef.current?.getTracks().forEach(t => t.stop());
         audioCtxRef.current?.close();
      };
   }, []);

   const startRecording = useCallback(async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
         streamRef.current = stream;
         setHasPermission(true);

         // ── Audio level analyser ──────────────────────────────
         const audioCtx = new AudioContext();
         audioCtxRef.current = audioCtx;
         const source = audioCtx.createMediaStreamSource(stream);
         const analyser = audioCtx.createAnalyser();
         analyser.fftSize = 256;
         source.connect(analyser);
         analyserRef.current = analyser;

         const dataArray = new Uint8Array(analyser.frequencyBinCount);
         const tick = () => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setAudioLevel(avg / 128);
            animFrameRef.current = requestAnimationFrame(tick);
         };
         tick();

         // ── MediaRecorder ─────────────────────────────────────
         const recorder = new MediaRecorder(stream);
         mediaRecorderRef.current = recorder;
         chunksRef.current = [];

         recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
         };

         recorder.start();
         setIsRecording(true);
      } catch (err) {
         console.error('[Microphone] Permission denied or unavailable:', err);
         setHasPermission(false);
      }
   }, []);

   const stopRecording = useCallback(() => {
      return new Promise((resolve) => {
         const recorder = mediaRecorderRef.current;
         if (!recorder || recorder.state === 'inactive') {
            resolve(null);
            return;
         }

         cancelAnimationFrame(animFrameRef.current);
         setAudioLevel(0);

         recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            streamRef.current?.getTracks().forEach(t => t.stop());
            audioCtxRef.current?.close();
            resolve(blob);
         };

         recorder.stop();
         setIsRecording(false);
      });
   }, []);

   return { isRecording, audioLevel, hasPermission, startRecording, stopRecording };
}