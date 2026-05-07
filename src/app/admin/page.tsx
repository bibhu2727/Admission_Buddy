import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Navbar from '@/components/Navbar';
import AddCounselorForm from './AddCounselorForm';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'Admin') {
    redirect('/');
  }

  await dbConnect();

  const counselors = await User.find({ role: 'Counselor' }).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={session.user} />
      
      <main className="max-w-4xl mx-auto p-4 mt-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-text-muted">Manage counselor accounts</p>
        </div>

        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add New Counselor</h2>
          <AddCounselorForm />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Counselor Accounts ({counselors.length})</h2>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            {counselors.length === 0 ? (
              <div className="p-8 text-center text-text-muted">No counselors found.</div>
            ) : (
              <ul className="divide-y divide-border">
                {counselors.map((c: any) => (
                  <li key={c._id.toString()} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text">{c.name}</p>
                      <p className="text-sm text-text-muted">{c.email}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Counselor</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
