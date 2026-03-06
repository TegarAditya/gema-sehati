import { GrowthRecord, ImmunizationRecord, ReadingLog, Child } from '../../lib/supabase';
import { Download } from 'lucide-react';
import {
  calculateAverageGrowth,
  calculateImmunizationCompletionRate,
  calculateMonthlyReading,
  exportChildData,
  exportGrowthData,
  exportReadingLogs,
  exportImmunizationData,
} from './utils';

interface AnalyticsTabProps {
  growthRecords: GrowthRecord[];
  immunizations: ImmunizationRecord[];
  readingLogs: ReadingLog[];
  children: Child[];
}

export function AnalyticsTab({
  growthRecords,
  immunizations,
  readingLogs,
  children,
}: AnalyticsTabProps) {
  const averageGrowth = calculateAverageGrowth(growthRecords);
  const immunizationCompletionRate = calculateImmunizationCompletionRate(immunizations);
  const monthlyReading = calculateMonthlyReading(readingLogs);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Growth Summary</h3>
          <p className="text-sm text-gray-600">Rata-rata tinggi: <span className="font-semibold text-gray-900">{averageGrowth.avgHeight.toFixed(1)} cm</span></p>
          <p className="text-sm text-gray-600">Rata-rata berat: <span className="font-semibold text-gray-900">{averageGrowth.avgWeight.toFixed(1)} kg</span></p>
          <p className="text-sm text-gray-600">Total record: <span className="font-semibold text-gray-900">{growthRecords.length}</span></p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Immunization Coverage</h3>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
            <div className="bg-green-500 h-3" style={{ width: `${immunizationCompletionRate}%` }} />
          </div>
          <p className="text-sm text-gray-600">Completion rate: <span className="font-semibold text-gray-900">{immunizationCompletionRate}%</span></p>
          <p className="text-sm text-gray-600">Total record: <span className="font-semibold text-gray-900">{immunizations.length}</span></p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Reading Logs (6 bulan terakhir)</h3>
        <div className="space-y-2">
          {monthlyReading.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data membaca.</p>
          ) : (
            monthlyReading.map(([month, total]) => {
              const maxValue = Math.max(...monthlyReading.map(([, value]) => value), 1);
              const width = Math.round((total / maxValue) * 100);
              return (
                <div key={month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{month}</span>
                    <span className="font-semibold">{total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-2" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Export Data CSV</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportChildData(children)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Download className="w-4 h-4" /> Export Child Data
          </button>

          <button
            onClick={() => exportGrowthData(growthRecords)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Download className="w-4 h-4" /> Export Growth
          </button>

          <button
            onClick={() => exportReadingLogs(readingLogs)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Download className="w-4 h-4" /> Export Reading Logs
          </button>

          <button
            onClick={() => exportImmunizationData(immunizations)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Download className="w-4 h-4" /> Export Immunization
          </button>
        </div>
      </div>
    </div>
  );
}
