import type { Comb, ExerciceTangentesLog } from "../core6e/tangentesLogarithmiques.types";
import { valeur } from "../generateurs6e/tangentesLogarithmiques/exact";
import { COULEURS, repereSvg } from "./figureRepereIntegrales";
import type { CourbeRepere, PointRepere } from "./figureRepereIntegrales";

/**
 * Figures de `6gen87` — chaînes SVG autonomes (écran et `figureHtml` du corrigé papier), repère
 * commun du chapitre 4 (`figureRepereIntegrales.ts`, axes fléchés, couleurs du thème avec repli).
 *
 * - Pendant l'exercice (`avecTangentes: false`) : la courbe seule, plus la droite d (variante
 *   `parallele`) ou le point P (variante `origine`) — jamais la tangente ni le point de contact.
 * - Fin de l'exercice et corrigé (`avecTangentes: true`) : la ou les tangentes et les points de
 *   contact, graduations aux abscisses de contact.
 */

/** Écriture Unicode courte d'une abscisse exacte (graduations SVG) : « e² », « 1/e », « √e », « 2e ». */
function texteAbscisse(c: Comb): string {
  if (c.length === 0) return "0";
  const t = c[0];
  const sup: Record<string, string> = { "2": "²", "3": "³", "4": "⁴" };
  const L = t.atome.latex.replace(/e\^\{(\d)\}/, (_, k: string) => `e${sup[k] ?? `^${k}`}`).replace("\\sqrt{e}", "√e");
  const n = Math.abs(t.n);
  const signe = t.n < 0 ? "−" : "";
  if (t.atome.position === "den") return `${signe}${n}/${t.d === 1 ? "" : t.d}${L}`;
  if (L === "") return t.d === 1 ? `${signe}${n}` : `${signe}${n}/${t.d}`;
  return `${signe}${n === 1 ? "" : n}${L}${t.d === 1 ? "" : `/${t.d}`}`;
}

function fenetre(e: ExerciceTangentesLog): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const f = e.fonction;
  const xs = e.contacts.map((c) => valeur(c.x0));
  if (e.variante === "origine") xs.push(0);
  let lo = Math.min(...xs);
  let hi = Math.max(...xs);
  if (f.borneGauche !== null) lo = Math.min(lo, f.borneGauche);
  if (f.borneDroite !== null) hi = Math.max(hi, f.borneDroite);
  const span = Math.max(hi - lo, 2.5);
  let xMin = lo - 0.25 * span;
  let xMax = hi + 0.35 * span;
  if (xMin > 0 && xMin < span) xMin = -0.12 * span;
  if (xMax < 0 && xMax > -span) xMax = 0.12 * span;
  // Hauteur : f loin des bords du domaine (ln → −∞), points de contact, P.
  const de = f.borneGauche !== null ? Math.max(xMin, f.borneGauche + 0.15 * span) : xMin;
  const a = f.borneDroite !== null ? Math.min(xMax, f.borneDroite - 0.15 * span) : xMax;
  const ys: number[] = [0];
  for (let i = 0; i <= 160; i++) {
    const y = f.fn(de + ((a - de) * i) / 160);
    if (Number.isFinite(y)) ys.push(y);
  }
  for (const c of e.contacts) ys.push(valeur(c.fx0));
  if (e.variante === "origine") ys.push(valeur(e.pP));
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const ecart = Math.max(max - min, 2);
  return { xMin, xMax, yMin: min - 0.15 * ecart, yMax: max + 0.18 * ecart };
}

export function figureTangentesSvg(e: ExerciceTangentesLog, avecTangentes: boolean): string {
  const { xMin, xMax, yMin, yMax } = fenetre(e);
  const f = e.fonction;
  const courbes: CourbeRepere[] = [{ fn: f.fn, de: xMin, a: xMax, couleur: COULEURS.accent, etiquette: "f" }];
  const points: PointRepere[] = [];
  if (e.variante === "parallele") {
    const m = valeur(e.m);
    courbes.push({ fn: (x) => m * x + e.h, de: xMin, a: xMax, couleur: COULEURS.pale, pointilles: true, epaisseur: 1.4, etiquette: "d" });
  }
  if (e.variante === "origine") points.push({ x: 0, y: valeur(e.pP), etiquette: "P", couleur: COULEURS.encre, position: "gauche" });
  const graduationsX: { x: number; etiquette: string }[] = [];
  if (avecTangentes) {
    e.contacts.forEach((c, i) => {
      const m = valeur(c.m);
      const p = valeur(c.p);
      const x0 = valeur(c.x0);
      const nom = e.contacts.length > 1 ? `T${i === 0 ? "₁" : "₂"}` : "T";
      courbes.push({ fn: (x) => m * x + p, de: xMin, a: xMax, couleur: COULEURS.ciel, epaisseur: 1.6, etiquette: nom });
      points.push({ x: x0, y: valeur(c.fx0), couleur: COULEURS.ciel });
      if (Math.abs(x0) > 1e-9) graduationsX.push({ x: x0, etiquette: texteAbscisse(c.x0) });
    });
  }
  const libelle = avecTangentes ? "Courbe de f et tangente(s) demandée(s)" : "Courbe de f";
  return repereSvg({ xMin, xMax, yMin, yMax, courbes, points, graduationsX, libelle });
}
