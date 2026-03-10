import { supabase, UserProfile, Child, ReadingLog, ImmunizationRecord } from '../../lib/supabase';
import { useSupabaseQuery } from '../../lib/swrHooks';
import { adminKeys } from '../../lib/swrKeys';
import { calculateImmunizationCompletionRate } from './utils';

export function OverviewTab() {
  const { data: users = [] } = useSupabaseQuery<UserProfile[]>(
    'admin-users',
    async () => {
      const { data } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      return data ?? [];
    }
  );
  const { data: children = [] } = useSupabaseQuery<Child[]>(
    'admin-children',
    async () => {
      const { data } = await supabase.from('children').select('*').order('created_at', { ascending: false });
      return data ?? [];
    }
  );
  const { data: readingLogs = [] } = useSupabaseQuery<ReadingLog[]>(
    adminKeys.READING_LOGS,
    async () => {
      const { data } = await supabase.from('reading_logs').select('*').order('reading_date', { ascending: false });
      return data ?? [];
    }
  );
  const { data: immunizations = [] } = useSupabaseQuery<ImmunizationRecord[]>(
    adminKeys.IMMUNIZATION_RECORDS,
    async () => {
      const { data } = await supabase.from('immunization_records').select('*').order('scheduled_date', { ascending: false });
      return data ?? [];
    }
  );

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
