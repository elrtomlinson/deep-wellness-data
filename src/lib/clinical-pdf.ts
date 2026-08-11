import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, subDays } from 'date-fns';
import type { Condition, Symptom, Medication, Treatment, DailyLog } from '@/types/health';

/**
 * jspdf-autotable augments the jsPDF instance at runtime with `lastAutoTable`,
 * and `getNumberOfPages` lives on the untyped `internal` bag. Neither is in the
 * published typings, so narrow to exactly what we use rather than reaching for
 * `any` at each call site.
 */
type AutoTableDoc = jsPDF & {
  lastAutoTable: { finalY: number };
  internal: jsPDF['internal'] & { getNumberOfPages: () => number };
};

interface ClinicalPdfData {
  range: number;
  conditions: Condition[];
  symptoms: Symptom[];
  medications: Medication[];
  treatments: Treatment[];
  logs: DailyLog[];
  correlations?: { varA: string; varB: string; r: number; insight: string }[];
}

// Brand colours (approximate HSL from design tokens)
const PRIMARY = [75, 100, 60] as const; // muted green
const HEADER_BG = [240, 245, 240] as const;
const MUTED = [120, 120, 120] as const;
const DARK = [30, 30, 30] as const;

function rgb(c: readonly [number, number, number]): [number, number, number] {
  return [c[0], c[1], c[2]];
}

