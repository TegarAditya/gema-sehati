import { UserProfile, Child, ReadingLog, ImmunizationRecord } from '../../lib/supabase';
import { calculateImmunizationCompletionRate } from './utils';

interface OverviewProps {
  users: UserProfile[];
  children: Child[];
  readingLogs: ReadingLog[];
  immunizations: ImmunizationRecord[];
}

export function OverviewTab({ users, children, readingLogs, immunizations }: OverviewProps) {
  const immunizationCompletionRate = calculateImmunizationCompletionRate(immunizations);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-500">Total User</p>
        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-500">Total Anak</p>
        <p className="text-2xl font-bold text-gray-900">{children.length}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-500">Reading Logs</p>
        <p className="text-2xl font-bold text-gray-900">{readingLogs.length}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-500">Imunisasi Selesai</p>
        <p className="text-2xl font-bold text-gray-900">{immunizationCompletionRate}%</p>
      </div>
    </div>
  );
}
