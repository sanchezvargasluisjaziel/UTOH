/* Guardado de empresas y cuotas (sincronización con el estado). */

// =========================================================================
// 9. GUARDADO DE EMPRESAS, CUOTAS E IMPORTACIONES (SINCRONIZACIÓN TOTAL)
// =========================================================================
// Alta de empresa (sin asignar cuotas: eso se hace en Asignación de Cuota).
// Devuelve true si se guardó; si los datos no son válidos muestra el motivo y devuelve false.
window.saveCompanyToDB = function(name, rtn, modules, allowedSubstances = []) {
    const error = validateCompanyData({ name, rtn, modules });
    if (error) {
        customAlert('No se pudo registrar la empresa', error);
        return false;
    }
    const cleanName = name.trim();
    const cleanRTN = rtn.trim();
    window.appState.companies.push({
        id: 'comp_' + Date.now(),
        name: cleanName,
        rtn: cleanRTN,
        modules: modules,
        allowedSubstances: allowedSubstances
    });
    window.appState.selectedPortalCompany = cleanName;
    logAudit(`Dio de alta la empresa "${cleanName}" (RTN ${cleanRTN}) en Módulos [${modules.join(', ')}]`, 'Empresas');
    showToast(`Empresa "${cleanName}" registrada`);
    window.renderAll();
    return true;
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
