import type { RacineEtudeLocale } from "../../core5e/etudeLocale.types";
import type { ExerciceEtudierFonction } from "../../core5e/etudierFonction.types";
import { construireSvgFonction, type PointMarqueSvg } from "../../../export/svgGraph";
import { formatLimiteCibleLatex, formatOrdonneeLatex } from "../../ui5e/formatEtudierFonction";
import { libelleLigne2Tableau, radicalSimplifieLatex } from "../../ui5e/formatEtudeLocale";
import { calculerViewBoxEtudierFonction } from "../../ui5e/etudierFonctionCourbe";
import { decalageVertical, exclusionsCE, listeSlotsLimites, pointsClesEtudierFonction, racinesFPrime, racinesFSeconde, typeAsymptotique, valeurF } from "../../moteur5e/verificationEtudierFonction";
import type { TableauEtudeLocaleAttendu } from "../../moteur5e/verificationEtudeLocale";

/**
 * Figures du corrigé de 5gen31 (étudier une fonction), sorties de l'adaptateur pour être importées
 * SANS `docx` par le corrigé détaillé (`corrigeDetaille.ts`), donc aussi par `App5gen31.tsx` :
 * tableaux de signes de f′ et de f″ (HTML) et graphique (courbe, asymptotes, points remarquables).
 */

/** Équations des asymptotes (verticales, puis horizontale ou oblique). */
export function asymptotesLatex(exercice: ExerciceEtudierFonction): string[] {
  const out = exclusionsCE(exercice).map((x) => `x=${formatOrdonneeLatex(x)}`);
  for (const slot of listeSlotsLimites(exercice)) {
    if (slot.kind === "infiniHorizontale") out.push(`y=${formatOrdonneeLatex(slot.valeur)}`);
    if (slot.kind === "infiniOblique") out.push(`y=${formatLimiteCibleLatex(slot)}`);
  }
  return out;
}

/** Racine en texte simple (en-têtes des tableaux HTML du corrigé) : « 1/2 », « 1 − √2 ». */
export function racineTexte(r: RacineEtudeLocale): string {
  const moins = (s: string) => s.replace(/-/g, "−");
  if (r.exact) return moins(r.valeur.den === 1 ? `${r.valeur.num}` : `${r.valeur.num}/${r.valeur.den}`);
  const racine = radicalSimplifieLatex(1, r.radicande).replace(/\\sqrt\{(\d+)\}/, "√$1");
  if (r.centre === 0) return r.signe < 0 ? `−${racine}` : racine;
  return `${moins(`${r.centre}`)} ${r.signe < 0 ? "−" : "+"} ${racine}`;
}

export function nombreTexte(v: number): string {
  return formatOrdonneeLatex(v).replace("{,}", ",").replace(/-/g, "−");
}

// ============================================================================
// Figures du corrigé : tableaux de signes (HTML) et graphique (SVG).
// ============================================================================

const STYLE_TABLE = 'style="border-collapse:collapse;margin:4px 0;font-size:13px;font-family:Archivo, Arial, Helvetica, sans-serif"';
const STYLE_CASE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:center;min-width:22px"';
const STYLE_ENTETE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:left;background:#f1f3f5;font-style:italic"';

export function tableauHtml(exercice: ExerciceEtudierFonction, attendu: TableauEtudeLocaleAttendu, mode: "fprime" | "fseconde"): string {
  const racines = mode === "fprime" ? racinesFPrime(exercice) : racinesFSeconde(exercice);
  const exclusions = exclusionsCE(exercice);
  const entetes = attendu.colonnes.map((c) => (c.type === "racine" ? racineTexte(racines[c.index]) : c.type === "exclusion" ? nombreTexte(exclusions[c.index]) : ""));
  const ligne2 = attendu.ligne2.map((v, j) => {
    if (attendu.colonnes[j].type === "exclusion") return "‖";
    const t = libelleLigne2Tableau(v);
    return t === "PI" ? "point d'inflexion" : t === "pas de PI" ? "pas d'inflexion" : t;
  });
  const signes = attendu.signes.map((s) => (s === "-" ? "−" : s));
  const cases = (valeurs: string[]) => valeurs.map((v) => `<td ${STYLE_CASE}>${v}</td>`).join("");
  const ligne = (titre: string, valeurs: string[], bords: [string, string]) => `<tr><td ${STYLE_ENTETE}>${titre}</td><td ${STYLE_CASE}>${bords[0]}</td>${cases(valeurs)}<td ${STYLE_CASE}>${bords[1]}</td></tr>`;
  const titreSigne = mode === "fprime" ? "f′(x)" : "f″(x)";
  const titreLigne2 = mode === "fprime" ? "f" : "concavité de f";
  return `<table ${STYLE_TABLE}><tbody>${ligne("x", entetes, ["−∞", "+∞"])}${ligne(titreSigne, signes, ["", ""])}${ligne(titreLigne2, ligne2, ["", ""])}</tbody></table>`;
}

