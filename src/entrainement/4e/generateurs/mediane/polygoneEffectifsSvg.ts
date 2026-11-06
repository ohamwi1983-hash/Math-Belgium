/**
 * Figure statique (SVG) du corrigé détaillé, variante « classes » de gen33 et de l'exercice de
 * synthèse gen35 : le polygone des effectifs cumulés de la série, avec la lecture graphique de Q₁,
 * Q₂ (médiane) et Q₃ — pour chaque quartile, un trait en pointillés part du seuil (n/4, n/2, 3n/4)
 * sur l'axe des effectifs cumulés, rejoint le polygone, puis descend sur l'axe des valeurs où la
 * valeur lue est écrite.
 *
 * Les points du polygone viennent de `polygonePoints` et les intersections de
 * `intersectionCourbeEnY` — les MÊMES fonctions que les écrans de lecture graphique de l'appli
 * (`LectureQuartileGraph`) ; les valeurs écrites sont celles du corrigé (`valeurCibleLecture`,
 * arrondies à la précision demandée). Aucune dépendance DOM : chaîne SVG autonome, insérée telle quelle
 * dans le corrigé HTML (`EtapeCorrection.figureHtml`).
 */
import type { ExerciceMedianeClasses } from "../../core/mediane.types";
import { polygonePoints } from "../../ui/formatMediane";
import { intersectionCourbeEnY } from "../../ui/lectureQuartileGraph";
import { nombreFr } from "../../ui/nombreFr";
import { seuilLecture, valeurCibleLecture, type ParametreLecture } from "../../moteur/verificationMediane";

const LARGEUR = 560;
const HAUTEUR = 340;
const MARGE_G = 58;
const MARGE_D = 24;
const MARGE_H = 26;
const MARGE_B = 74;
const ENCRE = "#1b1d22";
const GRIS = "#8a8f98";
const GRILLE = "#e3e6ea";
const POLYGONE = "#1d5b8f";
const LECTURE = "#9a3b12";

function echapper(texte: string): string {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function ligne(x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur: number, pointilles = false): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"${pointilles ? ' stroke-dasharray="5 4"' : ""}/>`;
}

function texteSvg(x: number, y: number, contenu: string, options: { couleur?: string; ancre?: "start" | "middle" | "end"; taille?: number; gras?: boolean } = {}): string {
  const { couleur = ENCRE, ancre = "middle", taille = 11, gras = false } = options;
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}" fill="${couleur}" text-anchor="${ancre}"${gras ? ' font-weight="bold"' : ""} font-family="Archivo, Arial, Helvetica, sans-serif">${echapper(contenu)}</text>`;
}

/** Pas « rond » (1, 2, 5 × 10ᵏ) donnant au plus 8 graduations sur [0 ; n]. */
function pasGraduation(n: number): number {
  for (const base of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]) if (n / base <= 8) return base;
  return Math.ceil(n / 8);
}

const QUARTILES: { parametre: ParametreLecture; nom: string; seuil: string }[] = [
  { parametre: "q1", nom: "Q₁", seuil: "n/4" },
  { parametre: "mediane", nom: "Q₂", seuil: "n/2" },
  { parametre: "q3", nom: "Q₃", seuil: "3n/4" },
];

