/* Datos de demostración (empresas, cuotas, importaciones). */

window.DEMO_COMPANIES = [
    {
        id: "c1",
        name: "FrioMax S.A.",
        modules: ["1", "2"],
        allowedSubstances: ["R-22", "R-410A", "R-134a", "R-600a (Isobutano)"]
    },
    {
        id: "c2",
        name: "EcoGas Honduras",
        modules: ["2"],
        allowedSubstances: ["R-600a (Isobutano)", "R-290 (Propano licuado)", "R-1234yf"]
    },
    {
        id: "c3",
        name: "ClimaCorp Equipos S.A.",
        modules: ["3"],
        allowedSubstances: [
            "Equipos de aire acondicionado tipo Split System",
            "Muebles refrigerados para la exposición de productos"
        ]
    }
];

window.DEMO_QUOTAS = [
    { id: "q1", company: "FrioMax S.A.", substance: "R-22", limit: 500, year: 2026 },
    { id: "q2", company: "FrioMax S.A.", substance: "R-410A", limit: 800, year: 2026 },
    { id: "q3", company: "FrioMax S.A.", substance: "R-134a", limit: 450, year: 2026 }
];

window.DEMO_IMPORTS = [
    { id: "imp1", module: "1", company: "FrioMax S.A.", type: "R-22", tariff: "2903.71.00.00", qty: 120, orderDate: "2026-11-15", arrivalDate: "2026-12-04", fiscalYear: 2026, trackingNumber: "UTOH-2026-M1-849201", authCode: "9F8A-44B1-C092-UTOH-7731", registeredBy: "Admin 1 (Sistema)", registeredAt: "2026-11-15T10:30:00", deliveredToAdmin: true, deliveredToCompany: true },
    { id: "imp2", module: "1", company: "FrioMax S.A.", type: "R-410A", tariff: "3827.63.00.00", qty: 300, orderDate: "2026-12-28", arrivalDate: "2027-01-11", fiscalYear: 2026, trackingNumber: "UTOH-2026-M1-592044", authCode: "3D7E-91A0-B842-UTOH-1109", registeredBy: "Admin 2 (Aduana)", registeredAt: "2026-12-28T14:15:00", deliveredToAdmin: true, deliveredToCompany: true },
    { id: "imp3", module: "2", company: "EcoGas Honduras", type: "R-600a (Isobutano)", tariff: "2901.10.00.00", qty: 45, orderDate: "2026-05-10", arrivalDate: "2026-05-28", fiscalYear: 2026, trackingNumber: "UTOH-2026-M2-310982", authCode: "7C1B-28F4-E650-UTOH-4920", registeredBy: "Admin 1 (Sistema)", registeredAt: "2026-05-10T09:05:00", deliveredToAdmin: true, deliveredToCompany: true },
    { id: "imp4", module: "3", company: "ClimaCorp Equipos S.A.", type: "Equipos de aire acondicionado tipo Split System", productDescription: "Minisplit Inverter 18,000 BTU", contained: "R-410A", regStatus: "Regulado (Protocolo Montreal)", tariff: "8415.10.00.00", qty: 150, orderDate: "2026-06-20", arrivalDate: "2026-07-05", fiscalYear: 2026, trackingNumber: "UTOH-2026-M3-774190", authCode: "6A9D-53C2-F118-UTOH-8834", registeredBy: "Admin 3 (Auditor)", registeredAt: "2026-06-20T16:40:00", deliveredToAdmin: true, deliveredToCompany: true }
];