export function generateClinicalPdf(data: ClinicalPdfData): void {
  const { range, conditions, symptoms, medications, treatments, logs } = data;

  const recentLogs = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return logs
      .filter(l => new Date(l.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

  if (recentLogs.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const startDate = format(subDays(new Date(), range), 'dd MMM yyyy');
  const endDate = format(new Date(), 'dd MMM yyyy');

  // ── Helpers ──────────────────────────────────────────────────
  function checkPage(needed: number) {
    if (y + needed > pageH - 20) {
      doc.addPage();
      y = margin;
      addFooter();
    }
  }

  function addFooter() {
    const pages = (doc as AutoTableDoc).internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(...rgb(MUTED));
      doc.text(`Chronicle Health Tracker — Generated ${format(new Date(), 'dd MMM yyyy HH:mm')}`, margin, pageH - 8);
      doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 8, { align: 'right' });
    }
  }

  function sectionTitle(title: string) {
    checkPage(14);
    doc.setFillColor(...rgb(HEADER_BG));
    doc.rect(margin, y, contentW, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rgb(PRIMARY));
    doc.text(title, margin + 3, y + 5.5);
    y += 12;
  }

  function labelValue(label: string, value: string, x?: number) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rgb(DARK));
    doc.text(label, x ?? margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, (x ?? margin) + doc.getTextWidth(label) + 2, y);
  }

  // ── Header ──────────────────────────────────────────────────
  doc.setFillColor(...rgb(PRIMARY));
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Clinical Health Report', margin, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${startDate} — ${endDate}  ·  ${recentLogs.length} days logged`, margin, 19);
  y = 30;

  // ── Patient Summary ─────────────────────────────────────────
  sectionTitle('PATIENT SUMMARY');

  doc.setFontSize(8);
  doc.setTextColor(...rgb(DARK));
  doc.setFont('helvetica', 'bold');
  doc.text('Conditions:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(conditions.map(c => c.name).join(', ') || 'None listed', margin + 24, y);
  y += 6;

  // Averages
  const avgPain = recentLogs.reduce((s, l) => s + l.overallPain, 0) / recentLogs.length;
  const avgSleep = recentLogs.reduce((s, l) => s + l.sleepQuality, 0) / recentLogs.length;
  const avgSleepHrs = recentLogs.reduce((s, l) => s + l.sleepHours, 0) / recentLogs.length;
  const avgMood = recentLogs.reduce((s, l) => s + l.mood, 0) / recentLogs.length;
  const avgEnergy = recentLogs.reduce((s, l) => s + (l.energyLevel ?? 50), 0) / recentLogs.length;

  const colW = contentW / 4;
  const summaryItems = [
    { label: 'Avg Pain', value: `${avgPain.toFixed(1)}/10` },
    { label: 'Avg Sleep', value: `${avgSleepHrs.toFixed(1)}h (${avgSleep.toFixed(1)}/10)` },
    { label: 'Avg Mood', value: `${avgMood.toFixed(1)}/10` },
    { label: 'Avg Energy', value: `${avgEnergy.toFixed(0)}%` },
  ];

  summaryItems.forEach((item, i) => {
    const x = margin + i * colW;
    doc.setFillColor(248, 250, 248);
    doc.roundedRect(x, y, colW - 2, 14, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...rgb(DARK));
    doc.text(item.value, x + (colW - 2) / 2, y + 7, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(...rgb(MUTED));
    doc.text(item.label, x + (colW - 2) / 2, y + 12, { align: 'center' });
  });
  y += 20;

  // Pain trend
  if (recentLogs.length >= 4) {
    const half = Math.floor(recentLogs.length / 2);
    const first = recentLogs.slice(0, half);
    const second = recentLogs.slice(half);
    const avgFirst = first.reduce((s, l) => s + l.overallPain, 0) / first.length;
    const avgSecond = second.reduce((s, l) => s + l.overallPain, 0) / second.length;
    const diff = avgSecond - avgFirst;
    const trend = Math.abs(diff) > 0.5
      ? `${diff > 0 ? 'Worsening' : 'Improving'} (${diff > 0 ? '+' : ''}${diff.toFixed(1)})`
      : 'Stable';
    labelValue('Pain trend:', trend);
    y += 6;
  }

  // ── Daily Log Table (sparkline-like) ─────────────────────────
  sectionTitle('DAILY LOG OVERVIEW');

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Date', 'Pain', 'Sleep', 'Mood', 'Energy']],
    body: recentLogs.map(l => [
      format(new Date(l.date), 'dd MMM'),
      `${l.overallPain}/10`,
      `${l.sleepQuality}/10`,
      `${l.mood}/10`,
      `${(l.energyLevel ?? 50)}%`,
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: rgb(PRIMARY), textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 248] },
    columnStyles: {
      0: { cellWidth: 22 },
    },
  });

  y = (doc as AutoTableDoc).lastAutoTable.finalY + 8;

  // ── Symptom Analysis ────────────────────────────────────────
  const symptomStats: Record<string, { total: number; count: number; max: number }> = {};
  recentLogs.forEach(log => {
    log.symptoms.forEach(sl => {
      if (sl.severity === 0) return;
      if (!symptomStats[sl.symptomId]) symptomStats[sl.symptomId] = { total: 0, count: 0, max: 0 };
      symptomStats[sl.symptomId].total += sl.severity;
      symptomStats[sl.symptomId].count++;
      symptomStats[sl.symptomId].max = Math.max(symptomStats[sl.symptomId].max, sl.severity);
    });
  });

  const topSymptoms = Object.entries(symptomStats)
    .map(([id, stats]) => {
      const sym = symptoms.find(s => s.id === id);
      return {
        name: sym?.name ?? 'Unknown',
        avg: (stats.total / stats.count).toFixed(1),
        max: stats.max,
        freq: `${stats.count}/${recentLogs.length}`,
      };
    })
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

  if (topSymptoms.length > 0) {
    sectionTitle('SYMPTOM ANALYSIS');

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Symptom', 'Avg Severity', 'Peak', 'Days Reported']],
      body: topSymptoms.map(s => [s.name, `${s.avg}/10`, `${s.max}/10`, s.freq]),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: rgb(PRIMARY), textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 248] },
    });

    y = (doc as AutoTableDoc).lastAutoTable.finalY + 8;
  }

  // ── Medication Adherence ─────────────────────────────────────
  const medStats: Record<string, { taken: number; total: number }> = {};
  recentLogs.forEach(log => {
    log.medications.forEach(ml => {
      if (!medStats[ml.medicationId]) medStats[ml.medicationId] = { taken: 0, total: 0 };
      medStats[ml.medicationId].total++;
      if (ml.taken) medStats[ml.medicationId].taken++;
    });
  });

  const medRows = Object.entries(medStats).map(([id, stats]) => {
    const med = medications.find(m => m.id === id);
    return {
      name: med?.name ?? 'Unknown',
      dosage: med?.dosage ?? '',
      adherence: Math.round((stats.taken / stats.total) * 100),
      taken: stats.taken,
      missed: stats.total - stats.taken,
    };
  });

  if (medRows.length > 0) {
    sectionTitle('MEDICATION ADHERENCE');

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Medication', 'Dosage', 'Adherence', 'Days Taken', 'Days Missed']],
      body: medRows.map(m => [m.name, m.dosage, `${m.adherence}%`, `${m.taken}`, `${m.missed}`]),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: rgb(PRIMARY), textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 248] },
      didDrawCell: (hookData) => {
        // Colour-code adherence
        if (hookData.section === 'body' && hookData.column.index === 2) {
          const val = medRows[hookData.row.index]?.adherence ?? 0;
          if (val >= 80) hookData.cell.styles.textColor = [60, 140, 60];
          else if (val >= 50) hookData.cell.styles.textColor = [200, 150, 0];
          else hookData.cell.styles.textColor = [200, 60, 60];
        }
      },
    });

    y = (doc as AutoTableDoc).lastAutoTable.finalY + 8;
  }

  // ── Treatment Compliance ─────────────────────────────────────
  const treatStats: Record<string, { done: number; total: number }> = {};
  recentLogs.forEach(log => {
    (log.treatments ?? []).forEach(tl => {
      if (!treatStats[tl.treatmentId]) treatStats[tl.treatmentId] = { done: 0, total: 0 };
      treatStats[tl.treatmentId].total++;
      if (tl.done) treatStats[tl.treatmentId].done++;
    });
  });

  const treatRows = Object.entries(treatStats).map(([id, stats]) => {
    const treat = treatments.find(t => t.id === id);
    return {
      name: treat?.name ?? 'Unknown',
      compliance: Math.round((stats.done / stats.total) * 100),
      done: stats.done,
      missed: stats.total - stats.done,
    };
  });

  if (treatRows.length > 0) {
    sectionTitle('TREATMENT COMPLIANCE');

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Treatment', 'Compliance', 'Days Done', 'Days Missed']],
      body: treatRows.map(t => [t.name, `${t.compliance}%`, `${t.done}`, `${t.missed}`]),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: rgb(PRIMARY), textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 248] },
    });

    y = (doc as AutoTableDoc).lastAutoTable.finalY + 8;
  }

  // ── Side Effects ─────────────────────────────────────────────
  const seMap: Record<string, { effect: string; medName: string; count: number; totalSev: number }> = {};
  recentLogs.forEach(log => {
    (log.sideEffects ?? []).forEach(se => {
      const key = `${se.medicationId}-${se.effect}`;
      const med = medications.find(m => m.id === se.medicationId);
      if (!seMap[key]) seMap[key] = { effect: se.effect, medName: med?.name ?? '?', count: 0, totalSev: 0 };
      seMap[key].count++;
      seMap[key].totalSev += se.severity;
    });
  });
  const sideEffects = Object.values(seMap).sort((a, b) => b.count - a.count);

  if (sideEffects.length > 0) {
    sectionTitle('SIDE EFFECTS');

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Side Effect', 'Medication', 'Occurrences', 'Avg Severity']],
      body: sideEffects.map(se => [
        se.effect, se.medName, `${se.count}`, `${(se.totalSev / se.count).toFixed(1)}/10`,
      ]),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: rgb(PRIMARY), textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 248] },
    });

    y = (doc as AutoTableDoc).lastAutoTable.finalY + 8;
  }

  // ── Correlations ─────────────────────────────────────────────
  if (data.correlations && data.correlations.length > 0) {
    sectionTitle('CORRELATION ANALYSIS');

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Variable A', 'Variable B', 'r', 'Interpretation']],
      body: data.correlations.slice(0, 10).map(c => [
        c.varA, c.varB, c.r.toFixed(2), c.insight,
      ]),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: rgb(PRIMARY), textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 248] },
      columnStyles: {
        3: { cellWidth: 65 },
      },
    });

    y = (doc as AutoTableDoc).lastAutoTable.finalY + 8;
  }

  // ── Flare History ────────────────────────────────────────────
  const flareDays = recentLogs.filter(l => l.overallPain >= 7);
  if (flareDays.length > 0) {
    sectionTitle('FLARE HISTORY');

    checkPage(10);
    doc.setFontSize(8);
    doc.setTextColor(...rgb(DARK));
    doc.text(
      `${flareDays.length} high-pain days (≥7/10) during this period:`,
      margin, y,
    );
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Date', 'Pain', 'Top Symptom', 'Meds Taken', 'Notes']],
      body: flareDays.map(l => {
        const topSym = l.symptoms
          .filter(s => s.severity > 0)
          .sort((a, b) => b.severity - a.severity)[0];
        const topSymName = topSym
          ? (symptoms.find(s => s.id === topSym.symptomId)?.name ?? '?') + ` (${topSym.severity}/10)`
          : '—';
        const medsTaken = l.medications.filter(m => m.taken).length;
        const medsTotal = l.medications.length;
        return [
          format(new Date(l.date), 'dd MMM'),
          `${l.overallPain}/10`,
          topSymName,
          `${medsTaken}/${medsTotal}`,
          (l.notes || '—').slice(0, 40),
        ];
      }),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [200, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 245, 245] },
    });

    y = (doc as AutoTableDoc).lastAutoTable.finalY + 8;
  }

  // ── Disclaimer ──────────────────────────────────────────────
  checkPage(20);
  doc.setDrawColor(...rgb(MUTED));
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(...rgb(MUTED));
  const disclaimer = [
    'DISCLAIMER: This report is auto-generated from patient self-reported data and is intended to facilitate',
    'clinician-patient discussion. It does not constitute medical advice or diagnosis. Data accuracy depends',
    'on the consistency and completeness of patient logging.',
  ];
  disclaimer.forEach(line => {
    doc.text(line, margin, y);
    y += 3.5;
  });

  // ── Footer on all pages ─────────────────────────────────────
  addFooter();

  // ── Download ────────────────────────────────────────────────
  const fileName = `Chronicle_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
