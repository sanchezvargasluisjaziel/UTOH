/* Utilidades: año fiscal, folios, bitácora y filtros activos. */

// Regla Fiscal: Del 2 de Enero al 31 de Diciembre según FECHA DE ORDEN
window.calculateFiscalYear = function(orderDateString) {
    if (!orderDateString) return 2026;
    const parts = orderDateString.split('-');
    if (parts.length < 3) return 2026;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (month === 1 && day === 1) return year - 1;
    return year;
};

window.generateTrackingFolio = function(fy, mod) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `UTOH-${fy}-M${mod}-${randomDigits}`;
};

window.generateAuthHash = function() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    return `${s4()}-${s4()}-${s4()}-UTOH-${s4()}`;
};

window.logAudit = function(actionText, moduleName = 'Sistema') {
    const roleSel = document.getElementById('user-role-selector');
    const rawUser = roleSel ? roleSel.value : 'Admin 1 (Sistema)';
    const user = rawUser.startsWith('COMPANY_VIEW:') ? `Empresa (${rawUser.replace('COMPANY_VIEW:', '')})` : rawUser;
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    window.appState.auditLogs.unshift({
        id: 'aud_' + Date.now() + Math.random(),
        timestamp: ts,
        user,
        module: moduleName,
        action: actionText
    });
};

function getActiveFiscalYear() {
    const sel = document.getElementById('global-fiscal-year');
    if (sel && sel.value) return Number(sel.value);
    return 2026;
}

function getMonitoredCompanyFilter() {
    const sel = document.getElementById('user-role-selector');
    if (sel && sel.value && sel.value.startsWith('COMPANY_VIEW:')) {
        return sel.value.replace('COMPANY_VIEW:', '');
    }
    return null;
}
