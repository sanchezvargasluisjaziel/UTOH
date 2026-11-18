/* Potenciales de Calentamiento Global (PCG, 100 años) de las sustancias sujetas a cuota.
   Fuente: archivo "PCG_sustancias_UTOH_Honduras.xlsx" enviado por el compañero (16-nov-2026), basado en la
   Disposición Administrativa ADUANAS-GNGTNA-SA-076-2025 e IPCC AR4. La clave es el id del catálogo (sN = fila N).
   pending = true: celda en amarillo en el Excel, falta confirmar con Honduras (gwp null = "Preguntar"). */

window.OFFICIAL_PCG = {
    s4: { gwp: 1810, pending: false, ref: "AR4 (100 años)", note: "" }, // R-22
    s5: { gwp: null, pending: true, ref: "", note: "Pendiente de confirmar con Honduras" }, // R-141a
    s6: { gwp: 725, pending: false, ref: "AR4 (100 años)", note: "" }, // R-141b
    s7: { gwp: 1182, pending: false, ref: "AR4 (100 años)", note: "" }, // R-401 (MP-39)
    s8: { gwp: 1585, pending: false, ref: "AR4 (100 años)", note: "" }, // R-409A
    s9: { gwp: 2053, pending: false, ref: "AR4 (100 años)", note: "" }, // R-413 (MO49)
    s10: { gwp: 1478, pending: false, ref: "AR4 (100 años)", note: "" }, // R-414A
    s11: { gwp: 1362, pending: false, ref: "AR4 (100 años)", note: "" }, // R-414B
    s12: { gwp: 77, pending: false, ref: "AR4 (100 años)", note: "" }, // R-123
    s13: { gwp: 2088, pending: false, ref: "AR4 (100 años)", note: "" }, // R-410A
    s14: { gwp: 2729, pending: false, ref: "AR4 (100 años)", note: "" }, // HFC R-422D
    s15: { gwp: 1430, pending: false, ref: "AR4 (100 años)", note: "" }, // R-134a
    s16: { gwp: 3922, pending: false, ref: "AR4 (100 años)", note: "" }, // R-404A
    s17: { gwp: 2107, pending: false, ref: "AR4 (100 años)", note: "" }, // R-407A
    s18: { gwp: 1774, pending: false, ref: "AR4 (100 años)", note: "" }, // R-407C
    s19: { gwp: 124, pending: false, ref: "AR4 (100 años)", note: "" }, // R-152a
    s20: { gwp: 3500, pending: false, ref: "AR4 (100 años)", note: "" }, // R-125
    s21: { gwp: 3985, pending: false, ref: "AR4 (100 años)", note: "" }, // R-507A
    s22: { gwp: 3220, pending: false, ref: "AR4 (100 años)", note: "" }, // R-227ea
    s23: { gwp: 2346, pending: false, ref: "AR4 (100 años)", note: "" }, // R-417A
    s25: { gwp: 1809, pending: false, ref: "AR4 (100 años)", note: "" }, // R-417C
    s27: { gwp: 3985, pending: false, ref: "AR4 (100 años)", note: "" }, // R-507
    s28: { gwp: 3985, pending: false, ref: "AR4 (100 años)", note: "" }, // R-507C
    s29: { gwp: 3985, pending: true, ref: "Ver observación", note: "Valor por confirmar con Honduras" }, // R-507F
    s30: { gwp: 2, pending: false, ref: "Ver observación", note: "" }, // OPTEON XP 30 (R-514A)
    s31: { gwp: null, pending: true, ref: "Ver observación", note: "Debe ser R-223ca o cb. Pendiente de confirmar con Honduras" }, // HFC-223R
    s32: { gwp: 2, pending: false, ref: "Ver observación", note: "" }, // Bromuro de Metilo
    s37: { gwp: null, pending: true, ref: "Ver observación", note: "Composición. Pendiente de confirmar con Honduras" }, // Poliol Premezclado con R-141b
    s38: { gwp: null, pending: true, ref: "Ver observación", note: "Composición. Pendiente de confirmar con Honduras" }, // R-134a Poliuretano Espuma
    s39: { gwp: null, pending: true, ref: "Ver observación", note: "Composición. Pendiente de confirmar con Honduras" }, // Poliol Premezclado con R-134a
    s40: { gwp: null, pending: true, ref: "Ver observación", note: "Composición. Pendiente de confirmar con Honduras" }, // Poliol Premezclado con HFC 365 mfc
    s43: { gwp: null, pending: true, ref: "Ver observación", note: "Composición. Pendiente de confirmar con Honduras" }, // Poliol Premezclado a base de HFC (932r-x)
    s47: { gwp: 1430, pending: true, ref: "Ver observación", note: "Typo, es 134a. Valor por confirmar con Honduras" }, // TETRAFLUORETANO R-14
    s48: { gwp: 964, pending: false, ref: "AR4 calculado", note: "" }, // PENTAFLUORETANO SOLKANE R-365/R-227/93/7
    s49: { gwp: 3010, pending: true, ref: "Ver observación", note: "se cuenta sólo la parte de HFC. Valor por confirmar con Honduras" }, // FREON MO89
    s58: { gwp: 2310, pending: false, ref: "AR4 (100 años)", note: "" }, // R-142b
    s59: { gwp: 14800, pending: false, ref: "AR4 (100 años)", note: "" }, // R-23
    s60: { gwp: 675, pending: false, ref: "AR4 (100 años)", note: "" }, // R-32
    s61: { gwp: 1100, pending: false, ref: "AR4 (100 años)", note: "" }, // R-134
    s62: { gwp: 1340, pending: false, ref: "AR4 (100 años)", note: "" }, // R-236cb
    s63: { gwp: 1370, pending: false, ref: "AR4 (100 años)", note: "" }, // R-236ea
    s64: { gwp: 693, pending: false, ref: "AR4 (100 años)", note: "" }, // R-245ca
    s65: { gwp: 1640, pending: false, ref: "AR4 (100 años)", note: "" }, // R43-10mee
    s66: { gwp: 794, pending: false, ref: "AR4 (100 años)", note: "" }, // R-365mfc
    s69: { gwp: 2804, pending: false, ref: "AR4 (100 años)", note: "" }, // R-407B
};
