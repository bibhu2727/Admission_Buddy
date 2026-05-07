'use client';

import { useState } from 'react';
import { createCounselor } from '@/actions/admin';
import { Loader2 } from 'lucide-react';

export default function AddCounselorForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await createCounselor(formData);
      form.reset();
      alert('Counselor created successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to create counselor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input name="name" required className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John Doe" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="john@admbuddy.com" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-medium">Initial Password</label>
          <input name="password" type="text" required className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="password123" />
        </div>
      </div>
      
      <button type="submit" disabled={loading} className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center justify-center">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
      </button>
    </form>
  );
}
