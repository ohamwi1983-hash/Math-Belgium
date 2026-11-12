import type { ExerciceDeuxEnfants, ExerciceMontyHall, ExerciceParadoxesProbabilites } from "../core6e/paradoxesProbabilites.types";
import type { PhaseParadoxe } from "../moteur6e/typesParadoxesProbabilites";
import { COULEURS } from "./figureRepereIntegrales";
import { issueFavorable, issuesCompatibles, UNIVERS_DEUX_ENFANTS } from "./formatParadoxesProbabilites";

/**
 * Arbres de `6gen76` (chaînes SVG autonomes, couleurs du thème avec repli imprimable comme
 * `figureRepereIntegrales.ts`) — affichés à l'écran (`dangerouslySetInnerHTML`, comme 6gen26–28)
 * dès l'écran « modéliser », et dans le corrigé papier (`EtapeCorrection.figureHtml`).
 *
 * - Monty Hall : 1er niveau « où est la voiture » (V / non V), 2e niveau « gagner en changeant ».
 *   À l'écran « modéliser », les probabilités demandées sont remplacées par « ? ».
 * - Deux enfants : aîné puis cadet, branches 1/2 ; à partir de l'écran « calculer », les issues
 *   exclues par l'information sont barrées et l'issue favorable entourée.
 * - Méré : pas d'arbre (4 ou 24 niveaux : la formule de l'événement contraire est plus lisible).
 */

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="var(--surface, #ffffff)" stroke-width="4" stroke-linejoin="round" paint-order="stroke"';

type Etiquette = { num: number; den: number } | "?" | null;

function f1(v: number): string {
  return v.toFixed(1);
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Probabilité écrite en fraction ÉTAGÉE (jamais « 1/3 » au clavier), « 1 » si entière, « ? » à trouver. */
function etiquetteSvg(x: number, y: number, e: Etiquette, couleur: string): string {
  if (e === null) return "";
  if (e === "?") return `<text x="${f1(x)}" y="${f1(y + 5)}" font-size="14" font-weight="700" text-anchor="middle" fill="${COULEURS.accent}" ${HALO} ${POLICE}>?</text>`;
  const g = pgcd(e.num, e.den);
  const n = e.num / g;
  const d = e.den / g;
  if (d === 1) return `<text x="${f1(x)}" y="${f1(y + 4)}" font-size="12" text-anchor="middle" fill="${couleur}" ${HALO} ${POLICE}>${n}</text>`;
  const w = Math.max(String(n).length, String(d).length) * 7 + 4;
  return [
    `<text x="${f1(x)}" y="${f1(y - 3)}" font-size="11.5" text-anchor="middle" fill="${couleur}" ${HALO} ${POLICE}>${n}</text>`,
    `<line x1="${f1(x - w / 2)}" y1="${f1(y)}" x2="${f1(x + w / 2)}" y2="${f1(y)}" stroke="${couleur}" stroke-width="1"/>`,
    `<text x="${f1(x)}" y="${f1(y + 11)}" font-size="11.5" text-anchor="middle" fill="${couleur}" ${HALO} ${POLICE}>${d}</text>`,
  ].join("");
}

/** Nœud : lettre en italique, éventuellement surlignée (événement contraire). */
function noeudSvg(x: number, y: number, lettre: string, barre: boolean, couleur: string): string {
  const morceaux = [`<text x="${f1(x)}" y="${f1(y + 5)}" font-size="14" font-style="italic" text-anchor="middle" fill="${couleur}" ${HALO} ${POLICE}>${lettre}</text>`];
  if (barre) morceaux.push(`<line x1="${f1(x - 5)}" y1="${f1(y - 9)}" x2="${f1(x + 5)}" y2="${f1(y - 9)}" stroke="${couleur}" stroke-width="1.3"/>`);
  return morceaux.join("");
}

interface Branche {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  etiquette: Etiquette;
}

function brancheSvg(b: Branche): string {
  const dx = b.x2 - b.x1;
  const dy = b.y2 - b.y1;
  const lg = Math.hypot(dx, dy);
  // Le trait part et arrive à 11 px des centres des nœuds (place pour la lettre).
  const ux = dx / lg;
  const uy = dy / lg;
  const ligne = `<line x1="${f1(b.x1 + 11 * ux)}" y1="${f1(b.y1 + 11 * uy)}" x2="${f1(b.x2 - 11 * ux)}" y2="${f1(b.y2 - 11 * uy)}" stroke="${COULEURS.doux}" stroke-width="1.3"/>`;
  const mx = (b.x1 + b.x2) / 2;
  const my = (b.y1 + b.y2) / 2;
  const decalage = dy < -1 ? -15 : dy > 1 ? 15 : -14;
  return ligne + etiquetteSvg(mx - (Math.abs(dy) > 1 ? 6 : 0), my + decalage, b.etiquette, COULEURS.encre);
}

function enveloppe(largeur: number, hauteur: number, corps: string, libelle: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}" style="max-width:100%;height:auto" role="img" aria-label="${libelle}">${corps}</svg>`;
}

