/* Vista: Catálogo de Sustancias y Equipos */

// =========================================================================
// 7. CATÁLOGO DE SUSTANCIAS Y EQUIPOS (MÓDULOS 1, 2 Y 3)
// =========================================================================
function renderSubstances() {
    const subs = window.appState.substances;
    let html = `
        <div class="mb-6">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Arancel Centroamericano UTOH (Sin CFC)</span>
            <h2 class="text-2xl font-bold text-gray-800">Catálogo de Sustancias y Equipos (${subs.length})</h2>
        </div>

        <!-- Formulario Agregar Sustancia o Equipo -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <form onsubmit="handleAddSubstance(event)" class="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Nombre de Sustancia / Equipo</label>
                    <input type="text" id="sub_name" required class="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="Ej. R-410A o Split System">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Fracción Arancelaria</label>
                    <input type="text" id="sub_tariff" required class="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono" placeholder="3827.63.00.00">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Clasificación</label>
                    <select id="sub_module" onchange="document.getElementById('sub_ref_wrap').classList.toggle('hidden', this.value !== '3'); document.getElementById('sub_gwp_wrap').classList.toggle('hidden', this.value === '3')" class="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white">
                        <option value="1">Sustancia regulada sujeta a cuota</option>
                        <option value="2">Sustancia regulada sin cuota</option>
                        <option value="3">Equipo o aparato regulado</option>
                    </select>
                </div>
                <div id="sub_gwp_wrap">
                    <label class="block text-xs font-bold text-gray-700 mb-1">Factor TCO₂eq por TM</label>
                    <input type="number" step="0.01" min="0" id="sub_gwp" class="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="Ej. 1810">
                </div>
                <div id="sub_ref_wrap" class="hidden">
                    <label class="block text-xs font-bold text-gray-700 mb-1">Gas que usa el Equipo</label>
                    <input type="text" id="sub_refrigerant" class="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="Ej. R-410A">
                </div>
                <div>
                    <button type="submit" class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm">
                        + Agregar al Catálogo
                    </button>
                </div>
            </form>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Nombre / Descripción</th>
                            <th class="p-3.5 font-semibold">Fracción Arancelaria</th>
                            <th class="p-3.5 font-semibold">Clasificación</th>
                            <th class="p-3.5 font-semibold text-right">Factor TCO₂eq / TM</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        ${subs.map(s => `
                            <tr class="hover:bg-gray-50">
                                <td class="p-3.5 font-bold text-gray-900">
                                    ${escapeHtml(s.name)}
                                    ${s.module === '3' && s.refrigerant ? `<span class="block text-xs text-purple-600 font-normal">Refrigerante: ${escapeHtml(s.refrigerant)}</span>` : ''}
                                </td>
                                <td class="p-3.5 font-mono text-xs text-gray-700">${escapeHtml(s.tariff)}</td>
                                <td class="p-3.5 text-xs font-bold">${moduleName(s.module)}</td>
                                <td class="p-3.5 text-right text-xs">${String(s.module) === '3' ? '<span class="text-gray-400">No aplica</span>' : (getGwp(s.name) !== null ? `<b>${fmtNum(getGwp(s.name))}</b>` : '<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">Sin factor</span>')}</td>
                                <td class="p-3.5 text-right whitespace-nowrap">
                                    <button onclick="openEditSubstanceModal('${s.id}')" class="text-indigo-600 hover:underline font-bold text-xs mr-3">Editar</button>
                                    <button onclick="deleteSubstance('${s.id}')" class="text-red-500 hover:underline font-bold text-xs">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return html;
}

function handleAddSubstance(e) {
    e.preventDefault();
    const name = document.getElementById('sub_name').value.trim();
    const tariff = document.getElementById('sub_tariff').value.trim();
    const module = document.getElementById('sub_module').value;
    const refrigerant = document.getElementById('sub_refrigerant')?.value.trim() || '';
    const gwpRaw = document.getElementById('sub_gwp')?.value || '';
    const gwp = (module === '3' || gwpRaw === '') ? null : parseFloat(gwpRaw);
    const error = validateSubstanceData({ name, tariff, module, gwp, refrigerant });
    if (error) {
        customAlert('No se pudo agregar al catálogo', error);
        return;
    }
    window.appState.substances.unshift({
        id: 'sub_' + Date.now(),
        name,
        tariff,
        module,
        refrigerant,
        gwp
    });
    logAudit(`Agregó sustancia/equipo ${name} (${tariff}) en "${moduleName(module)}"`, 'Catálogo');
    showToast(`Sustancia agregada a "${moduleName(module)}"`);
    window.renderAll();
}
