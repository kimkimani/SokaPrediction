import { PredictionFixture } from '../types';

export interface DateGroupedFixtures {
  dateLabel: string;
  dateKey: string;
  isToday: boolean;
  isTomorrow: boolean;
  isYesterday: boolean;
  isPast: boolean;
  fixtures: PredictionFixture[];
  wonCount?: number;
  lostCount?: number;
}

export function formatDateString(dateStr: string): {
  label: string;
  key: string;
  isToday: boolean;
  isTomorrow: boolean;
  isYesterday: boolean;
  isPast: boolean;
} {
  const now = new Date();
  const todayKey = now.toISOString().split('T')[0];

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = yesterdayDate.toISOString().split('T')[0];

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowKey = tomorrowDate.toISOString().split('T')[0];

  let targetDate: Date;
  let key: string;

  if (dateStr.includes('T')) {
    key = dateStr.split('T')[0];
    targetDate = new Date(dateStr);
  } else if (dateStr.includes(' ')) {
    key = dateStr.split(' ')[0];
    targetDate = new Date(dateStr.replace(' ', 'T') + 'Z');
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    key = dateStr;
    targetDate = new Date(`${dateStr}T12:00:00Z`);
  } else {
    key = todayKey;
    targetDate = now;
  }

  const isToday = key === todayKey;
  const isTomorrow = key === tomorrowKey;
  const isYesterday = key === yesterdayKey;
  const isPast = key < todayKey;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = isNaN(targetDate.getDay()) ? '' : dayNames[targetDate.getDay()];
  const dayNum = isNaN(targetDate.getDate()) ? '' : targetDate.getDate();
  const monthName = isNaN(targetDate.getMonth()) ? '' : monthNames[targetDate.getMonth()];

  let prefix = '';
  if (isToday) prefix = 'Today, ';
  else if (isTomorrow) prefix = 'Tomorrow, ';
  else if (isYesterday) prefix = 'Yesterday, ';
  else if (dayName) prefix = `${dayName}, `;

  const label = `${prefix}${dayNum} ${monthName}`.trim() || key;

  return { label, key, isToday, isTomorrow, isYesterday, isPast };
}

export class MultiDateFixtureService {
  /**
   * Groups verified real match fixtures from the sports analytics database by date.
   * Competitor analysis categories (PredictZ, Sokapedia, Sunpel) are strictly limited to 4 days only.
   */
  static getGroupedFixtures(
    category: string = 'general',
    mode?: 'today' | 'yesterday' | 'tomorrow' | 'multi_date_3_plus_1' | 'multi_date_4_plus_1' | '4_days_only',
    apiFixtures?: PredictionFixture[]
  ): DateGroupedFixtures[] {
    if (!apiFixtures || apiFixtures.length === 0) {
      return [];
    }

    // Partition fixtures strictly by their real date
    const dateMap = new Map<string, PredictionFixture[]>();

    apiFixtures.forEach((fixture) => {
      const rawDate = fixture.kickoffTime || fixture.date || '';
      let dateKey = '';
      if (rawDate.includes('T')) {
        dateKey = rawDate.split('T')[0];
      } else if (rawDate.includes(' ')) {
        dateKey = rawDate.split(' ')[0];
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        dateKey = rawDate;
      } else {
        dateKey = new Date().toISOString().split('T')[0];
      }

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(fixture);
    });

    // Sort dates in reverse chronological order (newest date first)
    const sortedDateKeys = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    const grouped: DateGroupedFixtures[] = sortedDateKeys.map((key) => {
      const fixtures = dateMap.get(key) || [];
      const { label, isToday, isTomorrow, isYesterday, isPast } = formatDateString(key);

      const wonCount = fixtures.filter((f) => (f.result || '').toLowerCase() === 'won').length;
      const lostCount = fixtures.filter((f) => (f.result || '').toLowerCase() === 'lost').length;

      return {
        dateLabel: label,
        dateKey: key,
        isToday,
        isTomorrow,
        isYesterday,
        isPast,
        fixtures,
        wonCount: (isPast || isYesterday) ? wonCount : undefined,
        lostCount: (isPast || isYesterday) ? lostCount : undefined,
      };
    });

    if (mode === 'today') {
      const todayGroup = grouped.filter((g) => g.isToday);
      return todayGroup.length > 0 ? todayGroup : grouped.slice(0, 1);
    }
    if (mode === 'tomorrow') {
      const tomGroup = grouped.filter((g) => g.isTomorrow);
      return tomGroup.length > 0 ? tomGroup : [];
    }
    if (mode === 'yesterday') {
      const yestGroup = grouped.filter((g) => g.isYesterday);
      return yestGroup.length > 0 ? yestGroup : [];
    }

    // Competitor analysis pages (PredictZ, Sokapedia, Sunpel) show games of 4 days only
    const catLower = (category || '').toLowerCase();
    const isCompetitorOr4Days =
      catLower.includes('predictz') ||
      catLower.includes('sokapedia') ||
      catLower.includes('sunpel') ||
      mode === 'multi_date_3_plus_1' ||
      mode === '4_days_only';

    if (isCompetitorOr4Days) {
      return grouped.slice(0, 4);
    }

    return grouped.slice(0, 5);
  }
}
