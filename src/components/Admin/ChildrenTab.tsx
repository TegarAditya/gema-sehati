import { UserProfile, Child, GrowthRecord, ReadingLog, ImmunizationRecord } from '../../lib/supabase';
import { ArrowLeft, Calendar, BookOpen, Pill } from 'lucide-react';

interface ChildrenTabProps {
  children: Child[];
  users: UserProfile[];
  growthRecords: GrowthRecord[];
  readingLogs: ReadingLog[];
  immunizations: ImmunizationRecord[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  selectedChildId: string | null;
  onSelectChild: (childId: string | null) => void;
}

export function ChildrenTab({
  children,
  users,
  growthRecords,
  readingLogs,
  immunizations,
  searchQuery,
  onSearchChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  selectedChildId,
  onSelectChild,
}: ChildrenTabProps) {
  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);
  const paginatedChildren = filteredChildren.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedChild = selectedChildId ? children.find((c) => c.id === selectedChildId) : null;
  const selectedChildGrowth = selectedChildId ? growthRecords.filter((g) => g.child_id === selectedChildId) : [];
  const selectedChildReading = selectedChildId ? readingLogs.filter((r) => r.child_id === selectedChildId) : [];
  const selectedChildImmunization = selectedChildId ? immunizations.filter((i) => i.child_id === selectedChildId) : [];
  const selectedChildParent = selectedChild ? users.find((u) => u.id === selectedChild.user_id) : null;

  if (selectedChildId !== null && selectedChild) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => onSelectChild(null)}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Anak
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedChild.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal Lahir</p>
                <p className="text-base font-semibold text-gray-900">{new Date(selectedChild.birth_date).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-base font-semibold text-gray-900 capitalize">{selectedChild.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Parent</p>
                <p className="text-base font-semibold text-gray-900">{selectedChildParent?.full_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Parent</p>
                <p className="text-base font-semibold text-gray-900 truncate">{selectedChildParent?.email || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Riwayat Pertumbuhan ({selectedChildGrowth.length})
            </h4>
            {selectedChildGrowth.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada data pertumbuhan</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {selectedChildGrowth.map((record) => (
                  <div key={record.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-600">{new Date(record.record_date).toLocaleDateString('id-ID')}</p>
                        <p className="text-gray-900 font-medium">
                          Tinggi: {record.height_cm} cm | Berat: {record.weight_kg} kg
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'Normal' ? 'bg-green-100 text-green-700' : record.status === 'Kurang' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Catatan Membaca ({selectedChildReading.length})
            </h4>
            {selectedChildReading.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada catatan membaca</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {selectedChildReading.map((log) => (
                  <div key={log.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-900 font-medium">{log.book_title}</p>
                    <p className="text-gray-600 text-xs">{new Date(log.reading_date).toLocaleDateString('id-ID')} · {log.duration_minutes} menit</p>
                    {log.notes && <p className="text-gray-700 text-xs mt-1 italic">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600" />
            Jadwal dan Status Imunisasi ({selectedChildImmunization.length})
          </h4>
          {selectedChildImmunization.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada jadwal imunisasi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2">Vaksin</th>
                    <th className="px-4 py-2">Jadwal</th>
                    <th className="px-4 py-2">Tanggal Selesai</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChildImmunization.map((record) => (
                    <tr key={record.id} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-medium">{record.vaccine_name}</td>
                      <td className="px-4 py-2">{new Date(record.scheduled_date).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-2">{record.completed_date ? new Date(record.completed_date).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          record.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {record.completed ? 'Selesai' : 'Belum'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600 text-xs">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 space-y-3">
        <h3 className="font-semibold text-gray-900">Manage Child</h3>
        <input
          type="text"
          placeholder="Cari nama anak..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onPageChange(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Tanggal Lahir</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Parent Email</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChildren.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Tidak ada anak ditemukan
                </td>
              </tr>
            ) : (
              paginatedChildren.map((child) => {
                const parent = users.find((u) => u.id === child.user_id);
                return (
                  <tr key={child.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{child.name}</td>
                    <td className="px-4 py-3">{new Date(child.birth_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 capitalize">{child.gender}</td>
                    <td className="px-4 py-3 text-gray-600">{parent?.email || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectChild(child.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredChildren.length)} dari {filteredChildren.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Sebelumnya
            </button>
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
