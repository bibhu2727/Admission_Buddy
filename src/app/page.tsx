import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';
import { Plus, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, CalendarClock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LeadCard from '@/components/LeadCard';
import SearchBar from '@/components/SearchBar';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'Admin') {
    redirect('/admin');
  }

  await dbConnect();

  const params = await searchParams;
  const query = params.q || '';

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // Build search filter
  const baseFilter: any = { counselorId: session.user.id };
  if (query) {
    baseFilter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } },
    ];
  }

  // Today's pending leads
  const todaysLeads = await Lead.find({
    ...baseFilter,
    status: 'Pending',
    visitDate: { $gte: todayStart, $lte: todayEnd },
  })
    .sort({ visitDate: 1 })
    .lean();

  // Other pending leads (not today)
  const pendingLeads = await Lead.find({
    ...baseFilter,
    status: 'Pending',
    $and: [
      { $or: [{ visitDate: { $lt: todayStart } }, { visitDate: { $gt: todayEnd } }] },
    ],
  })
    .sort({ visitDate: -1 })
    .lean();

  // Converted leads
  const convertedLeads = await Lead.find({
    ...baseFilter,
    status: 'Converted',
  })
    .sort({ updatedAt: -1 })
    .lean();

  // No Show leads
  const noShowLeads = await Lead.find({
    ...baseFilter,
    status: 'No Show',
  })
    .sort({ updatedAt: -1 })
    .lean();

  // Postponed leads
  const postponedLeads = await Lead.find({
    ...baseFilter,
    status: 'Postponed',
  })
    .sort({ visitDate: 1 })
    .lean();

  const serialize = (leads: any[]) => JSON.parse(JSON.stringify(leads));

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={session.user} />

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Link
            href="/new-lead"
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Lead</span>
          </Link>
        </div>

        {/* Search Bar */}
        <SearchBar defaultValue={query} />

        {/* TODAY'S VISITS - Highlighted */}
        {todaysLeads.length > 0 && (
          <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-800">
              <CalendarIcon className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Today&apos;s Visits ({todaysLeads.length})</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {serialize(todaysLeads).map((lead: any) => (
                <LeadCard key={lead._id} lead={lead} highlight />
              ))}
            </div>
          </section>
        )}

        {/* PENDING Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Pending ({pendingLeads.length})</h2>
          </div>
          {pendingLeads.length === 0 ? (
            <div className="text-center py-8 bg-surface border border-border rounded-2xl">
              <p className="text-text-muted">No other pending leads.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {serialize(pendingLeads).map((lead: any) => (
                <LeadCard key={lead._id} lead={lead} />
              ))}
            </div>
          )}
        </section>

        {/* CONVERTED Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">Converted ({convertedLeads.length})</h2>
          </div>
          {convertedLeads.length === 0 ? (
            <div className="text-center py-8 bg-surface border border-border rounded-2xl">
              <p className="text-text-muted">No converted leads yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {serialize(convertedLeads).map((lead: any) => (
                <LeadCard key={lead._id} lead={lead} />
              ))}
            </div>
          )}
        </section>

        {/* POSTPONED Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Postponed ({postponedLeads.length})</h2>
          </div>
          {postponedLeads.length === 0 ? (
            <div className="text-center py-8 bg-surface border border-border rounded-2xl">
              <p className="text-text-muted">No postponed leads.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {serialize(postponedLeads).map((lead: any) => (
                <LeadCard key={lead._id} lead={lead} />
              ))}
            </div>
          )}
        </section>

        {/* NO SHOW Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold">No Show ({noShowLeads.length})</h2>
          </div>
          {noShowLeads.length === 0 ? (
            <div className="text-center py-8 bg-surface border border-border rounded-2xl">
              <p className="text-text-muted">No &quot;No Show&quot; leads.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {serialize(noShowLeads).map((lead: any) => (
                <LeadCard key={lead._id} lead={lead} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
