/* Modal de registro de importación por módulo. */

// =========================================================================
// 10. MODAL DE REGISTRO DE IMPORTACIÓN ESPECÍFICO POR MÓDULO
// =========================================================================
window.openContextImportModal = function() {
    const tab = window.appState.activeTab;
    if (tab === 'mod2') openModuleImportModal('2');
    else if (tab === 'mod3') openModuleImportModal('3');
    else openModuleImportModal('1');
};

window.openModuleImportModal = function(modNum) {
    const mod = String(modNum);
    document.getElementById('modal_current_module').value = mod;
    document.getElementById('fields-mod1').classList.toggle('hidden', mod !== '1');
    document.getElementById('fields-mod2').classList.toggle('hidden', mod !== '2');
    document.getElementById('fields-mod3').classList.toggle('hidden', mod !== '3');

    const titleEl = document.getElementById('modal-module-title');
    const qtyLabel = document.getElementById('modal_qty_label');
    const qtyInput = document.getElementById('modal_qty');

    if (mod === '1') {
        titleEl.innerText = `Registrar Importación — ${moduleName('1')}`;
        qtyLabel.innerHTML = 'Cantidad a Importar (Toneladas) <span class="text-red-500">*</span>';
        qtyInput.step = '0.01';
    } else if (mod === '2') {
        titleEl.innerText = `Registrar Importación — ${moduleName('2')}`;
        qtyLabel.innerHTML = 'Cantidad a Importar (Toneladas) <span class="text-red-500">*</span>';
        qtyInput.step = '0.01';
    } else {
        titleEl.innerText = `Registrar Importación — ${moduleName('3')}`;
        qtyLabel.innerHTML = 'Cantidad de Aparatos (Unidades) <span class="text-red-500">*</span>';
        qtyInput.step = '1';
    }

    const fy = getActiveFiscalYear();
    document.getElementById('modal_order_date').value = `${fy}-06-15`;
    document.getElementById('modal_arrival_date').value = `${fy}-06-30`;
    document.getElementById('modal_qty').value = '';
    document.getElementById('modal_qty_co2_text').innerText = '';

    // Filtrar empresas que pertenecen a este módulo
    const compSel = document.getElementById('modal_company');
    const modCompanies = window.appState.companies.filter(c => !Array.isArray(c.modules) || c.modules.includes(mod));
    compSel.innerHTML = modCompanies.length > 0
        ? modCompanies.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('')
        : `<option value="" disabled selected>Agregue una empresa a este apartado...</option>`;

    onOrderDateOrCompanyChange();
    document.getElementById('import-modal').classList.remove('hidden');
};

window.closeModal = function() {
    document.getElementById('import-modal').classList.add('hidden');
};

window.onOrderDateOrCompanyChange = function() {
    const mod = document.getElementById('modal_current_module').value;
    const orderDate = document.getElementById('modal_order_date').value;
    const compName = document.getElementById('modal_company').value;
    const computedFY = calculateFiscalYear(orderDate);

    const badge = document.getElementById('modal_computed_fy_badge');
    if (badge) badge.innerText = `Contabiliza en AF ${computedFY}`;

    const compObj = window.appState.companies.find(c => c.name === compName);

    if (mod === '1') {
        const sel1 = document.getElementById('modal_type_select_mod1');
        const quotas = window.appState.quotas.filter(q => q.company === compName && Number(q.year) === computedFY);
        if (quotas.length === 0) {
            sel1.innerHTML = `<option value="" disabled selected>Sin cuota asignada en AF ${computedFY}</option>`;
            document.getElementById('modal_tariff').value = '';
            document.getElementById('mod1_quota_available_text').innerText = 'Asigne primero una cuota a esta empresa en Asignación de Cuota o en el Balance de cuotas.';
        } else {
            sel1.innerHTML = quotas.map(q => `<option value="${escapeHtml(q.substance)}">${escapeHtml(q.substance)} (Cuota: ${q.limit} Ton)</option>`).join('');
            autoFillTariffAndDetails('1');
        }
    } else if (mod === '2') {
        const sel2 = document.getElementById('modal_type_select_mod2');
        let subs2 = window.appState.substances.filter(s => String(s.module) === '2');
        if (compObj && Array.isArray(compObj.allowedSubstances) && compObj.allowedSubstances.length > 0) {
            const filtered = subs2.filter(s => compObj.allowedSubstances.includes(s.name));
            if (filtered.length > 0) subs2 = filtered;
        }
        sel2.innerHTML = subs2.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
        autoFillTariffAndDetails('2');
    } else if (mod === '3') {
        const sel3 = document.getElementById('modal_type_select_mod3');
        let subs3 = window.appState.substances.filter(s => String(s.module) === '3');
        if (compObj && Array.isArray(compObj.allowedSubstances) && compObj.allowedSubstances.length > 0) {
            const filtered = subs3.filter(s => compObj.allowedSubstances.includes(s.name));
            if (filtered.length > 0) subs3 = filtered;
        }
        sel3.innerHTML = subs3.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
        autoFillTariffAndDetails('3');
    }
};

