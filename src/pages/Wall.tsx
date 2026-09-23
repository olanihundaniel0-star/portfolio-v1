import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FaPen } from 'react-icons/fa';
import Cursor from '../components/Cursor';
import WallAudio from '../components/WallAudio';
import SignaturePad from '../components/SignaturePad';
import type { SignaturePadHandle } from '../components/SignaturePad';
import {
  fetchWallMessages,
  loadLocalMessages,
  postWallMessage,
  saveLocalMessages
} from '../data/wall';
import type { WallMessage } from '../data/wall';

export default function Wall() {
  const [messages, setMessages] = useState<WallMessage[]>(() => loadLocalMessages());
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [showSig, setShowSig] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const sigRef = useRef<SignaturePadHandle>(null);

  useEffect(() => {
    let alive = true;
    fetchWallMessages()
      .then((server) => {
        if (!alive) return;
        setMessages((prev) => {
          const local = prev.filter((m) => m.local);
          const ids = new Set(server.map((m) => m.id));
          return [...local.filter((m) => !ids.has(m.id)), ...server];
        });
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open ]);

  const closeModal = () => {
    setOpen(false);
    setShowSig(false);
    sigRef.current?.clear();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanText = text.trim();
    if (!cleanName || !cleanText) return;
    const sig = sigRef.current?.toDataURL() ?? undefined;

    postWallMessage({ name: cleanName, sig, text: cleanText })
      .then((saved) => {
        setMessages((prev) => [saved, ...prev]);
        setNotice('');
      })
      .catch((error: unknown) => {
        const fallback: WallMessage = {
          at: Date.now(),
          id: `local-${Date.now()}`,
          local: true,
          name: cleanName,
          sig,
          text: cleanText
        };
        setMessages((prev) => {
          const next = [fallback, ...prev];
          saveLocalMessages(next);
          return next;
        });
        setNotice(
          error instanceof Error ? error.message : 'Saved on this device only.'
        );
      });

    setName('');
    setText('');
    setShowSig(false);
    setOpen(false);
  };

  return (
    <>
      <Cursor />
      <WallAudio />
      <main className="wall">
        <Link to="/" className="wall-back">
          ← nife
        </Link>
        <p className="sec-label">Message Wall</p>
        <h1 className="wall-title">Leave a mark.</h1>
        <p className="wall-sub">
          Anything you&apos;re thinking about rn.
        </p>
        {notice && <p className="wall-notice">{notice}</p>}

        <div className="wall-list">
          {loading ? (
            <p className="wall-empty">Loading the wall…</p>
          ) : messages.length === 0 ? (
            <p className="wall-empty">
              The wall is bare — tap the pen to pin the first one.
            </p>
          ) : (
            messages.map((m) => (
              <article key={m.id} className="wall-card">
                <p className="wall-card-text">{m.text}</p>
                <p className="wall-card-meta">
                  {m.name} · {new Date(m.at).toLocaleDateString()}
                  {m.local ? ' · this device only' : ''}
                </p>
                {m.sig && <img src={m.sig} alt="" className="wall-card-sig" />}
              </article>
            ))
          )}
        </div>

        <button
          type="button"
          className="wall-fab"
          onClick={() => setOpen(true)}
          aria-label="Write your own message"
          title="Pin your message"
        >
          <FaPen aria-hidden="true" />
        </button>

        {open && (
          <div
            className="wall-overlay"
            onClick={closeModal}
            role="presentation"
          >
            <div
              className="wall-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Pin your message"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="wall-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
              <p className="wall-modal-kicker">Pin yours</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={40}
                  aria-label="Your name"
                  autoFocus
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Your message"
                  rows={4}
                  maxLength={280}
                  aria-label="Your message"
                />
                {!showSig ? (
                  <button
                    type="button"
                    className="sig-toggle"
                    onClick={() => setShowSig(true)}
                  >
                    Sign? — or just doodle ✎
                  </button>
                ) : (
                  <div className="sig-wrap">
                    <div className="sig-row">
                      <span>Sign? — or just doodle</span>
                      <button
                        type="button"
                        onClick={() => sigRef.current?.clear()}
                      >
                        Clear
                      </button>
                    </div>
                    <SignaturePad ref={sigRef} />
                  </div>
                )}
                <button type="submit">Pin to wall</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
