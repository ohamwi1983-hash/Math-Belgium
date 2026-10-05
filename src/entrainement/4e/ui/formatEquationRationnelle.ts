import type { ExerciceCas4a, ExerciceCas4b, ExerciceEquationRationnelle, FractionAReduire } from "../core/equationRationnelle.types";
import type { Exercice } from "../core/generateur.types";
import type { PolynomeLineaire } from "../core/simplification.types";
import type { PhaseEquationRationnelle } from "../moteur/typesEquationRationnelle";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./formatEquation";

/** "x - n", "x + |n|" si n négatif, ou "x" nu si n=0 — jamais "x - (-n)" (section 1, point 6 de la spec). */
function formatXMoins(n: number): string {
  if (n === 0) return "x";
  return n > 0 ? `x - ${n}` : `x + ${Math.abs(n)}`;
}

/**
 * "kx + c" développé, terme constant omis si c=0 — jamais "1x"/"-1x"/"-0". Utilisé pour N(x)=k(x-t)
 * de la construction deux_denominateurs : correctif "tous les polynômes affichés dans l'énoncé
 * doivent être sous forme complètement développée, sans exception"
 * (prompt-1-renommage-et-correctifs-cas2.md) — jamais "k(x-t)" pré-factorisé.
 */
function formatLineaireDeveloppe(k: number, c: number): string {
  const termeK = k === 1 ? "x" : k === -1 ? "-x" : `${k}x`;
  if (c === 0) return termeK;
  return `${termeK} ${c > 0 ? "+" : "-"} ${Math.abs(c)}`;
}

/** \frac{A}{x-p} = x-q — construction un_denominateur (section 1, point 6 de la spec). */
function formatUnDenominateur(A: number, p: number, q: number): string {
  return `\\frac{${A}}{${formatXMoins(p)}} = ${formatXMoins(q)}`;
}

/**
 * \frac{A}{x-p} = \frac{kx-kt}{x²-(p+s)x+ps} — construction deux_denominateurs
 * (prompt-deux-denominateurs-racine-etrangere.md). D(x)=(x-p)(x-s) et N(x)=k(x-t) sont toujours
 * affichés développés, jamais pré-factorisés (correctif 1 : l'élève doit factoriser lui-même D(x)
 * pour découvrir le facteur commun (x-p) partagé avec le dénominateur de gauche) — D(x) est
 * toujours monique (coefficient 1 en x², produit de deux facteurs linéaires unitaires), donc
 * directement réutilisable via formatMembreGauche (exercice 1), même convention de signes.
 */
function formatDeuxDenominateurs(A: number, p: number, s: number, t: number, k: number): string {
  const gauche = `\\frac{${A}}{${formatXMoins(p)}}`;
  const numerateur = formatLineaireDeveloppe(k, -k * t);
  const denominateur = formatMembreGauche({ a: 1, b: -(p + s), c: p * s });
  const droite = `\\frac{${numerateur}}{${denominateur}}`;
  return `${gauche} = ${droite}`;
}

/** "kx - kp" — rendu développé d'un PolynomeLineaire k(x-p), jamais "k(x-p)" pré-factorisé. */
export function formatPolynomeLineaireDeveloppe(poly: PolynomeLineaire): string {
  return formatLineaireDeveloppe(poly.k, -poly.k * poly.p);
}

/**
 * \frac{P1_1}{P1_2} = \frac{P1_3}{P1_4} — construction deux_fractions_lineaires
 * (prompt-2-cas3-degre1.md), les 4 polynômes toujours développés (même règle générale que
 * deux_denominateurs) : chacun est un simple binôme k(x-p), jamais affiché sous forme factorisée.
 */
function formatDeuxFractionsLineaires(
  n1: PolynomeLineaire,
  d1: PolynomeLineaire,
  n2: PolynomeLineaire,
  d2: PolynomeLineaire,
): string {
  const gauche = `\\frac{${formatPolynomeLineaireDeveloppe(n1)}}{${formatPolynomeLineaireDeveloppe(d1)}}`;
  const droite = `\\frac{${formatPolynomeLineaireDeveloppe(n2)}}{${formatPolynomeLineaireDeveloppe(d2)}}`;
  return `${gauche} = ${droite}`;
}

