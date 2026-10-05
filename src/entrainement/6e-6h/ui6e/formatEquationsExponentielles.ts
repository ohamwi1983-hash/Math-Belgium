import type { BaseExpo, ExerciceEqExpoA, ExerciceEqExpoB, ExerciceEqExpoC, ExerciceEqExpoD, ExerciceEquationExponentielle, ValeurExacteExpo } from "../core6e/equationsExponentielles.types";
import { baseValeur } from "../generateurs6e/equationsExponentielles/rationnel";
import type { PhaseEquationExponentielle, ResultatExerciceEquationExponentielle } from "../moteur6e/typesEquationsExponentielles";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen9`. `src/ui6e/` peut dépendre de
 * `src/generateurs6e/` (même principe que `formatInjectiviteFonctions.ts`/`formatFonctionsCyclometriques.ts`)
 * — réutilise `baseValeur` pour les calculs de formatage (jamais pour re-DÉRIVER une donnée déjà
 * calculée à la génération, seulement pour l'afficher).
 *
 * Toute aide qui embarque un symbole LaTeX est retournée en `AideAvecLatex {texte, latex}` —
 * JAMAIS interpolée en texte brut (piège déjà rencontré et corrigé à de nombreuses reprises sur ce
 * chantier — 6gen2 "aideNiveau1 perdant silencieusement sa formule LaTeX", 6gen3 "aide affichant du
 * LaTeX brut non rendu", 6gen9 v1 "coefficient nul affiché tel quel").
 *
 * **Dispatch PAR FAMILLE, pas par phase seule** — même décision de conception que
 * `formatLimitesExponentielles.ts` (6gen6) : les phases (`aEcran1`, `bEcran1`...) sont préfixées
 * par famille et n'ont jamais de sens hors de leur famille.
 */
export const CONSIGNE_GENERALE = "Résous l'équation suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

/** Jamais de coefficient nul affiché, jamais de coefficient `±1` littéral. */
function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

/** Même principe que `formatSommeTermes`, mais avec un `\cdot` explicite entre le coefficient et
 * le suffixe dès que ce dernier n'est pas un simple monôme polynomial (`x`/`t`) — nécessaire pour
 * un terme comme `3\cdot 2^{x}`, où la juxtaposition directe (`32^{x}`) serait ambiguë. Réservée
 * aux termes en `base^{...}` de la famille C (style "direct"/"carreDeguise"). */
function formatSommeTermesAvecCdot(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}\\cdot ${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

function baseLatex(base: BaseExpo): string {
  if (base.estE) return "e";
  if (base.den === 1) return String(base.num);
  return `\\frac{${base.num}}{${base.den}}`;
}

/** Même chose que `baseLatex`, mais entre PARENTHÈSES quand la base est une fraction — nécessaire
 * partout où la base est immédiatement suivie d'un exposant (`base^{...}`) : `\frac{5}{2}^{-4x}`
 * (sans parenthèses) attache visuellement l'exposant au SEUL dénominateur "2" plutôt qu'à la
 * fraction entière, un rendu KaTeX AMBIGU trouvé par vérification Playwright (capture "5/2^{-4x}"
 * avec l'exposant collé sur le "2" seul) — jamais un problème pour `formatDecompositionValeurLatex`
 * (facteurs juxtaposés par `\times`, jamais suivis d'un exposant, donc `baseLatex` nue y reste
 * correcte). Entier/`e` : identique à `baseLatex` (jamais de parenthèses superflues). */
function baseLatexPourExposant(base: BaseExpo): string {
  if (base.estE || base.den === 1) return baseLatex(base);
  return `\\left(${baseLatex(base)}\\right)`;
}

/** `den` ne contient que des facteurs 2/5 ⟺ `num/den` a un développement décimal FINI. */
function denominateurDecimalFini(den: number): boolean {
  let d = den;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Décimal FRANÇAIS (virgule, `{,}` LaTeX) — même convention que le chantier 4e
 * (`ui/formatDispersion.ts`, dupliquée localement, jamais importée entre chantiers). */
function formatDecimalFrancaisLatex(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

/** Valeur numérique DÉCODÉE (jamais "base^p" littéralement) — décimal si le dénominateur le
 * permet (ex. spec : `(5/2)^{-2}=4/25=0{,}16`), fraction irréductible sinon, entier nu si `den=1`. */
function formatValeurExacteLatex(v: ValeurExacteExpo): string {
  if (v.den === 1) return String(v.num);
  if (denominateurDecimalFini(v.den)) return formatDecimalFrancaisLatex(v.num / v.den);
  return `\\frac{${v.num}}{${v.den}}`;
}

/** Décomposition amorcée de `base^exposant` en un produit répété de `base` (ou son inverse pour un
 * exposant négatif) — généralise l'exemple illustratif de la spec (`0,16=16/100=4/25`) à un seul
 * mécanisme UNIFORME, valide quelle que soit la forme d'affichage retenue (décimal, fraction ou
 * entier) : révèle la STRUCTURE (`base` répétée) sans jamais donner l'exposant final directement —
 * l'élève doit encore compter les facteurs (et gérer le signe pour un exposant négatif) pour
 * répondre. */
function formatDecompositionValeurLatex(base: BaseExpo, exposant: number): string {
  const e = Math.abs(exposant);
  if (e === 0) return "1";
  const facteurs = Array(e).fill(baseLatex(base)).join(" \\times ");
  return exposant > 0 ? facteurs : `\\dfrac{1}{${facteurs}}`;
}

// ============================================================================
// Famille A — 3 sous-types.
// ============================================================================

function formatExposantLineaireLatex(m: number, n: number): string {
  return formatSommeTermes([{ valeur: m, suffixe: "x" }, { valeur: n, suffixe: "" }]);
}

function formatEnonceA(exercice: ExerciceEqExpoA): string {
  const bl = baseLatexPourExposant(exercice.base);
  if (exercice.sousType === "A2") {
    return `\\sqrt{${bl}^{${formatExposantLineaireLatex(exercice.m, exercice.n)}} - ${formatValeurExacteLatex(exercice.valeurNumerique)}} = 0`;
  }
  const expo = exercice.sousType === "A1" ? formatExposantLineaireLatex(exercice.m, exercice.n) : formatSommeTermes([{ valeur: exercice.a, suffixe: "x^2" }, { valeur: exercice.b, suffixe: "x" }, { valeur: exercice.c, suffixe: "" }]);
  return `${bl}^{${expo}} = ${formatValeurExacteLatex(exercice.valeurNumerique)}`;
}

function consigneA(phase: "aEcran1" | "aEcran2", exercice: ExerciceEqExpoA): string {
  if (phase === "aEcran1") {
    return exercice.sousType === "A2"
      ? "Un radical est nul SI ET SEULEMENT SI son radicande est nul. Écris l'équation \"radicande = 0\" (pas encore résolue en x)."
      : "Réécris le second membre comme une puissance de la MÊME base que le premier membre — donne l'exposant cible.";
  }
  return exercice.sousType === "A3" ? "À partir de l'exposant CORRECT de l'étape précédente, résous l'équation du second degré en x (0, 1 ou 2 solutions selon le cas)." : "À partir de l'exposant/de l'équation CORRECT(E) de l'étape précédente, résous pour x.";
}

function aideA1(phase: "aEcran1" | "aEcran2", exercice: ExerciceEqExpoA): AideAvecLatex {
  if (phase === "aEcran1") {
    if (exercice.sousType === "A2") return { texte: "Isole le radicande : pose-le égal à 0, sans simplifier davantage à cette étape.", latex: null };
    return { texte: "Toute valeur numérique de l'équation doit être réécrite comme une puissance de la même base que le membre de gauche.", latex: null };
  }
  return { texte: "Deux puissances de la MÊME base sont égales si et seulement si leurs exposants sont égaux (injectivité de l'exponentielle).", latex: null };
}

function aideA2(phase: "aEcran1" | "aEcran2", exercice: ExerciceEqExpoA): AideAvecLatex {
  if (phase === "aEcran1") {
    const cible = exercice.sousType === "A1" ? exercice.p : exercice.sousType === "A2" ? exercice.c : exercice.d;
    return { texte: "Décomposition amorcée de la valeur numérique (dernière étape — l'exposant — laissée à toi) :", latex: `${formatValeurExacteLatex(exercice.valeurNumerique)} = ${formatDecompositionValeurLatex(exercice.base, cible)}` };
  }
  if (exercice.sousType === "A3") {
    const enX = formatSommeTermes([{ valeur: exercice.a, suffixe: "x^2" }, { valeur: exercice.b, suffixe: "x" }, { valeur: exercice.c - exercice.d, suffixe: "" }]);
    return { texte: "L'équation devient (ramenée à 0) :", latex: `${enX} = 0` };
  }
  const expo = exercice.sousType === "A1" ? exercice.p : exercice.c;
  return { texte: "L'équation d'exposants devient :", latex: `${formatExposantLineaireLatex(exercice.m, exercice.n)} = ${expo}` };
}

// ============================================================================
// Famille B.
// ============================================================================

function formatEnonceB(exercice: ExerciceEqExpoB): string {
  const bl = baseLatexPourExposant(exercice.base);
  return `\\sqrt{${bl}^{${formatExposantLineaireLatex(exercice.m1, exercice.n1)}}} = ${bl}^{${formatExposantLineaireLatex(exercice.m2, exercice.n2)}}`;
}

// Consigne en PROSE PURE, jamais de syntaxe LaTeX embarquée (`consigneEcran` est rendu en `<p>`
// brut par les composants d'écran, jamais via KaTeX — bug trouvé par vérification Playwright :
// "\sqrt{base^u}=base^{u/2}" s'affichait littéralement à l'écran ; la formule elle-même reste
// disponible, correctement rendue, dans l'aide niveau 1).
function consigneB(phase: "bEcran1" | "bEcran2"): string {
  return phase === "bEcran1" ? "Simplifie le radical de gauche : réécris son exposant après division par 2." : "À partir de l'exposant simplifié CORRECT de l'étape précédente, résous l'équation — ou indique qu'il n'y a AUCUNE solution si les deux membres se réduisent à une égalité fausse indépendante de x.";
}

function aideB1(phase: "bEcran1" | "bEcran2"): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Rappel : une puissance de base strictement positive reste toujours strictement positive, donc la racine carrée est toujours définie.", latex: "\\sqrt{\\text{base}^{u}} = \\text{base}^{\\frac{u}{2}}" };
  return { texte: "Si les deux membres se simplifient en une égalité fausse INDÉPENDANTE de x (ex. \"1=-4\"), l'équation n'a AUCUNE solution.", latex: null };
}

function aideB2(phase: "bEcran1" | "bEcran2", exercice: ExerciceEqExpoB): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Exposant de gauche, non encore divisé par 2 :", latex: formatExposantLineaireLatex(exercice.m1, exercice.n1) };
  return { texte: "L'équation d'exposants devient :", latex: `\\frac{${formatExposantLineaireLatex(exercice.m1, exercice.n1)}}{2} = ${formatExposantLineaireLatex(exercice.m2, exercice.n2)}` };
}

// ============================================================================
// Famille C — 3 styles de présentation.
// ============================================================================

function formatEnonceC(exercice: ExerciceEqExpoC): string {
  const bl = baseLatexPourExposant(exercice.base);
  if (exercice.style === "regroupement") {
    return `${bl}^{2x+1} + \\left(${bl}^2\\right)^{x} = ${-exercice.C}`;
  }
  if (exercice.style === "carreDeguise") {
    const baseCarree = Math.round(baseValeur(exercice.base) * baseValeur(exercice.base));
    const membreGauche = formatSommeTermesAvecCdot([{ valeur: exercice.A, suffixe: `${baseCarree}^{x}` }, { valeur: exercice.B, suffixe: `${bl}^{x}` }, { valeur: exercice.C, suffixe: "" }]);
    return `${membreGauche} = 0`;
  }
  const membreGauche = formatSommeTermesAvecCdot([{ valeur: exercice.A, suffixe: `${bl}^{2x}` }, { valeur: exercice.B, suffixe: `${bl}^{x}` }, { valeur: exercice.C, suffixe: "" }]);
  return `${membreGauche} = 0`;
}

function consigneC(phase: "cEcran1" | "cEcran2" | "cEcran3"): string {
  if (phase === "cEcran1") return "Pose t=baseˣ et réécris l'équation en t (reconnais la structure éventuellement déguisée).";
  if (phase === "cEcran2") return "Résous l'équation du second degré en t — donne TOUTES les valeurs de t, y compris négatives (elles seront filtrées à l'étape suivante).";
  return "Parmi les valeurs de t CORRECTES de l'étape précédente, REJETTE celles qui sont ≤ 0 (baseˣ ne peut jamais l'être), puis convertis les valeurs positives restantes en x.";
}

function aideC1(phase: "cEcran1" | "cEcran2" | "cEcran3", exercice: ExerciceEqExpoC): AideAvecLatex {
  if (phase === "cEcran1") {
    if (exercice.style === "regroupement") return { texte: "Relation entre les puissances en jeu, à recomposer :", latex: `\\text{base}^{2x+1} = \\text{base}\\cdot(\\text{base}^{x})^2` };
    return { texte: "Relation entre les puissances en jeu :", latex: `(\\text{base}^2)^{x} = (\\text{base}^{x})^2` };
  }
  if (phase === "cEcran2") return { texte: "Résous comme une équation du second degré ORDINAIRE en t (discriminant, formule quadratique) — aucune restriction de signe à ce stade.", latex: null };
  return { texte: "Rappel : baseˣ est TOUJOURS STRICTEMENT POSITIF, donc toute valeur de t ≤ 0 doit être rejetée avant de convertir en x.", latex: null };
}

function aideC2(phase: "cEcran1" | "cEcran2" | "cEcran3", exercice: ExerciceEqExpoC): AideAvecLatex {
  if (phase === "cEcran1") {
    const enTPartiel = exercice.style === "regroupement" ? `(\\text{base}+1)\\cdot t^2` : formatSommeTermes([{ valeur: exercice.A, suffixe: "t^2" }, { valeur: exercice.B, suffixe: "t" }]);
    return { texte: "Équation partiellement réécrite en t (terme constant laissé à toi) :", latex: `${enTPartiel} + \\ldots = 0` };
  }
  if (phase === "cEcran2") {
    const enT = formatSommeTermes([
      { valeur: exercice.A, suffixe: "t^2" },
      { valeur: exercice.B, suffixe: "t" },
      { valeur: exercice.C, suffixe: "" },
    ]);
    return { texte: "Équation en t déjà réécrite :", latex: `${enT} = 0` };
  }
  return { texte: "Valeurs de t trouvées à l'étape précédente (sans indiquer lesquelles sont rejetées) :", latex: `t = ${exercice.solutionsT[0]} \\text{ ou } t = ${exercice.solutionsT[1]}` };
}

// ============================================================================
// Famille D — 2 sous-types, TOUJOURS ∅.
// ============================================================================

function formatEnonceD(exercice: ExerciceEqExpoD): string {
  if (exercice.sousType === "D1") {
    // Jamais de coefficient "1\cdot"/"−1\cdot" littéral quand |c|=1 (bug trouvé par test) — réutilise
    // `formatSommeTermesAvecCdot` sur un terme UNIQUE, exactement le même mécanisme que les 3 termes
    // de la famille C, plutôt qu'une interpolation directe qui ignorerait ce cas.
    const puissance = `${baseLatexPourExposant(exercice.base)}^{${formatExposantLineaireLatex(exercice.m, exercice.n)}}`;
    return `${formatSommeTermesAvecCdot([{ valeur: exercice.c, suffixe: puissance }])} = 0`;
  }
  const t1 = `${baseLatexPourExposant(exercice.base1)}^{${formatExposantLineaireLatex(exercice.m1, exercice.n1)}}`;
  const t2 = `${baseLatexPourExposant(exercice.base2)}^{${formatExposantLineaireLatex(exercice.m2, exercice.n2)}}`;
  return `${formatSommeTermes([{ valeur: 1, suffixe: t1 }, { valeur: 1, suffixe: t2 }, { valeur: exercice.k, suffixe: "" }])} = 0`;
}

function consigneD(): string {
  return "Sans AUCUN calcul : cette équation a-t-elle au moins une solution réelle ?";
}

/** Même message pour D1 et D2 (le fait fondamental invoqué est identique) — `exercice` non utilisé,
 * gardé en paramètre pour une signature uniforme avec `aideD2`. */
function aideD1(_exercice: ExerciceEqExpoD): AideAvecLatex {
  return { texte: "Rappel fondamental : une puissance de base strictement positive (base>0, ≠1) reste TOUJOURS strictement positive, quel que soit l'exposant — jamais nulle ni négative.", latex: null };
}

function aideD2(exercice: ExerciceEqExpoD): AideAvecLatex {
  if (exercice.sousType === "D1") {
    return { texte: "Reformulation : un produit d'un nombre NON NUL par un terme STRICTEMENT POSITIF ne peut jamais être nul.", latex: `\\underbrace{${exercice.c}}_{\\neq 0} \\cdot \\underbrace{${baseLatexPourExposant(exercice.base)}^{\\ldots}}_{>0} \\neq 0` };
  }
  return { texte: "Reformulation : une SOMME de 2 termes strictement positifs plus une constante NON-NÉGATIVE ne peut jamais être nulle.", latex: `\\underbrace{${baseLatexPourExposant(exercice.base1)}^{\\ldots}}_{>0} + \\underbrace{${baseLatexPourExposant(exercice.base2)}^{\\ldots}}_{>0} + \\underbrace{${exercice.k}}_{\\geq 0} > 0` };
}

// ============================================================================
// Récapitulatif final — réponse RÉELLEMENT attendue par écran, JAMAIS un score fractionnaire (voir
// `components6e/ResultatPanelEquationExponentielle.tsx`). Un FRAGMENT LaTeX par élément de réponse
// (permet un retour à la ligne propre entre plusieurs solutions, `.equation-box-termes` — même
// patron que `formatReponseAttenduePhaseLatex` côté 5e, `ResultatPanelSuiteArithmetique.tsx`).
// ============================================================================

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Un nombre EXACT (entier ou fraction irréductible) — jamais de décimal pour une valeur GÉNÉRÉE
 * par la plateforme (convention transversale). Toutes les valeurs de ce générateur proviennent
 * d'une arithmétique rationnelle à petit dénominateur (voir `rationnel.ts`) SAUF `solutionsX` de la
 * famille C (`x=\log_{base}(t)`, IRRATIONNEL dans ~62% des tirages positifs — écart de conception
 * assumé, seul écran du chapitre à enseigner la forme décimale, voir `docs/historique-6e.md`) : la
 * recherche jusqu'à 24 reste exacte pour toute valeur rationnelle en pratique ; repli décimal
 * ARRONDI à 4 décimales pour une valeur réellement irrationnelle (jamais les 15+ chiffres
 * significatifs bruts d'un flottant JS — trouvé par Playwright sur le récapitulatif final). */
function formatNombreExactLatex(v: number): string {
  if (Number.isInteger(v)) return String(v);
  const signe = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  for (let den = 2; den <= 24; den++) {
    const num = Math.round(abs * den);
    if (Math.abs(num / den - abs) < 1e-9) {
      const g = pgcd(num, den);
      return `${signe}\\frac{${num / g}}{${den / g}}`;
    }
  }
  return `${Number(v.toFixed(4))}`;
}

/** Un fragment par valeur (`variable = valeur`), ou un unique fragment `\varnothing` si la liste
 * est vide — jamais un score fractionnaire, jamais une liste vide silencieuse. */
function formatEnsembleValeursLatex(valeurs: number[], variable: string): string[] {
  if (valeurs.length === 0) return ["\\varnothing"];
  return valeurs.map((v) => `${variable} = ${formatNombreExactLatex(v)}`);
}

/** Réponse RÉELLEMENT attendue d'un écran donné — un fragment LaTeX par élément (0 à N solutions).
 * Dispatch par famille PUIS par phase (même principe que `consigneEcran`/`aideNiveau1/2`) — jamais
 * dérivée de ce que l'élève a soumis, toujours reconstruite depuis les champs déjà résolus à la
 * génération de `exercice` (mêmes valeurs que `verificationEquationsExponentielles.ts`). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceEquationExponentielle, phase: PhaseEquationExponentielle): string[] {
  switch (exercice.famille) {
    case "A": {
      if (phase === "aEcran1") {
        if (exercice.sousType === "A2") {
          const bl = baseLatexPourExposant(exercice.base);
          return [`${bl}^{${formatExposantLineaireLatex(exercice.m, exercice.n)}} - ${formatValeurExacteLatex(exercice.valeurNumerique)} = 0`];
        }
        const cible = exercice.sousType === "A1" ? exercice.p : exercice.d;
        return [formatNombreExactLatex(cible)];
      }
      if (exercice.sousType === "A3") return formatEnsembleValeursLatex(exercice.solutions, "x");
      return [`x = ${formatNombreExactLatex(exercice.x)}`];
    }
    case "B": {
      if (phase === "bEcran1") return [`\\dfrac{${formatExposantLineaireLatex(exercice.m1, exercice.n1)}}{2}`];
      return exercice.contradictoire ? ["\\varnothing"] : [`x = ${formatNombreExactLatex(exercice.x as number)}`];
    }
    case "C": {
      if (phase === "cEcran1") return [`${formatSommeTermes([{ valeur: exercice.A, suffixe: "t^2" }, { valeur: exercice.B, suffixe: "t" }, { valeur: exercice.C, suffixe: "" }])} = 0`];
      if (phase === "cEcran2") return formatEnsembleValeursLatex(exercice.solutionsT, "t");
      return formatEnsembleValeursLatex(exercice.solutionsX, "x");
    }
    case "D":
      return ["\\varnothing"];
  }
}

/**
 * Total points du récapitulatif final — complément AJOUTÉ à côté de la liste `LigneRecap` colorée
 * (jamais à sa place, voir `ResultatPanelEquationExponentielle.tsx`). Somme les scores DÉJÀ calculés
 * par `sessionEquationsExponentielles.ts` (pénalité par tentative + par niveau d'aide déjà
 * appliquée, forcé à 0 sur révélation) pour les seuls écrans du résultat — le nombre d'écrans varie
 * PAR FAMILLE (`maximum = 100 × nombre d'écrans` : 200 pour A/B, 300 pour C, 100 pour D). Volontairement
 * PAS aligné sur le statut vert/orange/rouge de `LigneRecap` : un écran vert (résolu sans aide,
 * éventuellement après un essai raté) peut très bien contribuer moins que 100/100 — décision
 * explicite de l'utilisateur, voir `docs/historique-6e.md`.
 */
