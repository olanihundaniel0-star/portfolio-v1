import { type ChangeEvent, type FormEvent, useState } from 'react';
import { CONTACT_INFO, SOCIAL_LINKS } from '../data/constants';

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type SubmitStatus = {
  type: 'idle' | 'sending' | 'success' | 'error';
  message: string;
};

const INITIAL_FORM_DATA: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [status, setStatus] = useState<SubmitStatus>({
    type: 'idle',
    message: '',
  });

  const endpoint =
    (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim() ||
    '/api/contact';

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (status.type !== 'sending' && status.type !== 'idle') {
      setStatus({ type: 'idle', message: '' });
    }
  };

  const validate = () => {
    const { name, email, subject, message } = formData;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return 'Please complete all fields before sending.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (message.trim().length < 10) {
      return 'Your message should be at least 10 characters.';
    }

    return null;
  };

  const submitToEndpoint = async (payload: ContactFormData) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let message = '';

    try {
      const data = (await response.json()) as { message?: string };
      if (typeof data.message === 'string' && data.message.trim()) {
        message = data.message;
      }
    } catch {
      // Ignore malformed server payloads.
    }

    if (!response.ok) {
      const errorMessage =
        message || 'Message failed to send. Please try again.';

      throw new Error(errorMessage);
    }

    return message || 'Message sent successfully. I will reply soon.';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    const payload: ContactFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      website: formData.website.trim(),
    };

    setStatus({ type: 'sending', message: 'Sending message...' });

    try {
      const successMessage = await submitToEndpoint(payload);
      setStatus({
        type: 'success',
        message: successMessage,
      });

      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to send your message at the moment.';

      setStatus({ type: 'error', message });
    }
  };

  return (
    <section id="contact">
      <div className="contact-grid">
        <div className="reveal">
          <p className="sec-label">Get in touch</p>
          <h2 className="contact-headline">
            Let's
            <br />
            Work
            <br />
            Together
          </h2>
          <div className="contact-info">
            <div>
              <div className="contact-field-label">Location</div>
              <div className="contact-field-val">{CONTACT_INFO.location}</div>
            </div>
            <div>
              <div className="contact-field-label">University</div>
              <div className="contact-field-val">{CONTACT_INFO.university}</div>
            </div>
            <div>
              <div className="contact-field-label">Email</div>
              <div className="contact-field-val">{CONTACT_INFO.email}</div>
            </div>
          </div>
        </div>
        <form className="form-wrap reveal reveal-d2" onSubmit={handleSubmit}>
          <p className="form-note">
            Note: The message form is offline right now. Please email me at{' '}
            <a href={`mailto:${CONTACT_INFO.email}`}>
              {CONTACT_INFO.email}
            </a>{' '}
            or DM me on{' '}
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            .
          </p>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="form-honeypot"
          />
          <button
            className="form-submit"
            type="submit"
            disabled={status.type === 'sending'}
          >
            <span>
              {status.type === 'sending' ? 'Sending Message...' : 'Send Message'}
            </span>
            <span className="form-submit-arrow">-&gt;</span>
          </button>
          <p className={`form-status ${status.type}`} aria-live="polite">
            {status.message}
          </p>
        </form>
      </div>
      <span className="sec-num">.05</span>
    </section>
  );
}
