/* Guardado de empresas y cuotas (sincronización con el estado). */

// =========================================================================
// 9. GUARDADO DE EMPRESAS, CUOTAS E IMPORTACIONES (SINCRONIZACIÓN TOTAL)
// =========================================================================
// Alta de empresa (sin asignar cuotas: eso se hace en Asignación de Cuota).
// Devuelve true si se guardó; si los datos no son válidos muestra el motivo y devuelve false.
window.saveCompanyToDB = function(name, rtn) {
    const error = validateCompanyData({ name, rtn });
    if (error) {
        customAlert('No se pudo registrar la empresa', error);
        return false;
    }
    const cleanName = name.trim();
    const cleanRTN = rtn.trim();
    window.appState.companies.push({
        id: 'comp_' + Date.now(),
        name: cleanName,
        rtn: cleanRTN
    });
    window.appState.selectedPortalCompany = cleanName;
    logAudit(`Dio de alta la empresa "${cleanName}" (RTN ${cleanRTN})`, 'Empresas');
    showToast(`Empresa "${cleanName}" registrada`);
    window.renderAll();
    return true;
};

window.saveQuotaToDB = function(company, substance, limit, year, limitCO2 = null) {
    const error = validateQuotaData({ company, substance, year, limit, limitCO2 });
    if (error) {
        customAlert('No se pudo guardar la cuota', error);
        return false;
    }
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
    return true;
};

// Asigna una empresa a un apartado sin cuota o de equipos con una sustancia/equipo.
// Es permanente y solo informativa: no limita las importaciones de ese apartado.
window.saveAssignmentToDB = function(company, module, substance) {
    const error = validateAssignmentData({ company, module, substance });
    if (error) {
        customAlert('No se pudo asignar', error);
        return false;
    }
    const comp = window.appState.companies.find(c => c.name === company);
    if (!Array.isArray(comp.assignments)) comp.assignments = [];
    comp.assignments.push({ module: String(module), substance });
    logAudit(`Asignó a ${company} en "${moduleName(module)}": ${substance}`, 'Asignación de Cuota');
    showToast(`${company} asignada a "${moduleName(module)}"`);
    window.renderAll();
    return true;
};

window.removeAssignment = function(company, module, substance) {
    customConfirm('Quitar asignación', `¿Desea quitar a "${company}" de "${moduleName(module)}" (${substance})? Sus importaciones ya registradas no se borran.`, () => {
        const comp = window.appState.companies.find(c => c.name === company);
        if (comp && Array.isArray(comp.assignments)) {
            comp.assignments = comp.assignments.filter(a => !(a.module === String(module) && a.substance === substance));
        }
        logAudit(`Quitó a ${company} de "${moduleName(module)}": ${substance}`, 'Asignación de Cuota');
        window.renderAll();
        showToast('Asignación eliminada');
    });
};