/**
 * \frac{P2}{P1_1} = \frac{P0}{P1_2} — construction p2_sur_p1 (cas 4a, prompt-cas4a-4b.md). P2
 * (fractionGauche.numerateur) toujours développé via formatMembreGauche (jamais pré-factorisé,
 * même règle générale que le reste du générateur), P1_1/P1_2 toujours développés.
 */
function formatCas4a(exercice: ExerciceCas4a): string {
  const P2 = exercice.fractionGauche.numerateur as Exercice;
  const P1_1 = exercice.fractionGauche.denominateur as PolynomeLineaire;
  const gauche = `\\frac{${formatMembreGauche(P2.enonce)}}{${formatPolynomeLineaireDeveloppe(P1_1)}}`;
  const droite = `\\frac{${exercice.P0}}{${formatPolynomeLineaireDeveloppe(exercice.denominateurDroit)}}`;
  return `${gauche} = ${droite}`;
}

/** \frac{P1_1}{P2} = \frac{P1_2}{P0} — construction p1_sur_p2 (cas 4b, prompt-cas4a-4b.md), même règle. */
function formatCas4b(exercice: ExerciceCas4b): string {
  const P1_1 = exercice.fractionGauche.numerateur as PolynomeLineaire;
  const P2 = exercice.fractionGauche.denominateur as Exercice;
  const gauche = `\\frac{${formatPolynomeLineaireDeveloppe(P1_1)}}{${formatMembreGauche(P2.enonce)}}`;
  const droite = `\\frac{${formatPolynomeLineaireDeveloppe(exercice.numerateurDroit)}}{${exercice.P0}}`;
  return `${gauche} = ${droite}`;
}

/** Rendu LaTeX de l'énoncé affiché à l'élève — dispatch selon la construction tirée. */
export function formatEquationRationnelleLatex(exercice: ExerciceEquationRationnelle): string {
  switch (exercice.construction) {
    case "un_denominateur":
      return formatUnDenominateur(exercice.A, exercice.p, exercice.q);
    case "deux_denominateurs":
      return formatDeuxDenominateurs(exercice.A, exercice.p, exercice.s, exercice.t, exercice.k);
    case "deux_fractions_lineaires":
      return formatDeuxFractionsLineaires(
        exercice.numerateurGauche,
        exercice.denominateurGauche,
        exercice.numerateurDroit,
        exercice.denominateurDroit,
      );
    case "p2_sur_p1":
      return formatCas4a(exercice);
    case "p1_sur_p2":
      return formatCas4b(exercice);
  }
}

function appliquerReduction(poly: PolynomeLineaire, diviseur: number): PolynomeLineaire {
  return { k: poly.k / diviseur, p: poly.p };
}

/**
 * Rendu LaTeX d'une fraction réduite : la constante nue (`numerateur.k / denominateur.k`) quand
 * numérateur et dénominateur partagent la même racine — cas de la sous-variante 3(a) de
 * "deux_fractions_lineaires", où la fraction P1_3/P1_4 est toujours proportionnelle et se réduit
 * donc intégralement à un nombre (chemin linéaire, prompt-4-chemin-lineaire.md, section 4), jamais
 * à un simple facteur numérique comme une réduction ordinaire — sinon la fraction réduite classique
 * (`diviseur` appliqué aux deux coefficients, racines inchangées).
 */
export function formatFractionReduiteOuConstante(fraction: FractionAReduire): string {
  if (fraction.numerateur.p === fraction.denominateur.p) {
    return String(fraction.numerateur.k / fraction.denominateur.k);
  }
  const numerateur = appliquerReduction(fraction.numerateur, fraction.diviseur);
  const denominateur = appliquerReduction(fraction.denominateur, fraction.diviseur);
  return `\\frac{${formatPolynomeLineaireDeveloppe(numerateur)}}{${formatPolynomeLineaireDeveloppe(denominateur)}}`;
}

