import type { ExerciceTraverserRiviere, GrandeurRiviere } from "../core/traverserRiviere.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { abscisseAccostage, duree, estExacte, normeVitesseReelle, precision, valeurExacte, vitesseReelle } from "./modeleTraverserRiviere";

/**
 * Vérification de gen87. Chaque champ est comparé à la valeur EXACTE du modèle :
 * - valeur décimale exacte (composantes, durée entière, norme d'un triplet…) : égalité stricte (une
 *   racine tapée « rac(6,25) » est acceptée aussi) ;
 * - valeur irrationnelle (racine) : la forme exacte « rac(13) » ou une valeur approchée à
 *   max(une unité de la précision affichée ; 0,5 %) près — un arrondi intermédiaire n'est pas
 *   sanctionné.
 * Les erreurs typiques ont leur statut (message ciblé à l'écran) : courant ajouté sur la mauvaise
 * composante, durée calculée avec la vitesse réelle ou la vitesse propre (LE piège : le courant ne
 * change pas la durée), x_A sans la composante x de la vitesse propre, norme par une somme au lieu de
 * Pythagore, signe de la compensation… Une saisie illisible (`parse_error`) ne consomme jamais de
 * tentative (c'est l'appli qui ne l'envoie pas à la session).
 */

export type StatutChamp =
  | "correct"
  | "faux"
  | "parse_error"
  | "courant_oublie"
  | "courant_mauvaise_composante"
  | "signe_courant"
  | "duree_norme"
  | "duree_propre"
  | "accostage_sans_px"
  | "accostage_norme"
  | "somme_composantes"
  | "norme_propre"
  | "distance_somme"
  | "distance_largeur"
  | "compensation_signe"
  | "pythagore_difference"
  | "pythagore_somme"
  | "pythagore_norme"
  | "duree_enface_norme";

/** Nombre saisi : décimal (virgule ou point), signe moins typographique, racine « rac(…) » / « √… »,
 * fraction. `null` si illisible. */
export function lireNombre(texte: string): number | null {
  const s = texte
    .trim()
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/,/g, ".")
    .replace(/√\(/g, "rac(")
    .replace(/√(\d+(\.\d+)?)/g, "rac($1)");
  if (s === "") return null;
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return Number(s);
  if (/[a-z]/i.test(s.replace(/racine|rac|sqrt/gi, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function egal(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
}

/** Accord avec une valeur attendue : stricte si `exacte`, sinon à max(précision ; 0,5 %) près. */
export function accord(v: number, attendu: number, exacte: boolean, prec: number): boolean {
  if (exacte) return egal(v, attendu);
  return egal(v, attendu) || Math.abs(v - attendu) <= Math.max(prec, 0.005 * Math.abs(attendu)) + 1e-9;
}

function proche(_e: ExerciceTraverserRiviere, g: GrandeurRiviere, v: number, autre: number): boolean {
  return accord(v, autre, false, precision(g));
}

export function diagnostiquerChamp(e: ExerciceTraverserRiviere, g: GrandeurRiviere, texte: string): StatutChamp {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  if (accord(v, valeurExacte(e, g), estExacte(e, g), precision(g))) return "correct";
  const c = e.courant;
  const vR = vitesseReelle(e);
  switch (g) {
    case "vRx":
      if (egal(v, e.px) && e.px !== 0) return "courant_oublie";
      if (egal(v, e.px - c)) return "signe_courant";
      return "faux";
    case "vRy":
      if (egal(v, e.py + c)) return "courant_mauvaise_composante";
      return "faux";
    case "duree":
      if (proche(e, g, v, e.largeur / normeVitesseReelle(e))) return "duree_norme";
      if (e.px !== 0 && proche(e, g, v, e.largeur / Math.hypot(e.px, e.py))) return "duree_propre";
      if (proche(e, g, v, e.largeur / vR.x)) return "duree_norme";
      return "faux";
    case "accostage":
      if (e.px !== 0 && proche(e, g, v, c * duree(e))) return "accostage_sans_px";
      if (proche(e, g, v, (vR.x * e.largeur) / normeVitesseReelle(e))) return "accostage_norme";
      return "faux";
    case "vitesse":
      if (proche(e, g, v, vR.x + vR.y)) return "somme_composantes";
      if (e.px !== 0 && proche(e, g, v, Math.hypot(e.px, e.py))) return "norme_propre";
      return "faux";
    case "distance":
      if (proche(e, g, v, abscisseAccostage(e) + e.largeur)) return "distance_somme";
      if (egal(v, e.largeur)) return "distance_largeur";
      return "faux";
    case "compensation":
      if (egal(v, c)) return "compensation_signe";
      return "faux";
    case "pythagore":
      if (proche(e, g, v, e.normePropre - c)) return "pythagore_difference";
      if (proche(e, g, v, Math.hypot(e.normePropre, c))) return "pythagore_somme";
      if (egal(v, e.normePropre)) return "pythagore_norme";
      return "faux";
    case "dureeEnFace":
      if (proche(e, g, v, e.largeur / e.normePropre)) return "duree_enface_norme";
      if (proche(e, g, v, e.largeur / (e.normePropre - c))) return "pythagore_difference";
      return "faux";
  }
}
