/* Cálculo de TCO2eq (doble unidad: TM y TCO2eq) y balance de cuotas. */

// Formato numérico: 1,234.50
window.fmtNum = function(n, decimals = 2) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

window.round2 = function(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
};

window.fmtCO2 = function(n) {
    return (n === null || n === undefined || isNaN(n)) ? '—' : `${fmtNum(n)} TCO₂eq`;
};

// Factor TCO2eq por Tonelada Métrica de una sustancia (null si aún no se captura).
window.getGwp = function(substanceName) {
    const s = window.appState.substances.find(x => x.name === substanceName && String(x.module) !== '3');
    if (!s || s.gwp === null || s.gwp === undefined || s.gwp === '') return null;
    const g = Number(s.gwp);
    return (isNaN(g) || g <= 0) ? null : g;
};

window.calcCO2 = function(tm, substanceName) {
    const g = getGwp(substanceName);
    return g === null ? null : round2(Number(tm || 0) * g);
};

// Cuota en TCO2eq: la manual si existe; si no, límite en TM × factor.
window.getQuotaCO2Limit = function(quota) {
    if (!quota) return null;
    if (quota.limitCO2 !== null && quota.limitCO2 !== undefined && quota.limitCO2 !== '') return Number(quota.limitCO2);
    return calcCO2(quota.limit, quota.substance);
};

// Balance de cuota (Módulo 1) de una empresa y sustancia en un año fiscal.
// excludeImportId permite recalcular ignorando un movimiento (para editarlo).
window.getQuotaBalance = function(company, substance, fy, excludeImportId = null) {
    const q = window.appState.quotas.find(x => x.company === company && x.substance === substance && Number(x.year) === Number(fy));
    const imps = window.appState.imports.filter(i =>
        String(i.module) === '1' && i.company === company && i.type === substance &&
        Number(i.fiscalYear) === Number(fy) && i.id !== excludeImportId);
    const limitTM = q ? (Number(q.limit) || 0) : 0;
    const limitCO2 = q ? getQuotaCO2Limit(q) : null;
    const usedTM = round2(imps.reduce((a, i) => a + (parseFloat(i.qty) || 0), 0));
    const usedCO2 = getGwp(substance) === null ? null : calcCO2(usedTM, substance);
    return {
        quota: q || null,
        limitTM, usedTM, remTM: round2(limitTM - usedTM),
        limitCO2, usedCO2,
        remCO2: (limitCO2 === null || usedCO2 === null) ? null : round2(limitCO2 - usedCO2)
    };
};

// Celda de dos líneas: cantidad en TM y su equivalente en TCO2eq.
window.dualQty = function(tm, co2, tmClass = '', unit = 'Ton') {
    return `<div class="${tmClass}">${fmtNum(tm)} ${unit}</div><div class="text-[11px] font-semibold text-gray-500">${fmtCO2(co2)}</div>`;
};
