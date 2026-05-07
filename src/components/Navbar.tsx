'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function Navbar({ user }: { user: any }) {
  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-primary">
          AdmBuddy
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-text-muted">
            <User className="w-4 h-4" />
            <span>{user.name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
