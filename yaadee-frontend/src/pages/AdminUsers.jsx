import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, updateUser, deleteUser } from '../api';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', photoUrl: '', bio: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsers();
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true); // Re-use loading state for upload
    try {
      const { compressImage, uploadFile } = await import('../api');
      const compressed = await compressImage(file);
      const url = await uploadFile(compressed);
      callback(url);
    } catch (err) {
      console.error('Profile upload failed:', err);
      alert('Photo upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditUser = (u) => {
    setEditingUserId(u.id);
    setEditUserForm({ name: u.name, photoUrl: u.photoUrl || '', bio: u.quote || '' });
  };

  const handleSaveEditUser = async (id) => {
    if (!editUserForm.name) return alert('Name is required');
    const result = await updateUser(id, editUserForm.name, editUserForm.photoUrl, editUserForm.bio);
    if (result.error) {
      alert('Error saving user: ' + result.error.message);
    } else {
      setEditingUserId(null);
      loadUsers();
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const result = await deleteUser(id);
      if (result.error) {
        alert('Error deleting user: ' + result.error.message);
      } else {
        loadUsers();
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto pt-16 md:pt-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="font-serif text-3xl md:text-4xl text-ink">All Listed People</h1>
        <button onClick={() => navigate('/admin')} className="btn-primary py-2 px-4 text-sm w-full md:w-auto">
          Back to Admin
        </button>
      </div>

      <div className="paper-cutout p-6">
        {loading ? (
          <p className="font-serif text-stone-500">Loading people...</p>
        ) : users.length === 0 ? (
          <p className="font-serif text-stone-500 italic">No people listed yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {users.map(u => (
              <div key={u.id} className="flex flex-col p-4 border border-stone-200 bg-white">
                {editingUserId === u.id ? (
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-stone-400 font-bold uppercase">Name</label>
                      <input 
                        type="text" 
                        value={editUserForm.name} 
                        onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} 
                        className="p-2 border border-stone-300 w-full font-sans text-lg focus:outline-none focus:border-accent" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs text-stone-400 font-bold uppercase">Farewell Note / Bio</label>
                      <textarea 
                        value={editUserForm.bio} 
                        onChange={e => setEditUserForm({...editUserForm, bio: e.target.value})} 
                        className="p-3 border border-stone-300 w-full font-serif italic text-stone-700 min-h-[100px] focus:outline-none focus:border-accent" 
                        placeholder="Write a heartfelt message..."
                      />
                    </div>

                    <div className="bg-stone-50 p-3 border border-stone-200">
                      <label className="text-sm text-stone-500 block mb-2 font-bold uppercase tracking-wide">Change Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, (base64) => setEditUserForm({...editUserForm, photoUrl: base64}))} 
                        className="text-sm w-full" 
                      />
                      {editUserForm.photoUrl && (
                        <div className="mt-3">
                          <p className="text-xs text-stone-400 mb-1">Preview:</p>
                          <img src={editUserForm.photoUrl} alt="preview" className="w-16 h-16 object-cover rounded-sm border border-stone-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleSaveEditUser(u.id)} className="bg-green-600 text-white font-bold px-6 py-2 transition hover:bg-green-700">Save Changes</button>
                      <button onClick={() => setEditingUserId(null)} className="bg-stone-200 text-ink font-bold px-6 py-2 transition hover:bg-stone-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full">
                      {u.photoUrl ? (
                        <img src={u.photoUrl} alt="profile" className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-full shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-stone-200 rounded-full flex items-center justify-center font-serif text-stone-500 text-lg md:text-xl shadow-sm">{u.name.charAt(0)}</div>
                      )}
                      <div>
                        <span className="font-serif font-bold text-xl md:text-2xl block">{u.name}</span>
                        {u.quote && <p className="text-xs text-stone-400 italic line-clamp-1">"{u.quote}"</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => handleStartEditUser(u)} className="flex-1 sm:flex-none bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 font-bold px-4 py-2 rounded-sm transition">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="flex-1 sm:flex-none bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold px-4 py-2 rounded-sm transition">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
