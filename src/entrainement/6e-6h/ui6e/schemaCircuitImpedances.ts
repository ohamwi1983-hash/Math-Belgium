import { capaciteMicroFarad, inductanceMilliHenry } from "../core6e/impedancesComplexes";
import type { ExerciceImpedances } from "../core6e/impedancesComplexes";
import { nombreTexte } from "./formatImpedances";

/**
 * Schéma du circuit de `6gen96` (SVG autonome, symboles normalisés IEC : résistance = rectangle,
 * bobine = boucles, condensateur = deux plaques, source alternative = cercle avec une sinusoïde).
 * Le même schéma sert à l'écran (bloc de données de l'énoncé) et sur papier (`enteteHtml`) : il ne
 * montre que les DONNÉES (R, L ou C, U, ω), jamais un résultat. Trait et texte en `currentColor`
 * (lisible en thème clair, sombre et à l'impression) ; aucun identifiant SVG (rien à dédoublonner).
 */

const LARGEUR = 320;
const HAUTEUR = 176;
const TRAIT = 'stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"';

function texte(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end" = "middle"): string {
  return `<text x="${x}" y="${y}" font-size="13" text-anchor="${ancre}" fill="currentColor" stroke="none">${contenu}</text>`;
}

function ligne(x1: number, y1: number, x2: number, y2: number): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${TRAIT}/>`;
}

function libelleR(e: ExerciceImpedances): string {
  return `R = ${e.R} Ω`;
}

function libelleL(e: ExerciceImpedances): string {
  return `L = ${nombreTexte(inductanceMilliHenry(e), 1)} mH`;
}

function libelleC(e: ExerciceImpedances): string {
  return `C = ${nombreTexte(capaciteMicroFarad(e), 1)} µF`;
}

/** Source alternative centrée en (x, y). */
function source(x: number, y: number): string {
  return `<circle cx="${x}" cy="${y}" r="13" ${TRAIT}/><path d="M ${x - 8} ${y} q 4 -8 8 0 t 8 0" ${TRAIT}/>`;
}

type Composant = "R" | "L" | "C";

/** Composant HORIZONTAL centré en (cx, y), de largeur 40 (le fil s'arrête à ses bornes). */
function composantHorizontal(c: Composant, cx: number, y: number): string {
  if (c === "R") return `<rect x="${cx - 20}" y="${y - 7}" width="40" height="14" ${TRAIT}/>`;
  if (c === "L") return `<path d="M ${cx - 20} ${y} a 5 5 0 0 1 10 0 a 5 5 0 0 1 10 0 a 5 5 0 0 1 10 0 a 5 5 0 0 1 10 0" ${TRAIT}/>`;
  return `${ligne(cx - 20, y, cx - 4, y)}${ligne(cx + 4, y, cx + 20, y)}${ligne(cx - 4, y - 12, cx - 4, y + 12)}${ligne(cx + 4, y - 12, cx + 4, y + 12)}`;
}

/** Composant VERTICAL centré en (x, cy), de hauteur 40. */
function composantVertical(c: Composant, x: number, cy: number): string {
  if (c === "R") return `<rect x="${x - 7}" y="${cy - 20}" width="14" height="40" ${TRAIT}/>`;
  if (c === "L") return `<path d="M ${x} ${cy - 20} a 5 5 0 0 1 0 10 a 5 5 0 0 1 0 10 a 5 5 0 0 1 0 10 a 5 5 0 0 1 0 10" ${TRAIT}/>`;
  return `${ligne(x, cy - 20, x, cy - 4)}${ligne(x, cy + 4, x, cy + 20)}${ligne(x - 12, cy - 4, x + 12, cy - 4)}${ligne(x - 12, cy + 4, x + 12, cy + 4)}`;
}

function enveloppe(contenu: string, description: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" width="100%" style="max-width:340px;display:block;margin:0 auto" role="img" aria-label="${description}">${contenu}</svg>`;
}

function schemaSerie(e: ExerciceImpedances): string {
  const composants: { c: Composant; libelle: string }[] = [{ c: "R", libelle: libelleR(e) }];
  if (e.xL !== null) composants.push({ c: "L", libelle: libelleL(e) });
  if (e.xC !== null) composants.push({ c: "C", libelle: libelleC(e) });
  const haut = 46;
  const bas = 140;
  const gauche = 30;
  const droite = 296;
  const pas = (droite - gauche - 20) / composants.length;
  const centres = composants.map((_, i) => gauche + 20 + pas * (i + 0.5));
  let s = "";
  // Fil du haut, interrompu à chaque composant.
  let x = gauche;
  centres.forEach((cx) => {
    s += ligne(x, haut, cx - 20, haut);
    x = cx + 20;
  });
  s += ligne(x, haut, droite, haut);
  s += ligne(droite, haut, droite, bas) + ligne(gauche, bas, droite, bas);
  s += ligne(gauche, haut, gauche, 80) + ligne(gauche, 106, gauche, bas) + source(gauche, 93);
  composants.forEach(({ c, libelle }, i) => {
    s += composantHorizontal(c, centres[i], haut);
    s += texte(centres[i], haut - 18, libelle);
  });
  s += texte((gauche + droite) / 2, bas + 24, `U = ${e.U} V ; ω = ${e.omega} rad/s`);
  return enveloppe(s, "Schéma du circuit : source alternative et composants en série");
}

function schemaParallele(e: ExerciceImpedances): string {
  const haut = 24;
  const bas = 140;
  const gauche = 30;
  const b1 = 120;
  const b2 = 214;
  const milieu = (haut + bas) / 2;
  const reactif: Composant = e.xL !== null ? "L" : "C";
  let s = "";
  s += ligne(gauche, haut, b2, haut) + ligne(gauche, bas, b2, bas);
  s += ligne(gauche, haut, gauche, milieu - 13) + ligne(gauche, milieu + 13, gauche, bas) + source(gauche, milieu);
  [b1, b2].forEach((x) => {
    s += ligne(x, haut, x, milieu - 20) + ligne(x, milieu + 20, x, bas);
  });
  s += composantVertical("R", b1, milieu) + composantVertical(reactif, b2, milieu);
  s += `<circle cx="${b1}" cy="${haut}" r="2.6" fill="currentColor"/><circle cx="${b1}" cy="${bas}" r="2.6" fill="currentColor"/>`;
  s += texte(b1 + 14, milieu + 5, libelleR(e), "start");
  s += texte(b2 + 18, milieu + 5, reactif === "L" ? libelleL(e) : libelleC(e), "start");
  s += texte(LARGEUR / 2, bas + 26, `U = ${e.U} V ; ω = ${e.omega} rad/s`);
  return enveloppe(s, "Schéma du circuit : source alternative et deux branches en parallèle");
}

export function schemaCircuitSvg(e: ExerciceImpedances): string {
  return e.variante === "parallele" ? schemaParallele(e) : schemaSerie(e);
}