export function calculerTotalRecapEquationExponentielle(resultat: ResultatExerciceEquationExponentielle): { total: number; maximum: number } {
  switch (resultat.famille) {
    case "A":
    case "B":
      return { total: resultat.scoreEcran1 + resultat.scoreEcran2, maximum: 200 };
    case "C":
      return { total: resultat.scoreEcran1 + resultat.scoreEcran2 + resultat.scoreEcran3, maximum: 300 };
    case "D":
      return { total: resultat.score, maximum: 100 };
  }
}

// ============================================================================
// Bloc "état actuel" — audit "état actuel cumulatif" (voir CLAUDE.md) : ce chapitre (ch.2,
// 6gen6-6gen11) n'affichait AUCUN rappel des écrans précédents d'une même famille. Corrigé ici
// pour 6gen9 uniquement, même patron que `etatActuel` de `formatExponentiellesProblemes.ts`
// (6gen12, même chapitre) et de `formatPointsDroitesRemarquablesTriangle.ts` : `null` sur le
// PREMIER écran d'une famille (rien à rappeler), un tableau de fragments LaTeX ACCUMULÉ depuis ce
// premier écran sinon — jamais seulement l'écran immédiatement précédent. Réutilise
// `formatReponseAttenduePhaseLatex` (déjà dérivée uniquement de `exercice`, jamais de la saisie
// brute de l'élève) plutôt que de redupliquer son calcul.
// ============================================================================

