/* Vista: Años Fiscales. */

// =========================================================================
// 8. AÑOS FISCALES Y AUDITORÍA
// =========================================================================
function renderYears() {
    const years = [...window.appState.fiscalYears].sort((a,b) => a.year - b.year);
    return `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Gestor de Años Fiscales (2 Ene - 31 Dic)</h2>
            <p class="text-sm text-gray-500">Agregue o edite años fiscales para el control de importaciones.</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 max-w-md">
            <form onsubmit="handleAddYear(event)" class="flex gap-2">
                <input type="number" id="new_fy_input" required min="2020" max="2100" placeholder="Ej. 2028" class="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-bold">
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">+ Agregar Año</button>
            </form>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-xl">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b text-xs uppercase text-gray-500">
                        <th class="p-3.5">Año Fiscal</th>
                        <th class="p-3.5">Vigencia Oficial</th>
                        <th class="p-3.5 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y text-sm">
                    ${years.map(y => `
                        <tr>
                            <td class="p-3.5 font-extrabold text-indigo-700">AF ${y.year}</td>
                            <td class="p-3.5 text-xs text-gray-600">2 de Enero ${y.year} — 31 de Diciembre ${y.year}</td>
                            <td class="p-3.5 text-right">
                                <button onclick="openEditYearModal('${y.id}')" class="text-indigo-600 hover:underline text-xs font-bold">Editar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleAddYear(e) {
    e.preventDefault();
    const yr = parseInt(document.getElementById('new_fy_input').value, 10);
    const error = validateYear(yr);
    if (error) {
        customAlert('No se pudo agregar el año fiscal', error);
        return;
    }
    window.appState.fiscalYears.push({ id: 'fy_' + Date.now(), year: yr });
    logAudit(`Agregó Año Fiscal ${yr}`, 'Años Fiscales');
    showToast(`Año Fiscal ${yr} agregado`);
    document.getElementById('global-fiscal-year').value = yr;
    window.renderAll();
}