function arbreMonty(e: ExerciceMontyHall, masquer: boolean): string {
  const n = e.nPortes;
  const q = (v: Etiquette): Etiquette => (masquer ? "?" : v);
  const racine = { x: 16, y: n === 3 ? 92 : 104 };
  const yV = 40;
  const yNonV = n === 3 ? 144 : 160;
  const x1 = 118;
  const x2 = 232;
  const m: string[] = [];
  const feuilles: { y: number; gagne: boolean; etiquette: Etiquette; depuis: number }[] = [{ y: yV, gagne: false, etiquette: { num: 1, den: 1 }, depuis: yV }];
  if (n === 3) feuilles.push({ y: yNonV, gagne: true, etiquette: q({ num: 1, den: 1 }), depuis: yNonV });
  else {
    feuilles.push({ y: yNonV - 34, gagne: true, etiquette: q({ num: 1, den: n - 2 }), depuis: yNonV });
    feuilles.push({ y: yNonV + 34, gagne: false, etiquette: q({ num: n - 3, den: n - 2 }), depuis: yNonV });
  }
  m.push(brancheSvg({ x1: racine.x, y1: racine.y, x2: x1, y2: yV, etiquette: q({ num: 1, den: n }) }));
  m.push(brancheSvg({ x1: racine.x, y1: racine.y, x2: x1, y2: yNonV, etiquette: q({ num: n - 1, den: n }) }));
  for (const f of feuilles) m.push(brancheSvg({ x1, y1: f.depuis, x2, y2: f.y, etiquette: f.etiquette }));
  m.push(`<circle cx="${racine.x}" cy="${racine.y}" r="3" fill="${COULEURS.doux}"/>`);
  m.push(noeudSvg(x1, yV, "V", false, COULEURS.encre), noeudSvg(x1, yNonV, "V", true, COULEURS.encre));
  for (const f of feuilles) {
    const couleur = f.gagne ? COULEURS.bon : COULEURS.mauvais;
    m.push(noeudSvg(x2, f.y, "C", !f.gagne, couleur));
    m.push(`<text x="${x2 + 14}" y="${f1(f.y + 4)}" font-size="11.5" fill="${couleur}" ${POLICE}>${f.gagne ? "gagné" : "perdu"}</text>`);
  }
  m.push(`<text x="${x1}" y="12" font-size="10.5" text-anchor="middle" fill="${COULEURS.doux}" ${POLICE}>voiture</text>`);
  m.push(`<text x="${x2}" y="12" font-size="10.5" text-anchor="middle" fill="${COULEURS.doux}" ${POLICE}>en changeant</text>`);
  const hauteur = n === 3 ? 176 : 214;
  return enveloppe(300, hauteur, m.join(""), `Arbre : la voiture est ou n'est pas derrière ta porte, puis gain ou perte en changeant (${n} portes)`);
}

