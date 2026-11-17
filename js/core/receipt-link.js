/* Liga del QR del comprobante: codifica los datos en la URL de verificar.html y los decodifica allá.
   Mientras no haya backend, la liga solo transporta los datos: NO prueba que el comprobante sea real.
   Con backend, el QR debe llevar solo el folio y verificar.html debe consultarlo en el servidor. */

window.FOLIO_PATTERN = /^UTOH-\d{4}-M[123]-\d{6}$/;
window.MAX_RECEIPT_PARAM = 2000;

// Texto UTF-8 -> base64url (sin +, / ni =, para que viaje limpio en la URL).
function toBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

// Datos mínimos del comprobante con claves cortas (el QR es más chico y fácil de escanear).
window.encodeReceiptPayload = function(imp) {
    const co2 = String(imp.module) === '3' ? null : calcCO2(imp.qty, imp.type);
    const data = {
        f: imp.trackingNumber,
        e: imp.company,
        m: String(imp.module),
        s: imp.type,
        a: imp.tariff || '',
        q: Number(imp.qty),
        c: co2,
        o: imp.orderDate,
        y: Number(imp.fiscalYear)
    };
    if (String(imp.module) === '3' && imp.productDescription) data.d = imp.productDescription;
    return toBase64Url(JSON.stringify(data));
};

// Devuelve el objeto del comprobante o null si el parámetro no tiene la forma esperada.
// Los datos vienen de la URL: se tratan como no confiables y solo se muestran con textContent.
window.decodeReceiptPayload = function(param) {
    if (typeof param !== 'string' || param.length === 0 || param.length > window.MAX_RECEIPT_PARAM) return null;
    if (!/^[A-Za-z0-9_-]+$/.test(param)) return null;
    let data;
    try {
        data = JSON.parse(fromBase64Url(param));
    } catch (err) {
        return null;
    }
    if (!data || typeof data !== 'object') return null;
    const isStr = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;
    if (!isStr(data.f, 40) || !window.FOLIO_PATTERN.test(data.f)) return null;
    if (!isStr(data.e, 120) || !isStr(data.s, 200)) return null;
    if (!['1', '2', '3'].includes(data.m)) return null;
    if (data.f.split('-')[2] !== 'M' + data.m) return null;
    if (typeof data.a !== 'string' || data.a.length > 40) return null;
    if (typeof data.q !== 'number' || !isFinite(data.q) || data.q <= 0) return null;
    if (data.c !== null && (typeof data.c !== 'number' || !isFinite(data.c))) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.o || '')) return null;
    if (!Number.isInteger(data.y) || data.y < 2000 || data.y > 2100) return null;
    if (data.d !== undefined && (typeof data.d !== 'string' || data.d.length > 200)) return null;
    return {
        folio: data.f, company: data.e, module: data.m, type: data.s, tariff: data.a,
        qty: data.q, co2: data.c, orderDate: data.o, fiscalYear: data.y, description: data.d || ''
    };
};

// URL de verificar.html junto a la página actual (sirve igual en GitHub Pages o en un servidor local).
window.buildVerifyUrl = function(imp) {
    const url = new URL('verificar.html', window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('d', encodeReceiptPayload(imp));
    return url.toString();
};