export function construireSvgPolygoneEffectifs(exercice: ExerciceMedianeClasses): string {
  const points = polygonePoints(exercice);
  const n = exercice.n;
  const xMin = exercice.xMin;
  const xMax = exercice.xMax;
  const larg = LARGEUR - MARGE_G - MARGE_D;
  const haut = HAUTEUR - MARGE_H - MARGE_B;
  const sx = (x: number) => MARGE_G + ((x - xMin) / (xMax - xMin)) * larg;
  const sy = (y: number) => MARGE_H + haut - (y / n) * haut;
  const y0 = sy(0);
  const m: string[] = [];

  // Grille et graduations de l'axe des effectifs cumulés.
  const pas = pasGraduation(n);
  // n (l'effectif total) est toujours gradué ; une graduation régulière trop proche de n (moins
  // d'un demi-pas) est tracée sans étiquette, sinon les deux nombres se chevauchent.
  for (let v = 0; v <= n + 1e-9; v += pas) {
    m.push(ligne(MARGE_G, sy(v), MARGE_G + larg, sy(v), GRILLE, 1));
    if (n % pas === 0 || n - v >= pas / 2) m.push(texteSvg(MARGE_G - 6, sy(v) + 4, nombreFr(v), { ancre: "end", couleur: GRIS }));
  }
  if (n % pas !== 0) m.push(texteSvg(MARGE_G - 6, sy(n) + 4, nombreFr(n), { ancre: "end", couleur: GRIS }));

  // Graduations de l'axe des valeurs : les bornes de classes (amplitudes parfois différentes).
  const bornes = [points[0].x, ...exercice.classes.map((c) => c.borneSup)];
  for (const b of bornes) {
    m.push(ligne(sx(b), MARGE_H, sx(b), y0, GRILLE, 1));
    m.push(ligne(sx(b), y0, sx(b), y0 + 4, ENCRE, 1));
    m.push(texteSvg(sx(b), y0 + 16, nombreFr(b), { couleur: GRIS }));
  }

  // Axes et leurs titres.
  m.push(ligne(MARGE_G, y0, MARGE_G + larg, y0, ENCRE, 1.4));
  m.push(ligne(MARGE_G, y0, MARGE_G, MARGE_H - 8, ENCRE, 1.4));
  m.push(texteSvg(MARGE_G - 6, MARGE_H - 12, "effectifs cumulés", { ancre: "start", couleur: GRIS, taille: 10 }));
  m.push(texteSvg(MARGE_G + larg, y0 - 6, `valeurs (${exercice.contexte.unite})`, { ancre: "end", couleur: GRIS, taille: 10 }));

  // Lectures de Q₁, Q₂, Q₃ : seuil → polygone → axe des valeurs.
  const etiquettes: { x: number; texte: string }[] = [];
  for (const q of QUARTILES) {
    const seuil = seuilLecture(exercice, q.parametre);
    const xLu = intersectionCourbeEnY(points, seuil);
    if (xLu === null) continue;
    m.push(ligne(MARGE_G, sy(seuil), sx(xLu), sy(seuil), LECTURE, 1.3, true));
    m.push(ligne(sx(xLu), sy(seuil), sx(xLu), y0, LECTURE, 1.3, true));
    m.push(`<circle cx="${sx(xLu).toFixed(1)}" cy="${sy(seuil).toFixed(1)}" r="3" fill="${LECTURE}"/>`);
    m.push(texteSvg(MARGE_G + 4, sy(seuil) - 4, `${q.seuil} = ${nombreFr(seuil)}`, { ancre: "start", couleur: LECTURE, taille: 10 }));
    etiquettes.push({ x: sx(xLu), texte: `${q.nom} ≈ ${nombreFr(valeurCibleLecture(exercice, q.parametre))}` });
  }

  // Polygone par-dessus les lectures.
  m.push(`<polyline points="${points.map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ")}" fill="none" stroke="${POLYGONE}" stroke-width="2.2" stroke-linejoin="round"/>`);
  for (const p of points) m.push(`<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="3.2" fill="${POLYGONE}"/>`);

  // Valeurs lues sous l'axe, sur une 2e ou 3e ligne si deux étiquettes se chevaucheraient.
  let derniereLigne2 = -Infinity;
  for (const e of etiquettes) {
    const surLigne2 = e.x - derniereLigne2 >= 78;
    if (surLigne2) derniereLigne2 = e.x;
    const x = Math.min(Math.max(e.x, MARGE_G + 30), MARGE_G + larg - 30);
    m.push(texteSvg(x, y0 + (surLigne2 ? 36 : 54), e.texte, { couleur: LECTURE, gras: true }));
  }

  return `<svg class="figure-corrige" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" width="${LARGEUR}" height="${HAUTEUR}" role="img" aria-label="Polygone des effectifs cumulés et lecture de Q1, Q2, Q3">${m.join("")}</svg>`;
}
