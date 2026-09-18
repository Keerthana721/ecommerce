import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
];

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
      setSelectedAvatar(user.avatar);
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    await updateProfile(name, selectedAvatar);
    setIsEditing(false);
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>User Account Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details and quick access options.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px' }} className="profile-grid">
        {/* Avatar Sidebar */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', height: 'fit-content' }}>
          <img src={user.avatar} alt={user.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: 'var(--shadow-md)' }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</h3>
            <span className="badge badge-primary" style={{ marginTop: '6px' }}>{user.role}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Member since 2026</p>
        </div>

        {/* Info Card */}
        <div className="card" style={{ padding: '32px', textAlign: 'left' }}>
          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="info-cols">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>FULL NAME</span>
                  <p style={{ fontWeight: 500, marginTop: '2px' }}>{user.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>EMAIL ADDRESS</span>
                  <p style={{ fontWeight: 500, marginTop: '2px' }}>{user.email}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="info-cols">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>ACCOUNT ID</span>
                  <p style={{ fontWeight: 500, marginTop: '2px' }}>{user.id}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>DEFAULT DIRECTORY</span>
                  <p style={{ fontWeight: 500, marginTop: '2px' }}>
                    {user.addresses.length > 0
                      ? user.addresses.find((a) => a.isDefault)?.name || user.addresses[0].name
                      : 'No addresses saved'}
                  </p>
                </div>
              </div>

              {/* Action Buttons depending on role */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ height: '40px' }}>
                  <Icon name="edit" size={16} />
                  <span>Edit Profile Details</span>
                </button>
                <>
                  <Link to="/address-management" className="btn btn-secondary" style={{ height: '40px' }}>
                    <Icon name="map-pin" size={16} />
                    <span>Manage Address Book</span>
                  </Link>
                  <Link to="/orders" className="btn btn-secondary" style={{ height: '40px' }}>
                    <Icon name="package" size={16} />
                    <span>View Orders Tracker</span>
                  </Link>
                </>
                {user.role === 'MANAGER' && (
                  <Link to="/seller" className="btn btn-primary" style={{ height: '40px' }}>
                    <Icon name="settings" size={16} />
                    <span>Go to Seller Console</span>
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="btn btn-primary" style={{ height: '40px' }}>
                    <Icon name="activity" size={16} />
                    <span>Go to Admin Control</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Update profile settings</h3>

              <div className="form-group">
                <label className="label" htmlFor="profile-name-input">Full Name</label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Avatar Selector Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="label">Choose Avatar profile photo</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                  {AVATAR_OPTIONS.map((avUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avUrl)}
                      style={{
                        padding: 0,
                        border: '3px solid transparent',
                        borderColor: selectedAvatar === avUrl ? 'var(--primary)' : 'transparent',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        width: '54px',
                        height: '54px'
                      }}
                    >
                      <img src={avUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary">
                  <Icon name="check" size={16} />
                  <span>Save Changes</span>
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .info-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
