/**
 * Figure statique (SVG) du corrigé détaillé de gen31 : l'histogramme ATTENDU (la réponse de l'étape
 * « Trace l'histogramme » est un graphique). Barres jointives, une par classe, de largeur égale à
 * l'amplitude ; hauteur = `valeurHauteur` (effectif ou fréquence en %), la MÊME fonction que l'écran
 * de tracé (`HistogrammeGraph`) et que le texte du corrigé (`formatTraceAttendueTexte`). Chaque barre
 * porte sa hauteur au-dessus. Chaîne SVG autonome (`EtapeCorrection.figureHtml`).
 */
import type { ExerciceHistogramme } from "../../core/histogramme.types";
import { valeurHauteur } from "../../ui/histogrammeGraph";
import { nombreFr } from "../../ui/nombreFr";

const LARGEUR = 560;
const HAUTEUR = 320;
const MARGE_G = 56;
const MARGE_D = 24;
const MARGE_H = 30;
const MARGE_B = 46;
const ENCRE = "#1b1d22";
const GRIS = "#8a8f98";
const GRILLE = "#e3e6ea";
const BARRE = "#1d5b8f";
const POLICE = 'font-family="Archivo, Arial, Helvetica, sans-serif"';

function texteSvg(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end", couleur = GRIS, taille = 11, gras = false): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}" fill="${couleur}" text-anchor="${ancre}"${gras ? ' font-weight="bold"' : ""} ${POLICE}>${contenu}</text>`;
}

/** Pas « rond » donnant au plus 8 graduations sur [0 ; max]. */
function pasGraduation(max: number): number {
  for (const base of [1, 2, 5, 10, 20, 25, 50, 100]) if (max / base <= 8) return base;
  return Math.ceil(max / 8);
}

export function construireSvgHistogramme(instance: ExerciceHistogramme): string {
  const frequence = instance.variante === "frequence";
  const hauteurs = instance.classes.map((_, i) => valeurHauteur(instance, i));
  const pas = pasGraduation(Math.max(...hauteurs));
  const yMax = Math.ceil(Math.max(...hauteurs) / pas) * pas + pas;
  const xMin = instance.classes[0].borneInf;
  const xMax = instance.classes[instance.classes.length - 1].borneSup;
  const larg = LARGEUR - MARGE_G - MARGE_D;
  const haut = HAUTEUR - MARGE_H - MARGE_B;
  const sx = (x: number) => MARGE_G + ((x - xMin) / (xMax - xMin)) * larg;
  const sy = (y: number) => MARGE_H + haut - (y / yMax) * haut;
  const m: string[] = [];

  for (let v = 0; v <= yMax + 1e-9; v += pas) {
    m.push(`<line x1="${MARGE_G}" y1="${sy(v).toFixed(1)}" x2="${MARGE_G + larg}" y2="${sy(v).toFixed(1)}" stroke="${GRILLE}" stroke-width="1"/>`);
    m.push(texteSvg(MARGE_G - 6, sy(v) + 4, nombreFr(v), "end"));
  }

  instance.classes.forEach((classe, i) => {
    const x1 = sx(classe.borneInf);
    const x2 = sx(classe.borneSup);
    const y = sy(hauteurs[i]);
    m.push(`<rect x="${x1.toFixed(1)}" y="${y.toFixed(1)}" width="${(x2 - x1).toFixed(1)}" height="${(sy(0) - y).toFixed(1)}" fill="${BARRE}" fill-opacity="0.22" stroke="${BARRE}" stroke-width="1.6"/>`);
    m.push(texteSvg((x1 + x2) / 2, y - 5, `${nombreFr(hauteurs[i])}${frequence ? " %" : ""}`, "middle", BARRE, 11, true));
  });

  const bornes = [xMin, ...instance.classes.map((c) => c.borneSup)];
  for (const b of bornes) {
    m.push(`<line x1="${sx(b).toFixed(1)}" y1="${sy(0).toFixed(1)}" x2="${sx(b).toFixed(1)}" y2="${(sy(0) + 4).toFixed(1)}" stroke="${ENCRE}" stroke-width="1"/>`);
    m.push(texteSvg(sx(b), sy(0) + 16, nombreFr(b), "middle"));
  }

  m.push(`<line x1="${MARGE_G}" y1="${sy(0).toFixed(1)}" x2="${MARGE_G + larg}" y2="${sy(0).toFixed(1)}" stroke="${ENCRE}" stroke-width="1.4"/>`);
  m.push(`<line x1="${MARGE_G}" y1="${sy(0).toFixed(1)}" x2="${MARGE_G}" y2="${MARGE_H - 8}" stroke="${ENCRE}" stroke-width="1.4"/>`);
  m.push(texteSvg(MARGE_G - 6, MARGE_H - 14, frequence ? "fréquence (%)" : "effectif", "start", GRIS, 10));
  m.push(texteSvg(MARGE_G + larg, sy(0) + 34, `${instance.contexte.unite}`, "end", GRIS, 10));

  return `<svg class="figure-corrige" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" width="${LARGEUR}" height="${HAUTEUR}" role="img" aria-label="Histogramme attendu">${m.join("")}</svg>`;
}
