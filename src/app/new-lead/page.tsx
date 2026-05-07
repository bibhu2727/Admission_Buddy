'use client';

import { useState } from 'react';
import { createLead } from '@/actions/leads';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLeadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await createLead(formData);
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Failed to create lead');
      setLoading(false);
    }
  };

  if (!session) return null;

  // Default to today's date
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={session.user} />
      
      <main className="max-w-2xl mx-auto p-4 mt-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-text-muted hover:text-text transition-colors rounded-full hover:bg-surface">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Add New Lead</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name</label>
            <input name="name" required className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background" placeholder="e.g. John Doe" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phone Number</label>
            <input name="phone" type="tel" required className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background" placeholder="e.g. 9876543210" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Channel</label>
            <select name="channel" required className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background appearance-none">
              <option value="direct">Direct Walk-in</option>
              <option value="reff">Reference</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Visit Date</label>
            <input name="visitDate" type="date" defaultValue={today} required className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Remarks (Optional)</label>
            <textarea name="remark" rows={3} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background resize-none" placeholder="Add any notes from the call..." />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors flex justify-center mt-6 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Lead'}
          </button>
        </form>
      </main>
    </div>
  );
}