/**
 * Rendu LaTeX de la SEULE fraction concernée par l'étape "Simplification" (cas 4a/4b), sous sa
 * forme factorisée — jamais l'équation complète à deux fractions, ambiguë sur laquelle des deux
 * doit être simplifiée (promptgenerateur4equationRationnelle.md, point 5). Le P2 embarqué est
 * toujours rendu via formatFormeFactoriseeDepuisRacines (dérivée de enonce.a et des racines
 * connues, jamais de solution.formeFactorisee — absente pour cas_general), le côté P1 toujours
 * développé (formatPolynomeLineaireDeveloppe, même convention que le reste de ce fichier).
 */
export function formatFractionGaucheFactorisee(exercice: ExerciceCas4a | ExerciceCas4b): string {
  if (exercice.construction === "p2_sur_p1") {
    const P2 = exercice.fractionGauche.numerateur as Exercice;
    const P1_1 = exercice.fractionGauche.denominateur as PolynomeLineaire;
    const numerateur = formatFormeFactoriseeDepuisRacines(P2.enonce, P2.solution.racines);
    return `\\frac{${numerateur}}{${formatPolynomeLineaireDeveloppe(P1_1)}}`;
  }
  const P1_1 = exercice.fractionGauche.numerateur as PolynomeLineaire;
  const P2 = exercice.fractionGauche.denominateur as Exercice;
  const denominateur = formatFormeFactoriseeDepuisRacines(P2.enonce, P2.solution.racines);
  return `\\frac{${formatPolynomeLineaireDeveloppe(P1_1)}}{${denominateur}}`;
}

/**
 * Rendu LaTeX post-simplification du cas 4a : le côté gauche P2/P1_1 se réduit intégralement à un
 * binôme nu A(x-r) (A = P2.enonce.a / P1_1.k, r l'autre racine de P2, ou p lui-même si P2 a une
 * racine double) — le dénominateur P1_1 disparaît entièrement, jamais une fraction résiduelle. Le
 * côté droit P0/P1_2 n'a jamais besoin d'être simplifié (P0 est une constante).
 */
function formatCas4aApresSimplification(exercice: ExerciceCas4a): string {
  const P2 = exercice.fractionGauche.numerateur as Exercice;
  const P1_1 = exercice.fractionGauche.denominateur as PolynomeLineaire;
  const p = exercice.fractionGauche.racineCommune;
  const A = P2.enonce.a / P1_1.k;
  const r = P2.solution.racines.find((x) => x !== p) ?? p;

  const gauche = formatPolynomeLineaireDeveloppe({ k: A, p: r });
  const droite = `\\frac{${exercice.P0}}{${formatPolynomeLineaireDeveloppe(exercice.denominateurDroit)}}`;
  return `${gauche} = ${droite}`;
}

/**
 * Rendu LaTeX post-simplification du cas 4b : le côté gauche P1_1/P2 se réduit à k1/[a(x-s)] — le
 * numérateur P1_1 disparaît entièrement (devient la constante nue k1), le dénominateur ne perd que
 * le facteur (x-p), conservant son coefficient dominant `a` intact devant (x-s).
 */
function formatCas4bApresSimplification(exercice: ExerciceCas4b): string {
  const P1_1 = exercice.fractionGauche.numerateur as PolynomeLineaire;
  const P2 = exercice.fractionGauche.denominateur as Exercice;
  const p = exercice.fractionGauche.racineCommune;
  const s = P2.solution.racines.find((x) => x !== p) as number;

  const gauche = `\\frac{${P1_1.k}}{${formatPolynomeLineaireDeveloppe({ k: P2.enonce.a, p: s })}}`;
  const droite = `\\frac{${formatPolynomeLineaireDeveloppe(exercice.numerateurDroit)}}{${exercice.P0}}`;
  return `${gauche} = ${droite}`;
}