/** Un rappel = les fragments de la réponse attendue d'un écran déjà confirmé, regroupés sur une
 * seule ligne et étiquetés par leur numéro d'écran (même convention que `formatExponentiellesProblemes.ts`). */
function etiqueterEcran(fragments: string[], numeroEcran: number): string {
  return `${fragments.join(",\\ ")}\\ \\text{(étape ${numeroEcran})}`;
}

/** A a 2 écrans — `aEcran1` est le premier de la famille (rien à rappeler) ; `aEcran2` rappelle
 * l'exposant cible (A1/A3) ou l'équation "radicande=0" (A2) confirmé(e) à `aEcran1`. */
function etatActuelA(exercice: ExerciceEqExpoA, phase: "aEcran1" | "aEcran2"): string[] | null {
  if (phase === "aEcran1") return null;
  const repEcran1 = formatReponseAttenduePhaseLatex(exercice, "aEcran1");
  const fragments = exercice.sousType === "A2" ? repEcran1 : [`\\text{exposant} = ${repEcran1[0]}`];
  return [etiqueterEcran(fragments, 1)];
}

/** B a 2 écrans — `bEcran1` est le premier de la famille ; `bEcran2` rappelle l'exposant déjà
 * simplifié (divisé par 2) confirmé à `bEcran1`. */
