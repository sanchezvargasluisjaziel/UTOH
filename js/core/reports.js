/* Filtros por mes / año fiscal e impresión de reportes (módulos 1, 2, 3 y auditoría). */

window.MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Filtros de periodo por vista ('all' = todo el año). No se guardan en localStorage.
window.reportFilters = { mod1: 'all', mod2: 'all', mod3: 'all', auditYear: 'all', auditMonth: 'all' };

window.monthLabel = function(key) {
    const m = window.reportFilters[key];
    return m === 'all' ? 'Todo el año' : window.MONTH_NAMES[Number(m) - 1];
};

// Filtra movimientos por mes de la FECHA DE ORDEN (no la de llegada).
window.filterByMonth = function(list, key) {
    const m = window.reportFilters[key];
    if (m === 'all') return list;
    return list.filter(i => parseInt(String(i.orderDate || '').split('-')[1], 10) === Number(m));
};

window.setReportFilter = function(key, value) {
    window.reportFilters[key] = value;
    window.renderAll();
};

window.setFiscalYearFromReport = function(value) {
    document.getElementById('global-fiscal-year').value = value;
    window.renderAll();
};

// Barra de filtros (Año Fiscal + Mes) con el botón de impresión de cada módulo.
window.renderReportToolbar = function(key) {
    const fy = getActiveFiscalYear();
    const years = [...window.appState.fiscalYears].sort((a, b) => a.year - b.year);
    const sel = window.reportFilters[key];
    return `
        <div class="mb-4 flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
            <div>
                <label class="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Año Fiscal</label>
                <select onchange="setFiscalYearFromReport(this.value)" class="p-2 border border-gray-300 rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                    ${years.map(y => `<option value="${y.year}" ${Number(y.year) === fy ? 'selected' : ''}>AF ${y.year}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Mes (fecha de orden)</label>
                <select onchange="setReportFilter('${key}', this.value)" class="p-2 border border-gray-300 rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all" ${sel === 'all' ? 'selected' : ''}>Todo el año</option>
                    ${window.MONTH_NAMES.map((n, i) => `<option value="${i + 1}" ${String(sel) === String(i + 1) ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
            </div>
            <button onclick="printReport('${key}')" class="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Imprimir Reporte
            </button>
        </div>
    `;
};

// Años presentes en la bitácora (más el año en curso), de mayor a menor.
window.getAuditYears = function() {
    const years = new Set(window.appState.auditLogs.map(a => String(a.timestamp || '').slice(0, 4)).filter(y => /^\d{4}$/.test(y)));
    years.add(String(new Date().getFullYear()));
    return [...years].sort().reverse();
};

window.getFilteredAuditLogs = function() {
    const { auditYear, auditMonth } = window.reportFilters;
    return window.appState.auditLogs.filter(a => {
        const ts = String(a.timestamp || '');
        if (auditYear !== 'all' && ts.slice(0, 4) !== String(auditYear)) return false;
        if (auditMonth !== 'all' && parseInt(ts.slice(5, 7), 10) !== Number(auditMonth)) return false;
        return true;
    });
};

window.renderAuditToolbar = function() {
    const { auditYear, auditMonth } = window.reportFilters;
    return `
        <div class="mb-4 flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
            <div>
                <label class="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Año</label>
                <select onchange="setReportFilter('auditYear', this.value)" class="p-2 border border-gray-300 rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all" ${auditYear === 'all' ? 'selected' : ''}>Todos</option>
                    ${getAuditYears().map(y => `<option value="${y}" ${String(auditYear) === y ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Mes</label>
                <select onchange="setReportFilter('auditMonth', this.value)" class="p-2 border border-gray-300 rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all" ${auditMonth === 'all' ? 'selected' : ''}>Todos</option>
                    ${window.MONTH_NAMES.map((n, i) => `<option value="${i + 1}" ${String(auditMonth) === String(i + 1) ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
            </div>
            <button onclick="printReport('audit')" class="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-sm">
                Imprimir Reporte de Auditoría
            </button>
        </div>
    `;
};

// ------------------------------------------------------------------ impresión

window.getCurrentUserLabel = function() {
    const sel = document.getElementById('user-role-selector');
    const raw = sel ? sel.value : 'Admin 1 (Sistema)';
    return raw.startsWith('COMPANY_VIEW:') ? `Empresa (${raw.replace('COMPANY_VIEW:', '')})` : raw;
};

// Movimientos del módulo para el reporte: año fiscal activo, filtro de empresa y mes.
window.getReportImports = function(mod) {
    const fy = getActiveFiscalYear();
    const monitored = getMonitoredCompanyFilter();
    let list = window.appState.imports.filter(i => String(i.module) === String(mod) && Number(i.fiscalYear) === fy);
    if (monitored) list = list.filter(i => i.company === monitored);
    return filterByMonth(list, 'mod' + mod).slice().sort((a, b) => String(a.orderDate).localeCompare(String(b.orderDate)));
};

function reportHeaderHtml(title, lines) {
    const now = new Date();
    const stamp = now.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
    return `
        <div style="border-bottom:2px solid #1e293b; padding-bottom:10px; margin-bottom:14px;">
            <div style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#475569;">Sistema de Control UTOH · Protocolo de Montreal</div>
            <h1 style="font-size:20px; font-weight:800; margin:2px 0 6px;">${escapeHtml(title)}</h1>
            <div style="font-size:12px; color:#334155;">
                ${lines.map(l => `<div>${escapeHtml(l)}</div>`).join('')}
                <div>Emitido: ${escapeHtml(stamp)} · Por: ${escapeHtml(getCurrentUserLabel())}</div>
            </div>
        </div>
    `;
}

const TH = 'style="text-align:left; padding:5px 6px; border:1px solid #94a3b8; background:#e2e8f0; font-size:10px; text-transform:uppercase;"';
const TD = 'style="padding:5px 6px; border:1px solid #cbd5e1; font-size:11px; vertical-align:top;"';
const TDR = 'style="padding:5px 6px; border:1px solid #cbd5e1; font-size:11px; text-align:right; vertical-align:top;"';

function sumCO2(list) {
    let total = 0;
    for (const i of list) {
        const v = calcCO2(i.qty, i.type);
        if (v === null) return null;
        total += v;
    }
    return round2(total);
}

function buildModuleReport(mod) {
    const fy = getActiveFiscalYear();
    const monitored = getMonitoredCompanyFilter();
    const list = getReportImports(mod);
    const lines = [`Año Fiscal ${fy} (2 de enero al 31 de diciembre)`, `Periodo: ${monthLabel('mod' + mod)} (por fecha de orden)`];
    if (monitored) lines.push(`Empresa: ${monitored}`);
    let html = reportHeaderHtml(`Reporte de Importaciones — ${moduleName(mod)}`, lines);

    if (mod === '3') {
        const units = list.reduce((a, i) => a + (parseInt(i.qty, 10) || 0), 0);
        html += `<table style="width:100%; border-collapse:collapse;"><thead><tr>
            <th ${TH}>Folio</th><th ${TH}>Fecha orden</th><th ${TH}>Empresa</th><th ${TH}>Equipo / Descripción</th>
            <th ${TH}>Refrigerante</th><th ${TH}>Fracción</th><th ${TH}>Unidades</th></tr></thead><tbody>
            ${list.length === 0 ? `<tr><td ${TD} colspan="7">Sin movimientos en el periodo.</td></tr>` : list.map(i => `<tr>
                <td ${TD}>${escapeHtml(i.trackingNumber)}</td><td ${TD}>${escapeHtml(i.orderDate)}</td><td ${TD}>${escapeHtml(i.company)}</td>
                <td ${TD}>${escapeHtml(i.type)}${i.productDescription ? `<br><i>${escapeHtml(i.productDescription)}</i>` : ''}</td>
                <td ${TD}>${escapeHtml(i.contained || 'N/A')}</td><td ${TD}>${escapeHtml(i.tariff)}</td>
                <td ${TDR}>${fmtNum(i.qty, 0)}</td></tr>`).join('')}
            </tbody><tfoot><tr><td ${TD} colspan="6"><b>Total (${list.length} movimientos)</b></td><td ${TDR}><b>${fmtNum(units, 0)} Unid.</b></td></tr></tfoot></table>`;
    } else {
        const tm = round2(list.reduce((a, i) => a + (parseFloat(i.qty) || 0), 0));
        html += `<table style="width:100%; border-collapse:collapse;"><thead><tr>
            <th ${TH}>Folio</th><th ${TH}>Fecha orden</th><th ${TH}>Empresa</th><th ${TH}>Sustancia</th>
            <th ${TH}>Fracción</th><th ${TH}>Cantidad (TM)</th><th ${TH}>TCO₂eq</th></tr></thead><tbody>
            ${list.length === 0 ? `<tr><td ${TD} colspan="7">Sin movimientos en el periodo.</td></tr>` : list.map(i => `<tr>
                <td ${TD}>${escapeHtml(i.trackingNumber)}</td><td ${TD}>${escapeHtml(i.orderDate)}</td><td ${TD}>${escapeHtml(i.company)}</td>
                <td ${TD}>${escapeHtml(i.type)}</td><td ${TD}>${escapeHtml(i.tariff)}</td>
                <td ${TDR}>${fmtNum(i.qty)}</td><td ${TDR}>${fmtCO2(calcCO2(i.qty, i.type))}</td></tr>`).join('')}
            </tbody><tfoot><tr><td ${TD} colspan="5"><b>Total (${list.length} movimientos)</b></td>
                <td ${TDR}><b>${fmtNum(tm)} TM</b></td><td ${TDR}><b>${fmtCO2(sumCO2(list))}</b></td></tr></tfoot></table>`;
    }

    if (mod === '1') {
        let quotas = window.appState.quotas.filter(q => Number(q.year) === fy);
        if (monitored) quotas = quotas.filter(q => q.company === monitored);
        html += `<h2 style="font-size:13px; font-weight:800; margin:18px 0 6px;">Balance anual de cuotas (AF ${fy}, no depende del mes seleccionado)</h2>
            <table style="width:100%; border-collapse:collapse;"><thead><tr>
            <th ${TH}>Empresa</th><th ${TH}>Sustancia</th><th ${TH}>Cuota disponible</th><th ${TH}>Importado</th><th ${TH}>Cuota restante</th></tr></thead><tbody>
            ${quotas.length === 0 ? `<tr><td ${TD} colspan="5">Sin cuotas asignadas.</td></tr>` : quotas.map(q => {
                const b = getQuotaBalance(q.company, q.substance, fy);
                return `<tr><td ${TD}>${escapeHtml(q.company)}</td><td ${TD}>${escapeHtml(q.substance)}</td>
                    <td ${TDR}>${fmtNum(b.limitTM)} TM<br>${fmtCO2(b.limitCO2)}</td>
                    <td ${TDR}>${fmtNum(b.usedTM)} TM<br>${fmtCO2(b.usedCO2)}</td>
                    <td ${TDR}>${fmtNum(b.remTM)} TM<br>${fmtCO2(b.remCO2)}</td></tr>`;
            }).join('')}</tbody></table>`;
    }
    return html;
}

function buildAuditReport() {
    const { auditYear, auditMonth } = window.reportFilters;
    const logs = getFilteredAuditLogs();
    const period = `${auditMonth === 'all' ? 'Todos los meses' : window.MONTH_NAMES[Number(auditMonth) - 1]} · ${auditYear === 'all' ? 'Todos los años' : auditYear}`;
    return reportHeaderHtml('Reporte de Auditoría de Administradores', [`Periodo: ${period}`, `Registros: ${logs.length}`]) + `
        <table style="width:100%; border-collapse:collapse;"><thead><tr>
        <th ${TH}>Fecha / Hora</th><th ${TH}>Usuario</th><th ${TH}>Apartado</th><th ${TH}>Movimiento registrado</th></tr></thead><tbody>
        ${logs.length === 0 ? `<tr><td ${TD} colspan="4">Sin registros en el periodo.</td></tr>` : logs.map(a => `<tr>
            <td ${TD}>${escapeHtml(a.timestamp)}</td><td ${TD}>${escapeHtml(a.user)}</td><td ${TD}>${escapeHtml(a.module)}</td><td ${TD}>${escapeHtml(a.action)}</td></tr>`).join('')}
        </tbody></table>`;
}

window.printReport = function(key) {
    const container = document.getElementById('printable-report');
    if (!container) return;
    container.innerHTML = key === 'audit' ? buildAuditReport() : buildModuleReport(key.replace('mod', ''));
    document.body.classList.add('printing-report');
    const cleanup = () => {
        document.body.classList.remove('printing-report');
        container.innerHTML = '';
        window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
};
