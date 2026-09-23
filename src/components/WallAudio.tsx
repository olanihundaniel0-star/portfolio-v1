import { useCallback, useEffect, useRef, useState } from 'react';
import { FaVolumeUp, FaVolumeMute, FaPlay } from 'react-icons/fa';
import { PLAYLIST } from '../data/playlist';

export default function WallAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [dead, setDead] = useState(false);
  const failuresRef = useRef(0);

  const track = PLAYLIST[index];

  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.volume = 0.8;
    audio.src = track.src;
    tryPlay();
    return undefined;
  }, [index, track.src, tryPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.muted = muted;
    return undefined;
  }, [muted]);

  useEffect(() => {
    const next = PLAYLIST[(index + 1) % PLAYLIST.length];
    const warm = new Audio();
    warm.preload = 'auto';
    warm.src = next.src;
    return () => {
      warm.src = '';
    };
  }, [index]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    []
  );

  const handleEnded = () => {
    failuresRef.current = 0;
    setIndex((i) => (i + 1) % PLAYLIST.length);
  };

  const handleError = () => {
    failuresRef.current += 1;
    if (failuresRef.current >= PLAYLIST.length) {
      setDead(true);
      return;
    }
    setIndex((i) => (i + 1) % PLAYLIST.length);
  };

  const handleButton = () => {
    if (blocked) {
      tryPlay();
      return;
    }
    setMuted((m) => !m);
  };

  if (dead) return null;

  return (
    <div className="wall-audio">
      <div className="wall-np" aria-hidden={!blocked && muted ? true : undefined}>
        <span className={`wall-np-bars${muted || blocked ? ' is-paused' : ''}`}>
          <span />
          <span />
          <span />
        </span>
        <span className="wall-np-text">
          {track.title} — {track.artist}
        </span>
      </div>
      <button
        type="button"
        className="wall-mute"
        onClick={handleButton}
        aria-label={blocked ? 'Play music' : muted ? 'Unmute music' : 'Mute music'}
        title={blocked ? 'Tap to play' : muted ? 'Unmute' : 'Mute'}
      >
        {blocked ? (
          <FaPlay aria-hidden="true" />
        ) : muted ? (
          <FaVolumeMute aria-hidden="true" />
        ) : (
          <FaVolumeUp aria-hidden="true" />
        )}
      </button>
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={handleEnded}
        onError={handleError}
      />
    </div>
  );
}
