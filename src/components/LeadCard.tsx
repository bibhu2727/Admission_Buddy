'use client';

import { Calendar, Phone, Hash, CheckCircle, XCircle, Clock, CalendarClock, MessageSquarePlus } from 'lucide-react';
import { format } from 'date-fns';
import { updateLeadStatus, postponeLead, updateLeadRemark } from '@/actions/leads';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'No Show': 'bg-red-50 text-red-700 border-red-200',
  Postponed: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function LeadCard({ lead, highlight = false }: { lead: any; highlight?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPostpone, setShowPostpone] = useState(false);
  const [showRemark, setShowRemark] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [remarkText, setRemarkText] = useState(lead.remark || '');

  const handleStatusUpdate = async (status: 'Converted' | 'No Show' | 'Pending') => {
    setLoading(true);
    try {
      await updateLeadStatus(lead._id, status);
      router.refresh();
    } catch (e) {
      alert('Failed to update status');
    }
    setLoading(false);
  };

  const handlePostpone = async () => {
    if (!newDate) return;
    setLoading(true);
    try {
      await postponeLead(lead._id, newDate);
      setShowPostpone(false);
      setNewDate('');
      router.refresh();
    } catch (e) {
      alert('Failed to postpone');
    }
    setLoading(false);
  };

  const handleRemarkSave = async () => {
    setLoading(true);
    try {
      await updateLeadRemark(lead._id, remarkText);
      setShowRemark(false);
      router.refresh();
    } catch (e) {
      alert('Failed to update remark');
    }
    setLoading(false);
  };

  // Tomorrow for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  return (
    <div
      className={`bg-surface rounded-xl p-4 border transition-all ${
        highlight ? 'border-emerald-200 shadow-md ring-1 ring-emerald-100' : 'border-border shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg">{lead.name}</h3>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
            {lead.channel}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[lead.status] || ''}`}>
            {lead.status}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-text-muted mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <a href={`tel:${lead.phone}`} className="hover:text-primary transition-colors">
            {lead.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={highlight ? 'text-emerald-700 font-medium' : ''}>
            {format(new Date(lead.visitDate), 'PPP')}
          </span>
        </div>
        {lead.remark && !showRemark && (
          <div className="flex items-start gap-2 pt-1">
            <Hash className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="line-clamp-2">{lead.remark}</p>
          </div>
        )}
      </div>

      {/* Postpone Date Picker */}
      {showPostpone && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
          <p className="text-sm font-medium text-blue-800">New visit date select karo:</p>
          <input
            type="date"
            min={minDate}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
          />
          <div className="flex gap-2">
            <button
              disabled={loading || !newDate}
              onClick={handlePostpone}
              className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Confirm'}
            </button>
            <button
              onClick={() => { setShowPostpone(false); setNewDate(''); }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Remark Editor */}
      {showRemark && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <p className="text-sm font-medium text-gray-700">Remark add/edit karo:</p>
          <textarea
            rows={2}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="Notes likh do..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={handleRemarkSave}
              className="flex-1 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Remark'}
            </button>
            <button
              onClick={() => { setShowRemark(false); setRemarkText(lead.remark || ''); }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto flex-wrap">
        {lead.status !== 'Converted' && (
          <button
            disabled={loading}
            onClick={() => handleStatusUpdate('Converted')}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 min-w-[60px]"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Convert
          </button>
        )}
        {lead.status !== 'No Show' && (
          <button
            disabled={loading}
            onClick={() => handleStatusUpdate('No Show')}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 min-w-[60px]"
          >
            <XCircle className="w-3.5 h-3.5" />
            No Show
          </button>
        )}
        {lead.status !== 'Pending' && (
          <button
            disabled={loading}
            onClick={() => handleStatusUpdate('Pending')}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50 min-w-[60px]"
          >
            <Clock className="w-3.5 h-3.5" />
            Pending
          </button>
        )}
        {!showPostpone && (
          <button
            disabled={loading}
            onClick={() => { setShowPostpone(true); setShowRemark(false); }}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 min-w-[60px]"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Postpone
          </button>
        )}
        {!showRemark && (
          <button
            disabled={loading}
            onClick={() => { setShowRemark(true); setShowPostpone(false); }}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 min-w-[60px]"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Remark
          </button>
        )}
      </div>
    </div>
  );
}
