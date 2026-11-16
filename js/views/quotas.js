/* Vista: Asignación de Cuota */

// =========================================================================
// 1. PESTAÑA INICIAL: ASIGNACIÓN DE CUOTA
// =========================================================================
function renderQuotas() {
    const currentFY = getActiveFiscalYear();
    const monitored = getMonitoredCompanyFilter();
    const mod1Companies = window.appState.companies.filter(c => !Array.isArray(c.modules) || c.modules.includes('1'));
    const mod1Substances = window.appState.substances.filter(s => String(s.module) === '1');

    let quotasList = window.appState.quotas.filter(q => Number(q.year) === currentFY);
    if (monitored) quotasList = quotasList.filter(q => q.company === monitored);

    let html = `
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Control Anual • Protocolo de Montreal</span>
                <h2 class="text-2xl font-bold text-gray-800">Asignación de Cuota (AF ${currentFY})</h2>
                <p class="text-sm text-gray-500 mt-0.5">Asigne o edite los límites en Toneladas por empresa y sustancia regulada.</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="openQuickCompanyModal('1')" class="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold shadow-sm">
                    + Agregar Empresa
                </button>
                <button onclick="switchTab('mod1')" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm">
                    Ver Módulo 1 →
                </button>
            </div>
        </div>

        ${renderGwpNotice(quotasList.map(q => q.substance))}

        <!-- Formulario Asignación -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <form onsubmit="handleQuotaSubmit(event)" class="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Empresa Importadora (Módulo 1)</label>
                    <select id="quota_company" required onchange="updateQuotaSubstanceSelect()" class="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="" disabled selected>Seleccione empresa...</option>
                        ${mod1Companies.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Sustancia Regulada</label>
                    <select id="quota_substance" required class="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="" disabled selected>Seleccione gas...</option>
                        ${mod1Substances.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (${escapeHtml(s.tariff)})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Cuota Anual (Toneladas)</label>
                    <input type="number" step="0.01" min="0" id="quota_limit" required class="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. 500.00">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Cuota TCO₂eq (opcional)</label>
                    <input type="number" step="0.01" min="0" id="quota_limit_co2" class="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Auto con el factor">
                </div>
                <div>
                    <button type="submit" class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-sm">
                        + Guardar Cuota
                    </button>
                </div>
            </form>
        </div>

        <!-- Tabla Cuotas -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Cuotas Activas (AF ${currentFY})</h3>
                <span class="text-xs font-semibold text-gray-500">${quotasList.length} cuotas</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Empresa</th>
                            <th class="p-3.5 font-semibold">Sustancia</th>
                            <th class="p-3.5 font-semibold">Fracción Arancelaria</th>
                            <th class="p-3.5 font-semibold text-right">Cuota Permitida (TM / TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Importado</th>
                            <th class="p-3.5 font-semibold text-right">Restante</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (quotasList.length === 0) {
        html += `<tr><td colspan="7" class="p-8 text-center text-gray-400">Sin cuotas registradas en el AF ${currentFY}.</td></tr>`;
    } else {
        quotasList.forEach(q => {
            const subObj = window.appState.substances.find(s => s.name === q.substance && String(s.module) === '1');
            const tariff = subObj ? subObj.tariff : 'S/N';
            const bal = getQuotaBalance(q.company, q.substance, currentFY);
            const remClass = bal.remTM < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700 font-extrabold';

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(q.company)}</td>
                    <td class="p-3.5 font-semibold text-indigo-700">${escapeHtml(q.substance)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(tariff)}</td>
                    <td class="p-3.5 text-right font-bold">${dualQty(bal.limitTM, bal.limitCO2)}</td>
                    <td class="p-3.5 text-right text-gray-700">${dualQty(bal.usedTM, bal.usedCO2)}</td>
                    <td class="p-3.5 text-right ${remClass}">${dualQty(bal.remTM, bal.remCO2)}</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="openEditQuotaModal('${q.id}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-bold text-xs mr-1.5">Editar Cuota</button>
                        <button onclick="deleteQuota('${q.id}')" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-xs">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    return html;
}

function updateQuotaSubstanceSelect() {
    const compName = document.getElementById('quota_company')?.value;
    const subSel = document.getElementById('quota_substance');
    if (!subSel) return;
    const compObj = window.appState.companies.find(c => c.name === compName);
    let mod1Subs = window.appState.substances.filter(s => String(s.module) === '1');
    if (compObj && Array.isArray(compObj.allowedSubstances) && compObj.allowedSubstances.length > 0) {
        const filtered = mod1Subs.filter(s => compObj.allowedSubstances.includes(s.name));
        if (filtered.length > 0) mod1Subs = filtered;
    }
    subSel.innerHTML = '<option value="" disabled selected>Seleccione gas...</option>' +
        mod1Subs.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (${escapeHtml(s.tariff)})</option>`).join('');
}

function handleQuotaSubmit(e) {
    e.preventDefault();
    const company = document.getElementById('quota_company').value;
    const substance = document.getElementById('quota_substance').value;
    const limit = parseFloat(document.getElementById('quota_limit').value);
    const co2Raw = document.getElementById('quota_limit_co2').value;
    const limitCO2 = co2Raw === '' ? null : parseFloat(co2Raw);
    const year = getActiveFiscalYear();
    window.saveQuotaToDB(company, substance, limit, year, limitCO2);
}
