/**
 * Couche B (5e) — vérification pour 5gen24 ("Étude complète"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réutilise DIRECTEMENT (moteur→moteur, jamais réimplémenté) :
 * - `diagnostiquerNombre`/`verifierSigne` (`verificationLimites.ts`, 5gen20) pour tout champ
 *   "nombre simple"/choix de signe ±∞.
 * - `diagnostiquerQuotient` (`verificationAsymptoteOblique.ts`, 5gen21) pour toute équation d'AO
 *   demandée (ax+b) — même mécanisme d'équivalence algébrique par échantillonnage de points.
 *
 * RÉPLIQUE localement (jamais importée, petite duplication assumée) l'équivalence par
 * échantillonnage étendue à :
 * - la vérification PAR PROPRIÉTÉS de la variante bonus "construction inverse" (inchangée par la
 *   refonte `prompt5gen24refontecomplete.md`, hors scope).
 * - `diagnostiquerSimplificationPointVide` (écran spécial A, NOUVEAU) — même technique
 *   d'échantillonnage que `diagnostiquerFormeDeveloppee` (5gen21), en excluant les points qui
 *   annulent `D_vraie`, PAS de dépendance à Algebrite (bibliothèque exclusive au chantier 6e,
 *   jamais partagée entre chantiers — voir CLAUDE.md) : la plateforme 5e a déjà son propre mécanisme
 *   établi d'équivalence algébrique par échantillonnage, réutilisé ici à l'identique.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ProprietesConstructionInverse } from "../core5e/etudeComplete.types";
import { diagnostiquerNombre, verifierSigne } from "./verificationLimites";
import { diagnostiquerQuotient } from "./verificationAsymptoteOblique";

export { diagnostiquerNombre, verifierSigne, diagnostiquerQuotient };

/**
 * Cible d'un champ "valeur ou infini" (écrans "limitesGD1"/"limitesGD2", "infiniMoins"/"infiniPlus",
 * "coefDirecteur") — soit une vraie valeur finie, soit un signe d'infini (jamais les deux).
 */
export type CibleValeurOuInfini = { fini: true; valeur: number } | { fini: false; signe: 1 | -1 };

const REGEX_INFINI = /^([+-]?)(inf|infini|infty|\\infty|oo)$/;

/** Normalise une saisie « valeur ou infini » : moins typographique « − » (U+2212) et tiret « – »
 * → « - », symbole « ∞ » → « inf », espaces retirés (audit 5e ch. 4, point 4 : « −∞ », « +∞ », « ∞ »
 * étaient refusés). */
function normaliserInfini(texte: string): string {
  return texte.trim().toLowerCase().replace(/\s+/g, "").replace(/[\u2212\u2013]/g, "-").replace(/∞/g, "inf");
}

/** Champ libre générique acceptant soit une valeur numérique (entier, décimal, fraction — via
 * `diagnostiquerNombre`), soit la notation "+inf"/"-inf"/"inf" (sans signe = "+inf", convention
 * standard) — jamais un parsing strictement numérique qui échouerait sur "+inf" (celui-ci n'est ni
 * un nombre ni une fonction connue de `evaluerExpressionGenerale`, qui lèverait sinon "Identifiant
 * inconnu"). Une saisie finie face à une cible infinie (ou l'inverse) est jugée `not_equivalent`
 * (parsing réussi, contenu faux) — jamais `parse_error`, réservé aux erreurs de SYNTAXE. */
export function diagnostiquerValeurOuInfini(texte: string, cible: CibleValeurOuInfini): StatutVerification {
  const t = normaliserInfini(texte);
  const matchInfini = REGEX_INFINI.exec(t);
  if (matchInfini) {
    if (cible.fini) return "not_equivalent";
    const signeSaisi: 1 | -1 = matchInfini[1] === "-" ? -1 : 1;
    return signeSaisi === cible.signe ? "correct" : "not_equivalent";
  }
  if (!cible.fini) return "not_equivalent";
  return diagnostiquerNombre(texte, cible.valeur);
}

/** `coeffs[i]` = coefficient de x^i. */
function evaluerPolynome(coeffs: number[], x: number): number {
  let acc = 0;
  for (let d = 0; d < coeffs.length; d++) acc += coeffs[d] * x ** d;
  return acc;
}

/** Écran spécial A "Simplification" (point vide) — l'élève saisit la forme simplifiée M(x)/D_vraie(x)
 * après avoir annulé le facteur commun ; vérifiée par équivalence algébrique échantillonnée (même
 * mécanisme que `diagnostiquerFormeDeveloppee`, 5gen21), en excluant les points qui annulent
 * `D_vraie` (pôles de la forme simplifiée, où l'expression saisie n'est de toute façon pas définie —
 * ne discriminerait rien). */