function etatActuelB(exercice: ExerciceEqExpoB, phase: "bEcran1" | "bEcran2"): string[] | null {
  if (phase === "bEcran1") return null;
  const repEcran1 = formatReponseAttenduePhaseLatex(exercice, "bEcran1");
  return [etiqueterEcran([`\\text{exposant simplifié} = ${repEcran1[0]}`], 1)];
}

/** C a 3 écrans — `cEcran1` est le premier de la famille ; `cEcran2` rappelle l'équation en t
 * confirmée à `cEcran1` ; `cEcran3` ACCUMULE cet écran 1 ET les valeurs de t confirmées à
 * `cEcran2` (jamais seulement l'écran immédiatement précédent). */
function etatActuelC(exercice: ExerciceEqExpoC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] | null {
  if (phase === "cEcran1") return null;
  const rappelEcran1 = etiqueterEcran(formatReponseAttenduePhaseLatex(exercice, "cEcran1"), 1);
  if (phase === "cEcran2") return [rappelEcran1];
  const rappelEcran2 = etiqueterEcran(formatReponseAttenduePhaseLatex(exercice, "cEcran2"), 2);
  return [rappelEcran1, rappelEcran2];
}

/** D n'a qu'un SEUL écran (`dEcran`, toujours le premier — et unique — de la famille) : jamais
 * rien à rappeler, `etatActuel` reste `null` sans exception. */
