import React, { useState, useEffect } from 'react';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ModalProps {
  onClose: () => void;
  userId: string;
}

const EmergencyContactsModal: React.FC<ModalProps> = ({ onClose, userId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Contact Picker API is supported
    if ('contacts' in navigator && 'ContactsManager' in window) {
      setIsSupported(true);
    }

    const fetchContacts = async () => {
      try {
        const contactsRes = await fetch(`http://localhost:8000/api/contacts?user_id=${userId}`);
        const contactsData = await contactsRes.json();
        setContacts(contactsData);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      }
    };
    fetchContacts();
  }, [userId]);

  const handleAddContact = async (e?: React.FormEvent, name?: string, phone?: string) => {
    if (e) e.preventDefault();
    const finalName = name || newContactName;
    const finalPhone = phone || newContactPhone;
    
    if (!finalName || !finalPhone) return;
    setIsAddingContact(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: finalName,
          phone: finalPhone
        })
      });
      const resData = await response.json();
      if (resData.status === 'success') {
        setContacts(prev => [...prev, resData.data[0]]);
        if (!name && !phone) {
          setNewContactName('');
          setNewContactPhone('');
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsAddingContact(false);
  };

  const handleSyncDevice = async () => {
    try {
      const props = ['name', 'tel'];
      const opts = { multiple: true };
      // @ts-ignore
      const selectedContacts = await navigator.contacts.select(props, opts);
      
      for (const c of selectedContacts) {
        const cName = c.name?.[0] || 'Unknown';
        const cPhone = c.tel?.[0] || '';
        if (cPhone) {
          await handleAddContact(undefined, cName, cPhone);
        }
      }
    } catch (err) {
      console.error('Failed to select contacts:', err);
      alert('Could not sync device contacts. Please ensure you granted permission.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          &times;
        </button>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🚨 Emergency Contacts
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          These contacts will be automatically notified with your location if the SOS trigger is activated.
        </p>
        
        {isSupported && (
          <button 
            onClick={handleSyncDevice}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '1.5rem', background: 'rgba(126, 200, 227, 0.1)', borderColor: 'rgba(126, 200, 227, 0.3)', color: 'var(--accent-primary)' }}
          >
            📱 Import from Device Contacts
          </button>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
          {contacts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No emergency contacts added yet.</p>
          ) : (
            contacts.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(126, 200, 227, 0.05)', borderRadius: '8px', border: '1px solid rgba(126, 200, 227, 0.15)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.phone}</span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={(e) => handleAddContact(e)} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Name" 
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            style={{ flex: '1', minWidth: '120px', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(126, 200, 227, 0.2)', background: 'rgba(255, 255, 255, 0.5)', outline: 'none' }}
            required
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            style={{ flex: '1', minWidth: '150px', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(126, 200, 227, 0.2)', background: 'rgba(255, 255, 255, 0.5)', outline: 'none' }}
            required
          />
          <button 
            type="submit" 
            disabled={isAddingContact}
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
          >
            {isAddingContact ? 'Adding...' : 'Add Contact'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyContactsModal;
