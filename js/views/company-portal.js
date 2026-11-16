/* Vista: Portal de la Empresa */

// =========================================================================
// 5. VISTA DE EMPRESA (PORTAL DE MONITOREO PERSONAL Y BUZÓN DE RECIBOS)
// =========================================================================
function renderCompanyPortal() {
    const currentFY = getActiveFiscalYear();
    const companies = window.appState.companies;
    if (companies.length === 0) {
        return `<div class="bg-white p-8 rounded-xl border text-center text-gray-500">No hay empresas registradas. Agregue una empresa primero.</div>`;
    }

    const monitored = getMonitoredCompanyFilter();
    const selectedName = monitored || window.appState.selectedPortalCompany || companies[0].name;
    const compObj = companies.find(c => c.name === selectedName) || companies[0];
    const compImports = window.appState.imports.filter(i => i.company === compObj.name && Number(i.fiscalYear) === currentFY);
    const compQuotas = window.appState.quotas.filter(q => q.company === compObj.name && Number(q.year) === currentFY);

    let html = `
        <div class="mb-6 bg-slate-900 text-white p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Portal de Monitoreo Personal y Comprobantes</span>
                <h2 class="text-xl font-bold mt-0.5">${compObj.name} — Año Fiscal ${currentFY}</h2>
                <div class="flex flex-wrap gap-1.5 mt-2">
                    ${(compObj.modules || ['1']).map(m => `<span class="px-2 py-0.5 bg-white/10 rounded text-xs font-semibold">Módulo ${m}</span>`).join('')}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <label class="text-xs text-slate-300 font-semibold">Empresa:</label>
                <select onchange="window.appState.selectedPortalCompany=this.value; renderAll();" class="p-2 rounded-lg bg-slate-800 text-white border border-slate-700 text-xs font-bold">
                    ${companies.map(c => `<option value="${c.name}" ${c.name === compObj.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
        </div>

        <!-- Balance de Cuotas de la Empresa -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <h3 class="font-bold text-gray-800 text-sm mb-3">Estado de Cuotas Autorizadas (Módulo 1 - AF ${currentFY})</h3>
            ${compQuotas.length === 0
                ? `<p class="text-xs text-gray-400">Esta empresa no tiene cuotas asignadas en el Módulo 1 para este año fiscal.</p>`
                : `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    ${compQuotas.map(q => {
                        const bal = getQuotaBalance(q.company, q.substance, currentFY);
                        return `
                            <div class="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                                <div class="font-bold text-indigo-700 text-sm">${q.substance}</div>
                                <div class="text-xs text-gray-500 mt-1">Asignada: <b>${fmtNum(bal.limitTM)} Ton</b> (${fmtCO2(bal.limitCO2)})</div>
                                <div class="text-xs text-gray-500">Usado: <b>${fmtNum(bal.usedTM)} Ton</b> (${fmtCO2(bal.usedCO2)})</div>
                                <div class="text-sm font-extrabold ${bal.remTM < 0 ? 'text-red-600' : 'text-emerald-700'} mt-1">Disponible: ${fmtNum(bal.remTM)} Ton</div>
                                <div class="text-xs font-bold text-emerald-700">${fmtCO2(bal.remCO2)}</div>
                            </div>
                        `;
                    }).join('')}
                   </div>`
            }
        </div>

        <!-- Buzón de Comprobantes QR Entregados a la Empresa -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Buzón de Comprobantes Digitales Recibidos (${compObj.name})</h3>
                <span class="text-xs font-semibold text-emerald-700">${compImports.length} recibos oficiales</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Folio Oficial</th>
                            <th class="p-3.5 font-semibold">Módulo</th>
                            <th class="p-3.5 font-semibold">Sustancia / Equipo</th>
                            <th class="p-3.5 font-semibold">Fecha Orden</th>
                            <th class="p-3.5 font-semibold text-right">Cantidad</th>
                            <th class="p-3.5 font-semibold text-right">Comprobante</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        ${compImports.length === 0
                            ? `<tr><td colspan="6" class="p-6 text-center text-gray-400">No hay comprobantes registrados para esta empresa en el AF ${currentFY}.</td></tr>`
                            : compImports.map(imp => `
                                <tr class="hover:bg-gray-50">
                                    <td class="p-3.5 font-mono text-xs font-bold text-indigo-700">${imp.trackingNumber}</td>
                                    <td class="p-3.5 text-xs font-semibold">Módulo ${imp.module}</td>
                                    <td class="p-3.5 font-semibold">${imp.type}</td>
                                    <td class="p-3.5 text-xs">${imp.orderDate}</td>
                                    <td class="p-3.5 text-right font-bold">${imp.qty} ${imp.module === '3' ? 'Unid.' : `Ton <span class="block text-[11px] text-gray-500">${fmtCO2(calcCO2(imp.qty, imp.type))}</span>`}</td>
                                    <td class="p-3.5 text-right">
                                        <button onclick="openReceiptById('${imp.id}', 'company')" class="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700">
                                            Ver Ejemplar Empresa
                                        </button>
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return html;
}
