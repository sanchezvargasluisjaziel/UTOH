/* Comprobante digital con QR y verificador de folio. */

// =========================================================================
// 12. COMPROBANTE DIGITAL BANCARIO CON QR Y ENTREGA DUAL (ADMIN + EMPRESA)
// =========================================================================
window.openReceiptById = function(impId, mode = 'both') {
    const imp = window.appState.imports.find(x => x.id === impId);
    if (!imp) return;

    document.getElementById('rec_tracking_number').innerText = imp.trackingNumber || 'UTOH-2026-M1-000000';
    document.getElementById('rec_company').innerText = imp.company;
    document.getElementById('rec_module').innerText = `Módulo ${imp.module} (AF ${imp.fiscalYear})`;
    document.getElementById('rec_substance').innerText = imp.module === '3' && imp.productDescription
        ? `${imp.type} - ${imp.productDescription}`
        : imp.type;
    document.getElementById('rec_tariff').innerText = imp.tariff || 'S/N';
    document.getElementById('rec_qty').innerText = `${imp.qty} ${imp.module === '3' ? 'Unidades' : 'Toneladas'}`;
    const co2Row = document.getElementById('rec_qty_co2_row');
    co2Row.classList.toggle('hidden', String(imp.module) === '3');
    document.getElementById('rec_qty_co2').innerText = fmtCO2(calcCO2(imp.qty, imp.type));
    document.getElementById('rec_order_date').innerText = `${imp.orderDate} (AF ${imp.fiscalYear})`;
    document.getElementById('rec_arrival_date').innerText = imp.arrivalDate || 'Pendiente';
    document.getElementById('rec_user').innerText = imp.registeredBy || 'Admin 1 (Sistema)';
    document.getElementById('rec_company_recipient').innerText = imp.company;
    document.getElementById('rec_auth_hash').innerText = imp.authCode || generateAuthHash();

    const qBreakdown = document.getElementById('rec_quota_breakdown');
    if (String(imp.module) === '1') {
        qBreakdown.classList.remove('hidden');
        const bal = getQuotaBalance(imp.company, imp.type, imp.fiscalYear);
        document.getElementById('rec_quota_limit').innerText = `${fmtNum(bal.limitTM)} Ton`;
        document.getElementById('rec_quota_used').innerText = `${fmtNum(bal.usedTM)} Ton`;
        document.getElementById('rec_quota_remaining').innerText = `${fmtNum(bal.remTM)} Ton`;
        document.getElementById('rec_quota_limit_co2').innerText = fmtCO2(bal.limitCO2);
        document.getElementById('rec_quota_used_co2').innerText = fmtCO2(bal.usedCO2);
        document.getElementById('rec_quota_remaining_co2').innerText = fmtCO2(bal.remCO2);
    } else {
        qBreakdown.classList.add('hidden');
    }

    // Generar Código QR Oficial
    const qrCanvas = document.getElementById('receipt-qr-canvas');
    if (qrCanvas && window.QRious) {
        new QRious({
            element: qrCanvas,
            value: JSON.stringify({
                folio: imp.trackingNumber,
                empresa: imp.company,
                modulo: imp.module,
                sustancia: imp.type,
                arancel: imp.tariff,
                cantidad: imp.qty,
                tco2eq: calcCO2(imp.qty, imp.type),
                orden: imp.orderDate,
                af: imp.fiscalYear
            }),
            size: 140,
            level: 'M'
        });
    }

    switchReceiptCopyMode(mode);
    document.getElementById('receipt-modal').classList.remove('hidden');
};

window.switchReceiptCopyMode = function(mode) {
    const adminBox = document.getElementById('rec_seal_admin_box');
    const compBox = document.getElementById('rec_seal_company_box');
    const badge = document.getElementById('rec_copy_badge');

    document.getElementById('btn_copy_both').className = mode === 'both' ? 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white' : 'px-2.5 py-1 rounded-md text-[11px] font-semibold text-gray-700 hover:bg-gray-100';
    document.getElementById('btn_copy_admin').className = mode === 'admin' ? 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white' : 'px-2.5 py-1 rounded-md text-[11px] font-semibold text-gray-700 hover:bg-gray-100';
    document.getElementById('btn_copy_company').className = mode === 'company' ? 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white' : 'px-2.5 py-1 rounded-md text-[11px] font-semibold text-gray-700 hover:bg-gray-100';

    if (mode === 'admin') {
        adminBox.classList.remove('hidden');
        compBox.classList.add('hidden');
        badge.innerText = 'EJEMPLAR ADMINISTRADOR';
    } else if (mode === 'company') {
        adminBox.classList.add('hidden');
        compBox.classList.remove('hidden');
        badge.innerText = 'EJEMPLAR EMPRESA IMPORTADORA';
    } else {
        adminBox.classList.remove('hidden');
        compBox.classList.remove('hidden');
        badge.innerText = 'DOBLE EJEMPLAR OFICIAL';
    }
};

window.closeReceiptModal = function() {
    document.getElementById('receipt-modal').classList.add('hidden');
};

window.copyTrackingFolio = function() {
    const text = document.getElementById('rec_tracking_number').innerText;
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`Folio copiado: ${text}`);
};

window.openVerifyFolioModal = function() {
    document.getElementById('verify_folio_input').value = '';
    document.getElementById('verify_folio_result').innerHTML = '';
    document.getElementById('verify-folio-modal').classList.remove('hidden');
};

window.closeVerifyFolioModal = function() {
    document.getElementById('verify-folio-modal').classList.add('hidden');
};

window.verifyTrackingFolio = function() {
    const val = document.getElementById('verify_folio_input').value.trim().toUpperCase();
    const resDiv = document.getElementById('verify_folio_result');
    const found = window.appState.imports.find(i => (i.trackingNumber || '').toUpperCase() === val);
    if (!found) {
        resDiv.innerHTML = `<div class="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-bold">❌ No se encontró ningún movimiento con el folio "${val}".</div>`;
    } else {
        resDiv.innerHTML = `
            <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div class="font-bold text-emerald-900">✓ FOLIO OFICIAL VÁLIDO (${found.trackingNumber})</div>
                <div><b>Empresa:</b> ${found.company}</div>
                <div><b>Sustancia/Equipo:</b> ${found.type} (${found.tariff})</div>
                <div><b>Cantidad:</b> ${found.qty} ${found.module === '3' ? 'Unidades' : 'Ton'} | <b>AF:</b> ${found.fiscalYear}</div>
                <button onclick="closeVerifyFolioModal(); openReceiptById('${found.id}')" class="mt-2 w-full py-1.5 bg-emerald-600 text-white rounded font-bold">Abrir Comprobante Completo</button>
            </div>
        `;
    }
};