export function etatActuel(exercice: ExerciceEquationExponentielle, phase: PhaseEquationExponentielle): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return etatActuelB(exercice, phase as "bEcran1" | "bEcran2");
    case "C":
      return etatActuelC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return null;
  }
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données (l'équation) affiché sur CHAQUE écran de l'exercice (spec : "consigne générale
 * et bloc de données... redondants sur chaque écran"). */
export function formatEnonceLatex(exercice: ExerciceEquationExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return formatEnonceA(exercice);
    case "B":
      return formatEnonceB(exercice);
    case "C":
      return formatEnonceC(exercice);
    case "D":
      return formatEnonceD(exercice);
  }
}

export function consigneEcran(phase: PhaseEquationExponentielle, exercice: ExerciceEquationExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aEcran1" | "aEcran2", exercice);
    case "B":
      return consigneB(phase as "bEcran1" | "bEcran2");
    case "C":
      return consigneC(phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return consigneD();
  }
}

export function aideNiveau1(phase: PhaseEquationExponentielle, exercice: ExerciceEquationExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(phase as "aEcran1" | "aEcran2", exercice);
    case "B":
      return aideB1(phase as "bEcran1" | "bEcran2");
    case "C":
      return aideC1(phase as "cEcran1" | "cEcran2" | "cEcran3", exercice);
    case "D":
      return aideD1(exercice);
  }
}

export function aideNiveau2(phase: PhaseEquationExponentielle, exercice: ExerciceEquationExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(phase as "aEcran1" | "aEcran2", exercice);
    case "B":
      return aideB2(phase as "bEcran1" | "bEcran2", exercice);
    case "C":
      return aideC2(phase as "cEcran1" | "cEcran2" | "cEcran3", exercice);
    case "D":
      return aideD2(exercice);
  }
}
