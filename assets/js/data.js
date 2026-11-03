/* IDB Space — shared data model, rules, storage and availability helpers */

const STORAGE_KEY = 'idb_space_bookings_v1';
const SEED_KEY = 'idb_space_seeded_v1';

const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WEEKDAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const HOLDING_STATUSES = ['menunggu', 'perlu-perbaikan', 'disetujui'];

const STATUS_LABELS = {
  menunggu: 'Menunggu',
  'perlu-perbaikan': 'Perlu Perbaikan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
  dibatalkan: 'Dibatalkan',
  selesai: 'Selesai'
};

const FACILITY_OPTIONS = [
  'Proyektor', 'Layar / TV', 'Sound system', 'Mikrofon',
  'AC', 'Papan tulis', 'Meja & kursi', 'Koneksi internet',
  'Panggung', 'Tata cahaya'
];

const ROOMS = [
  {
    id: 'lab-imac',
    name: 'Lab iMac',
    kind: 'Laboratorium',
    capacity: 30,
    blurb: 'Lab komputer untuk kelas desain, praktikum, dan pelatihan perangkat lunak.',
    facilities: ['AC', 'Proyektor', 'Koneksi internet', 'Meja & kursi'],
    rules: { 0: { start: '08:00', end: '17:00' }, 6: { start: '08:00', end: '17:00' } }
  },
  {
    id: 'lecture-2b',
    name: 'Lecture 2B',
    kind: 'Ruang kuliah',
    capacity: 45,
    blurb: 'Ruang kuliah dengan tata letak kelas untuk perkuliahan dan presentasi.',
    facilities: ['AC', 'Proyektor', 'Papan tulis', 'Meja & kursi'],
    rules: { 0: { start: '08:00', end: '17:00' }, 6: { start: '08:00', end: '17:00' } }
  },
  {
    id: 'a-1-2',
    name: 'A 1.2',
    kind: 'Ruang kelas',
    capacity: 40,
    blurb: 'Ruang kelas serbaguna untuk kegiatan organisasi dan diskusi kelompok.',
    facilities: ['AC', 'Layar / TV', 'Papan tulis', 'Meja & kursi'],
    rules: { 0: { start: '08:00', end: '17:00' }, 6: { start: '08:00', end: '17:00' } }
  },
  {
    id: 'studio-3',
    name: 'Studio 3',
    kind: 'Studio',
    capacity: 25,
    blurb: 'Studio kreatif untuk produksi konten, foto, dan rekaman.',
    facilities: ['AC', 'Tata cahaya', 'Sound system', 'Koneksi internet'],
    rules: { 0: { start: '08:00', end: '17:00' }, 6: { start: '08:00', end: '17:00' } }
  },
  {
    id: 'aula',
    name: 'Aula',
    kind: 'Aula serbaguna',
    capacity: 250,
    blurb: 'Aula utama untuk seminar, wisuda, dan acara besar kampus.',
    facilities: ['AC', 'Panggung', 'Sound system', 'Mikrofon', 'Proyektor', 'Tata cahaya', 'Meja & kursi'],
    rules: {
      1: { start: '08:00', end: '17:00' },
      2: { start: '08:00', end: '17:00' },
      3: { start: '08:00', end: '17:00' },
      4: { start: '08:00', end: '17:00' },
      5: { start: '08:00', end: '17:00' },
      6: { start: '08:00', end: '14:00' }
    }
  }
];

function timeToMin(t) {
  const parts = String(t).split(':');
  return Number(parts[0]) * 60 + Number(parts[1] || 0);
}

