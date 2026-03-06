import {
  Child,
  GrowthRecord,
  ImmunizationRecord,
  ReadingLog,
} from '../../lib/supabase';

function toCsv(rows: Record<string, string | number | boolean | null>[]) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escaped = (value: string | number | boolean | null) => {
    const normalized = `${value ?? ''}`.replaceAll('"', '""');
    return `"${normalized}"`;
  };

  const headerLine = headers.join(',');
  const body = rows
    .map((row) => headers.map((header) => escaped(row[header] ?? '')).join(','))
    .join('\n');

  return `${headerLine}\n${body}`;
}

export function downloadCsv(filename: string, rows: Record<string, string | number | boolean | null>[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function calculateChildrenByUser(children: Child[]): Record<string, number> {
  return children.reduce<Record<string, number>>((acc, child) => {
    acc[child.user_id] = (acc[child.user_id] ?? 0) + 1;
    return acc;
  }, {});
}

export function calculateMonthlyReading(readingLogs: ReadingLog[]): [string, number][] {
  const aggregation = readingLogs.reduce<Record<string, number>>((acc, log) => {
    const key = log.reading_date.slice(0, 7);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(aggregation)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);
}

export function calculateAverageGrowth(growthRecords: GrowthRecord[]): { avgHeight: number; avgWeight: number } {
  if (growthRecords.length === 0) {
    return { avgHeight: 0, avgWeight: 0 };
  }

  const totalHeight = growthRecords.reduce((sum, record) => sum + Number(record.height_cm), 0);
  const totalWeight = growthRecords.reduce((sum, record) => sum + Number(record.weight_kg), 0);

  return {
    avgHeight: totalHeight / growthRecords.length,
    avgWeight: totalWeight / growthRecords.length,
  };
}

export function calculateImmunizationCompletionRate(immunizations: ImmunizationRecord[]): number {
  if (immunizations.length === 0) return 0;
  const completed = immunizations.filter((record) => record.completed).length;
  return Math.round((completed / immunizations.length) * 100);
}

export function exportChildData(children: Child[]) {
  downloadCsv('children.csv', children.map((child) => ({
    id: child.id,
    user_id: child.user_id,
    name: child.name,
    birth_date: child.birth_date,
    gender: child.gender,
  })));
}

export function exportGrowthData(growthRecords: GrowthRecord[]) {
  downloadCsv('growth_records.csv', growthRecords.map((record) => ({
    id: record.id,
    child_id: record.child_id,
    record_date: record.record_date,
    height_cm: record.height_cm,
    weight_kg: record.weight_kg,
    status: record.status,
  })));
}

export function exportReadingLogs(readingLogs: ReadingLog[]) {
  downloadCsv('reading_logs.csv', readingLogs.map((log) => ({
    id: log.id,
    user_id: log.user_id,
    child_id: log.child_id,
    book_title: log.book_title,
    reading_date: log.reading_date,
    duration_minutes: log.duration_minutes,
  })));
}

export function exportImmunizationData(immunizations: ImmunizationRecord[]) {
  downloadCsv('immunization_records.csv', immunizations.map((record) => ({
    id: record.id,
    child_id: record.child_id,
    vaccine_name: record.vaccine_name,
    scheduled_date: record.scheduled_date,
    completed: record.completed,
    completed_date: record.completed_date,
  })));
}
