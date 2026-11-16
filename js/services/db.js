/* Guardado de empresas y cuotas (sincronización con el estado). */

// =========================================================================
// 9. GUARDADO DE EMPRESAS, CUOTAS E IMPORTACIONES (SINCRONIZACIÓN TOTAL)
// =========================================================================
window.saveCompanyToDB = function(name, modules, allowedSubstances = []) {
    const cleanName = (name || '').trim();
    if (!cleanName) return;

    const existing = window.appState.companies.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
        existing.modules = modules;
        existing.allowedSubstances = allowedSubstances;
    } else {
        window.appState.companies.push({
            id: 'comp_' + Date.now(),
            name: cleanName,
            modules: modules,
            allowedSubstances: allowedSubstances
        });
    }

    // Si la empresa opera en el Módulo 1 y se seleccionaron sustancias reguladas, asegurar que aparezca en el Balance del Módulo 1
    const currentFY = getActiveFiscalYear();
    if (modules.includes('1') && allowedSubstances.length > 0) {
        allowedSubstances.forEach(subName => {
            const subObj = window.appState.substances.find(s => s.name === subName && String(s.module) === '1');
            if (subObj) {
                const hasQuota = window.appState.quotas.some(q => q.company === cleanName && q.substance === subName && Number(q.year) === currentFY);
                if (!hasQuota) {
                    window.appState.quotas.push({
                        id: 'q_' + Date.now() + Math.floor(Math.random() * 1000),
                        company: cleanName,
                        substance: subName,
                        limit: 0,
                        year: currentFY
                    });
                }
            }
        });
    }

    window.appState.selectedPortalCompany = cleanName;
    logAudit(`Registró/actualizó empresa "${cleanName}" en Módulos [${modules.join(', ')}]`, 'Empresas');
    showToast(`Empresa "${cleanName}" actualizada en los módulos`);
    window.renderAll();
};

window.saveQuotaToDB = function(company, substance, limit, year, limitCO2 = null) {
    const existing = window.appState.quotas.find(q => q.company === company && q.substance === substance && Number(q.year) === Number(year));
    if (existing) {
        existing.limit = Number(limit);
        existing.limitCO2 = limitCO2;
        logAudit(`Actualizó cuota de ${company} (${substance}) a ${limit} Ton en AF ${year}`, 'Asignación de Cuota');
    } else {
        window.appState.quotas.push({
            id: 'q_' + Date.now(),
            company,
            substance,
            limit: Number(limit),
            limitCO2: limitCO2,
            year: Number(year)
        });
        logAudit(`Asignó nueva cuota a ${company}: ${limit} Ton de ${substance} (AF ${year})`, 'Asignación de Cuota');
    }
    showToast(`Cuota guardada para ${company}`);
    window.renderAll();
};
