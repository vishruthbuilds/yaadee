import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchTimeCapsule, updateTimeCapsule } from '../api';
import BackButton from '../components/BackButton';

const AdminTimeCapsule = () => {
  const [data, setData] = useState({ book_images: [], reel_images: [], final_video: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const tc = await fetchTimeCapsule();
      setData(tc);
      setLoading(false);
    };
    load();
  }, []);

  const handleUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSaving(true); // Show a global loading state during upload
    
    try {
      // Import the new utilities (Assuming they are exported from ../api)
      const { compressImage, uploadFile } = await import('../api');

      for (const file of files) {
        let finalUrl = '';
        
        if (file.type.startsWith('image/')) {
          // Compress image before upload
          const compressed = await compressImage(file);
          finalUrl = await uploadFile(compressed);
        } else {
          // Direct upload for non-images (videos)
          finalUrl = await uploadFile(file);
        }

        if (type === 'book') {
          setData(prev => ({ ...prev, book_images: [...prev.book_images, finalUrl] }));
        } else if (type === 'reel') {
          setData(prev => ({ ...prev, reel_images: [...prev.reel_images, finalUrl] }));
        } else if (type === 'video') {
          setData(prev => ({ ...prev, final_video: finalUrl }));
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(`Upload failed: ${err.message}\n\nCommon fixes:\n1. Ensure bucket "yaadee" exists in Supabase Storage.\n2. Ensure the bucket is set to "Public".\n3. Ensure Storage Policies are set to allow uploads.`);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (index, type) => {
    if (type === 'book') {
      setData(prev => ({ ...prev, book_images: prev.book_images.filter((_, i) => i !== index) }));
    } else if (type === 'reel') {
      setData(prev => ({ ...prev, reel_images: prev.reel_images.filter((_, i) => i !== index) }));
    } else if (type === 'video') {
      setData(prev => ({ ...prev, final_video: null }));
    }
  };

  const save = async () => {
    setSaving(true);
    console.log('Attempting to save time capsule data:', data);
    const { error } = await updateTimeCapsule(data);
    if (error) {
      console.error('Save error:', error);
      alert('Error saving configuration: ' + error.message + '\n\nIf the error is "relation not found", please ensure you have created the "time_capsule" table in Supabase.');
    } else {
      alert('Time Capsule updated successfully! Your changes are now live.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 font-serif italic">Loading Configuration...</div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-8 md:p-16">
      <BackButton />
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 border-b border-stone-200 pb-8">
          <h1 className="text-4xl md:text-5xl font-serif italic text-ink mb-2">Time Capsule Manager</h1>
          <p className="text-stone-500">Configure the interactive memory journey.</p>
        </header>

        <div className="space-y-12">
          {/* Section 1: Archive Images */}
          <section className="paper-cutout p-8">
            <h2 className="text-2xl font-serif italic mb-6">1. Memory Archive (A4 Sheets)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              {data.book_images.map((img, i) => (
                <div key={i} className="aspect-square bg-stone-100 rounded overflow-hidden relative group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeItem(i, 'book')}
                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-stone-200 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
                <span className="text-3xl text-stone-300">+</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold mt-2">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'book')} />
              </label>
            </div>
          </section>

          {/* Section 2: Reel Images */}
          <section className="paper-cutout p-8">
            <h2 className="text-2xl font-serif italic mb-6">2. Cinematic Reel</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {data.reel_images.map((img, i) => (
                <div key={i} className="aspect-video bg-stone-100 rounded overflow-hidden relative group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeItem(i, 'reel')}
                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <label className="aspect-video border-2 border-dashed border-stone-200 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
                <span className="text-3xl text-stone-300">+</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold mt-2">Add Frames</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'reel')} />
              </label>
            </div>
          </section>

          {/* Section 3: Final Video */}
          <section className="paper-cutout p-8">
            <h2 className="text-2xl font-serif italic mb-6">3. Final Memory Video</h2>
            {data.final_video ? (
              <div className="relative rounded overflow-hidden border border-stone-100">
                <video src={data.final_video} className="w-full aspect-video object-cover" controls />
                <button 
                  onClick={() => removeItem(0, 'video')}
                  className="mt-4 text-red-500 text-xs font-bold uppercase hover:underline"
                >
                  Remove & Replace
                </button>
              </div>
            ) : (
              <label className="w-full h-48 border-2 border-dashed border-stone-200 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
                <span className="text-3xl text-stone-300">🎞️</span>
                <span className="text-[10px] text-stone-400 uppercase font-bold mt-2">Upload Video</span>
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleUpload(e, 'video')} />
              </label>
            )}
          </section>
        </div>

        <div className="mt-16 sticky bottom-8 flex justify-center">
          <button 
            onClick={save}
            disabled={saving}
            className={`btn-primary shadow-2xl scale-110 px-12 ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? 'Syncing...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTimeCapsule;
