import { Patient, Evaluation } from '../db/schema';

const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const prettyDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-MX');
  } catch {
    return iso;
  }
};

export function generatePatientDashboardHTML({
  appName,
  patient,
  evaluations,
}: {
  appName: string;
  patient: Patient;
  evaluations: Evaluation[];
}) {
  const title = `${appName} — Dashboard clínico`;
  const fileSafeName = (patient.fullName || 'paciente').trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
  const date = new Date().toISOString().slice(0, 10);
  const filename = `dashboard-${fileSafeName || 'paciente'}-${date}.html`;

  const latestByTool: Record<string, Evaluation> = {};
  for (const e of evaluations) {
    if (!latestByTool[e.toolId]) latestByTool[e.toolId] = e;
  }

  const latestRows = Object.values(latestByTool)
    .slice(0, 12)
    .map((e) => {
      const main = e?.results?.main;
      const value = main ? `${esc(main.value)} ${esc(main.unit)}` : '—';
      return `<tr><td>${esc(e.toolTitle)}</td><td>${value}</td><td>${esc(prettyDate(e.date))}</td></tr>`;
    })
    .join('');

  const historyRows = evaluations
    .slice(0, 100)
    .map((e) => {
      const main = e?.results?.main;
      const value = main ? `${esc(main.value)} ${esc(main.unit)}` : '—';
      const alerts = (e.alerts || []).map((a: any) => esc(a?.message || a)).join(', ');
      return `<tr><td>${esc(prettyDate(e.date))}</td><td>${esc(e.toolTitle)}</td><td>${value}</td><td>${alerts || '—'}</td></tr>`;
    })
    .join('');

  const css = `
    :root{--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#64748b;--border:#e2e8f0;--brand:#4f46e5}
    *{box-sizing:border-box} body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto; background:var(--bg); color:var(--text)}
    .wrap{max-width:980px;margin:0 auto;padding:24px}
    .header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
    h1{margin:0;font-size:22px} .subtitle{color:var(--muted);font-size:13px;margin-top:6px}
    .btn{background:var(--brand);color:#fff;border:none;border-radius:14px;padding:10px 14px;font-weight:700;cursor:pointer}
    .grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:16px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:16px}
    .k{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em;font-weight:800}
    .v{font-weight:800;margin-top:4px}
    table{width:100%;border-collapse:collapse;margin-top:10px} th,td{border-top:1px solid var(--border);padding:10px 8px;text-align:left;font-size:13px}
    th{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em}
    .note{font-size:12px;color:var(--muted);margin-top:10px}
    @media(min-width:860px){.grid{grid-template-columns:1fr 1fr}}
    @media print{.btn{display:none}.wrap{padding:0}.card{border-radius:0}}
  `;

  const html = `<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <div>
          <h1>${esc(appName)} — Dashboard clínico</h1>
          <div class="subtitle">Autocontenido (sin backend). Generado: ${esc(prettyDate(new Date().toISOString()))}</div>
        </div>
        <button class="btn" onclick="window.print()">Imprimir / Guardar PDF</button>
      </div>

      <div class="grid">
        <div class="card">
          <div class="k">Paciente</div>
          <div class="v">${esc(patient.fullName || '—')}</div>
          <div class="subtitle">Edad: ${esc((patient as any).age ?? '—')} | Sexo: ${esc(patient.sex || '—')}</div>
          <div class="subtitle">Dx: ${esc(patient.diagnosis || '—')}</div>
          <div class="subtitle">Comorbilidades: ${esc(patient.comorbidities || '—')}</div>
          <div class="subtitle">Fisio: ${esc(patient.therapistName || '—')}</div>
        </div>

        <div class="card">
          <div class="k">Últimos resultados (por herramienta)</div>
          <table>
            <thead><tr><th>Herramienta</th><th>Resultado</th><th>Fecha</th></tr></thead>
            <tbody>
              ${latestRows || '<tr><td colspan="3">Sin registro</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="card" style="grid-column:1/-1">
          <div class="k">Historial</div>
          <table>
            <thead><tr><th>Fecha</th><th>Herramienta</th><th>Resultado</th><th>Alertas</th></tr></thead>
            <tbody>
              ${historyRows || '<tr><td colspan="4">Sin registro</td></tr>'}
            </tbody>
          </table>
          <div class="note">Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.</div>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  return { html, filename };
}

export function downloadHTML({ html, filename }: { html: string; filename: string }) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
