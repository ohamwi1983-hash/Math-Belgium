import { nombreFr, nombreFrLatex } from "./nombreFr";

/**
 * Écriture des nombres de gen111 : virgule décimale (`nombreFr`), et espace des milliers à partir
 * de 10 000 (« 12 000 ») — en dessous, quatre chiffres restent collés (« 1080 »), usage courant.
 */
export function nombreAffiche(v: number): string {
  const t = nombreFr(v);
  if (Math.abs(v) < 10000) return t;
  const [ent, dec] = t.split(",");
  const groupe = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${groupe},${dec}` : groupe;
}

export function nombreLatex(v: number): string {
  const t = nombreFrLatex(v);
  if (Math.abs(v) < 10000) return t;
  const [ent, dec] = t.split("{,}");
  const groupe = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
  return dec ? `${groupe}{,}${dec}` : groupe;
}
