import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, updateUser, deleteUser } from '../api';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', photoUrl: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsers();
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditUser = (u) => {
    setEditingUserId(u.id);
    setEditUserForm({ name: u.name, photoUrl: u.photoUrl || '' });
  };

  const handleSaveEditUser = async (id) => {
    if (!editUserForm.name) return alert('Name is required');
    const result = await updateUser(id, editUserForm.name, editUserForm.photoUrl);
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
    <div className="min-h-screen p-8 max-w-4xl mx-auto pt-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl text-ink">All Listed People</h1>
        <button onClick={() => navigate('/admin')} className="btn-primary py-2 px-4 text-sm">
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
                  <div className="flex flex-col gap-3">
                    <input 
                      type="text" 
                      value={editUserForm.name} 
                      onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} 
                      className="p-2 border border-stone-300 w-full font-sans text-lg" 
                    />
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {u.photoUrl ? (
                        <img src={u.photoUrl} alt="profile" className="w-14 h-14 object-cover rounded-full shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 bg-stone-200 rounded-full flex items-center justify-center font-serif text-stone-500 text-xl shadow-sm">{u.name.charAt(0)}</div>
                      )}
                      <span className="font-serif font-bold text-2xl">{u.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleStartEditUser(u)} className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 font-bold px-4 py-2 rounded-sm transition">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold px-4 py-2 rounded-sm transition">Delete</button>
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