const COULEUR_COURBE = "#1971c2";
const COULEUR_ASYMPTOTE = "#c92a2a";
const LARGEUR_SVG = 360;
const HAUTEUR_SVG = 260;
const MARGE_SVG = 10;

function texteSvg(x: number, y: number, contenu: string, ancre: "start" | "end" | "middle", couleur: string): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="10" fill="${couleur}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

export function construireSvgEtudierFonction(exercice: ExerciceEtudierFonction): string {
  const vbEcran = calculerViewBoxEtudierFonction(exercice);
  const vb = { xMin: vbEcran.x[0], xMax: vbEcran.x[1], yMin: vbEcran.y[0], yMax: vbEcran.y[1] };
  const etendue = vb.yMax - vb.yMin;
  const exclusions = exclusionsCE(exercice);
  const evaluer = (x: number): number | null => {
    if (exclusions.some((e) => Math.abs(x - e) < 1e-6)) return null;
    const y = valeurF(exercice, x);
    return Number.isFinite(y) && y > vb.yMin - 6 * etendue && y < vb.yMax + 6 * etendue ? y : null;
  };
  const type = typeAsymptotique(exercice);
  const slots = listeSlotsLimites(exercice);
  const oblique = slots.find((s) => s.kind === "infiniOblique");
  const droite =
    type === "horizontale"
      ? (_x: number) => decalageVertical(exercice)
      : oblique && oblique.kind === "infiniOblique"
        ? (x: number) => oblique.pente * x + oblique.ordonnee
        : null;
  const points: PointMarqueSvg[] = pointsClesEtudierFonction(exercice).map((p, i) => ({
    x: p.x,
    y: p.y,
    label: `(${p.racine ? racineTexte(p.racine) : nombreTexte(p.x)} ; ${nombreTexte(p.y)})`,
    couleur: COULEUR_COURBE,
    labelPosition: i % 2 === 0 ? "dessus" : "dessous",
  }));
  const svg = construireSvgFonction(evaluer, vb, {
    largeur: LARGEUR_SVG,
    hauteur: HAUTEUR_SVG,
    couleurCourbe: COULEUR_COURBE,
    classe: "figure-corrige",
    points,
    courbesSecondaires: droite ? [{ evaluer: droite, couleur: COULEUR_ASYMPTOTE, pointilles: true }] : undefined,
    legende: [{ texte: "courbe de f", couleur: COULEUR_COURBE }, ...(droite || exclusions.length > 0 ? [{ texte: "asymptotes", couleur: COULEUR_ASYMPTOTE, pointilles: true }] : [])],
  });
  const zoneX = LARGEUR_SVG - 2 * MARGE_SVG;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - vb.xMin) / (vb.xMax - vb.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((vb.yMax - y) / (vb.yMax - vb.yMin)) * zoneY;
  const ajouts: string[] = [];
  // Raccord fin près de chaque asymptote verticale (240 échantillons ne suffisent pas près d'un pôle).
  const pas = (vb.xMax - vb.xMin) / 240;
  const borne = (y: number) => Math.min(Math.max(y, vb.yMin - etendue), vb.yMax + etendue);
  for (const e of exclusions) {
    for (const cote of [-1, 1]) {
      const pts: string[] = [];
      for (let d = 1.5 * pas; d > 1e-7; d *= 0.8) {
        const y = valeurF(exercice, e + cote * d);
        if (!Number.isFinite(y)) break;
        pts.push(`${sx(e + cote * d).toFixed(1)},${sy(borne(y)).toFixed(1)}`);
        if (y < vb.yMin - etendue || y > vb.yMax + etendue) break;
      }
      if (pts.length > 1) ajouts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`);
    }
    const X = sx(e);
    ajouts.push(`<line x1="${X.toFixed(1)}" y1="${MARGE_SVG}" x2="${X.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_SVG}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
    ajouts.push(texteSvg(X + 4, HAUTEUR_SVG - MARGE_SVG - 6, `x = ${nombreTexte(e)}`, "start", COULEUR_ASYMPTOTE));
  }
  if (droite) {
    const xe = vb.xMax - (vb.xMax - vb.xMin) * 0.03;
    const ye = Math.min(Math.max(droite(xe), vb.yMin + etendue * 0.06), vb.yMax - etendue * 0.06);
    const eq = asymptotesLatex(exercice)
      .filter((a) => a.startsWith("y="))
      .map((a) => a.replace("y=", "y = ").replace(/\{,\}/g, ",").replace(/-/g, "−"))[0];
    const fe = valeurF(exercice, xe);
    const courbeAuDessus = Number.isFinite(fe) && fe > droite(xe);
    if (eq) ajouts.push(texteSvg(sx(xe), sy(ye) + (courbeAuDessus ? 14 : -6), eq, "end", COULEUR_ASYMPTOTE));
  }
  return svg.replace("</svg>", `${ajouts.join("")}</svg>`);
}

