/**
 * Couche B — parseur d'une combinaison linéaire de vecteurs NOMMÉS (ex. "-3u + 5t"), partagé par
 * les générateurs du chapitre "Calcul vectoriel" qui demandent une réponse symbolique en termes
 * des vecteurs de départ (jamais une expression numérique classique — `expressionAlgebrique.ts`/
 * `expressionGenerale.ts` manipulent des scalaires et une seule variable `x`, pas une somme de
 * SYMBOLES distincts, chacun représentant un vecteur — d'où ce module dédié plutôt qu'une
 * réutilisation détournée de l'un des deux évaluateurs existants).
 *
 * Grammaire volontairement étroite : une somme signée de termes `[coefficient]nom` OU
 * `nom[*×]coefficient` (ordre inversé — coefficient explicite après le nom, ex. "u*3", "u×3"),
 * jamais de parenthèses ni de produit entre deux noms (aucune notion de produit scalaire dans ce
 * chapitre — hors programme). Le premier terme peut omettre son signe (implicitement positif) ;
 * tout terme suivant DOIT porter un signe explicite, sans quoi deux termes accolés sans opérateur
 * (ex. `3u5t`) seraient acceptés à tort comme deux termes implicitement additionnés.
 */
import type { StatutVerification } from "./statutVerification";

export type CoefficientsVecteurs = Record<string, number>;

/** 2 formes alternatives par terme (audit champs à expressions littérales, 4e) :
 * - `nom[*×]coefficient` (groupes 2-3) — ordre inversé, séparateur `*`/`×` OBLIGATOIRE (jamais
 *   implicite : "u3" resterait ambigu avec un nom de vecteur qui contiendrait un chiffre, hors
 *   grammaire ici mais évité par prudence).
 * - `[coefficient][*×]?nom` (groupes 4-5) — forme historique, coefficient d'abord, séparateur
 *   optionnel (multiplication implicite déjà supportée), `×` accepté en plus de `*`.
 * La 1ʳᵉ forme est tentée avant la 2ᵉ dans l'alternation : pour "u" seul (sans coefficient), elle
 * échoue faute de `[*×]coefficient` après le nom, et la 2ᵉ forme prend le relais normalement. */
const REGEX_TERME = /([+-]?)(?:([a-zA-Z]+)[*×](\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)?[*×]?([a-zA-Z]+))/g;

/**
 * Parse `texte` en objet `{nom: coefficient}` (chaque nom de `nomsValides` toujours présent, 0 par
 * défaut) — `null` si l'expression ne peut pas être interprétée du tout (syntaxe invalide, nom
 * inconnu, chaîne vide) : c'est à l'appelant de traiter ce `null` comme un `parse_error`, jamais un
 * `not_equivalent` (voir `diagnostiquerCombinaisonVecteurs`).
 */
export function parserCombinaisonVecteurs(texte: string, nomsValides: string[]): CoefficientsVecteurs | null {
  const nettoye = texte.replace(/\s+/g, "");
  if (nettoye === "") return null;

  const coefficients: CoefficientsVecteurs = {};
  REGEX_TERME.lastIndex = 0;
  let position = 0;
  let premierTerme = true;
  let match: RegExpExecArray | null;

  while ((match = REGEX_TERME.exec(nettoye)) !== null) {
    const [texteMatch, signeTexte, nomApresCoef, coefApresNom, coefAvantNom, nomApresCoefOuSeul] = match;
    const nom = nomApresCoef ?? nomApresCoefOuSeul;
    const coefTexte = nomApresCoef ? coefApresNom : coefAvantNom;
    if (texteMatch.length === 0 || match.index !== position) return null;
    if (!premierTerme && signeTexte === "") return null; // opérateur manquant entre deux termes
    if (!nomsValides.includes(nom)) return null;

    const signe = signeTexte === "-" ? -1 : 1;
    const coefBrut = coefTexte ? Number(coefTexte.replace(",", ".")) : 1;
    if (!Number.isFinite(coefBrut)) return null;

    coefficients[nom] = (coefficients[nom] ?? 0) + signe * coefBrut;
    position = match.index + texteMatch.length;
    premierTerme = false;
  }

  if (position !== nettoye.length) return null;
  for (const nom of nomsValides) {
    if (!(nom in coefficients)) coefficients[nom] = 0;
  }
  return coefficients;
}

const TOLERANCE = 1e-6;

export function coefficientsEgaux(a: CoefficientsVecteurs, b: CoefficientsVecteurs, nomsValides: string[]): boolean {
  return nomsValides.every((nom) => Math.abs((a[nom] ?? 0) - (b[nom] ?? 0)) <= TOLERANCE);
}

export function diagnostiquerCombinaisonVecteurs(texte: string, nomsValides: string[], cible: CoefficientsVecteurs): StatutVerification {
  const parsed = parserCombinaisonVecteurs(texte, nomsValides);
  if (parsed === null) return "parse_error";
  return coefficientsEgaux(parsed, cible, nomsValides) ? "correct" : "not_equivalent";
}
