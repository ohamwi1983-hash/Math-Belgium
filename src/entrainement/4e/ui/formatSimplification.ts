import type { Exercice } from "../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire, TypeFraction } from "../core/simplification.types";
import { formatFacteurRacine, formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./formatEquation";
import { facteurCommun } from "../moteur/simplificationEquation";

/**
 * Titre affiché à l'élève pendant l'exercice (prompt-generateurs123groupe.md, générateur 3,
 * point 4) — jamais la notation interne "P1/P2" (jargon de conception, jamais destiné à l'élève),
 * distincte du libellé technique du catalogue de variantes {id,label} (RETROFIT-variantes-
 * generateurs.md, `CATALOGUE_VARIANTES` dans generateurs/simplification/index.ts), destiné au
 * professeur et légitimement plus technique.
 */
const LIBELLES_TYPE_FRACTION: Record<TypeFraction, string> = {
  "P2/P2": "Deux polynômes à factoriser",
  "P1/P2": "Dénominateur à factoriser",
  "P2/P1": "Numérateur à factoriser",
};

export function libelleTypeFraction(type: TypeFraction): string {
  return LIBELLES_TYPE_FRACTION[type];
}

function estP2(poly: Exercice | PolynomeLineaire): poly is Exercice {
  return "categorie" in poly;
}

/** "k" fois le facteur (x - r), ou "kx" si r=0 (jamais "k(x - 0)") — coefficient 1 omis. */
function formatFacteurAvecCoefficient(k: number, r: number): string {
  if (r === 0) return k === 1 ? "x" : `${k}x`;
  const facteur = formatFacteurRacine(r);
  return k === 1 ? facteur : `${k}(${facteur})`;
}

/**
 * Rendu LaTeX d'un polynôme brut (numérateur ou dénominateur), sans "=0" contrairement à
 * formatEnonceLatex. Pour un P1, la forme DÉVELOPPÉE "ax+b" (jamais déjà factorisée "k(x-p)",
 * gen3 image 6/7 du prompt du 27/09) : l'élève doit mettre lui-même le facteur commun en évidence,
 * comme pour un P2 — voir `formatPolynomeMisEnEvidence` pour la forme "k(x-p)" une fois cette
 * étape confirmée (ou d'emblée si k=1, rien à mettre en évidence).
 */
export function formatPolynome(poly: Exercice | PolynomeLineaire): string {
  if (estP2(poly)) return formatMembreGauche(poly.enonce);
  return formatMembreGauche({ a: 0, b: poly.k, c: -poly.k * poly.p });
}

/** "k(x-p)", ou "x-p" si k=1 (rien à mettre en évidence) — forme "mise en évidence"/factorisée d'un P1. */
function formatPolynomeLineaireFactorisee(poly: PolynomeLineaire): string {
  return formatFacteurAvecCoefficient(poly.k, poly.p);
}

/**
 * Forme "mise en évidence" d'un P2 (facteur commun sorti, jamais divisé — ex. "4(x^2-8x+15)"),
 * identique à `formatPolynome` si aucun facteur commun (pgcd(|a|,|b|,|c|)=1) ; pour un P1, la forme
 * "k(x-p)" (voir `formatPolynomeLineaireFactorisee`) — jamais `formatPolynome`, qui rend désormais
 * la forme développée non factorisée. Bug utilisateur du 27/09 : les écrans qui suivent la
 * confirmation de "mise en évidence" (denomReconnaissance, denomChamp1, denomFactorisation, et
 * leurs équivalents numérateur) régressaient vers le polynôme brut non factorisé au lieu de garder
 * cette forme déjà confirmée.
 */
export function formatPolynomeMisEnEvidence(poly: Exercice | PolynomeLineaire): string {
  if (!estP2(poly)) return formatPolynomeLineaireFactorisee(poly);
  const g = facteurCommun(poly.enonce);
  if (g <= 1) return formatPolynome(poly);
  const { a, b, c } = poly.enonce;
  return `${g}(${formatMembreGauche({ a: a / g, b: b / g, c: c / g })})`;
}

/**
 * "D(x) = <polynôme mis en évidence>", sans "=0" (prompt-corrections-affichage-simplification.md
 * points 1-2) — toujours appelée après la confirmation de "denomReduction" (ou son absence quand
 * inutile, pgcd=1), jamais avant : voir AppSimplification.tsx, où "denomReconnaissance" (premier
 * appelant) ne peut être atteint qu'après "denomReduction".
 */
export function formatEquationDenominateur(poly: Exercice): string {
  return `D(x) = ${formatPolynomeMisEnEvidence(poly)}`;
}

/** "N(x) = <polynôme mis en évidence>", sans "=0" (points 4-5) — même principe que
 * formatEquationDenominateur ci-dessus, côté numérateur. */
export function formatEquationNumerateur(poly: Exercice): string {
  return `N(x) = ${formatPolynomeMisEnEvidence(poly)}`;
}

/** "<polynôme> \neq 0" — écran "Valeurs interdites" (point 3), pas de préfixe D(x) ici. */
export function formatValeursInterdites(poly: Exercice): string {
  return `${formatMembreGauche(poly.enonce)} \\neq 0`;
}

/**
 * "<forme factorisée> \neq 0" — écran des conditions d'existence, une fois la factorisation du
 * dénominateur déjà confirmée (prompt-generateurs123groupe.md, générateur 3, point 2). Contrairement
 * à formatValeursInterdites (toujours développée), reprend la forme que l'élève vient de
 * confirmer, jamais une régression vers l'énoncé brut non factorisé (ex. affichait "2x²-50 ≠ 0"
 * au lieu de "2(x-5)(x+5) ≠ 0").
 */
export function formatValeursInterditesFactorisee(poly: Exercice): string {
  return `${formatFormeFactoriseeGenerique(poly)} \\neq 0`;
}

/**
 * Forme factorisée générique a(x-r1)(x-r2), a(x-r)^2 (racine double), ou k(x-p) pour un P1 —
 * délègue le cas P2 à formatFormeFactoriseeDepuisRacines (formatEquation.ts, module fondateur de
 * l'exercice 1), indépendante de la catégorie ou de solution.formeFactorisee (absente pour
 * cas_general).
 */
function formatFormeFactoriseeGenerique(poly: Exercice | PolynomeLineaire): string {
  if (!estP2(poly)) return formatPolynomeLineaireFactorisee(poly);
  return formatFormeFactoriseeDepuisRacines(poly.enonce, poly.solution.racines);
}

/** \frac{numérateur}{dénominateur} — rappel de contexte affiché sur chaque écran de l'exercice. */
export function formatFraction(exercice: ExerciceSimplification): string {
  return `\\frac{${formatPolynome(exercice.numerateur)}}{${formatPolynome(exercice.denominateur)}}`;
}

/**
 * Degré d'affichage d'un côté (numérateur ou dénominateur) de la fraction — "brut" (développé),
 * "miseEnEvidence" (facteur commun sorti, jamais divisé, ex. "4(x²-8x+15)" — voir
 * formatPolynomeMisEnEvidence), ou "factorisee" (forme factorisée complète, ex. "4(x-3)(x-5)").
 */
export type EtatAffichagePolynome = "brut" | "miseEnEvidence" | "factorisee";

function formatPolynomeSelonEtat(poly: Exercice | PolynomeLineaire, etat: EtatAffichagePolynome): string {
  switch (etat) {
    case "brut":
      return formatPolynome(poly);
    case "miseEnEvidence":
      return formatPolynomeMisEnEvidence(poly);
    case "factorisee":
      return formatFormeFactoriseeGenerique(poly);
  }
}

/**
 * \frac{numérateur}{dénominateur} où chaque côté est affiché selon son propre `EtatAffichagePolynome`
 * — pour le bloc "état actuel" (prompt-corrections-moteur-partage.md, point 1) : "dénominateur mis
 * en évidence puis factorisé, numérateur encore brut", etc. Un côté P1 (gen3 image 6/7 du prompt du
 * 27/09) distingue lui aussi "brut" (ax+b développé, `formatPolynome`) de "miseEnEvidence"/
 * "factorisee" (k(x-p), identiques pour un P1 — rien au-delà de la mise en évidence à factoriser).
 */
export function formatFractionProgressive(
  exercice: ExerciceSimplification,
  etatDenom: EtatAffichagePolynome,
  etatNum: EtatAffichagePolynome,
): string {
  const numAffiche = formatPolynomeSelonEtat(exercice.numerateur, etatNum);
  const denomAffiche = formatPolynomeSelonEtat(exercice.denominateur, etatDenom);
  return `\\frac{${numAffiche}}{${denomAffiche}}`;
}

/**
 * \frac{numérateur brut}{dénominateur factorisé, sauf cas_general} — écran "Conditions
 * d'existence" (CE) (prompt-generateurs123vague2.md, générateur 3, point 5, puis
 * promptgenerateur3CEcasgeneral.md) : montre la fraction complète plutôt que la seule inéquation
 * isolée sur le dénominateur — le numérateur, jamais encore traité à cette étape, reste sous sa
 * forme brute. Le dénominateur, lui, n'apparaît factorisé que pour les 3 catégories où l'élève l'a
 * déjà lui-même produit et validé à l'étape de factorisation qui précède directement cet écran
 * (mise_en_evidence/binome_conjugue/produit_remarquable) — jamais pour cas_general, dont l'écran
 * "champ1" ne demande que Δ, pas la factorisation elle-même : afficher la forme factorisée ici
 * spoilerait l'étape "Factorisation après Δ" qui suit précisément CE pour cette catégorie (voir
 * "Motifs partagés entre plusieurs exercices" / "Factorisation après Δ", CLAUDE.md). Pour
 * cas_general, le dénominateur reste tout de même affiché "mis en évidence" (jamais brut, bug
 * utilisateur du 27/09) : cette forme a déjà été confirmée à l'étape "denomReduction", bien avant
 * "champ1" — la montrer ici ne spoile rien de la factorisation complète qui suit.
 */
export function formatFractionPourCE(exercice: ExerciceSimplification): string {
  const { denominateur } = exercice;
  const denomFactoriseComplet = !estP2(denominateur) || denominateur.categorie !== "cas_general";
  return formatFractionProgressive(exercice, denomFactoriseComplet ? "factorisee" : "miseEnEvidence", "brut");
}

/** Retire une seule occurrence de p (la racine commune) et renvoie la racine restante. */
function racineRestante(racines: [number, number], p: number): number {
  const copie = [...racines];
  copie.splice(copie.indexOf(p), 1);
  return copie[0];
}

function coefficientPrincipal(poly: Exercice | PolynomeLineaire): number {
  return estP2(poly) ? poly.enonce.a : poly.k;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Forme simplifiée canonique d'un polynôme après retrait d'un facteur (x-p), avec le coefficient
 * numérique déjà réduit par formatFractionSimplifiee (pgcd partagé avec l'autre membre). */
function formatPolynomeSimplifie(poly: Exercice | PolynomeLineaire, p: number, coefficient: number): string {
  if (!estP2(poly)) return String(coefficient);
  const r = racineRestante(poly.solution.racines, p);
  return formatFacteurAvecCoefficient(coefficient, r);
}

/**
 * \frac{...}{...} de la réponse attendue à l'étape "Simplification", pour la révélation après
 * échec — toujours réduite au maximum : au-delà du retrait du facteur (x-p) commun, les
 * coefficients numériques restants sont eux aussi divisés par leur PGCD (ex: jamais "2(x-3)/4"
 * quand "(x-3)/2" est la même fraction sous forme réduite). Même principe que la forme factorisée
 * maximale du récapitulatif (voir prompt-corrections-affichage-simplification.md point 7) : seul
 * l'affichage de référence change, la validation de la réponse de l'élève reste permissive
 * (verifierSimplification accepte toujours toute fraction algébriquement équivalente).
 */
export function formatFractionSimplifiee(exercice: ExerciceSimplification): string {
  const coeffNumBrut = coefficientPrincipal(exercice.numerateur);
  const coeffDenomBrut = coefficientPrincipal(exercice.denominateur);
  const diviseur = pgcd(coeffNumBrut, coeffDenomBrut);

  const numerateur = formatPolynomeSimplifie(exercice.numerateur, exercice.racineCommune, coeffNumBrut / diviseur);
  const denominateur = formatPolynomeSimplifie(exercice.denominateur, exercice.racineCommune, coeffDenomBrut / diviseur);
  return `\\frac{${numerateur}}{${denominateur}}`;
}
