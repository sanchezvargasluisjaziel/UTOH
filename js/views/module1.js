/* Vista: Módulo 1 (Sustancias reguladas con cuota) */

// =========================================================================
// 2. MÓDULO 1: GASES REGULADOS (CON BALANCE EDITABLE Y ACTUALIZACIÓN AUTOMÁTICA)
// =========================================================================
function renderModule1(activeImports) {
    const currentFY = getActiveFiscalYear();
    const monitored = getMonitoredCompanyFilter();
    const mod1Imports = filterByMonth(activeImports.filter(i => String(i.module) === '1'), 'mod1');

    // Asegurar que todas las empresas del Módulo 1 aparezcan en el Balance aunque recién se hayan agregado
    let mod1Companies = window.appState.companies.filter(c => !Array.isArray(c.modules) || c.modules.includes('1'));
    if (monitored) mod1Companies = mod1Companies.filter(c => c.name === monitored);

    // Construir filas del Balance por Empresa Importadora combinando cuotas existentes y empresas recién agregadas
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

    // Si una empresa de Módulo 1 tiene sustancias autorizadas pero aún no tenía cuota en este AF, mostrarla para poder editar su cuota ahí mismo
    mod1Companies.forEach(comp => {
        const mod1Allowed = (comp.allowedSubstances || []).filter(sName => {
            const sObj = window.appState.substances.find(s => s.name === sName);
            return sObj && String(sObj.module) === '1';
        });
        if (mod1Allowed.length > 0) {
            mod1Allowed.forEach(subName => {
                const exists = balanceRows.some(r => r.company === comp.name && r.substance === subName);
                if (!exists) {
                    balanceRows.push({
                        quotaId: null,
                        company: comp.name,
                        substance: subName,
                        limit: 0
                    });
                }
            });
        } else if (!balanceRows.some(r => r.company === comp.name)) {
            balanceRows.push({
                quotaId: null,
                company: comp.name,
                substance: 'Sin sustancia asignada',
                limit: 0
            });
        }
    });

    let html = `
        <div class="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">PROTOCOLO DE MONTREAL • CON CUOTA</span>
                <h2 class="text-2xl font-bold text-gray-800 mt-1">${moduleName('1')} (AF ${currentFY})</h2>
                <p class="text-sm text-gray-500">Control de cuota permitida menos cantidad importada (en Toneladas) y fracción arancelaria.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="openQuickCompanyModal('1')" class="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold">
                    + Agregar Empresa
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
                    <p class="text-xs text-gray-500">Puede editar directamente el límite de cuota permitido de cada empresa desde la columna Acciones.</p>
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
                            <th class="p-3.5 font-semibold text-right">Cuota Permitida (TM / TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Importado (TM / TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Cuota Restante (TM / TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Acciones (Editar Balance)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (balanceRows.length === 0) {
        html += `<tr><td colspan="7" class="p-8 text-center text-gray-400">No hay empresas o cuotas registradas. Use "+ Agregar Empresa" para comenzar.</td></tr>`;
    } else {
        balanceRows.forEach(row => {
            const subObj = window.appState.substances.find(s => s.name === row.substance && String(s.module) === '1');
            const tariff = subObj ? subObj.tariff : '---';
            const bal = getQuotaBalance(row.company, row.substance, currentFY);
            const remClass = bal.remTM < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700 font-extrabold';
            const safeComp = jsArg(row.company);
            const safeSub = jsArg(row.substance);

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(row.company)}</td>
                    <td class="p-3.5 font-semibold text-indigo-700">${escapeHtml(row.substance)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(tariff)}</td>
                    <td class="p-3.5 text-right font-bold">${dualQty(bal.limitTM, bal.limitCO2)}</td>
                    <td class="p-3.5 text-right text-amber-700 font-bold">${dualQty(bal.usedTM, bal.usedCO2)}</td>
                    <td class="p-3.5 text-right ${remClass}">${dualQty(bal.remTM, bal.remCO2)}</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        ${row.quotaId
                            ? `<button onclick="openEditQuotaModal('${row.quotaId}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-bold text-xs mr-1.5">Editar Cuota</button>`
                            : `<button onclick="quickAssignQuotaFromMod1(${safeComp}, ${safeSub})" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-bold text-xs mr-1.5">Asignar Cuota</button>`
                        }
                        <button onclick="deleteBalanceCompanyRowMod1(${safeComp}, ${safeSub}, '${row.quotaId || ''}')" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-xs">Eliminar</button>
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
                            <th class="p-3.5 font-semibold text-right">Cantidad (TM / TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod1Imports.length === 0) {
        html += `<tr><td colspan="7" class="p-8 text-center text-gray-400">No hay órdenes de importación registradas para este año fiscal.</td></tr>`;
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
                    <td class="p-3.5 text-right font-bold text-gray-900">${dualQty(imp.qty, calcCO2(imp.qty, imp.type))}</td>
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

window.quickAssignQuotaFromMod1 = function(companyName, substanceName) {
    const currentFY = getActiveFiscalYear();
    let sub = substanceName;
    if (!sub || sub === 'Sin sustancia asignada') {
        const firstMod1 = window.appState.substances.find(s => String(s.module) === '1');
        sub = firstMod1 ? firstMod1.name : 'R-410A';
    }
    const newId = 'q_' + Date.now();
    window.appState.quotas.push({
        id: newId,
        company: companyName,
        substance: sub,
        limit: 100,
        year: currentFY
    });
    window.renderAll();
    openEditQuotaModal(newId);
};

window.deleteBalanceCompanyRowMod1 = function(companyName, substanceName, quotaId) {
    const currentFY = getActiveFiscalYear();
    customConfirm(
        'Eliminar del Balance de Cuotas',
        `¿Desea eliminar a "${companyName}" (${substanceName}) del Balance de cuotas?`,
        () => {
            // 1. Eliminar la cuota si existe
            if (quotaId) {
                window.appState.quotas = window.appState.quotas.filter(q => q.id !== quotaId);
            }
            window.appState.quotas = window.appState.quotas.filter(
                q => !(q.company === companyName && q.substance === substanceName && Number(q.year) === currentFY)
            );

            // 2. Actualizar la empresa para que no vuelva a regenerarse la fila en el Balance del Módulo 1
            const compObj = window.appState.companies.find(c => c.name === companyName);
            if (compObj) {
                if (Array.isArray(compObj.allowedSubstances)) {
                    compObj.allowedSubstances = compObj.allowedSubstances.filter(s => s !== substanceName);
                }
                const remainingMod1Quotas = window.appState.quotas.some(
                    q => q.company === companyName && Number(q.year) === currentFY
                );
                const remainingMod1Subs = (compObj.allowedSubstances || []).some(sName => {
                    const sObj = window.appState.substances.find(s => s.name === sName);
                    return sObj && String(sObj.module) === '1';
                });

                // Si ya no tiene más sustancias o cuotas en el Módulo 1, quitarla del Módulo 1
                if (!remainingMod1Quotas && !remainingMod1Subs) {
                    if (Array.isArray(compObj.modules)) {
                        compObj.modules = compObj.modules.filter(m => String(m) !== '1');
                    }
                    if (!compObj.modules || compObj.modules.length === 0) {
                        window.appState.companies = window.appState.companies.filter(c => c.name !== companyName);
                    }
                }
            }

            logAudit(`Eliminó del Balance de cuotas a "${companyName}" (${substanceName})`, moduleName('1'));
            window.renderAll();
            showToast(`Eliminado del Balance de cuotas: ${companyName}`);
        }
    );
};
