import type { RotationPeriod, RotationStudent, AvailableMonth } from '@/types/rotation';

export const SPECIALTIES = [
  'Cardiology',
  'Interventional Cardiology',
  'Preventative Cardiology',
  'Internal Medicine',
  'Family Medicine',
  'Emergency Medicine',
  'Other',
];

const CLINIC = {
  name: 'West Houston Heart Center',
  doctor: 'Dr. Humayun Naqvi, MD, MBA, FACC',
  title: 'Invasive Cardiologist & Program Director',
  address: '1140 Business Center Drive, Suite 300, Houston, TX 77043',
  phone: '832-400-3957',
  fax: '1 (877)-669-0063',
  email: 'westhoustonheartcenter@gmail.com',
  website: 'www.htxheart.com',
  hours: 'Monday – Friday, 9:00 AM – 5:00 PM',
  expectations: [
    'Arrive on time and dress professionally (business casual or scrubs as directed)',
    'Maintain patient confidentiality and adhere to HIPAA regulations at all times',
    'Actively participate in clinical activities, case discussions, and learning opportunities',
    'Complete all required documentation and evaluations before the end of the rotation',
    'Demonstrate professionalism, respect, and a willingness to learn',
  ],
};

const MONTHS_AHEAD = 12;

export function getAvailableMonths(): AvailableMonth[] {
  const months: AvailableMonth[] = [];
  const now = new Date();
  for (let i = 1; i <= MONTHS_AHEAD; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
  }
  return months;
}

export function getPeriods(monthKey: string): RotationPeriod[] {
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const periods: RotationPeriod[] = [];
  let cur = new Date(start);
  let n = 1;
  while (cur <= end) {
    const ps = new Date(cur);
    const pe = new Date(cur);
    pe.setDate(pe.getDate() + 13);
    if (pe > end) break;
    // Block last 2 weeks of December (Dec 18+)
    const isBlockedDec = ps.getMonth() === 11 && ps.getDate() >= 18;
    if (!isBlockedDec) {
      periods.push({
        id: monthKey + '-P' + n,
        label:
          ps.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
          ' – ' +
          pe.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        start: ps.toISOString(),
        end: pe.toISOString(),
      });
    }
    cur.setDate(cur.getDate() + 14);
    n++;
  }
  return periods;
}

export function getPeriodBookingCounts(
  students: RotationStudent[],
  monthKey?: string
): Record<string, number> {
  const counts: Record<string, number> = {};
  const filtered = monthKey ? students.filter((s) => s.month === monthKey) : students;
  filtered.forEach((s) => {
    if (s.periods) {
      s.periods.forEach((p) => {
        counts[p.id] = (counts[p.id] || 0) + 1;
      });
    }
  });
  return counts;
}

export function generateOfferLetterPDF(student: RotationStudent): void {
  // Dynamic import to avoid SSR issues
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const W = 612;
    const H = 792;
    const LM = 60;
    const RM = W - 60;
    const CW = RM - LM;
    let y = 0;

    // Header
    doc.setFillColor(204, 0, 0);
    doc.rect(0, 0, W, 80, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('West Houston Heart Center', W / 2, 40, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(255, 220, 220);
    doc.text('Official Correspondence', W / 2, 58, { align: 'center' });

    y = 100;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(CLINIC.address + '  |  ' + CLINIC.phone + '  |  ' + CLINIC.website, W / 2, y, { align: 'center' });

    y = 130;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), LM, y);

    y = 165;
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(LM, y - 14, CW, 32, 4, 4, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(153, 27, 27);
    doc.text('OFFICIAL OFFER LETTER', W / 2, y + 6, { align: 'center' });

    y = 220;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text('Dear ' + student.name + ',', LM, y);

    y = 245;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    const bt =
      'We are pleased to officially offer you a clinical rotation position at West Houston Heart Center. This letter confirms your acceptance into our International Medical Graduate Observership Program under the direct supervision of ' +
      CLINIC.doctor +
      '.';
    const bl = doc.splitTextToSize(bt, CW);
    doc.text(bl, LM, y);
    y += bl.length * 15 + 15;

    const pl = student.periods ? student.periods.map((p) => p.label).join(' & ') : 'TBD';
    const details: [string, string][] = [
      ['Rotation Period', pl],
      ['Duration', (student.duration || '—') + ' Weeks'],
      ['Specialty Interest', student.specialty],
      ['Supervising Physician', CLINIC.doctor],
      ['Location', CLINIC.address],
      ['Hours', CLINIC.hours],
    ];
    const colW = CW / 2;
    details.forEach((row, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(254, 242, 242);
        doc.rect(LM, y - 11, CW, 22, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(153, 27, 27);
      doc.text(row[0], LM + 10, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(row[1], LM + colW, y);
      doc.setDrawColor(230, 230, 230);
      doc.line(LM, y + 11, RM, y + 11);
      y += 22;
    });

    y += 15;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(153, 27, 27);
    doc.text('Program Expectations', LM, y);
    y += 18;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    CLINIC.expectations.forEach((exp, i) => {
      const lines = doc.splitTextToSize(i + 1 + '.  ' + exp, CW - 15);
      doc.text(lines, LM + 10, y);
      y += lines.length * 14 + 4;
    });

    y += 10;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    const at =
      'Please arrive at 9:00 AM on your first day with a valid government-issued ID and any required documentation. If you have questions, contact us at ' +
      CLINIC.phone +
      ' or ' +
      CLINIC.email +
      '.';
    const al = doc.splitTextToSize(at, CW);
    doc.text(al, LM, y);
    y += al.length * 15 + 15;

    // HIPAA note
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(153, 27, 27);
    doc.text('HIPAA Acknowledgment:', LM, y);
    y += 12;
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    const hipaaNote =
      'By accepting this offer, the student acknowledges their obligation to maintain the confidentiality of all patient health information in accordance with HIPAA regulations. Any unauthorized disclosure may result in immediate termination.';
    const hl = doc.splitTextToSize(hipaaNote, CW);
    doc.text(hl, LM, y);
    y += hl.length * 12 + 10;

    // Rescind notice
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    const rn =
      'West Houston Heart Center reserves the right to rescind this offer and cancel any scheduled rotation at its sole discretion, at any time, with or without cause.';
    const rl = doc.splitTextToSize(rn, CW);
    doc.text(rl, LM, y);
    y += rl.length * 11 + 15;

    doc.setDrawColor(204, 0, 0);
    doc.setLineWidth(2);
    doc.line(LM, y, LM + 200, y);
    y += 18;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    doc.text('Sincerely,', LM, y);
    y += 30;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(153, 27, 27);
    doc.text(CLINIC.doctor, LM, y);
    y += 16;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(CLINIC.title, LM, y);
    y += 14;
    doc.text(CLINIC.name, LM, y);

    doc.setFillColor(31, 41, 55);
    doc.rect(0, H - 40, W, 40, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(CLINIC.name + '  \u2022  ' + CLINIC.address, W / 2, H - 24, { align: 'center' });
    doc.text(CLINIC.phone + '  \u2022  ' + CLINIC.website, W / 2, H - 14, { align: 'center' });

    doc.save('WHHC_Offer_Letter_' + student.name.replace(/[^a-zA-Z]/g, '_') + '.pdf');
  });
}