function minToTime(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

function dayIndex(dateStr) {
  return parseDate(dateStr).getDay();
}

function dayName(dateStr) {
  return WEEKDAYS[dayIndex(dateStr)];
}

function formatDate(dateStr) {
  const d = parseDate(dateStr);
  return WEEKDAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

function formatDateShort(dateStr) {
  const d = parseDate(dateStr);
  return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function addDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

function nextWeekday(fromISO, targetDay) {
  let d = parseDate(fromISO);
  let guard = 0;
  while (d.getDay() !== targetDay && guard < 14) {
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return isoDate(d);
}

function ruleFor(room, dateStr) {
  return room.rules[dayIndex(dateStr)] || null;
}

function roomById(id) {
  return ROOMS.find(function (r) { return r.id === id; });
}

function overlap(aStart, aEnd, bStart, bEnd) {
  return timeToMin(aStart) < timeToMin(bEnd) && timeToMin(bStart) < timeToMin(aEnd);
}

function isHolding(booking) {
  return HOLDING_STATUSES.indexOf(booking.status) !== -1;
}

function getBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveBookings(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function addBooking(booking) {
  const list = getBookings();
  list.push(booking);
  saveBookings(list);
  return booking;
}

function updateBooking(id, patch) {
  const list = getBookings();
  const idx = list.findIndex(function (b) { return b.id === id; });
  if (idx === -1) return null;
  list[idx] = Object.assign({}, list[idx], patch);
  saveBookings(list);
  return list[idx];
}

function nextRef(list) {
  const year = new Date().getFullYear();
  let max = 0;
  list.forEach(function (b) {
    const m = /IDB-\d{4}-(\d+)/.exec(b.ref || '');
    if (m) max = Math.max(max, Number(m[1]));
  });
  return 'IDB-' + year + '-' + String(max + 1).padStart(4, '0');
}

/* Availability for one room at a given date + time window.
   Returns { status, selectable, label, reason, rule }. */
function getAvailability(room, dateStr, start, end, bookings) {
  const list = bookings || getBookings();
  const wd = dayIndex(dateStr);
  const rule = ruleFor(room, dateStr);

  if (!rule) {
    return {
      status: 'rule',
      selectable: false,
      label: 'Tidak tersedia di hari ini',
      reason: room.name + ' tidak dapat dipinjam pada hari ' + WEEKDAYS[wd] + '.',
      rule: null
    };
  }

  if (!start || !end || timeToMin(end) <= timeToMin(start)) {
    return {
      status: 'invalid',
      selectable: false,
      label: 'Jam tidak valid',
      reason: 'Jam selesai harus lebih akhir daripada jam mulai.',
      rule: rule
    };
  }

  if (timeToMin(start) < timeToMin(rule.start) || timeToMin(end) > timeToMin(rule.end)) {
    return {
      status: 'rule',
      selectable: false,
      label: 'Di luar jam ruangan',
      reason: room.name + ' hanya tersedia pukul ' + rule.start + '–' + rule.end + ' pada hari ' + WEEKDAYS[wd] + '.',
      rule: rule
    };
  }

  const conflict = list.find(function (b) {
    return b.roomId === room.id && b.date === dateStr && isHolding(b) &&
      overlap(start, end, b.start, b.end);
  });

  if (conflict) {
    return {
      status: 'booked',
      selectable: false,
      label: 'Sudah dipesan',
      reason: 'Terisi ' + conflict.start + '–' + conflict.end + ' oleh pengajuan lain pada waktu ini.',
      rule: rule,
      conflict: conflict
    };
  }

  return {
    status: 'available',
    selectable: true,
    label: 'Tersedia',
    reason: 'Ruangan dapat dipinjam pada rentang waktu ini.',
    rule: rule
  };
}

function roomRuleSummary(room) {
  if (room.id === 'aula') return 'Senin–Jumat 08.00–17.00 · Sabtu 08.00–14.00 · Minggu tutup';
  return 'Sabtu & Minggu 08.00–17.00 · hari kerja tutup';
}

/* Demo data so the conflict / queue experience is visible on first run. */
function seedDemoData() {
  if (localStorage.getItem(SEED_KEY)) return;
  const existing = getBookings();
  if (existing.length) { localStorage.setItem(SEED_KEY, '1'); return; }

  const today = todayISO();
  const sat = nextWeekday(today, 6);
  const mon = nextWeekday(today, 1);
  const year = new Date().getFullYear();
  const now = new Date().toISOString();

  const demo = [
    {
      id: 'seed-1',
      ref: 'IDB-' + year + '-0001',
      applicantType: 'UKM',
      name: 'Ni Made Ayu Lestari',
      nim: '2023010045',
      org: 'UKM Fotografi',
      position: 'Ketua',
      email: 'fotografi@idb.ac.id',
      whatsapp: '081234567801',
      activity: 'Workshop Fotografi Produk',
      reason: 'Pelatihan anggota UKM untuk persiapan pameran karya semester ini.',
      participants: 24,
      facilities: ['AC', 'Koneksi internet', 'Meja & kursi'],
      roomId: 'lab-imac',
      roomName: 'Lab iMac',
      date: sat,
      start: '10:00',
      end: '12:00',
      status: 'disetujui',
      createdAt: now,
      history: []
    },
    {
      id: 'seed-2',
      ref: 'IDB-' + year + '-0002',
      applicantType: 'HMJ',
      name: 'I Putu Bagus Wijaya',
      nim: '2022010012',
      org: 'HMJ Desain Komunikasi Visual',
      position: 'Sekretaris',
      email: 'hmjdkv@idb.ac.id',
      whatsapp: '081234567802',
      activity: 'Rapat Kerja Pengurus',
      reason: 'Koordinasi program kerja semester ganjil bersama seluruh pengurus HMJ.',
      participants: 35,
      facilities: ['AC', 'Proyektor', 'Meja & kursi'],
      roomId: 'aula',
      roomName: 'Aula',
      date: mon,
      start: '10:00',
      end: '12:00',
      status: 'menunggu',
      createdAt: now,
      history: []
    }
  ];

  saveBookings(demo);
  localStorage.setItem(SEED_KEY, '1');
}

function statusClass(status) {
  return 'status status--' + status;
}
