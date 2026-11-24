import type { ExerciceLectureGraphiqueDerivees } from "../../core5e/lectureGraphiqueDerivees.types";
import { calculerViewBoxLectureGraphiqueDerivees, construireMarqueursPointIsole, construireSegmentsDerivees } from "../../ui5e/lectureGraphiqueDeriveesCourbe";
import { pointsTangenteHorizontale } from "../../moteur5e/verificationLectureGraphiqueDerivees";

/**
 * Graphique de 5gen30 (énoncé ET corrigé annoté), sorti de l'adaptateur (qui importe `docx`) pour être
 * partagé avec le corrigé détaillé (`corrigeDetaille.ts`, importé par l'appli). Mêmes morceaux de courbe
 * que l'écran (`construireSegmentsDerivees`), quadrillage d'une unité.
 */

// ============================================================================
// Graphique (énoncé et corrigé).
// ============================================================================

const LARGEUR = 440;
const MARGE = 22;
const COULEUR_COURBE = "#1971c2";
const COULEUR_GRILLE = "#e3e7ec";
const COULEUR_GRILLE_FORTE = "#c5ccd5";
const COULEUR_AXE = "#495057";
const COULEUR_ANNOTATION = "#9a3b12";
// Asymptotes : couleur distincte de l'axe, pour qu'une asymptote confondue avec un axe (x = 0, y = 0)
// reste visible (pointillés tracés par-dessus l'axe).
const COULEUR_ASYMPTOTE = "#c2410c";
let compteurSvg = 0;

/** Nombre écrit dans le SVG : virgule décimale et vrai signe moins. */
function nombreSvg(v: number): string {
  const r = Math.round(v * 10) / 10;
  return String(Object.is(r, -0) ? 0 : r).replace(".", ",").replace("-", "−");
}

function droiteSvg(pente: number, ordonnee: number): string {
  const p = pente === 1 ? "x" : pente === -1 ? "−x" : `${nombreSvg(pente)}x`;
  return ordonnee === 0 ? p : `${p} ${ordonnee < 0 ? "−" : "+"} ${nombreSvg(Math.abs(ordonnee))}`;
}

