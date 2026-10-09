import type { ExerciceFamilleA_Direct, ExerciceFamilleB, TermeA } from "../../core6e/calculPrimitives.types";
import type { EntreeBanqueArc, ValeurExacte } from "../../core6e/cyclometrique.types";
import type { ExerciceIntegraleParametre, TechniqueParametre } from "../../core6e/integralesDefinies.types";
import { evaluerTermeA, primitiveTermeA } from "../calculPrimitives/familles/A";
import { gB, primitiveGB } from "../calculPrimitives/familles/B";
import { tirerEntier, tirerEntierNonNul, tirerParmi, pgcd } from "../calculPrimitives/aleatoire";
import { BANQUE_ARCCOS, BANQUE_ARCSIN } from "../cyclometrique/banqueAngles";

/**
 * Couche A (6e) — scénario `parametre` de `6gen25` : une des deux bornes de l'intégrale définie est
 * un paramètre `m` inconnu, l'intégrale vaut une valeur `cible` donnée dans l'énoncé.
 *
 * ============================================================================
 * **RESTRICTION DÉLIBÉRÉE — 3 techniques canoniques SEULEMENT, PAS les 12 sous-types A/B/C/G**
 * ============================================================================
 * La spec évoque "second degré si primitive polynomiale, exponentielle si primitive exponentielle,
 * trigonométrique si primitive trigonométrique" — mais les sous-types RÉELLEMENT tirés au hasard par
 * `construireFamilleADirecte`/`construireFamilleB`/etc. (6gen23) ne produisent PAS des équations en
 * m résolubles par une seule technique reconnaissable dans le cas général :
 * - Famille A "direct" tire TOUJOURS 3-4 termes de TYPES DIFFÉRENTS (ln, exp, trig, puissance,
 *   arctan, arcsin mélangés) — F(fixe)−F(m)=cible devient une équation TRANSCENDANTE mixte, sans
 *   technique de résolution unique enseignée au 6e.
 * - Famille B tire un typeG/typeU aléatoire parmi 7×2 combinaisons, dont certaines (typeU=
 *   "puissance", typeG="invU"/"invSqrtU" avec racines de signe ambigu) introduisent un risque de
 *   solutions PARASITES (racines qui ne correspondent à aucune borne d'intégration valide) —
 *   difficile à garantir "propre" pour un tirage complètement libre.
 * - Familles C/G (substitution/décomposition) enchaînent plusieurs écrans supplémentaires déjà
 *   longs (jusqu'à 4) avant même d'atteindre une primitive fermée exploitable pour poser l'équation.
 *
 * Plutôt que de risquer une équation ambiguë/non résoluble générée aléatoirement, ce fichier
 * construit 3 exercices CIBLÉS À LA MAIN, un par technique, dont l'objet résultant respecte
 * EXACTEMENT le contrat `ExerciceFamilleA_Direct`/`ExerciceFamilleB` de `core6e/
 * calculPrimitives.types.ts` (donc 100% compatible avec `moteur6e/verificationCalculPrimitives.ts`
 * et `ui6e/formatCalculPrimitives.ts` SANS AUCUNE adaptation) — en réutilisant les briques de calcul
 * déjà écrites (`evaluerTermeA`/`primitiveTermeA` de la famille A, `gB`/`primitiveGB` de la famille
 * B, `BANQUE_ARCSIN`/`BANQUE_ARCCOS` de 6gen2/6gen3), jamais un tirage aléatoire complet ni une
 * formule dupliquée.
 *
 * - **polynomiale** — f(x)=k·x+c (famille A "direct", 2 termes SEULEMENT : "puissance" n=1 +
 *   "constante" — jamais 3-4 termes mélangés). F(x)=(k/2)x²+cx, une VRAIE fonction quadratique.
 *   m choisi D'ABORD (entier) ; le calcul est exact (relations de Viète) pour retrouver la
 *   DEUXIÈME racine de l'équation du second degré résultante — les 2 racines sont ajoutées à
 *   `solutionsM` (add-as-needed, 2 solutions généralement attendues).
 * - **exponentielle** — f(x)=k·eˣ (famille B, u(x)=x identité, typeG="expU"). `cible` choisie
 *   D'ABORD (entier propre), m dérivé par la technique exponentielle standard (isoler eᵐ puis
 *   ln) — fonction injective, TOUJOURS exactement 1 solution réelle.
 * - **trigonometrique** — f(x)=k·cos(x) ou k·sin(x) (famille B, u(x)=x identité, k=1 pour garder
 *   `cible` une combinaison EXACTE de 2 valeurs remarquables). borneFixe ET m choisis DIRECTEMENT
 *   dans `BANQUE_ARCSIN`/`BANQUE_ARCCOS` (paire angle↔valeur déjà exacte et croisée-vérifiée) —
 *   jamais de calcul d'arcsin/arccos à l'exécution, donc jamais de risque d'arrondi ; m reste par
 *   construction dans la branche principale (domaine explicitement annoncé à l'élève,
 *   `domaineMTexte` — sans cette restriction l'équation trigonométrique aurait une infinité de
 *   solutions périodiques, hors-sujet à ce stade du cursus).
 */

