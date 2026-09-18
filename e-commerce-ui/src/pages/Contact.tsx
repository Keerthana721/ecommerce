import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';
import { useLanguage } from '../context/LanguageContext';

const Contact: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showToast('Please fill out all contact fields.', 'error');
      return;
    }

    setSending(true);
    // Simulate API request send
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    
    showToast('Your message has been sent successfully! We will get back to you shortly.', 'success');
    
    // Clear fields
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '8px' }}>{t('contactUs')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Get in touch with the Diyora customer support team. We're here to help you.</p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }} className="footer-grid">
        {/* Contact Form Card */}
        <div className="card" style={{ padding: '36px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>{t('sendMessage')}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="form-group">
              <label className="label" htmlFor="contact-name">{t('fullName')}</label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Lopez"
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="contact-email">{t('emailAddress')}</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. maya@example.com"
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="contact-subject">{t('subject')}</label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Shipping inquiry"
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="contact-message">{t('messageDetails')}</label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you today?"
                className="input-field"
                style={{ minHeight: '120px', resize: 'vertical', paddingTop: '12px' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '48px', justifyContent: 'center' }} disabled={sending}>
              {sending ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }}></span>
                  <span>{t('sending')}</span>
                </>
              ) : (
                <>
                  <Icon name="shield-check" size={16} />
                  <span>{t('submitFeedback')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Details Card */}
          <div className="card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>{t('officeAddress')}</h3>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
                <Icon name="map-pin" size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{t('hqAddress')}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  No 42, Mount Road, Guindy,
                  <br />
                  Chennai, Tamil Nadu - 600032, India
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
                <Icon name="activity" size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{t('callSupport')}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Phone: +91 44 2235 1234</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Email: support@diyora.in</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
                <Icon name="clock" size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{t('businessHours')}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Sunday: Closed (Public Holiday)</p>
              </div>
            </div>
          </div>

          {/* Interactive Map Embed */}
          <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
            <iframe
              title="Diyora Headquarters Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.994271810565!2d80.20391307589945!3d13.004128514144415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52671cf0e6b5b5%3A0xe5e13589b2db9756!2sGuindy%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin"
              width="100%"
              height="260"
              style={{ border: 0, borderRadius: 'var(--radius-sm)' }}
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
