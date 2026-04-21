import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchUsers } from '../api';
import PageWrapper from '../components/PageWrapper';

const Credential = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then(data => {
      if (data) setUsers(data);
    });
  }, []);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleProceed = () => {
    if (selectedUser) {
      localStorage.setItem('yaadee_user', JSON.stringify(selectedUser));
      navigate(`/scrapbook/${selectedUser.id}`);
    }
  };

  return (
    <PageWrapper style={styles.page}>
      <motion.div style={styles.card} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <h2 style={styles.title}>Who are you?</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Find your name to unlock your memories.</p>
        
        <input 
          type="text" 
          placeholder="Type your name..." 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedUser(null);
          }}
          style={styles.input}
        />

        {searchTerm && !selectedUser && (
          <ul style={styles.dropdown}>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <li key={user.id} style={styles.dropdownItem} onClick={() => {
                setSelectedUser(user);
                setSearchTerm(user.name);
              }}>
                {user.name}
              </li>
            )) : <li style={styles.dropdownItem}>No one found :(</li>}
          </ul>
        )}

        <button 
          className="btn" 
          disabled={!selectedUser}
          onClick={handleProceed}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Open My Scrapbook
        </button>
      </motion.div>
    </PageWrapper>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0
  },
  card: {
    background: 'white',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: 'var(--paper-shadow)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    position: 'relative'
  },
  title: {
    fontSize: '3rem',
    color: '#e6b981'
  },
  input: {
    marginBottom: 0
  },
  dropdown: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    border: '1px solid #ddd',
    borderTop: 'none',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    maxHeight: '150px',
    overflowY: 'auto',
    textAlign: 'left',
    position: 'absolute',
    width: 'calc(100% - 6rem)',
    background: 'white',
    zIndex: 10
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0'
  }
};

export default Credential;
