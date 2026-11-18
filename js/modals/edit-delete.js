/* Modales de edición y funciones de eliminación. */

// =========================================================================
// 11. EDICIÓN Y ELIMINACIÓN (CUOTAS, EMPRESAS, SUSTANCIAS, IMPORTACIONES)
// =========================================================================
// Oculta los campos extra del modal de edición (se muestran solo donde aplican).
window.hideEditExtras = function() {
    ['edit-modal-limitco2-container', 'edit-modal-gwp-container', 'edit-modal-rtn-container'].forEach(id => document.getElementById(id).classList.add('hidden'));
};

window.openEditQuotaModal = function(quotaId) {
    hideEditExtras();
    const q = window.appState.quotas.find(x => x.id === quotaId);
    if (!q) return;
    document.getElementById('edit-modal-id').value = q.id;
    document.getElementById('edit-modal-type').value = 'quota';
    document.getElementById('edit-modal-title').innerText = `Editar Cuota: ${q.company} (${q.substance})`;
    document.getElementById('edit-modal-name-container').classList.add('hidden');
    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');

    document.getElementById('edit-modal-limit-container').classList.remove('hidden');
    document.getElementById('edit-modal-limit-label').innerText = `Límite Anual Autorizado en Toneladas (AF ${q.year})`;
    document.getElementById('edit-modal-limit').value = q.limit;
    document.getElementById('edit-modal-limitco2-container').classList.remove('hidden');
    document.getElementById('edit-modal-limitco2').value = (q.limitCO2 === null || q.limitCO2 === undefined) ? '' : q.limitCO2;

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openEditCompanyModal = function(compId) {
    hideEditExtras();
    const c = window.appState.companies.find(x => x.id === compId);
    if (!c) return;
    document.getElementById('edit-modal-id').value = c.id;
    document.getElementById('edit-modal-type').value = 'company';
    document.getElementById('edit-modal-title').innerText = `Editar Empresa: ${c.name}`;

    document.getElementById('edit-modal-name-container').classList.remove('hidden');
    document.getElementById('edit-modal-name-label').innerText = 'Nombre de la Empresa';
    document.getElementById('edit-modal-input').value = c.name;
    document.getElementById('edit-modal-rtn-container').classList.remove('hidden');
    document.getElementById('edit-modal-rtn').value = c.rtn || '';

    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');
    document.getElementById('edit-modal-limit-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openEditSubstanceModal = function(subId) {
    hideEditExtras();
    const s = window.appState.substances.find(x => x.id === subId);
    if (!s) return;
    document.getElementById('edit-modal-id').value = s.id;
    document.getElementById('edit-modal-type').value = 'substance';
    document.getElementById('edit-modal-title').innerText = 'Editar Sustancia / Equipo';

    document.getElementById('edit-modal-name-container').classList.remove('hidden');
    document.getElementById('edit-modal-name-label').innerText = 'Nombre de Sustancia / Equipo';
    document.getElementById('edit-modal-input').value = s.name;

    document.getElementById('edit-modal-module-container').classList.remove('hidden');
    document.getElementById('edit-modal-module').value = String(s.module);
    document.getElementById('edit-modal-tariff').value = s.tariff || '';

    document.getElementById('edit-modal-refrigerant').value = s.refrigerant || '';
    document.getElementById('edit-modal-gwp').value = (s.gwp === null || s.gwp === undefined) ? '' : s.gwp;
    toggleEditRefrigerantField();

    document.getElementById('edit-modal-limit-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('hidden');
};

window.toggleEditRefrigerantField = function() {
    const mod = document.getElementById('edit-modal-module').value;
    document.getElementById('edit-modal-refrigerant-container').classList.toggle('hidden', mod !== '3');
    document.getElementById('edit-modal-gwp-container').classList.toggle('hidden', mod === '3');
};

window.openEditYearModal = function(yearId) {
    hideEditExtras();
    const y = window.appState.fiscalYears.find(x => x.id === yearId);
    if (!y) return;
    document.getElementById('edit-modal-id').value = y.id;
    document.getElementById('edit-modal-type').value = 'year';
    document.getElementById('edit-modal-title').innerText = 'Editar Año Fiscal';

    document.getElementById('edit-modal-name-container').classList.remove('hidden');
    document.getElementById('edit-modal-name-label').innerText = 'Año Fiscal';
    document.getElementById('edit-modal-input').value = y.year;

    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');
    document.getElementById('edit-modal-limit-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openEditImportModal = function(impId) {
    hideEditExtras();
    const imp = window.appState.imports.find(x => x.id === impId);
    if (!imp) return;
    document.getElementById('edit-modal-id').value = imp.id;
    document.getElementById('edit-modal-type').value = 'import';
    document.getElementById('edit-modal-title').innerText = `Editar Importación [${imp.trackingNumber}]`;

    document.getElementById('edit-modal-name-container').classList.add('hidden');
    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');

    document.getElementById('edit-modal-limit-container').classList.remove('hidden');
    document.getElementById('edit-modal-limit-label').innerText = imp.module === '3' ? 'Cantidad (Unidades)' : 'Cantidad (Toneladas)';
    document.getElementById('edit-modal-limit').value = imp.qty;

    document.getElementById('edit-modal-date-container').classList.remove('hidden');
    document.getElementById('edit-modal-date').value = imp.orderDate;

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.closeEditModal = function() {
    document.getElementById('edit-modal').classList.add('hidden');
};

window.saveEdit = function() {
    const id = document.getElementById('edit-modal-id').value;
    const type = document.getElementById('edit-modal-type').value;

    if (type === 'quota') {
        const q = window.appState.quotas.find(x => x.id === id);
        if (q) {
            const limit = parseFloat(document.getElementById('edit-modal-limit').value);
            const co2Raw = document.getElementById('edit-modal-limitco2').value;
            const limitCO2 = co2Raw === '' ? null : parseFloat(co2Raw);
            const error = validateQuotaData({ company: q.company, substance: q.substance, year: q.year, limit, limitCO2 });
            if (error) {
                customAlert('No se pudo guardar la cuota', error);
                return;
            }
            q.limit = limit;
            q.limitCO2 = limitCO2;
            logAudit(`Modificó cuota de ${q.company} (${q.substance}) a ${q.limit} Ton`, 'Asignación de Cuota');
            showToast('Cuota actualizada correctamente');
        }
    } else if (type === 'company') {
        const c = window.appState.companies.find(x => x.id === id);
        if (c) {
            const oldName = c.name;
            const newName = document.getElementById('edit-modal-input').value.trim();
            const newRTN = document.getElementById('edit-modal-rtn').value.trim();
            const error = validateCompanyData({ name: newName, rtn: newRTN, excludeId: c.id });
            if (error) {
                customAlert('No se pudo guardar la empresa', error);
                return;
            }
            c.name = newName;
            c.rtn = newRTN;

            // Propagar cambio de nombre en cuotas, importaciones y en la empresa seleccionada (portal y vista de empresa)
            if (oldName !== newName) {
                window.appState.quotas.forEach(q => { if (q.company === oldName) q.company = newName; });
                window.appState.imports.forEach(i => { if (i.company === oldName) i.company = newName; });
                if (window.appState.selectedPortalCompany === oldName) window.appState.selectedPortalCompany = newName;
                const roleSel = document.getElementById('user-role-selector');
                if (roleSel && roleSel.value === `COMPANY_VIEW:${oldName}`) {
                    const opt = Array.from(roleSel.options).find(o => o.value === roleSel.value);
                    if (opt) { opt.value = `COMPANY_VIEW:${newName}`; opt.textContent = `🏢 Empresa: ${newName}`; }
                }
            }
            const renamed = oldName !== newName ? `Cambió el nombre de "${oldName}" a "${newName}". ` : '';
            logAudit(`${renamed}Editó empresa "${newName}" (RTN ${newRTN})`, 'Empresas');
            showToast('Empresa actualizada');
        }
    } else if (type === 'substance') {
        const s = window.appState.substances.find(x => x.id === id);
        if (s) {
            const oldName = s.name;
            const newName = document.getElementById('edit-modal-input').value.trim();
            const newModule = document.getElementById('edit-modal-module').value;
            const newTariff = document.getElementById('edit-modal-tariff').value.trim();
            const newRefrigerant = document.getElementById('edit-modal-refrigerant').value.trim();
            const gwpRaw = document.getElementById('edit-modal-gwp').value;
            const newGwp = (newModule === '3' || gwpRaw === '') ? null : parseFloat(gwpRaw);
            const error = validateSubstanceData({ name: newName, tariff: newTariff, module: newModule, gwp: newGwp, refrigerant: newRefrigerant, excludeId: s.id });
            if (error) {
                customAlert('No se pudo guardar la sustancia', error);
                return;
            }
            const usedBy = countSubstanceUsage(oldName, s.module);
            if (newModule !== String(s.module) && (usedBy.quotas > 0 || usedBy.imports > 0)) {
                customAlert('No se puede cambiar la clasificación', `"${oldName}" ya tiene ${usedBy.quotas} cuota(s) y ${usedBy.imports} importación(es) registradas.`);
                return;
            }
            // Si cambia el nombre, se actualiza en cuotas, importaciones y empresas para no perder la relación
            if (newName !== oldName) {
                window.appState.quotas.forEach(q => { if (q.substance === oldName && String(s.module) === '1') q.substance = newName; });
                window.appState.imports.forEach(i => { if (i.type === oldName && String(i.module) === String(s.module)) i.type = newName; });
            }
            s.name = newName;
            s.module = newModule;
            s.tariff = newTariff;
            s.refrigerant = newRefrigerant;
            s.gwp = newGwp;
            logAudit(`Editó sustancia/equipo "${s.name}"`, 'Catálogo');
            showToast('Sustancia actualizada');
        }
    } else if (type === 'year') {
        const y = window.appState.fiscalYears.find(x => x.id === id);
        if (y) {
            const newYear = parseInt(document.getElementById('edit-modal-input').value, 10);
            const error = validateYear(newYear, y.id);
            if (error) {
                customAlert('No se pudo guardar el año fiscal', error);
                return;
            }
            const inUse = window.appState.quotas.some(q => Number(q.year) === Number(y.year)) ||
                          window.appState.imports.some(i => Number(i.fiscalYear) === Number(y.year));
            if (inUse && newYear !== Number(y.year)) {
                customAlert('No se puede cambiar el año', `El AF ${y.year} ya tiene cuotas o importaciones registradas.`);
                return;
            }
            y.year = newYear;
            logAudit(`Editó Año Fiscal a ${newYear}`, 'Años Fiscales');
            showToast('Año fiscal actualizado');
        }
    } else if (type === 'import') {
        const imp = window.appState.imports.find(x => x.id === id);
        if (imp) {
            const newQty = imp.module === '3'
                ? parseInt(document.getElementById('edit-modal-limit').value, 10)
                : parseFloat(document.getElementById('edit-modal-limit').value);
            const newDate = document.getElementById('edit-modal-date').value;
            const error = validateImportData({
                mod: imp.module, company: imp.company, substance: imp.type,
                orderDate: newDate, arrivalDate: imp.arrivalDate, qty: newQty, excludeId: imp.id
            });
            if (error) {
                customAlert('No se pudo guardar el movimiento', error);
                return;
            }
            imp.qty = newQty;
            imp.orderDate = newDate;
            imp.fiscalYear = calculateFiscalYear(imp.orderDate);
            logAudit(`Editó movimiento [${imp.trackingNumber}]: cantidad=${imp.qty}, fecha=${imp.orderDate}`, moduleName(imp.module));
            showToast('Movimiento actualizado');
        }
    }

    closeEditModal();
    window.renderAll();
};

// Cuántas cuotas e importaciones usan una sustancia o equipo.
window.countSubstanceUsage = function(name, module) {
    return {
        quotas: String(module) === '1' ? window.appState.quotas.filter(q => q.substance === name).length : 0,
        imports: window.appState.imports.filter(i => i.type === name && String(i.module) === String(module)).length
    };
};

window.deleteQuota = function(id) {
    const quota = window.appState.quotas.find(q => q.id === id);
    if (quota) {
        const bal = getQuotaBalance(quota.company, quota.substance, quota.year);
        if (bal.usedTM > 0) {
            customAlert('No se puede eliminar la cuota', `${quota.company} ya importó ${fmtNum(bal.usedTM)} TM de ${quota.substance} en el AF ${quota.year}. Elimine primero esas importaciones.`);
            return;
        }
    }
    customConfirm('Eliminar Cuota', '¿Desea eliminar este registro de cuota?', () => {
        window.appState.quotas = window.appState.quotas.filter(q => q.id !== id);
        window.renderAll();
        showToast('Cuota eliminada');
    });
};

window.deleteCompany = function(id) {
    const c = window.appState.companies.find(x => x.id === id);
    if (!c) return;
    const nQuotas = window.appState.quotas.filter(q => q.company === c.name).length;
    const nImports = window.appState.imports.filter(i => i.company === c.name).length;
    const detail = (nQuotas || nImports)
        ? ` Se eliminarán también ${nQuotas} cuota(s) y ${nImports} importación(es) asociadas.`
        : '';
    customConfirm('Dar de baja la empresa', `¿Desea eliminar a "${c.name}"?${detail}`, () => {
        window.appState.companies = window.appState.companies.filter(x => x.id !== id);
        window.appState.quotas = window.appState.quotas.filter(q => q.company !== c.name);
        window.appState.imports = window.appState.imports.filter(i => i.company !== c.name);
        if (window.appState.selectedPortalCompany === c.name) window.appState.selectedPortalCompany = null;
        logAudit(`Dio de baja la empresa "${c.name}" (RTN ${c.rtn || 'sin RTN'}), con ${nQuotas} cuota(s) y ${nImports} importación(es)`, 'Empresas');
        window.renderAll();
        showToast('Empresa eliminada');
    });
};

window.deleteSubstance = function(id) {
    const sub = window.appState.substances.find(s => s.id === id);
    if (sub) {
        const usage = countSubstanceUsage(sub.name, sub.module);
        if (usage.quotas > 0 || usage.imports > 0) {
            customAlert('No se puede eliminar', `"${sub.name}" tiene ${usage.quotas} cuota(s) y ${usage.imports} importación(es) registradas. Elimínelas primero.`);
            return;
        }
    }
    customConfirm('Eliminar Sustancia', '¿Desea eliminar este elemento del catálogo?', () => {
        window.appState.substances = window.appState.substances.filter(s => s.id !== id);
        window.renderAll();
        showToast('Sustancia eliminada');
    });
};

window.deleteImport = function(id) {
    customConfirm('Eliminar Importación', '¿Desea eliminar este movimiento de importación?', () => {
        window.appState.imports = window.appState.imports.filter(i => i.id !== id);
        window.renderAll();
        showToast('Movimiento eliminado');
    });
};

window.clearModuleData = function(modNum) {
    const m = String(modNum);
    customConfirm('Vaciar movimientos', `¿Desea dejar en blanco los movimientos de "${moduleName(m)}"?${m === '1' ? ' También se borrarán sus cuotas.' : ''}`, () => {
        window.appState.imports = window.appState.imports.filter(i => String(i.module) !== m);
        if (m === '1') window.appState.quotas = [];
        window.renderAll();
        showToast(`Movimientos de "${moduleName(m)}" eliminados`);
    });
};

window.clearAllDemoDataToBlank = function() {
    customConfirm('Dejar el Sistema en Blanco', '¿Desea borrar las empresas, cuotas e importaciones de prueba para ingresar únicamente sus datos reales?', () => {
        window.appState.companies = [];
        window.appState.quotas = [];
        window.appState.imports = [];
        window.renderAll();
        showToast('Sistema limpio y listo para sus empresas reales');
    });
};