function fractionLatexLocale(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 !== den < 0 ? "-" : "";
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${signe}${n}` : `${signe}\\dfrac{${n}}{${d}}`;
}

function valeurExacteEntiere(v: number): ValeurExacte {
  return { latex: `${v}`, numerique: v };
}

// ============================================================================
// Technique "polynomiale" — second degré.
// ============================================================================

function construirePrimitivePolynomiale(k: number, c: number): ExerciceFamilleA_Direct {
  const termes: TermeA[] = [
    { type: "puissance", coef: k, n: 1 },
    { type: "constante", coef: c },
  ];
  return {
    famille: "A",
    sousType: "direct",
    termes,
    integrandeReference: (x) => termes.reduce((acc, t) => acc + evaluerTermeA(t, x), 0),
    primitiveReference: (x) => termes.reduce((acc, t) => acc + primitiveTermeA(t, x), 0),
  };
}

export function construireParametrePolynomiale(): ExerciceIntegraleParametre {
  for (let tentative = 0; tentative < 30; tentative++) {
    const k = tirerEntierNonNul(-4, 4);
    const c = tirerEntier(-4, 4);
    const primitive = construirePrimitivePolynomiale(k, c);

    const borneFixe = tirerEntier(-4, 4);
    const m = tirerEntier(-4, 4);
    if (m === borneFixe) continue;
    const mEstBorneSuperieure = tirerParmi([true, false] as const);

    // F(v) = (k/2)v² + c·v — numérateur ENTIER exact sur dénominateur 2 : F(v) = (k·v²+2c·v)/2.
    const numerateur = (v: number) => k * v * v + 2 * c * v;
    const numCible = mEstBorneSuperieure ? numerateur(m) - numerateur(borneFixe) : numerateur(borneFixe) - numerateur(m);

    // Équation résultante (k/2)x² + c·x − RHS = 0, RHS=F(m) — relations de Viète : somme des
    // racines = −c/(k/2) = −2c/k, EXACT (m est UNE des 2 racines par construction).
    const root2 = -2 * c / k - m;
    if (Math.abs(root2 - borneFixe) < 1e-9) continue; // dégénérescence (voir en-tête).
    const solutionsM = Math.abs(root2 - m) < 1e-9 ? [m] : [m, root2];

    return {
      scenario: "parametre",
      primitive,
      technique: "polynomiale",
      borneFixe,
      borneFixeLatex: `${borneFixe}`,
      mEstBorneSuperieure,
      m,
      cible: { latex: fractionLatexLocale(numCible, 2), numerique: numCible / 2 },
      solutionsM,
      domaineMTexte: null,
    };
  }
  throw new Error("construireParametrePolynomiale : aucun tirage valide trouvé après 30 tentatives");
}

// ============================================================================
// Technique "exponentielle".
// ============================================================================

function construirePrimitiveExponentielle(k: number): ExerciceFamilleB {
  const uReference = (x: number) => x;
  const uPrimeReference = () => 1;
  return {
    famille: "B",
    sousType: "unique",
    typeG: "expU",
    nG: undefined,
    typeU: "affine",
    mAffine: 1,
    nAffine: 0,
    pPuissance: undefined,
    cPuissance: undefined,
    k,
    mCoef: 1,
    expPart: 0,
    facteurAjustement: k,
    uReference,
    uPrimeReference,
    integrandeReference: (x) => k * gB("expU", uReference(x)),
    primitiveReference: (x) => k * primitiveGB("expU", uReference(x)),
  };
}

export function construireParametreExponentielle(): ExerciceIntegraleParametre {
  const k = tirerEntierNonNul(-3, 3);
  const primitive = construirePrimitiveExponentielle(k);

  for (let tentative = 0; tentative < 50; tentative++) {
    const borneFixe = tirerEntier(-2, 3);
    const mEstBorneSuperieure = tirerParmi([true, false] as const);
    const cible = tirerEntierNonNul(-15, 15);
    // mEstBorneSuperieure : k·e^m − k·e^borneFixe = cible ⟹ e^m = e^borneFixe + cible/k.
    // sinon        : k·e^borneFixe − k·e^m = cible ⟹ e^m = e^borneFixe − cible/k.
    const R = mEstBorneSuperieure ? Math.exp(borneFixe) + cible / k : Math.exp(borneFixe) - cible / k;
    if (!(R > 0)) continue;
    const m = Math.log(R);
    if (!Number.isFinite(m) || Math.abs(m - borneFixe) < 1e-6) continue;

    return {
      scenario: "parametre",
      primitive,
      technique: "exponentielle",
      borneFixe,
      borneFixeLatex: `${borneFixe}`,
      mEstBorneSuperieure,
      m,
      cible: valeurExacteEntiere(cible),
      solutionsM: [m],
      domaineMTexte: null,
    };
  }
  throw new Error("construireParametreExponentielle : aucun tirage valide trouvé après 50 tentatives");
}

// ============================================================================
// Technique "trigonometrique".
// ============================================================================

function construirePrimitiveTrigonometrique(typeG: "cosU" | "sinU"): ExerciceFamilleB {
  const uReference = (x: number) => x;
  const uPrimeReference = () => 1;
  const k = 1;
  return {
    famille: "B",
    sousType: "unique",
    typeG,
    nG: undefined,
    typeU: "affine",
    mAffine: 1,
    nAffine: 0,
    pPuissance: undefined,
    cPuissance: undefined,
    k,
    mCoef: 1,
    expPart: 0,
    facteurAjustement: 1,
    uReference,
    uPrimeReference,
    integrandeReference: (x) => k * gB(typeG, uReference(x)),
    primitiveReference: (x) => primitiveGB(typeG, uReference(x)),
  };
}

/** Oppose une `ValeurExacte` (latex + numérique) — nécessaire pour typeG="sinU" : F(x)=−cos(x), donc
 * F(angle) = −(valeur de la banque BANQUE_ARCCOS, qui donne cos(angle) et non −cos(angle)). */
function negerValeurExacte(v: ValeurExacte): ValeurExacte {
  return { latex: v.latex.startsWith("-") ? v.latex.slice(1) : `-${v.latex}`, numerique: -v.numerique };
}

/** F(angle) EXACTE pour l'entrée de banque donnée, selon `typeG` (voir en-tête de fichier :
 * typeG="cosU" ⟹ F(x)=sin(x) ⟹ F(angle)=valeur de BANQUE_ARCSIN telle quelle ; typeG="sinU" ⟹
 * F(x)=−cos(x) ⟹ F(angle)=−(valeur de BANQUE_ARCCOS), jamais la valeur brute de la banque. */
function valeurFExacte(typeG: "cosU" | "sinU", entree: EntreeBanqueArc): ValeurExacte {
  return typeG === "cosU" ? entree.valeur : negerValeurExacte(entree.valeur);
}

function combinerCibleLatex(termeM: ValeurExacte, termeFixe: ValeurExacte, mEstBorneSuperieure: boolean): string {
  // cible = (mEstBorneSuperieure ? termeM − termeFixe : termeFixe − termeM), affichée TELLE QUELLE
  // (non simplifiée en un seul radical — parfaitement acceptable, cf. en-tête de fichier).
  const [gauche, droite] = mEstBorneSuperieure ? [termeM, termeFixe] : [termeFixe, termeM];
  const droiteLatex = droite.latex.startsWith("-") ? ` + ${droite.latex.slice(1)}` : ` - ${droite.latex}`;
  return `${gauche.latex}${droiteLatex}`;
}

export function construireParametreTrigonometrique(): ExerciceIntegraleParametre {
  const typeG = tirerParmi(["cosU", "sinU"] as const);
  const primitive = construirePrimitiveTrigonometrique(typeG);
  const banque = typeG === "cosU" ? BANQUE_ARCSIN : BANQUE_ARCCOS;
  const domaineMTexte = typeG === "cosU" ? "m appartient à l'intervalle [-π/2 ; π/2]." : "m appartient à l'intervalle [0 ; π].";

  for (let tentative = 0; tentative < 50; tentative++) {
    const entreeFixe = tirerParmi(banque);
    const entreeM = tirerParmi(banque);
    if (entreeM.angle.numerique === entreeFixe.angle.numerique) continue;
    const mEstBorneSuperieure = tirerParmi([true, false] as const);
    const fM = valeurFExacte(typeG, entreeM);
    const fFixe = valeurFExacte(typeG, entreeFixe);
    const cibleNumerique = mEstBorneSuperieure ? fM.numerique - fFixe.numerique : fFixe.numerique - fM.numerique;
    if (Math.abs(cibleNumerique) < 1e-6) continue;

    return {
      scenario: "parametre",
      primitive,
      technique: "trigonometrique",
      borneFixe: entreeFixe.angle.numerique,
      borneFixeLatex: entreeFixe.angle.latex,
      mEstBorneSuperieure,
      m: entreeM.angle.numerique,
      cible: { latex: combinerCibleLatex(fM, fFixe, mEstBorneSuperieure), numerique: cibleNumerique },
      solutionsM: [entreeM.angle.numerique],
      domaineMTexte,
    };
  }
  throw new Error("construireParametreTrigonometrique : aucun tirage valide trouvé après 50 tentatives");
}

const TECHNIQUES: readonly TechniqueParametre[] = ["polynomiale", "exponentielle", "trigonometrique"];

export function construireParametre(): ExerciceIntegraleParametre {
  const technique = tirerParmi(TECHNIQUES);
  if (technique === "polynomiale") return construireParametrePolynomiale();
  if (technique === "exponentielle") return construireParametreExponentielle();
  return construireParametreTrigonometrique();
}
