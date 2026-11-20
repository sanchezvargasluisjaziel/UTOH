/* Vista: Módulo 1 (Sustancias reguladas con cuota) */

// =========================================================================
// 2. MÓDULO 1: GASES REGULADOS (CON BALANCE EDITABLE Y ACTUALIZACIÓN AUTOMÁTICA)
// =========================================================================
function renderModule1(activeImports) {
    const currentFY = getActiveFiscalYear();
    const monitored = getMonitoredCompanyFilter();
    const mod1Imports = filterByMonth(activeImports.filter(i => String(i.module) === '1'), 'mod1');

    // Balance: una fila por cada cuota asignada en el año fiscal (las cuotas se asignan en Asignación de Cuota)
    let balanceRows = [];
    let quotasFY = window.appState.quotas.filter(q => Number(q.year) === currentFY);
    if (monitored) quotasFY = quotasFY.filter(q => q.company === monitored);

    quotasFY.forEach(q => {
        balanceRows.push({
            quotaId: q.id,
            company: q.company,
            substance: q.substance,
            limit: parseFloat(q.limit || 0)
        });
    });

    let html = `
        <div class="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">PROTOCOLO DE MONTREAL • CON CUOTA</span>
                <h2 class="text-2xl font-bold text-gray-800 mt-1">${moduleName('1')} (AF ${currentFY})</h2>
                <p class="text-sm text-gray-500">Control de cuota permitida menos cantidad importada (en Toneladas) y fracción arancelaria.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="switchTab('quotas')" class="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold">
                    Asignar Cuota
                </button>
                <button onclick="clearModuleData('1')" class="px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                    Vaciar Movimientos
                </button>
                <button onclick="openModuleImportModal('1')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm">
                    + Registrar Importación
                </button>
            </div>
        </div>

        ${renderGwpNotice([...balanceRows.map(r => r.substance), ...mod1Imports.map(i => i.type)])}
        ${renderReportToolbar('mod1')}

        <!-- Tabla 1: Balance por Empresa Importadora (EDITABLE DIRECTAMENTE) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
                <div>
                    <h3 class="font-bold text-gray-800 text-sm">Balance por Empresa Importadora y Resta de Cuota (Editable)</h3>
                    <p class="text-xs text-gray-500">Puede editar la cuota de cada empresa desde la columna Acciones. Las cuotas nuevas se asignan en Asignación de Cuota.</p>
                </div>
                <span class="text-xs font-bold text-indigo-700">${balanceRows.length} registros</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Empresa Importadora</th>
                            <th class="p-3.5 font-semibold">Gas Regulado</th>
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

    if (balanceRows.length === 0) {
        html += `<tr><td colspan="10" class="p-8 text-center text-gray-400">No hay cuotas asignadas en el AF ${currentFY}. Asígnelas en Asignación de Cuota.</td></tr>`;
    } else {
        balanceRows.forEach(row => {
            const subObj = window.appState.substances.find(s => s.name === row.substance && String(s.module) === '1');
            const tariff = subObj ? subObj.tariff : '---';
            const bal = getQuotaBalance(row.company, row.substance, currentFY);
            const remClass = bal.remTM < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700 font-extrabold';
            const remCO2Class = bal.remCO2 !== null && bal.remCO2 < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700 font-extrabold';

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(row.company)}</td>
                    <td class="p-3.5 font-semibold text-indigo-700">${escapeHtml(row.substance)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(tariff)}</td>
                    <td class="p-3.5 text-right font-bold">${fmtNum(bal.limitTM)}</td>
                    <td class="p-3.5 text-right font-bold">${fmtCO2Num(bal.limitCO2)}</td>
                    <td class="p-3.5 text-right text-amber-700 font-bold">${fmtNum(bal.usedTM)}</td>
                    <td class="p-3.5 text-right text-amber-700 font-bold">${fmtCO2Num(bal.usedCO2)}</td>
                    <td class="p-3.5 text-right ${remClass}">${fmtNum(bal.remTM)}</td>
                    <td class="p-3.5 text-right ${remCO2Class}">${fmtCO2Num(bal.remCO2)}</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="openEditQuotaModal('${row.quotaId}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-bold text-xs mr-1.5">Editar Cuota</button>
                        <button onclick="deleteQuota('${row.quotaId}')" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-xs">Eliminar</button>
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

        <!-- Tabla 2: Historial de Órdenes de Importación del Módulo 1 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Movimientos de Importación Registrados (AF ${currentFY} · ${monthLabel('mod1')})</h3>
                <span class="text-xs font-semibold text-gray-500">${mod1Imports.length} movimientos</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Folio / QR</th>
                            <th class="p-3.5 font-semibold">Fecha Orden (AF)</th>
                            <th class="p-3.5 font-semibold">Empresa</th>
                            <th class="p-3.5 font-semibold">Gas Regulado</th>
                            <th class="p-3.5 font-semibold">Fracción Arancelaria</th>
                            <th class="p-3.5 font-semibold text-right">Cantidad (TM)</th>
                            <th class="p-3.5 font-semibold text-right">Cantidad (TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod1Imports.length === 0) {
        html += `<tr><td colspan="8" class="p-8 text-center text-gray-400">No hay órdenes de importación registradas para este año fiscal.</td></tr>`;
    } else {
        mod1Imports.forEach(imp => {
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5">
                        <button onclick="openReceiptById('${imp.id}')" class="font-mono text-xs font-bold text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded">
                            ${escapeHtml(imp.trackingNumber || 'VER-QR')}
                        </button>
                    </td>
                    <td class="p-3.5 text-xs">
                        <div class="font-bold text-gray-800">Orden: ${escapeHtml(imp.orderDate)}</div>
                        <div class="text-gray-400">Llegada: ${escapeHtml(imp.arrivalDate || 'Pendiente')}</div>
                    </td>
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(imp.company)}</td>
                    <td class="p-3.5 font-semibold text-indigo-700">${escapeHtml(imp.type)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(imp.tariff)}</td>
                    <td class="p-3.5 text-right font-bold text-gray-900">${fmtNum(imp.qty)}</td>
                    <td class="p-3.5 text-right font-semibold text-gray-600">${fmtCO2Num(calcCO2(imp.qty, imp.type))}</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="openReceiptById('${imp.id}')" class="text-emerald-600 hover:text-emerald-800 font-bold text-xs mr-2">Recibo/QR</button>
                        <button onclick="openEditImportModal('${imp.id}')" class="text-indigo-600 hover:text-indigo-900 font-bold text-xs mr-2">Editar</button>
                        <button onclick="deleteImport('${imp.id}')" class="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    return html;
}
