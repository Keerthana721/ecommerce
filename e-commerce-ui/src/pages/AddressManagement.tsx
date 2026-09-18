import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Address } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 
    'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri', 
    'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 
    'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupattur', 
    'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ],
  'Karnataka': [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 
    'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 
    'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 
    'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 
    'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 
    'Thrissur', 'Wayanad'
  ],
  'Maharashtra': [
    'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 
    'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 
    'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 
    'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 
    'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 
    'Washim', 'Yavatmal'
  ],
  'Andhra Pradesh': [
    'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Kadapa', 'Krishna', 'Kurnool', 
    'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari'
  ],
  'Telangana': [
    'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 
    'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad', 
    'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu', 
    'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 
    'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 
    'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'
  ]
};

const AddressManagement: React.FC = () => {
  const { user, addAddress   } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const districts = STATES_AND_DISTRICTS[selectedState] || [];
    if (districts.length > 0) {
      setCity(districts[0]);
    } else {
      setCity('');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const openAddModal = () => {
    setEditingAddress(null);
    setName('');
    setStreet('');
    setState('Tamil Nadu');
    setCity('Chennai');
    setZipCode('');
    setCountry('India');
    setIsDefault(user.addresses.length === 0); // Force default if it is the first address
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setName(addr.name);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !street.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      showToast('Please fill out all address fields.', 'error');
      return;
    }

    const payload = { name, street, city, state, zipCode, country, isDefault };
    try {
      addAddress(payload);
    }
    catch (error) {
      console.error('Error adding address:', error);
    }
    // if (editingAddress) {
    //   updateAddress(editingAddress.id, payload);
    //   showToast('Address updated successfully!', 'success');
    // } else {
    //   showToast('Address added to directory!', 'success');
    // }
    setIsModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this address?')) {
      // deleteAddress(id);
      showToast('Address deleted successfully.', 'info');
    }
  };

  const handleSetDefault = ( e: React.MouseEvent) => {
    e.stopPropagation();
    // updateAddress( { isDefault: true });
    showToast('Default shipping address updated.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Address Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your delivery locations for faster checkout steps.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ height: '44px' }}>
          <Icon name="plus" size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {user.addresses.map((addr) => (
          <div
            
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px',
              borderColor: addr.isDefault ? 'var(--primary)' : 'var(--border-color)',
              borderWidth: addr.isDefault ? '2px' : '1px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{addr.name}</h3>
                {addr.isDefault && (
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Default</span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {addr.street}
                <br />
                {addr.city}, {addr.state} {addr.zipCode}
                <br />
                {addr.country}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button onClick={() => openEditModal(addr)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }} aria-label="Edit address">
                <Icon name="edit" size={14} />
                <span>Edit</span>
              </button>
              <button onClick={(e) => handleDelete( e)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '6px 10px' }} aria-label="Delete address">
                <Icon name="trash" size={14} />
                <span>Delete</span>
              </button>
              {!addr.isDefault && (
                <button onClick={(e) => handleSetDefault( e)} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--primary)' }}>
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}

        {user.addresses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
            <Icon name="map-pin" size={48} style={{ marginBottom: '16px', color: 'var(--text-light)' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Saved Addresses</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>You haven\'t added any delivery locations to your account directory yet.</p>
            <button onClick={openAddModal} className="btn btn-primary">
              <Icon name="plus" size={16} />
              <span>Create First Address</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Modify Address' : 'Register Address'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
          {/* Address Label (e.g. Home, Work) */}
          <div className="floating-field-container">
            <input
              id="address-label"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder=" "
              className="floating-input"
              style={{ paddingRight: '60px' }}
              required
            />
            <label htmlFor="address-label" className="floating-label">Address Label (e.g. Home, Work)</label>
            <span className="char-counter">{name.length}/30</span>
            <span className="helper-text">Give this location a recognizable label</span>
          </div>

          {/* Street Address */}
          <div className="floating-field-container">
            <input
              id="street-address"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value.slice(0, 100))}
              placeholder=" "
              className="floating-input"
              style={{ paddingRight: '65px' }}
              required
            />
            <label htmlFor="street-address" className="floating-label">Street Address</label>
            <span className="char-counter">{street.length}/100</span>
            <span className="helper-text">Door number, building, street, and area details</span>
          </div>

          {/* District, State, and Zip Code Grid */}
          <div className="address-form-grid">
            {/* District (City) (spans full row) */}
            <div style={{ gridColumn: 'span 2' }}>
              <div className="floating-field-container" style={{ marginBottom: 0 }}>
                {STATES_AND_DISTRICTS[state] ? (
                  <select
                    id="city-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="floating-select"
                    required
                  >
                    {STATES_AND_DISTRICTS[state].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="city-input"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder=" "
                    className="floating-input"
                    required
                  />
                )}
                <label htmlFor="city-select" className={STATES_AND_DISTRICTS[state] ? "floating-label floating-label-always" : "floating-label"}>District (City)</label>
                <span className="helper-text">Select your district town location</span>
              </div>
            </div>

            {/* State */}
            <div>
              <div className="floating-field-container" style={{ marginBottom: 0 }}>
                <select
                  id="state-select"
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="floating-select"
                  required
                >
                  {Object.keys(STATES_AND_DISTRICTS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {![...Object.keys(STATES_AND_DISTRICTS), 'Other'].includes(state) && state && (
                    <option value={state}>{state}</option>
                  )}
                  <option value="Other">Other</option>
                </select>
                <label htmlFor="state-select" className="floating-label floating-label-always">State</label>
                <span className="helper-text">Select state region</span>
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <div className="floating-field-container" style={{ marginBottom: 0 }}>
                <input
                  id="zip-code-input"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder=" "
                  className="floating-input"
                  style={{ paddingRight: '50px' }}
                  required
                />
                <label htmlFor="zip-code-input" className="floating-label">Pin Code</label>
                <span className="char-counter">{zipCode.length}/6</span>
                <span className="helper-text">6-digit postal pin code</span>
              </div>
            </div>

            {/* Country (spans full row) */}
            <div style={{ gridColumn: 'span 2' }}>
              <div className="floating-field-container" style={{ marginBottom: 0 }}>
                <select
                  id="country-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="floating-select"
                  required
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                </select>
                <label htmlFor="country-select" className="floating-label floating-label-always">Country</label>
                <span className="helper-text">Billing/delivery country destination</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="default-address-checkbox"
              checked={isDefault}
              disabled={editingAddress?.isDefault || user.addresses.length === 0}
              onChange={(e) => setIsDefault(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="default-address-checkbox" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Set as primary shipping address
            </label>
          </div>

          {street && city && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
              <label className="label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Delivery Location Map</label>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', height: '150px', backgroundColor: 'var(--bg-tertiary)' }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(street + ', ' + city + ', ' + state + ', ' + country)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  style={{ border: 0 }}
                  allowFullScreen
                  title="Address Delivery Map"
                ></iframe>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', height: '44px' }}>
            <Icon name="check" size={16} />
            <span>Save Location</span>
          </button>
        </form>
        <style>{`
          .modal-content {
            max-width: 540px !important;
          }
          .floating-field-container {
            position: relative;
            margin-bottom: 2px;
          }
          .floating-input, .floating-select {
            width: 100%;
            padding: 14px;
            font-size: 0.9rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
            height: 48px;
          }
          .floating-input:focus, .floating-select:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
          }
          .floating-label {
            position: absolute;
            left: 12px;
            top: 24px;
            transform: translateY(-50%);
            background-color: var(--bg-secondary);
            padding: 0 6px;
            color: var(--text-muted);
            font-size: 0.9rem;
            pointer-events: none;
            transition: 0.2s ease all;
          }
          .floating-input:focus ~ .floating-label,
          .floating-input:not(:placeholder-shown) ~ .floating-label,
          .floating-select:focus ~ .floating-label,
          .floating-select ~ .floating-label-always {
            top: 0;
            transform: translateY(-50%) scale(0.85);
            color: var(--primary);
            font-weight: 600;
          }
          .char-counter {
            position: absolute;
            right: 14px;
            top: 24px;
            transform: translateY(-50%);
            font-size: 0.75rem;
            color: var(--text-muted);
            pointer-events: none;
          }
          .helper-text {
            font-size: 0.72rem;
            color: var(--text-muted);
            margin-top: 4px;
            display: block;
            margin-left: 4px;
          }
          .address-form-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 20px;
          }
          @media (max-width: 500px) {
            .address-form-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            .address-form-grid > div {
              grid-column: span 1 !important;
            }
          }
        `}</style>
      </Modal>
    </div>
  );
};

export default AddressManagement;
