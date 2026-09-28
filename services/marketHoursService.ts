/**
 * Official Indian Stock Market (NSE / BSE) Trading Hours & Session Service
 * 
 * Exact Schedule (IST = UTC + 5:30):
 * - Normal Trading Hours: 09:15 AM to 03:30 PM (Mon - Fri)
 * - Auto Square-Off / Pre-close: 03:15 PM - 03:25 PM
 * - Post-Market Closing Session: 03:30 PM - 04:00 PM
 * - Market Closed: Before 09:15 AM, After 03:30 PM, Saturdays & Sundays, and Declared NSE Holidays.
 */

export interface MarketHoursStatus {
  isOpen: boolean;
  status: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'AUTO_SQUARE_OFF' | 'POST_CLOSE' | 'WEEKEND' | 'HOLIDAY';
  statusText: string;
  badgeColor: string;
  istTimeString: string;
  istDateString: string;
  timeRemainingText: string;
  canExecuteLiveOrders: boolean;
  autoSquareOffTriggered: boolean;
  nextOpenString: string;
}

// 2024-2026 NSE Scheduled Trading Holidays (YYYY-MM-DD)
const NSE_HOLIDAYS_SET = new Set<string>([
  '2026-01-26', // Republic Day
  '2026-03-03', // Holi
  '2026-03-21', // Id-Ul-Fitr
  '2026-04-03', // Good Friday
  '2026-04-14', // Dr. Ambedkar Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-05-27', // Bakri Id
  '2026-08-15', // Independence Day
  '2026-09-04', // Milad-un-Nabi
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-09', // Diwali Laxmi Pujan
  '2026-11-10', // Diwali Balipratipada
  '2026-11-24', // Gurunanak Jayanti
  '2026-12-25'  // Christmas
]);

class MarketHoursService {
  private listeners: Set<(status: MarketHoursStatus) => void> = new Set();
  private timer: any = null;
  private currentStatus: MarketHoursStatus;

  constructor() {
    this.currentStatus = this.calculateStatus();
    if (typeof window !== 'undefined') {
      this.timer = setInterval(() => {
        const next = this.calculateStatus();
        this.currentStatus = next;
        this.listeners.forEach(fn => {
          try { fn(next); } catch (_) {}
        });
      }, 1000);
    }
  }

  public getStatus(): MarketHoursStatus {
    return this.currentStatus;
  }

  public subscribe(fn: (status: MarketHoursStatus) => void): () => void {
    this.listeners.add(fn);
    fn(this.currentStatus);
    return () => this.listeners.delete(fn);
  }

  public calculateStatus(): MarketHoursStatus {
    const now = new Date();
    // Convert to IST (UTC + 5:30)
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istDate = new Date(utcTime + 330 * 60000);

    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dayOfWeek = istDate.getDay(); // 0 = Sun, 6 = Sat
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const seconds = istDate.getSeconds();
    const totalMinutes = hours * 60 + minutes;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    const istTimeString = `${hh}:${mm}:${ss} IST`;
    const istDateString = istDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    // Weekend Check
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        isOpen: false,
        status: 'WEEKEND',
        statusText: 'Market Closed (Weekend)',
        badgeColor: 'border-slate-700 bg-slate-800/80 text-slate-400',
        istTimeString,
        istDateString,
        timeRemainingText: 'Opens Monday 09:15 AM',
        canExecuteLiveOrders: false,
        autoSquareOffTriggered: true,
        nextOpenString: 'Mon 09:15 AM'
      };
    }

    // Holiday Check
    if (NSE_HOLIDAYS_SET.has(dateKey)) {
      return {
        isOpen: false,
        status: 'HOLIDAY',
        statusText: 'Market Closed (NSE Holiday)',
        badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        istTimeString,
        istDateString,
        timeRemainingText: 'Opens Next Trading Session 09:15 AM',
        canExecuteLiveOrders: false,
        autoSquareOffTriggered: true,
        nextOpenString: 'Next Business Day 09:15 AM'
      };
    }

    // Pre-Market Order Window (09:00 - 09:15 IST = 540 - 555 mins)
    if (totalMinutes >= 540 && totalMinutes < 555) {
      const minsLeft = 555 - totalMinutes;
      return {
        isOpen: false,
        status: 'PRE_OPEN',
        statusText: 'Pre-Market Discovery Session',
        badgeColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
        istTimeString,
        istDateString,
        timeRemainingText: `Opens in ${minsLeft}m (${555 * 60 - (totalMinutes * 60 + seconds)}s)`,
        canExecuteLiveOrders: false,
        autoSquareOffTriggered: false,
        nextOpenString: 'Today 09:15 AM'
      };
    }

    // Auto Square-Off Window (03:15 PM - 03:30 PM = 915 - 930 mins)
    if (totalMinutes >= 915 && totalMinutes < 930) {
      const minsToClose = 930 - totalMinutes;
      return {
        isOpen: true,
        status: 'AUTO_SQUARE_OFF',
        statusText: 'Mandatory Auto Square-Off Window (Pre-Close)',
        badgeColor: 'border-rose-500/40 bg-rose-500/15 text-rose-300 animate-pulse',
        istTimeString,
        istDateString,
        timeRemainingText: `Market Closes in ${minsToClose}m (${930 * 60 - (totalMinutes * 60 + seconds)}s)`,
        canExecuteLiveOrders: false, // Disallow new entries, trigger auto-squareoff
        autoSquareOffTriggered: true,
        nextOpenString: 'Tomorrow 09:15 AM'
      };
    }

    // Normal Trading Hours (09:15 AM - 03:15 PM = 555 - 915 mins)
    if (totalMinutes >= 555 && totalMinutes < 915) {
      const minsToSquareOff = 915 - totalMinutes;
      const hoursLeft = Math.floor(minsToSquareOff / 60);
      const remainingMins = minsToSquareOff % 60;
      return {
        isOpen: true,
        status: 'OPEN',
        statusText: 'NSE / BSE Market Open (Live Trading)',
        badgeColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
        istTimeString,
        istDateString,
        timeRemainingText: `Closes in ${hoursLeft}h ${remainingMins}m`,
        canExecuteLiveOrders: true,
        autoSquareOffTriggered: false,
        nextOpenString: 'Now Active'
      };
    }

    // Post-Market / Off-Hours
    const isPostClose = totalMinutes >= 930 && totalMinutes < 960;
    return {
      isOpen: false,
      status: isPostClose ? 'POST_CLOSE' : 'CLOSED',
      statusText: isPostClose ? 'Post-Market Closing Session' : 'Market Closed (Off-Hours)',
      badgeColor: 'border-slate-700 bg-slate-800/80 text-slate-400',
      istTimeString,
      istDateString,
      timeRemainingText: totalMinutes < 540 ? `Opens Today at 09:15 AM` : `Opens Tomorrow at 09:15 AM`,
      canExecuteLiveOrders: false,
      autoSquareOffTriggered: true,
      nextOpenString: totalMinutes < 540 ? 'Today 09:15 AM' : 'Next Trading Day 09:15 AM'
    };
  }
}

export const marketHoursService = new MarketHoursService();
