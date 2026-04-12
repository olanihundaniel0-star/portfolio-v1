import { CONTACT_INFO } from '../data/constants';

export default function Contact() {
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
        <form
          className="form-wrap reveal reveal-d2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="form-row">
            <div className="form-group">
              <input type="text" placeholder="Your Name" />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" />
            </div>
          </div>
          <div className="form-group">
            <input type="text" placeholder="Subject" />
          </div>
          <div className="form-group">
            <textarea placeholder="Message" />
          </div>
          <button className="form-submit" type="submit">
            <span>Send Message</span>
            <span className="form-submit-arrow">→</span>
          </button>
        </form>
      </div>
      <span className="sec-num">.05</span>
    </section>
  );
}
