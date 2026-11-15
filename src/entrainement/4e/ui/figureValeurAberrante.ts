import type { ExerciceValeurAberrante } from "../core/valeurAberrante.types";
import { nombreTexteFr } from "../moteur/contextesTransformationDonnees";
import { indicateursComplets, trier } from "../moteur/modeleValeurAberrante";
import { valeurTexte } from "./formatValeurAberrante";

/**
 * Nuage de points de gen110 (même langage que l'atelier `valeur-aberrante-widget` du chapitre) :
 * chaque valeur est un point sur un axe gradué (les valeurs égales s'empilent), la moyenne et la
 * médiane de la série complète sont deux repères verticaux étiquetés. Montré SEULEMENT après
 * l'écran c (et dans le corrigé) : dans l'énoncé, il trahirait le verdict.
 *
 * SVG autonome (écran et papier) : couleurs en dur (la feuille de style des documents redéfinit
 * `--accent`), points et axe en `currentColor` (lisibles en thème sombre comme sur papier). Pas
 * d'identifiant SVG (aucun `id`, aucune référence `url(#…)`).
 */

const LARGEUR = 340;
const MARGE_G = 18;
const MARGE_D = 24;
const RANGEE_1 = 14;
const RANGEE_2 = 32;
const ECART_PILE = 9;
const COULEUR_MOYENNE = "#c2410c";
const COULEUR_MEDIANE = "#15803d";

function pasLisible(etendue: number): number {
  const brut = etendue / 5;
  const p = 10 ** Math.floor(Math.log10(brut));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= brut) return m * p;
  return 10 * p;
}

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function figureNuageSvg(e: ExerciceValeurAberrante, largeurMax = 440): string {
  const valeurs = trier(e.valeurs);
  const ind = indicateursComplets(e);
  const pas = pasLisible(valeurs[valeurs.length - 1]! - valeurs[0]!);
  const debut = Math.floor(valeurs[0]! / pas) * pas;
  const fin = Math.ceil(valeurs[valeurs.length - 1]! / pas) * pas;
  const xPx = (v: number) => MARGE_G + ((v - debut) / (fin - debut || 1)) * (LARGEUR - MARGE_G - MARGE_D);

  // Piles de points égaux.
  const piles = new Map<number, number>();
  for (const v of valeurs) piles.set(v, (piles.get(v) ?? 0) + 1);
  const hauteurPile = Math.max(...piles.values());
  const yAxe = RANGEE_2 + 14 + hauteurPile * ECART_PILE;
  const hauteur = yAxe + 24;

  const morceaux: string[] = [];
  // Axe et graduations.
  morceaux.push(`<line x1="${MARGE_G - 8}" y1="${yAxe}" x2="${LARGEUR - MARGE_D + 10}" y2="${yAxe}" stroke="currentColor" stroke-width="1.2"/>`);
  morceaux.push(`<path d="M${LARGEUR - MARGE_D + 10},${yAxe - 4} L${LARGEUR - MARGE_D + 16},${yAxe} L${LARGEUR - MARGE_D + 10},${yAxe + 4} Z" fill="currentColor"/>`);
  for (let g = debut; g <= fin + pas / 1000; g += pas) {
    const x = xPx(g).toFixed(1);
    morceaux.push(`<line x1="${x}" y1="${yAxe - 3}" x2="${x}" y2="${yAxe + 3}" stroke="currentColor" stroke-width="1"/>`);
    morceaux.push(`<text x="${x}" y="${yAxe + 17}" font-size="11" text-anchor="middle" fill="currentColor">${echapper(nombreTexteFr(Math.round(g * 1e9) / 1e9))}</text>`);
  }
  // Points.
  const vus = new Map<number, number>();
  for (const v of valeurs) {
    const k = vus.get(v) ?? 0;
    vus.set(v, k + 1);
    morceaux.push(`<circle cx="${xPx(v).toFixed(1)}" cy="${(yAxe - 8 - k * ECART_PILE).toFixed(1)}" r="4" fill="currentColor"/>`);
  }
  // Repères moyenne / médiane : étiquettes écrites en s'éloignant de l'autre repère.
  const xm = xPx(ind.moyenne);
  const xd = xPx(ind.mediane);
  const moyenneADroite = xm >= xd;
  /** Placement horizontal d'une étiquette : du côté demandé, sinon de l'autre (bord du cadre). */
  const placer = (x: number, versDroite: boolean, texte: string) => {
    const largeur = texte.length * 6.6;
    let droite = versDroite;
    if (versDroite && x + 4 + largeur > LARGEUR - 2) droite = false;
    else if (!versDroite && x - 4 - largeur < 2) droite = true;
    const xt = droite ? Math.max(x + 4, 2) : Math.min(x - 4, LARGEUR - 2);
    return { texte, ancre: droite ? "start" : "end", xt, debut: droite ? xt : xt - largeur, fin: droite ? xt + largeur : xt };
  };
  const texteM = `moyenne : ${valeurTexte(e, ind.moyenne)}`;
  const texteD = `médiane : ${valeurTexte(e, ind.mediane)}`;
  const pm = placer(xm, moyenneADroite, texteM);
  const pd = placer(xd, !moyenneADroite, texteD);
  // Le trait du repère de la rangée du HAUT traverse la rangée du bas : on met en bas l'étiquette
  // que ce trait ne coupe pas (moyenne en haut par défaut).
  const coupe = (p: { debut: number; fin: number }, x: number) => x >= p.debut - 2 && x <= p.fin + 2;
  const moyenneEnHaut = !coupe(pd, xm) || coupe(pm, xd);
  const repere = (x: number, rangee: number, couleur: string, pointille: boolean, p: { texte: string; ancre: string; xt: number }) =>
    `<line x1="${x.toFixed(1)}" y1="${rangee + 3}" x2="${x.toFixed(1)}" y2="${yAxe}" stroke="${couleur}" stroke-width="1.6"${pointille ? ' stroke-dasharray="4 3"' : ""}/>` +
    `<text x="${p.xt.toFixed(1)}" y="${rangee}" font-size="11.5" font-weight="600" text-anchor="${p.ancre}" fill="${couleur}">${echapper(p.texte)}</text>`;
  morceaux.push(repere(xm, moyenneEnHaut ? RANGEE_1 : RANGEE_2, COULEUR_MOYENNE, true, pm));
  morceaux.push(repere(xd, moyenneEnHaut ? RANGEE_2 : RANGEE_1, COULEUR_MEDIANE, false, pd));

  return `<svg viewBox="0 0 ${LARGEUR} ${hauteur}" width="100%" style="max-width:${largeurMax}px;display:block;margin:0 auto" role="img" aria-label="Nuage de points de la série avec sa moyenne et sa médiane" xmlns="http://www.w3.org/2000/svg">${morceaux.join("")}</svg>`;
}