function arbreEnfants(e: ExerciceDeuxEnfants, marquer: boolean): string {
  const racine = { x: 16, y: 104 };
  const x1 = 104;
  const x2 = 196;
  const yNiv1 = [52, 156];
  const yFeuilles = [24, 80, 128, 184];
  const demi = { num: 1, den: 2 };
  const compat = issuesCompatibles(e);
  const favorable = issueFavorable(e);
  const m: string[] = [];
  for (let i = 0; i < 2; i++) m.push(brancheSvg({ x1: racine.x, y1: racine.y, x2: x1, y2: yNiv1[i], etiquette: demi }));
  for (let j = 0; j < 4; j++) m.push(brancheSvg({ x1, y1: yNiv1[Math.floor(j / 2)], x2, y2: yFeuilles[j], etiquette: demi }));
  m.push(`<circle cx="${racine.x}" cy="${racine.y}" r="3" fill="${COULEURS.doux}"/>`);
  m.push(noeudSvg(x1, yNiv1[0], "G", false, COULEURS.encre), noeudSvg(x1, yNiv1[1], "F", false, COULEURS.encre));
  UNIVERS_DEUX_ENFANTS.forEach((issue, j) => {
    m.push(noeudSvg(x2, yFeuilles[j], issue[1], false, COULEURS.encre));
    const y = yFeuilles[j];
    const xi = x2 + 40;
    const exclue = marquer && !compat.includes(issue);
    const fav = marquer && issue === favorable;
    const couleur = exclue ? COULEURS.pale : fav ? COULEURS.accent : COULEURS.encre;
    m.push(`<text x="${xi}" y="${f1(y + 5)}" font-size="13.5" ${fav ? 'font-weight="700"' : ""} text-anchor="middle" fill="${couleur}" ${POLICE}>${issue}</text>`);
    if (exclue) m.push(`<line x1="${xi - 15}" y1="${f1(y + 1)}" x2="${xi + 15}" y2="${f1(y + 1)}" stroke="${COULEURS.mauvais}" stroke-width="1.5"/>`);
    if (fav) m.push(`<ellipse cx="${xi}" cy="${f1(y)}" rx="20" ry="12" fill="none" stroke="${COULEURS.accent}" stroke-width="1.5"/>`);
  });
  m.push(`<text x="${x1}" y="12" font-size="10.5" text-anchor="middle" fill="${COULEURS.doux}" ${POLICE}>aîné</text>`);
  m.push(`<text x="${x2}" y="12" font-size="10.5" text-anchor="middle" fill="${COULEURS.doux}" ${POLICE}>cadet</text>`);
  m.push(`<text x="${x2 + 40}" y="12" font-size="10.5" text-anchor="middle" fill="${COULEURS.doux}" ${POLICE}>issue</text>`);
  const libelle = marquer ? "Arbre des quatre issues équiprobables ; les issues exclues par l'information sont barrées, l'issue favorable est entourée" : "Arbre des quatre issues équiprobables : aîné puis cadet";
  return enveloppe(262, 204, m.join(""), libelle);
}

/** Arbre à montrer sur l'écran `phase` (`null` : pas d'arbre — prédiction, ou famille Méré). */
export function figureEcranSvg(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe): string | null {
  if (phase === "prediction" || e.famille === "mere") return null;
  if (e.famille === "montyHall") return arbreMonty(e, phase === "modeliser");
  return arbreEnfants(e, phase !== "modeliser");
}

/** Arbre complet du corrigé (toutes les probabilités, issues marquées). */
export function figureCorrigeSvg(e: ExerciceParadoxesProbabilites): string | null {
  if (e.famille === "mere") return null;
  return e.famille === "montyHall" ? arbreMonty(e, false) : arbreEnfants(e, true);
}