/**
 * Rendu LaTeX de l'énoncé une fois l'étape "simplifier" passée (réussie ou révélée) —
 * prompt-3-simplifier-et-isolement-flexible.md, section 2 : "l'étape isolement qui suit doit
 * utiliser les fractions simplifiées ... pas les fractions d'origine". Substitue chaque fraction de
 * `exercice.fractionsSimplifiables` par son rendu réduit (`formatFractionReduiteOuConstante` — soit
 * une fraction plus petite, soit une constante nue pour le chemin linéaire) ; identique à
 * `formatEquationRationnelleLatex` quand `fractionsSimplifiables` est vide (un_denominateur/
 * deux_denominateurs, toujours vide, ou deux_fractions_lineaires sans fraction réductible).
 */
export function formatEquationRationnelleLatexApresSimplification(exercice: ExerciceEquationRationnelle): string {
  if (exercice.construction === "p2_sur_p1") return formatCas4aApresSimplification(exercice);
  if (exercice.construction === "p1_sur_p2") return formatCas4bApresSimplification(exercice);

  if (exercice.construction !== "deux_fractions_lineaires" || exercice.fractionsSimplifiables.length === 0) {
    return formatEquationRationnelleLatex(exercice);
  }

  const gauche = exercice.fractionsSimplifiables.find((f) => f.cote === "gauche");
  const droite = exercice.fractionsSimplifiables.find((f) => f.cote === "droite");

  const coteGauche = gauche
    ? formatFractionReduiteOuConstante(gauche)
    : `\\frac{${formatPolynomeLineaireDeveloppe(exercice.numerateurGauche)}}{${formatPolynomeLineaireDeveloppe(exercice.denominateurGauche)}}`;
  const coteDroit = droite
    ? formatFractionReduiteOuConstante(droite)
    : `\\frac{${formatPolynomeLineaireDeveloppe(exercice.numerateurDroit)}}{${formatPolynomeLineaireDeveloppe(exercice.denominateurDroit)}}`;

  return `${coteGauche} = ${coteDroit}`;
}

/**
 * Phases où la fraction de gauche (cas 4a/4b) ou les fractions de `fractionsSimplifiables` (cas
 * 1/2/3) ne sont pas encore réduites — le rappel doit alors montrer l'énoncé BRUT, jamais la
 * version "après simplification" qui trahirait par avance le travail de l'étape "simplifier"
 * elle-même. Une fois "isolement" atteint (donc après confirmation du volet Simplifier, léger ou
 * riche, quand il existe), la version réduite est déjà un fait établi — voir
 * `formatEquationRationnelleLatexApresSimplification`.
 */
const PHASES_FRACTION_NON_ENCORE_SIMPLIFIEE: ReadonlySet<PhaseEquationRationnelle> = new Set([
  "ce",
  "simplifier",
  "simplifierReduction",
  "simplifierReconnaissance",
  "simplifierChamp1",
  "simplifierChamp2",
  "simplifierFactorisation",
  "simplifierFraction",
]);

/**
 * Rappel de l'équation rationnelle complète de départ (promptgenerateur4vague2.md, point 1) —
 * chaque écran de la séquence perd, au fil des étapes, le contexte de cette équation complète au
 * profit du seul fragment sur lequel porte l'étape en cours (N(x)=..., D(x)=..., l'équation isolée
 * seule...) ; cette fonction fournit systématiquement l'équation complète à rappeler en plus de ce
 * fragment, jamais à sa place. Reflète toujours la forme RÉELLEMENT connue de l'élève à ce stade
 * (jamais la version réduite avant que l'étape "simplifier" ne l'ait confirmée) — voir
 * `PHASES_FRACTION_NON_ENCORE_SIMPLIFIEE` ci-dessus.
 */
export function formatRappelEquationRationnelle(
  exercice: ExerciceEquationRationnelle,
  phase: PhaseEquationRationnelle,
): string {
  return PHASES_FRACTION_NON_ENCORE_SIMPLIFIEE.has(phase)
    ? formatEquationRationnelleLatex(exercice)
    : formatEquationRationnelleLatexApresSimplification(exercice);
}
