/* Vista: Registro de Auditoría. */

function renderAudit() {
    return `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Registro de Auditoría de Administradores</h2>
            <p class="text-sm text-gray-500">Bitácora en tiempo real de quién ha modificado cuotas, empresas o importaciones.</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b text-xs uppercase text-gray-500">
                        <th class="p-3.5">Fecha / Hora</th>
                        <th class="p-3.5">Usuario / Administrador</th>
                        <th class="p-3.5">Módulo</th>
                        <th class="p-3.5">Movimiento Registrado</th>
                    </tr>
                </thead>
                <tbody class="divide-y text-sm">
                    ${window.appState.auditLogs.map(a => `
                        <tr>
                            <td class="p-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">${a.timestamp}</td>
                            <td class="p-3.5 font-bold text-indigo-700 whitespace-nowrap">${a.user}</td>
                            <td class="p-3.5 text-xs font-semibold">${a.module}</td>
                            <td class="p-3.5 text-xs text-gray-700">${a.action}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
