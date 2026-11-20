/* Vista: Asignación de Cuota (apartado, sustancia y, solo en "sujetas a cuota", la cuota anual) */

// Apartado elegido por última vez en el formulario (se conserva entre re-renderizados).
window.assignFormModule = window.assignFormModule || '1';

// =========================================================================
// 1. PESTAÑA INICIAL: ASIGNACIÓN DE CUOTA
// =========================================================================
function renderQuotas() {
    const currentFY = getActiveFiscalYear();
    const monitored = getMonitoredCompanyFilter();
    const companies = window.appState.companies;
    const formMod = window.assignFormModule;

    let quotasList = window.appState.quotas.filter(q => Number(q.year) === currentFY);
    if (monitored) quotasList = quotasList.filter(q => q.company === monitored);

    // Asignaciones permanentes de los apartados sin cuota y de equipos (solo registran que la empresa importa ahí)
    let assignRows = [];
    companies.forEach(c => (c.assignments || []).forEach(a => assignRows.push({ company: c.name, module: a.module, substance: a.substance })));
    if (monitored) assignRows = assignRows.filter(r => r.company === monitored);
    assignRows.sort((a, b) => a.company.localeCompare(b.company) || a.module.localeCompare(b.module) || a.substance.localeCompare(b.substance));

    let html = `
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Control Anual • Protocolo de Montreal</span>
                <h2 class="text-2xl font-bold text-gray-800">Asignación de Cuota (AF ${currentFY})</h2>
                <p class="text-sm text-gray-500 mt-0.5">Indique a qué apartado va cada empresa y con qué sustancia o equipo. Solo las sustancias sujetas a cuota llevan cuota anual (TM y TCO₂eq).</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button onclick="openQuickCompanyModal()" class="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap">
                    + Agregar Empresa
                </button>
                <button onclick="switchTab('mod1')" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm whitespace-nowrap">
                    Ver Balance de Cuotas →
                </button>
            </div>
        </div>

        ${renderGwpNotice(quotasList.map(q => q.substance))}

        <!-- Formulario de asignación (una fila) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <form onsubmit="handleQuotaSubmit(event)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Empresa Importadora</label>
                    <select id="quota_company" required class="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="" disabled selected>Seleccione empresa...</option>
                        ${companies.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Apartado</label>
                    <select id="quota_module" onchange="onAssignModuleChange()" class="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                        ${['1', '2', '3'].map(m => `<option value="${m}" ${m === formMod ? 'selected' : ''}>${moduleName(m)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1" id="quota_substance_label">${formMod === '3' ? 'Equipo / Aparato' : 'Sustancia'}</label>
                    <select id="quota_substance" required class="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                        ${assignSubstanceOptions(formMod)}
                    </select>
                </div>
                <div class="quota-only ${formMod === '1' ? '' : 'hidden'}">
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Cuota Anual (TM)</label>
                    <input type="number" step="0.01" min="0" id="quota_limit" ${formMod === '1' ? 'required' : ''} class="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. 500.00">
                </div>
                <div class="quota-only ${formMod === '1' ? '' : 'hidden'}">
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Cuota Anual (TCO₂eq, opcional)</label>
                    <input type="number" step="0.01" min="0" id="quota_limit_co2" class="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Auto con el factor">
                </div>
                <div class="${formMod === '1' ? '' : 'lg:col-span-3'}" id="quota_submit_cell">
                    <button type="submit" id="quota_submit_btn" class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-sm">
                        ${formMod === '1' ? '+ Guardar Cuota' : '+ Asignar a la Empresa'}
                    </button>
                </div>
            </form>
            <p id="quota_form_hint" class="text-[11px] text-gray-500 mt-2 ${formMod === '1' ? 'hidden' : ''}">Este apartado no lleva cuota: solo se registra que la empresa importa esta sustancia o equipo.</p>
        </div>

        <!-- Tabla de cuotas (sujetas a cuota, por año fiscal) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Cuotas Activas — ${moduleName('1')} (AF ${currentFY})</h3>
                <span class="text-xs font-semibold text-gray-500">${quotasList.length} cuotas</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Empresa</th>
                            <th class="p-3.5 font-semibold">Sustancia</th>
                            <th class="p-3.5 font-semibold">Fracción Arancelaria</th>
                            <th class="p-3.5 font-semibold text-right">Cuota (TM)</th>
                            <th class="p-3.5 font-semibold text-right">Cuota (TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Importado (TM)</th>
                            <th class="p-3.5 font-semibold text-right">Importado (TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Restante (TM)</th>
                            <th class="p-3.5 font-semibold text-right">Restante (TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (quotasList.length === 0) {
        html += `<tr><td colspan="10" class="p-8 text-center text-gray-400">Sin cuotas registradas en el AF ${currentFY}.</td></tr>`;
    } else {
        quotasList.forEach(q => {
            const subObj = window.appState.substances.find(s => s.name === q.substance && String(s.module) === '1');
            const tariff = subObj ? subObj.tariff : 'S/N';
            const bal = getQuotaBalance(q.company, q.substance, currentFY);
            const remClass = bal.remTM < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700 font-extrabold';
            const remCO2Class = bal.remCO2 !== null && bal.remCO2 < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700 font-extrabold';

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(q.company)}</td>
                    <td class="p-3.5 font-semibold text-indigo-700">${escapeHtml(q.substance)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(tariff)}</td>
                    <td class="p-3.5 text-right font-bold">${fmtNum(bal.limitTM)}</td>
                    <td class="p-3.5 text-right font-bold">${fmtCO2Num(bal.limitCO2)}</td>
                    <td class="p-3.5 text-right text-gray-700">${fmtNum(bal.usedTM)}</td>
                    <td class="p-3.5 text-right text-gray-700">${fmtCO2Num(bal.usedCO2)}</td>
                    <td class="p-3.5 text-right ${remClass}">${fmtNum(bal.remTM)}</td>
                    <td class="p-3.5 text-right ${remCO2Class}">${fmtCO2Num(bal.remCO2)}</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="openEditQuotaModal('${q.id}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-bold text-xs mr-1.5">Editar Cuota</button>
                        <button onclick="deleteQuota('${q.id}')" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-xs">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Tabla de asignaciones sin cuota y de equipos (permanentes, sin límite) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Empresas en ${moduleName('2')} y ${moduleName('3')}</h3>
                <span class="text-xs font-semibold text-gray-500">${assignRows.length} asignaciones</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Empresa</th>
                            <th class="p-3.5 font-semibold">Apartado</th>
                            <th class="p-3.5 font-semibold">Sustancia / Equipo</th>
                            <th class="p-3.5 font-semibold">Fracción Arancelaria</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (assignRows.length === 0) {
        html += `<tr><td colspan="5" class="p-8 text-center text-gray-400">Ninguna empresa asignada todavía a estos apartados.</td></tr>`;
    } else {
        assignRows.forEach(r => {
            const subObj = window.appState.substances.find(s => s.name === r.substance && String(s.module) === r.module);
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(r.company)}</td>
                    <td class="p-3.5 text-xs font-semibold ${r.module === '2' ? 'text-emerald-700' : 'text-purple-700'}">${moduleName(r.module)}</td>
                    <td class="p-3.5 font-semibold text-gray-800">${escapeHtml(r.substance)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(subObj ? subObj.tariff : 'S/N')}</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="removeAssignment(${jsArg(r.company)}, '${r.module}', ${jsArg(r.substance)})" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-xs">Quitar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    return html;
}

// Opciones del selector de sustancia según el apartado elegido.
function assignSubstanceOptions(mod) {
    const subs = window.appState.substances.filter(s => String(s.module) === String(mod));
    const placeholder = mod === '3' ? 'Seleccione equipo...' : 'Seleccione sustancia...';
    return `<option value="" disabled selected>${placeholder}</option>` +
        subs.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (${escapeHtml(s.tariff)})</option>`).join('');
}

// Cambia la lista de sustancias y muestra u oculta los campos de cuota sin perder la empresa elegida.
function onAssignModuleChange() {
    const mod = document.getElementById('quota_module').value;
    window.assignFormModule = mod;
    const isQuota = mod === '1';
    document.getElementById('quota_substance').innerHTML = assignSubstanceOptions(mod);
    document.getElementById('quota_substance_label').innerText = mod === '3' ? 'Equipo / Aparato' : 'Sustancia';
    document.querySelectorAll('.quota-only').forEach(el => el.classList.toggle('hidden', !isQuota));
    document.getElementById('quota_limit').required = isQuota;
    document.getElementById('quota_submit_cell').className = isQuota ? '' : 'lg:col-span-3';
    document.getElementById('quota_submit_btn').innerText = isQuota ? '+ Guardar Cuota' : '+ Asignar a la Empresa';
    document.getElementById('quota_form_hint').classList.toggle('hidden', isQuota);
}

function handleQuotaSubmit(e) {
    e.preventDefault();
    const company = document.getElementById('quota_company').value;
    const mod = document.getElementById('quota_module').value;
    const substance = document.getElementById('quota_substance').value;
    if (mod !== '1') {
        window.saveAssignmentToDB(company, mod, substance);
        return;
    }
    const limit = parseFloat(document.getElementById('quota_limit').value);
    const co2Raw = document.getElementById('quota_limit_co2').value;
    const limitCO2 = co2Raw === '' ? null : parseFloat(co2Raw);
    const year = getActiveFiscalYear();
    window.saveQuotaToDB(company, substance, limit, year, limitCO2);
}