/** Vrai si la saisie n'est PAS simplifiée : elle n'est pas définie (ou pas finie) au point vide, donc
 * le facteur commun est encore là — c'est la forme d'origine recopiée (audit 5e ch. 4, 5gen24
 * point 1 : acceptée dans 43 % des tirages tant que le point vide n'était pas parmi les points
 * testés). Message dédié, sans consommer de tentative (`EtapeChampsEtudeComplete`). */
export function estFormeNonSimplifiee(texte: string, positionPointVide: number): boolean {
  try {
    return !Number.isFinite(evaluerExpressionGenerale(texte, positionPointVide));
  } catch {
    return false;
  }
}

export function diagnostiquerSimplificationPointVide(texte: string, coeffsM: number[], coeffsDVraie: number[], positionPointVide?: number): StatutVerification {
  if (positionPointVide !== undefined && estFormeNonSimplifiee(texte, positionPointVide)) return "not_equivalent";
  const candidats = [0, 1, 2, -1, 3, -2, 4, -3];
  const pointsExclus = candidats.filter((x) => Math.abs(evaluerPolynome(coeffsDVraie, x)) < 1e-9);
  const points = candidats.filter((x) => !pointsExclus.includes(x)).slice(0, 5);
  try {
    for (const x of points) {
      const valeurEntree = evaluerExpressionGenerale(texte, x);
      const valeurAttendue = evaluerPolynome(coeffsM, x) / evaluerPolynome(coeffsDVraie, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - valeurAttendue) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Écran "typeLimite" — combobox par exclusion, ∞ (vraie AV) ou 0/0 (point vide) ; comparaison
 * DIRECTE au `TypeExclusion` réel, jamais de saisie libre à parser. */
export function verifierTypeLimite(choix: "infini" | "pointVide", estPointVide: boolean): boolean {
  return (choix === "pointVide") === estPointVide;
}

/** Écrans "domaine"/"classification" — liste add-as-needed de valeurs numériques, équivalence
 * d'ENSEMBLE (ordre indifférent, même patron que `EtapeListerIntervalles.tsx`/5gen9). */
export function diagnostiquerEnsembleNombres(textes: string[], cibles: number[]): StatutVerification {
  if (textes.length !== cibles.length) return "not_equivalent";
  const valeurs: number[] = [];
  for (const texte of textes) {
    try {
      const v = evaluerExpressionGenerale(texte, 0);
      if (!Number.isFinite(v)) return "parse_error";
      valeurs.push(v);
    } catch {
      return "parse_error";
    }
  }
  const restants = [...cibles];
  for (const v of valeurs) {
    const i = restants.findIndex((c) => Math.abs(c - v) < 1e-3);
    if (i === -1) return "not_equivalent";
    restants.splice(i, 1);
  }
  return "correct";
}

/** Écran "av" — l'élève tape l'ÉQUATION complète "x=r" (label "AV≡" à gauche du champ ne préfixe
 * QUE "AV≡", jamais "x=" — voir `promptcorrectiontransversaleecarts5gen24.md`), pas seulement la
 * valeur r. Retire un préfixe "x=" optionnel (espaces tolérés) avant de réutiliser
 * `diagnostiquerEnsembleNombres` telle quelle — une saisie sans le "x=" reste tolérée (dégrade
 * proprement plutôt que de rejeter une réponse mathématiquement correcte). */
export function diagnostiquerEnsembleEquationsAV(textes: string[], cibles: number[]): StatutVerification {
  const valeurs = textes.map((t) => {
    const m = /^\s*x\s*=\s*(.+)$/i.exec(t);
    return m ? m[1] : t;
  });
  return diagnostiquerEnsembleNombres(valeurs, cibles);
}

const REGEX_Y_EGAL = /^\s*y\s*=\s*(.+)$/i;

/** Écran "asymptoteInfini" (AH≡/AO≡) — l'élève tape l'ÉQUATION complète "y=..." (le label "AH≡"/
 * "AO≡" à gauche du champ ne préfixe QUE "AH≡"/"AO≡", jamais "y=" — même convention que
 * `diagnostiquerEnsembleEquationsAV` pour "AV≡"/"x="). Retire un préfixe "y=" optionnel (espaces
 * tolérés) avant de déléguer à `diagnostiquerNombre`/`diagnostiquerQuotient` — une saisie sans le
 * "y=" reste tolérée (dégrade proprement plutôt que de rejeter une réponse mathématiquement
 * correcte). Sans ce retrait, "y=1"/"y=-2x-2" échouaient au parsing (`evaluerExpressionGenerale` ne
 * connaît ni "y" ni "="), rejetées à tort en `parse_error`.
 */
export function diagnostiquerEquationHorizontale(texte: string, limite: number): StatutVerification {
  const m = REGEX_Y_EGAL.exec(texte);
  return diagnostiquerNombre(m ? m[1] : texte, limite);
}

export function diagnostiquerEquationOblique(texte: string, pente: number, ordonnee: number): StatutVerification {
  const m = REGEX_Y_EGAL.exec(texte);
  return diagnostiquerQuotient(m ? m[1] : texte, pente, ordonnee);
}

/** Écran "casSpecial" — les 2 coordonnées du point de recoupement, chacune un nombre simple. */
export interface ReponseCasSpecial {
  x: string;
  y: string;
}

export function diagnostiquerCasSpecial(reponse: ReponseCasSpecial, x: number, y: number): { x: StatutVerification; y: StatutVerification } {
  return { x: diagnostiquerNombre(reponse.x, x), y: diagnostiquerNombre(reponse.y, y) };
}

/**
 * Variante bonus — vérification PAR PROPRIÉTÉS d'une fonction f(x) entière saisie par l'élève,
 * jamais par égalité stricte à une fonction pré-calculée (plusieurs fonctions différentes peuvent
 * satisfaire les mêmes propriétés, exactement comme le corrigé source donne "un exemple" et non
 * "la" fonction). Ré-analyse la fonction proposée : le dénominateur doit réellement s'annuler à
 * `racineDenominateur` (vraie AV, divergence de part et d'autre — jamais un simple zéro isolé du
 * numérateur aussi, qui serait un point vide) ET la fonction doit réellement approcher l'asymptote
 * demandée en ±∞ (échantillonnage à grande distance, même mécanisme que les tests de génération).
 */
export function diagnostiquerProprietesConstructionInverse(texte: string, proprietes: ProprietesConstructionInverse): StatutVerification {
  try {
    const { racineDenominateur: r, asymptote } = proprietes;
    const f = (x: number) => evaluerExpressionGenerale(texte, x);
    if (Number.isFinite(f(r))) return "not_equivalent";
    // Vraie asymptote verticale en r : |f| grandit quand on se rapproche de r, des deux côtés —
    // rapport des valeurs à ε = 1e-6 et 1e-3 (≈ 1000 pour un pôle simple, 10⁶ pour un double ; ≈ 1
    // pour un point vide). Plus de seuil absolu : « 3 + 1/(x−2) » vaut −997 en 1,999 et était refusé.
    for (const cote of [-1, 1]) {
      const proche = f(r + cote * 1e-6);
      const loin = f(r + cote * 1e-3);
      if (!Number.isFinite(proche) || !Number.isFinite(loin)) return "parse_error";
      if (Math.abs(loin) === 0 || Math.abs(proche) / Math.abs(loin) < 50) return "not_equivalent";
    }
    const X = 1e4;
    const valeurs = [X, 2 * X, -X, -2 * X].map(f);
    if (valeurs.some((v) => !Number.isFinite(v))) return "parse_error";
    const [fX, f2X, fmX, fm2X] = valeurs;
    if (asymptote.type === "horizontale") {
      // Extrapolation de Richardson (le reste en 1/x disparaît) : limite estimée à ±∞.
      const limPlus = 2 * f2X - fX;
      const limMoins = 2 * fm2X - fmX;
      return Math.abs(limPlus - asymptote.limite) <= 0.05 && Math.abs(limMoins - asymptote.limite) <= 0.05 ? "correct" : "not_equivalent";
    }
    // Asymptote oblique : pente a puis b = lim (f(x) − a·x), estimé en X = 1e4 et 2e4 (Richardson),
    // tolérance 0,05 — une AO décalée (y = 2x + 6 au lieu de 2x + 4) est refusée.
    const a = asymptote.pente;
    const pente = (f2X - fX) / X;
    if (Math.abs(pente - a) > 0.05) return "not_equivalent";
    const bPlus = 2 * (f2X - a * 2 * X) - (fX - a * X);
    const bMoins = 2 * (fm2X + a * 2 * X) - (fmX + a * X);
    return Math.abs(bPlus - asymptote.ordonnee) <= 0.05 && Math.abs(bMoins - asymptote.ordonnee) <= 0.05 ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}