function etiquette(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end", couleur = COULEUR_ANNOTATION): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="10" font-weight="bold" fill="${couleur}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="3" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

export function svgLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees, annoter: boolean): string {
  const vb = calculerViewBoxLectureGraphiqueDerivees(exercice);
  const [xMin, xMax] = vb.x;
  const [yMin, yMax] = vb.y;
  const ux = (LARGEUR - 2 * MARGE) / (xMax - xMin);
  const uy = Math.min(22, Math.max(14, 300 / (yMax - yMin)));
  const hauteur = Math.round((yMax - yMin) * uy + 2 * MARGE);
  const sx = (x: number) => MARGE + (x - xMin) * ux;
  const sy = (y: number) => MARGE + (yMax - y) * uy;
  const id = `clip-lgd-${++compteurSvg}`;
  const pasLabelY = yMax - yMin > 12 ? 2 : 1;

  const grille: string[] = [];
  const labels: string[] = [];
  for (let v = Math.ceil(xMin); v <= xMax; v++) {
    const forte = v % 2 === 0;
    grille.push(`<line x1="${sx(v).toFixed(1)}" y1="${MARGE}" x2="${sx(v).toFixed(1)}" y2="${hauteur - MARGE}" stroke="${forte ? COULEUR_GRILLE_FORTE : COULEUR_GRILLE}" stroke-width="${forte ? 0.8 : 0.6}"/>`);
    if (forte && v !== 0) labels.push(`<text x="${sx(v).toFixed(1)}" y="${(sy(0) + 12).toFixed(1)}" font-size="9" text-anchor="middle" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke">${nombreSvg(v)}</text>`);
  }
  for (let v = Math.ceil(yMin); v <= yMax; v++) {
    const forte = v % pasLabelY === 0;
    grille.push(`<line x1="${MARGE}" y1="${sy(v).toFixed(1)}" x2="${LARGEUR - MARGE}" y2="${sy(v).toFixed(1)}" stroke="${forte && pasLabelY === 2 ? COULEUR_GRILLE_FORTE : COULEUR_GRILLE}" stroke-width="0.6"/>`);
    if (forte && v !== 0) labels.push(`<text x="${(sx(0) - 5).toFixed(1)}" y="${(sy(v) + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke">${nombreSvg(v)}</text>`);
  }
  const fleche = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.3" marker-end="url(#${id}-fleche)"/>`;
  const axes = fleche(MARGE - 4, sy(0), LARGEUR - MARGE + 8, sy(0)) + fleche(sx(0), hauteur - MARGE + 4, sx(0), MARGE - 8);
  const nomsAxes =
    `<text x="${LARGEUR - MARGE + 6}" y="${(sy(0) - 6).toFixed(1)}" font-size="10" font-style="italic" text-anchor="end" fill="${COULEUR_AXE}">x</text>` +
    `<text x="${(sx(0) + 6).toFixed(1)}" y="${MARGE - 2}" font-size="10" font-style="italic" fill="${COULEUR_AXE}">y</text>`;

  // Courbe : une branche par domaine, prolongée jusqu'au bord VISIBLE près d'une AV (même fonction
  // que l'écran), découpée au cadre par un clipPath.
  const chemins = construireSegmentsDerivees(exercice, xMin, xMax, [yMin, yMax])
    .map((seg) => {
      const [lo, hi] = seg.domaine;
      const n = 400;
      const pts: string[] = [];
      for (let i = 0; i <= n; i++) {
        const x = lo + ((hi - lo) * i) / n;
        const y = seg.evaluer(x);
        if (!Number.isFinite(y)) continue;
        const yBorne = Math.max(yMin - 2, Math.min(yMax + 2, y));
        pts.push(`${sx(x).toFixed(1)},${sy(yBorne).toFixed(1)}`);
      }
      return pts.length > 1 ? `<path d="M ${pts.join(" L ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linejoin="round" clip-path="url(#${id})"/>` : "";
    })
    .join("");

  const ligne = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${sx(x1).toFixed(1)}" y1="${sy(y1).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.4" stroke-dasharray="5 4" clip-path="url(#${id})"/>`;
  const asymptotes: string[] = exercice.asymptotique.vas.map((va) => ligne(va.position, yMin, va.position, yMax));
  const { infini } = exercice.asymptotique;
  if (infini.type === "horizontale") {
    const valeurs = infini.limitePlusInfini === infini.limiteMoinsInfini ? [infini.limitePlusInfini] : [infini.limitePlusInfini, infini.limiteMoinsInfini];
    for (const y of valeurs) asymptotes.push(ligne(xMin, y, xMax, y));
  } else if (infini.type === "oblique") {
    asymptotes.push(ligne(xMin, infini.pente * xMin + infini.ordonnee, xMax, infini.pente * xMax + infini.ordonnee));
  }

  const pointsIsoles = construireMarqueursPointIsole(exercice)
    .map((m) => `<circle cx="${sx(m.x).toFixed(1)}" cy="${sy(m.y).toFixed(1)}" r="3.6" fill="${COULEUR_COURBE}"/>`)
    .join("");

  const annotations: string[] = [];
  if (annoter) {
    exercice.asymptotique.vas.forEach((va, i) => {
      const X = sx(va.position);
      const aGauche = X > LARGEUR - 70;
      annotations.push(etiquette(aGauche ? X - 4 : X + 4, MARGE + 12 + 13 * i, `x = ${nombreSvg(va.position)}`, aGauche ? "end" : "start"));
    });
    if (infini.type === "horizontale") {
      const memes = infini.limitePlusInfini === infini.limiteMoinsInfini;
      annotations.push(etiquette(LARGEUR - MARGE - 3, sy(infini.limitePlusInfini) - 5, `y = ${nombreSvg(infini.limitePlusInfini)}${memes ? "" : " (en +∞)"}`, "end"));
      if (!memes) annotations.push(etiquette(MARGE + 3, sy(infini.limiteMoinsInfini) - 5, `y = ${nombreSvg(infini.limiteMoinsInfini)} (en −∞)`, "start"));
    } else if (infini.type === "oblique") {
      const xL = xMin + 0.82 * (xMax - xMin);
      const yL = Math.min(Math.max(infini.pente * xL + infini.ordonnee, yMin + 1), yMax - 1);
      annotations.push(etiquette(sx(xL), sy(yL) + (infini.pente > 0 ? 14 : -7), `y = ${droiteSvg(infini.pente, infini.ordonnee)}`, "middle"));
    }
    for (const p of pointsTangenteHorizontale(exercice)) {
      const nom = p.classification === "max" ? "max" : p.classification === "min" ? "min" : "palier";
      const dessus = p.classification !== "min";
      annotations.push(`<circle cx="${sx(p.position).toFixed(1)}" cy="${sy(p.valeur).toFixed(1)}" r="3.4" fill="${COULEUR_ANNOTATION}"/>`);
      // Près de l'axe des ordonnées, l'étiquette part sur le côté (elle masquerait les graduations).
      const presAxe = Math.abs(sx(p.position) - sx(0)) < 45;
      const ancre = presAxe ? (p.position >= 0 ? "start" : "end") : "middle";
      const dx = presAxe ? (p.position >= 0 ? 6 : -6) : 0;
      annotations.push(etiquette(sx(p.position) + dx, sy(p.valeur) + (dessus ? -8 : 16), `${nom} (${nombreSvg(p.position)} ; ${nombreSvg(p.valeur)})`, ancre));
    }
    const positionsPaliers = exercice.paliers.map((p) => p.position);
    for (const pi of exercice.inflexions) {
      if (positionsPaliers.some((x) => Math.abs(x - pi.position) < 1e-6)) continue;
      const X = sx(pi.position);
      const Y = sy(pi.valeur);
      annotations.push(`<rect x="${(X - 3.2).toFixed(1)}" y="${(Y - 3.2).toFixed(1)}" width="6.4" height="6.4" fill="#ffffff" stroke="${COULEUR_ANNOTATION}" stroke-width="1.6"/>`);
      annotations.push(etiquette(X + 7, Y + 4, `PI x ≈ ${nombreSvg(pi.position)}`, "start"));
    }
  }

  return `<svg class="${annoter ? "figure-corrige" : "graphe-derivees"}" width="${LARGEUR}" height="${hauteur}" viewBox="0 0 ${LARGEUR} ${hauteur}" xmlns="http://www.w3.org/2000/svg" style="display:block;max-width:100%;height:auto;margin:0.4em auto">
<defs><clipPath id="${id}"><rect x="${MARGE}" y="${MARGE}" width="${LARGEUR - 2 * MARGE}" height="${hauteur - 2 * MARGE}"/></clipPath><marker id="${id}-fleche" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${COULEUR_AXE}"/></marker></defs>
<rect x="0" y="0" width="${LARGEUR}" height="${hauteur}" fill="#ffffff"/>
${grille.join("")}
${axes}${nomsAxes}
${asymptotes.join("")}
${chemins}${pointsIsoles}
${labels.join("")}
${annotations.join("")}
<rect x="0.5" y="0.5" width="${LARGEUR - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>
</svg>`;
}