window.autoFillTariffAndDetails = function(mod) {
    const selectEl = document.getElementById(`modal_type_select_mod${mod}`);
    if (!selectEl || !selectEl.value) return;
    const subObj = window.appState.substances.find(s => s.name === selectEl.value && String(s.module) === String(mod));
    document.getElementById('modal_tariff').value = subObj ? subObj.tariff : '';

    if (mod === '1') {
        const compName = document.getElementById('modal_company').value;
        const fy = calculateFiscalYear(document.getElementById('modal_order_date').value);
        const bal = getQuotaBalance(compName, selectEl.value, fy);
        document.getElementById('mod1_quota_available_text').innerText =
            `Cuota restante antes de esta orden: ${fmtNum(bal.remTM)} Ton (${fmtCO2(bal.remCO2)})`;
    } else if (mod === '3' && subObj && subObj.refrigerant) {
        document.getElementById('modal_contained_gas').value = subObj.refrigerant;
    }
    updateQtyCO2Preview();
};

// Muestra el equivalente en TCO2eq de la cantidad escrita (Módulos 1 y 2).
window.updateQtyCO2Preview = function() {
    const mod = document.getElementById('modal_current_module').value;
    const el = document.getElementById('modal_qty_co2_text');
    if (!el) return;
    const sel = document.getElementById(`modal_type_select_mod${mod}`);
    const qty = parseFloat(document.getElementById('modal_qty').value);
    if (mod === '3' || !sel || !sel.value || isNaN(qty)) { el.innerText = ''; return; }
    const co2 = calcCO2(qty, sel.value);
    el.innerText = co2 === null
        ? 'Esta sustancia no tiene factor TCO₂eq (se captura en el Catálogo de Sustancias).'
        : `Equivale a ${fmtCO2(co2)}`;
};

window.handleImportSubmit = function(e) {
    e.preventDefault();
    const mod = document.getElementById('modal_current_module').value;
    const company = document.getElementById('modal_company').value;
    const orderDate = document.getElementById('modal_order_date').value;
    const arrivalDate = document.getElementById('modal_arrival_date').value;
    const qty = parseFloat(document.getElementById('modal_qty').value);
    const tariff = document.getElementById('modal_tariff').value;
    const fiscalYear = calculateFiscalYear(orderDate);

    const selectEl = document.getElementById(`modal_type_select_mod${mod}`);
    const substanceOrType = selectEl ? selectEl.value : '';
    const error = validateImportData({
        mod, company, substance: substanceOrType, orderDate, arrivalDate, qty,
        description: mod === '3' ? document.getElementById('modal_product_desc').value : undefined
    });
    if (error) {
        customAlert('No se pudo registrar la importación', error);
        return;
    }

    // Asegurar que el año fiscal exista en la lista
    if (!window.appState.fiscalYears.some(y => Number(y.year) === fiscalYear)) {
        window.appState.fiscalYears.push({ id: 'fy_' + Date.now(), year: fiscalYear });
    }

    const trackingNumber = generateTrackingFolio(fiscalYear, mod);
    const authCode = generateAuthHash();
    const roleSel = document.getElementById('user-role-selector');
    const registeredBy = roleSel ? roleSel.value.replace('COMPANY_VIEW:', 'Empresa: ') : 'Admin 1 (Sistema)';

    const newImp = {
        id: 'imp_' + Date.now(),
        module: mod,
        company,
        type: substanceOrType,
        tariff,
        qty: mod === '3' ? parseInt(qty, 10) : qty,
        orderDate,
        arrivalDate,
        fiscalYear,
        trackingNumber,
        authCode,
        registeredBy,
        registeredAt: new Date().toISOString(),
        deliveredToAdmin: true,
        deliveredToCompany: true,
        productDescription: mod === '3' ? document.getElementById('modal_product_desc').value.trim() : '',
        contained: mod === '3' ? document.getElementById('modal_contained_gas').value : '',
        regStatus: mod === '3' ? document.getElementById('modal_reg_status').value : ''
    };

    window.appState.imports.unshift(newImp);
    logAudit(`Registró importación [${trackingNumber}] en "${moduleName(mod)}": ${newImp.qty} ${mod === '3' ? 'Unidades' : 'Ton'} de ${substanceOrType} para ${company} (AF ${fiscalYear})`, moduleName(mod));

    closeModal();
    document.getElementById('global-fiscal-year').value = fiscalYear;
    window.renderAll();
    openReceiptById(newImp.id, 'both');
};
