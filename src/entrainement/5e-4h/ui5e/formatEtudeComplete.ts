/**
 * Couche présentation (5e) — formatage pour 5gen24 ("Étude complète"). Dépend librement des couches
 * inférieures (`core5e`/`generateurs5e`/`moteur5e`), jamais l'inverse.
 *
 * Refonte `prompt5gen24refontecomplete.md` — nouvelles règles d'affichage de D(x) (voir
 * `core5e/etudeComplete.types.ts` pour la justification complète), remplace l'ancienne convention
 * "dénominateur toujours factorisé". N(x) reste TOUJOURS développé.
 *
 * Ordre des termes des polynômes développés (numérateur, blocs P2) : `formatPolynomeLatex` prend un
 * `seed` déterministe dérivé des coefficients de l'exercice (même mécanisme, RÉPLIQUÉ localement
 * jamais importé, que `ui5e/formatLimites.ts`, 5gen20, transversal 3) — constant à travers tous les
 * écrans d'un même exercice, varie d'un tirage à l'autre.
 */
import type { ComportementInfiniEtude, ExerciceEtudeComplete, ExerciceEtudeCompletePipeline, ProprietesConstructionInverse } from "../core5e/etudeComplete.types";
import { ordreComplet } from "../moteur5e/typesEtudeComplete";
import type { PhaseEtudeComplete } from "../moteur5e/typesEtudeComplete";
import { formatFractionIrreductible } from "../ui/formatFraction";

export const CONSIGNE_GENERALE_ETUDE_COMPLETE = "Recherche toutes les asymptotes de la fonction f(x) ci-dessous :";

export const CONSIGNE_GENERALE_CONSTRUCTION_INVERSE = "Construis un exemple de fonction rationnelle f(x) qui satisfait les propriétés données ci-dessous.";

// ============================================================================
// Fragments LaTeX de bas niveau — polynômes développés (ordre variable, transversal 3).
// ============================================================================

function hashSeed(...nums: number[]): number {
  let h = 2166136261;
  for (const n of nums) {
    h ^= Math.trunc(n) + 0x9e3779b9;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function ordreTermesVarie(coeffs: number[], seed: number): number[] {
  const degres: number[] = [];
  for (let d = coeffs.length - 1; d >= 0; d--) if (coeffs[d] !== 0) degres.push(d);
  let s = seed;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = degres.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [degres[i], degres[j]] = [degres[j], degres[i]];
  }
  return degres;
}

function formatMonomeLatex(coeff: number, degre: number, premier: boolean): string {
  if (coeff === 0) return "";
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const variable = degre === 0 ? "" : degre === 1 ? "x" : `x^{${degre}}`;
  const coeffAffiche = abs === 1 && degre !== 0 ? "" : `${abs}`;
  return `${signe}${coeffAffiche}${variable}`;
}

/** `coeffs[i]` = coefficient de x^i, ordre d'affichage permuté par `seed` (déterministe). */
function formatPolynomeLatexVarie(coeffs: number[], seed: number): string {
  const ordre = ordreTermesVarie(coeffs, seed);
  let out = "";
  let premier = true;
  for (const d of ordre) {
    const frag = formatMonomeLatex(coeffs[d], d, premier);
    if (frag !== "") {
      out += frag;
      premier = false;
    }
  }
  return out === "" ? "0" : out;
}

function degrePolynome(coeffs: number[]): number {
  for (let d = coeffs.length - 1; d >= 0; d--) if (coeffs[d] !== 0) return d;
  return 0;
}

/** (x-r), simplifié en "x" nu quand r=0 (jamais "(x-0)" littéral — `prompt5gen24facteurxzero.md`,
 * portée étendue par cette refonte au facteur P1 révélé du cas degré 3). */
function formatFacteurLatex(racine: number): string {
  if (racine === 0) return "x";
  return racine >= 0 ? `(x-${racine})` : `(x+${-racine})`;
}

/** (x-r)² développé, ascendant [r², -2r, 1] — bloc P2 du cas degré 4 (double+double). */
function carreLineaireDeveloppe(r: number): number[] {
  return [r * r, -2 * r, 1];
}

/** Division synthétique EXACTE de D(x) par (x-r) — `r` est toujours une racine réelle de `coeffs`
 * par construction (voir `p1RacineSiDegre3`), jamais un facteur approché. */
function diviserParFacteurLineaire(coeffs: number[], r: number): number[] {
  const n = degrePolynome(coeffs);
  const q = new Array(n).fill(0);
  q[n - 1] = coeffs[n];
  for (let i = n - 2; i >= 0; i--) q[i] = coeffs[i + 1] + r * q[i + 1];
  return q;
}

/** Le SEUL facteur linéaire isolé présent quand deg(D)=3 — celui de `D_pointVide` s'il existe,
 * sinon celui de l'exclusion "vaSimple" (seule combinaison sans point vide atteignant ce degré :
 * "vaSimple"+"vaDouble") — voir justification complète dans `core5e/etudeComplete.types.ts`. */
function p1RacineSiDegre3(exercice: ExerciceEtudeCompletePipeline): number | null {
  if (degrePolynome(exercice.coeffsD) !== 3) return null;
  const pointVide = exercice.exclusions.find((e) => e.type === "pointVide");
  if (pointVide) return pointVide.position;
  const simple = exercice.exclusions.find((e) => e.type === "vaSimple");
  return simple ? simple.position : null;
}

function seedExercice(exercice: ExerciceEtudeCompletePipeline): number {
  return hashSeed(...exercice.coeffsN, ...exercice.coeffsD);
}

/** Fraction irréductible en LaTeX réel (`\dfrac{p}{q}`), jamais un décimal brut — `valeurPointVide`
 * (ordonnée du point retiré) est un rapport de deux entiers (M(a)/D_vraie(a)) mais rarement un
 * entier lui-même. Même patron que `formatValeurLatex` (`ui5e/formatDomaineDefinition.ts`),
 * RÉPLIQUÉ localement (jamais importé — petite primitive pure, convention transversale). */
function formatValeurLatex(valeur: number): string {
  const rendu = formatFractionIrreductible(valeur);
  if (rendu.includes("/")) {
    const [n, d] = rendu.split("/");
    // Signe devant la fraction : −\dfrac{1}{4}, jamais \dfrac{-1}{4}.
    return n.startsWith("-") ? `-\\dfrac{${n.slice(1)}}{${d}}` : `\\dfrac{${n}}{${d}}`;
  }
  return rendu;
}

/** N(x) — TOUJOURS complètement développé, quel que soit son degré (jamais de scaffold, jamais
 * pré-factorisé — seul D(x) doit l'être par l'élève pour trouver le domaine). */
export function formatNumerateurLatex(exercice: ExerciceEtudeCompletePipeline): string {
  return formatPolynomeLatexVarie(exercice.coeffsN, seedExercice(exercice));
}

/** D(x) — règles d'affichage par degré (voir en-tête + `core5e/etudeComplete.types.ts`) :
 * ≤2 développé ; 3 = P2·P1 (P1 racine explicite, P2 développé) ; 4 = P2·P2 (2 blocs développés,
 * aucune racine révélée). */
export function formatDenominateurLatex(exercice: ExerciceEtudeCompletePipeline): string {
  const deg = degrePolynome(exercice.coeffsD);
  const seed = seedExercice(exercice);
  if (deg <= 2) return formatPolynomeLatexVarie(exercice.coeffsD, seed);
  if (deg === 4) {
    const [d1, d2] = exercice.exclusions.map((e) => e.position);
    return `(${formatPolynomeLatexVarie(carreLineaireDeveloppe(d1), seed)})(${formatPolynomeLatexVarie(carreLineaireDeveloppe(d2), seed + 1)})`;
  }
  const r1 = p1RacineSiDegre3(exercice) as number;
  const p2 = diviserParFacteurLineaire(exercice.coeffsD, r1);
  // P2 réduit à un monôme (ex. x²) : écrit devant, sans parenthèses — jamais « (x+2)(x²) ».
  if (p2.filter((c) => c !== 0).length === 1) return `${formatPolynomeLatexVarie(p2, seed)}${formatFacteurLatex(r1)}`;
  return `${formatFacteurLatex(r1)}(${formatPolynomeLatexVarie(p2, seed)})`;
}

/** Bloc "données" — expression de f(x) SANS le préfixe "f(x)=" (redondant avec la consigne générale
 * "Recherche toutes les asymptotes de la fonction f(x) ci-dessous :"), visible sur TOUS les écrans
 * du pipeline (fait aussi office d'objectif persistant, même rôle que `QuestionFinale` ailleurs). */
export function formatDonneesLatex(exercice: ExerciceEtudeCompletePipeline): string {
  return `\\dfrac{${formatNumerateurLatex(exercice)}}{${formatDenominateurLatex(exercice)}}`;
}

/** f(x)=... complet, AVEC le préfixe — réutilisé uniquement là où le rappel explicite de "f(x)="
 * aide la lecture (écran récapitulatif), jamais sur le bloc de données persistant du pipeline. */
export function formatFonctionLatex(exercice: ExerciceEtudeCompletePipeline): string {
  return `f(x)=\\dfrac{${formatNumerateurLatex(exercice)}}{${formatDenominateurLatex(exercice)}}`;
}

// ============================================================================
// Labels de limite empilés — `\lim_{x\to cible}`, TOUJOURS en mode DISPLAY (`<Katex block />`).
// ============================================================================

function formatCibleLatex(cible: number | "moins-infini" | "plus-infini"): string {
  if (cible === "moins-infini") return "-\\infty";
  if (cible === "plus-infini") return "+\\infty";
  return `${cible}`;
}

export function formatLabelLimiteFLatex(cible: number | "moins-infini" | "plus-infini"): string {
  return `\\lim_{x\\to ${formatCibleLatex(cible)}} f(x)=`;
}

export function formatLabelLimiteGaucheLatex(position: number): string {
  return `\\lim_{x\\to ${position}^-} f(x)=`;
}

export function formatLabelLimiteDroiteLatex(position: number): string {
  return `\\lim_{x\\to ${position}^+} f(x)=`;
}

/** Écran de classification : « en x = r », suivi du choix « forme k/0 (limite infinie) » ou
 * « forme 0/0 » — jamais « lim f(x) = 0/0 » (une forme indéterminée n'est pas une valeur de limite,
 * audit 5e ch. 4, point 37). */
export function formatLabelTypeLimiteLatex(position: number): string {
  return `\\text{en } x=${position}`;
}

/** Forme obtenue en remplaçant x par une valeur exclue (classification), en LaTeX. */
export function formatFormeExclusionLatex(estPointVide: boolean): string {
  return estPointVide ? "\\text{forme } \\tfrac{0}{0}" : "\\text{forme } \\tfrac{k}{0}\\ \\text{(limite infinie)}";
}

export function formatLabelCoefDirecteurLatex(cible: "moins-infini" | "plus-infini"): string {
  return `a=\\lim_{x\\to ${formatCibleLatex(cible)}} \\dfrac{f(x)}{x}=`;
}

/** "-{a}x" ou "+{|a|}x" recomposé signé (jamais "-(-3)x") — fragment de `formatLabelCoefBLatex`. */
function formatMoinsAXLatex(a: number): string {
  if (a === 0) return "";
  const abs = Math.abs(a);
  const coeff = abs === 1 ? "" : `${abs}`;
  return a > 0 ? `-${coeff}x` : `+${coeff}x`;
}

/** Écran 6bis "coefB" — b=lim(f(x)-a·x), avec la valeur de `a` DÉJÀ TROUVÉE à l'écran 6 substituée
 * dans le label (jamais le symbole générique "a" — `prompt5gen24ecran6bisb.md`). */
export function formatLabelCoefBLatex(cible: "moins-infini" | "plus-infini", a: number): string {
  return `b=\\lim_{x\\to ${formatCibleLatex(cible)}} (f(x)${formatMoinsAXLatex(a)})=`;
}

// ============================================================================
// Labels/consignes/aides par écran.
// ============================================================================

export function labelPhase(phase: PhaseEtudeComplete): string {
  switch (phase) {
    case "domaine":
      return "Domaine de définition";
    case "typeLimite":
      return "Forme en chaque valeur exclue";
    case "pointVideSimplification":
      return "Point vide — simplification";
    case "pointVideLimite":
      return "Point vide — limite";
    case "pointVideConclusion":
      return "Point vide — conclusion";
    case "limitesGD1":
      return "Limites gauche/droite — 1ère exclusion";
    case "limitesGD2":
      return "Limites gauche/droite — 2e exclusion";
    case "av":
      return "Asymptotes verticales";
    case "infini":
      return "Limites à l'infini";
    case "coefDirecteur":
      return "Coefficient directeur";
    case "coefB":
      return "Ordonnée à l'origine de l'asymptote (b)";
    case "asymptoteInfini":
      return "Asymptote horizontale/oblique";
    case "casSpecial":
      return "Recoupement avec l'asymptote";
    case "constructionInverse":
      return "Construction inverse";
  }
}

/** Nombre écrit dans une phrase : vrai signe moins. */
function nombreTexte(v: number): string {
  return `${v}`.replace("-", "−");
}

function positionLimitesGD(exercice: ExerciceEtudeCompletePipeline, phase: "limitesGD1" | "limitesGD2"): number {
  const excl = phase === "limitesGD1" ? exercice.exclusions[0] : exercice.exclusions[1];
  return excl.position;
}

export function consignePhase(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): string {
  if (exercice.mode === "constructionInverse" || phase === "constructionInverse") {
    return "Écris une expression de f(x) (fraction rationnelle en x) qui vérifie les deux propriétés ci-dessus.";
  }
  const ex = exercice;
  switch (phase) {
    case "domaine":
      // Neutre : ne révèle pas le nombre de valeurs exclues (audit 5e ch. 4, point 41).
      return "Donne la ou les valeurs à exclure du domaine de définition de f.";
    case "typeLimite":
      return "Pour chaque valeur exclue, quelle forme obtiens-tu en remplaçant x par cette valeur dans f(x) ?";
    case "pointVideSimplification":
      return "Factorise le numérateur et le dénominateur de f, puis simplifie le facteur commun. Écris la forme simplifiée de f(x).";
    case "pointVideLimite": {
      const p = ex.exclusions.find((e) => e.type === "pointVide");
      return `Calcule la limite de f en x = ${nombreTexte(p?.position as number)} à l'aide de la forme simplifiée (valeur exacte ou décimale arrondie au centième).`;
    }
    case "limitesGD1":
    case "limitesGD2": {
      const position = positionLimitesGD(ex, phase);
      return `Détermine la limite à gauche puis à droite de x = ${nombreTexte(position)} (écris +inf ou −inf pour une limite infinie).`;
    }
    case "av":
      return "Donne la ou les équations des asymptotes verticales (AV).";
    case "infini":
    case "coefDirecteur":
    case "coefB":
      return "Détermine les limites suivantes (valeur exacte ou décimale arrondie au centième ; écris +inf ou −inf pour une limite infinie).";
    case "asymptoteInfini":
      return "Donne l'équation de l'asymptote horizontale (AH) ou oblique (AO) de chaque côté, ou indique qu'il n'y en a pas.";
    case "casSpecial": {
      const expression = formatExpressionAsymptoteLatex(ex.infini);
      return `\\text{La courbe de f recoupe réellement son asymptote en un point réel. Résous l'équation } f(x) = ${expression} \\text{ pour trouver les coordonnées de ce point.}`;
    }
    default:
      return "";
  }
}

/**
 * Aides — texte RichText (`$…$` = formule KaTeX en ligne, rendu par `TexteRiche5e`) : une phrase,
 * puis la formule ; jamais de formule écrite au clavier ni de phrase en mode maths (audit 5e ch. 4,
 * points 12 et 13 — les aides en `\text{}` display étaient coupées à 390 px).
 */
export function texteAideNiveau1(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): string {
  if (exercice.mode === "constructionInverse" || phase === "constructionInverse") {
    return "Choisis un dénominateur qui s'annule à la valeur donnée, par exemple $x-r$, puis ajuste le numérateur pour obtenir l'asymptote demandée.";
  }
  switch (phase) {
    case "domaine":
      return "Une valeur est exclue du domaine si elle annule le dénominateur de f — même si elle annule aussi le numérateur (point vide).";
    case "typeLimite":
      return "Remplace x par la valeur exclue. Si le numérateur s'annule aussi, c'est la forme $\\frac{0}{0}$ ; sinon c'est la forme $\\frac{k}{0}$ avec $k\\neq 0$, et la limite est infinie.";
    case "pointVideSimplification":
      return "Factorise séparément le numérateur et le dénominateur : la valeur exclue est une racine des deux, et le facteur commun se simplifie.";
    case "pointVideLimite":
      return "Remplace x par la valeur exclue dans la forme simplifiée — jamais dans la forme d'origine, qui donne $\\frac{0}{0}$.";
    case "limitesGD1":
    case "limitesGD2":
      return "Étudie le signe du dénominateur juste avant et juste après la valeur exclue. Piège : avec une racine double, le dénominateur ne change pas de signe, les deux limites sont les mêmes.";
    case "av":
      return "Un point vide (forme $\\frac{0}{0}$, simplifiable) n'est pas une asymptote verticale : seule une valeur où le dénominateur seul s'annule en donne une.";
    case "infini":
      return "En $\\pm\\infty$, ne garde que les termes de plus haut degré du numérateur et du dénominateur.";
    case "coefDirecteur":
      return "Le coefficient directeur est la limite suivante : $a=\\lim\\limits_{x\\to\\pm\\infty}\\dfrac{f(x)}{x}$. Compare le degré du numérateur à celui du dénominateur augmenté de 1.";
    case "coefB":
      return "L'ordonnée à l'origine est la limite suivante, avec la valeur de a trouvée à l'écran précédent : $b=\\lim\\limits_{x\\to\\pm\\infty}\\big(f(x)-a\\,x\\big)$. Réduis au même dénominateur, puis garde les termes de plus haut degré.";
    case "asymptoteInfini":
      return "Si la limite de f en l'infini est finie, c'est une asymptote horizontale $y=\\ell$. Si elle est infinie mais que a est fini et non nul, c'est une asymptote oblique $y=ax+b$.";
    case "casSpecial":
      return "Pose l'égalité entre f(x) et l'expression de l'asymptote, réduis au même dénominateur, puis résous l'équation obtenue au numérateur.";
    default:
      return "";
  }
}

/**
 * Aide niveau 2 — TOUJOURS un exemple travaillé sur une fonction/un cas DIFFÉRENT de l'exercice
 * affiché, jamais la réponse de l'exercice en cours. Les valeurs d'exemple sont HORS de la plage
 * réellement générée (positions d'exclusion dans [−6 ; 6], AH/pente dans [−4 ; 4]).
 */
export function texteAideNiveau2(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): string {
  if (exercice.mode === "constructionInverse" || phase === "constructionInverse") {
    return "Exemple : pour une racine en $x=20$ et une AH $y=15$, essaie $f(x)=15+\\dfrac{1}{x-20}$ ; pour une AO $y=12x+7$, essaie $f(x)=12x+7+\\dfrac{1}{x-20}$.";
  }
  if (exercice.mode !== "etude") return "";
  switch (phase) {
    case "domaine":
      return "Exemple : pour $g(x)=\\dfrac{x+1}{(x-30)(x+20)}$, les valeurs exclues sont $30$ et $-20$.";
    case "typeLimite":
      return "Exemple : pour $g(x)=\\dfrac{(x-30)(x+1)}{(x-30)(x-50)}$, en $x=30$ le numérateur et le dénominateur sont nuls (forme $\\frac{0}{0}$) ; en $x=50$, seul le dénominateur est nul (forme $\\frac{k}{0}$).";
    case "pointVideSimplification":
      return "Exemple : $g(x)=\\dfrac{(x-30)(x+20)}{(x-30)(x-10)}$ se simplifie en $\\dfrac{x+20}{x-10}$, pour $x\\neq 30$.";
    case "pointVideLimite":
      return "Exemple : la forme simplifiée $\\dfrac{x+20}{x-10}$ évaluée en $x=30$ donne $\\dfrac{50}{20}=2{,}5$.";
    case "limitesGD1":
    case "limitesGD2":
      return "Exemple : pour $g(x)=\\dfrac{1}{x-30}$, juste avant $30$ le dénominateur est négatif (limite $-\\infty$), juste après il est positif (limite $+\\infty$).";
    case "av":
      return "Exemple : si les valeurs exclues sont $30$ (forme $\\frac{k}{0}$) et $50$ (point vide), la seule asymptote verticale est $x=30$.";
    case "infini":
      if (exercice.infini.type === "oblique") {
        return "Exemple : pour $g(x)=\\dfrac{2x^{2}+1}{x-10}$, le quotient des termes dominants est $\\dfrac{2x^{2}}{x}=2x$ : la limite est $+\\infty$ en $+\\infty$ et $-\\infty$ en $-\\infty$.";
      }
      return "Exemple : pour $g(x)=\\dfrac{3x^{2}}{x^{2}-10}$, le quotient des termes dominants est $\\dfrac{3x^{2}}{x^{2}}=3$ : la limite vaut $3$.";
    case "coefDirecteur":
      return "Exemple : pour $g(x)=\\dfrac{2x^{3}}{x-10}$, $\\dfrac{g(x)}{x}=\\dfrac{2x^{3}}{x^{2}-10x}$ : le numérateur est de plus haut degré, donc a est infini.";
    case "coefB":
      return "Exemple : pour $g(x)=\\dfrac{2x^{2}+1}{x-10}$ et $a=2$, $g(x)-2x=\\dfrac{20x+1}{x-10}$, qui tend vers $20$.";
    case "asymptoteInfini":
      return "Exemple : si la limite de g en l'infini vaut $15$, AH : $y=15$. Si $a=20$ et $b=-10$, AO : $y=20x-10$.";
    case "casSpecial":
      return "Exemple : pour $g(x)=x+\\dfrac{x-15}{(x-1)(x-2)}$ (asymptote $y=x$), l'égalité $g(x)=x$ donne $\\dfrac{x-15}{(x-1)(x-2)}=0$, donc $x=15$.";
    default:
      return "";
  }
}

/** Consigne de l'écran « recoupement », en RichText (rendu à l'écran par `TexteRiche5e`). La version
 * LaTeX de `consignePhase(…, "casSpecial")` reste pour l'adaptateur d'évaluation. */
export function consigneCasSpecialTexte(exercice: ExerciceEtudeCompletePipeline): string {
  return `La courbe de f recoupe son asymptote en un point. Résous l'équation $f(x)=${formatExpressionAsymptoteLatex(exercice.infini)}$ pour trouver les coordonnées de ce point.`;
}

/** Bloc "état actuel" — accumule domaine puis chaque résultat trouvé au fil du pipeline (absent tant
 * que rien n'est confirmé, càd à l'écran "domaine" lui-même). Volontairement ABSENT à l'écran
 * "infini" (exception assumée à la convention transversale — voir `prompt5gen24refontecomplete.md`,
 * écran 5). */
export function formatTermesEtatActuelLatex(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete, ordreParcouru: PhaseEtudeComplete[]): string[] {
  if (exercice.mode !== "etude" || phase === "infini") return [];
  const ex = exercice;
  const indexPhase = ordreComplet(ex).indexOf(phase);
  const prefixe = ordreParcouru.slice(0, indexPhase);
  // Écrans 6 ("coefDirecteur"), 6bis ("coefB") et 7 ("asymptoteInfini") : portée restreinte aux
  // limites de l'écran 5 seul (écran 6), écrans 5+6 (écran 6bis), ou écrans 5+6+6bis (écran 7) —
  // jamais tout l'historique (domaine/typeLimite/point vide/limitesGD/av), voir
  // `promptcorrectiontransversaleecarts5gen24.md` et `prompt5gen24ecran6bisb.md`.
  const dejaFaites: PhaseEtudeComplete[] =
    phase === "coefDirecteur"
      ? prefixe.filter((p) => p === "infini")
      : phase === "coefB"
        ? prefixe.filter((p) => p === "infini" || p === "coefDirecteur")
        : phase === "asymptoteInfini"
          ? prefixe.filter((p) => p === "infini" || p === "coefDirecteur" || p === "coefB")
          : prefixe;
  const termes: string[] = [];
  for (const p of dejaFaites) {
    if (p === "domaine") {
      termes.push(`\\text{Domaine : } \\mathbb{R} \\setminus \\{${ex.exclusions.map((e) => e.position).join(",\\ ")}\\}`);
    } else if (p === "infini") {
      const infini = ex.infini;
      const moins = infini.type === "horizontale" ? `${infini.limite}` : infini.type === "oblique" ? (infini.pente >= 0 ? "-\\infty" : "+\\infty") : infini.signeMoinsInfini === 1 ? "+\\infty" : "-\\infty";
      const plus = infini.type === "horizontale" ? `${infini.limite}` : infini.type === "oblique" ? (infini.pente >= 0 ? "+\\infty" : "-\\infty") : infini.signePlusInfini === 1 ? "+\\infty" : "-\\infty";
      termes.push(`\\lim_{x\\to -\\infty} f(x) = ${moins},\\ \\lim_{x\\to +\\infty} f(x) = ${plus}`);
    } else if (p === "typeLimite") {
      termes.push(ex.exclusions.map((e) => `x=${e.position} :\\ ${formatFormeExclusionLatex(e.type === "pointVide")}`).join(",\\quad "));
    } else if (p === "pointVideSimplification") {
      const point = ex.exclusions.find((e) => e.type === "pointVide");
      if (point && ex.coeffsM && ex.coeffsDVraie) {
        termes.push(`f(x) = \\dfrac{${formatPolynomeLatexVarie(ex.coeffsM, seedExercice(ex))}}{${formatPolynomeLatexVarie(ex.coeffsDVraie, seedExercice(ex))}} \\text{ si } x\\neq ${point.position}`);
      }
    } else if (p === "pointVideLimite") {
      const point = ex.exclusions.find((e) => e.type === "pointVide");
      if (point) termes.push(`\\text{Point retiré : } (${point.position}\\,;\\,${formatValeurLatex(point.valeurPointVide as number)})\\ \\text{— pas d'AV, hors domaine}`);
    } else if (p === "limitesGD1" || p === "limitesGD2") {
      const excl = p === "limitesGD1" ? ex.exclusions[0] : ex.exclusions[1];
      if (excl.type === "vaDouble") termes.push(`\\lim_{x\\to ${excl.position}} f(x) = ${excl.signeGauche === 1 ? "+\\infty" : "-\\infty"}`);
      else termes.push(`\\lim_{x\\to ${excl.position}^-} f(x) = ${excl.signeGauche === 1 ? "+\\infty" : "-\\infty"},\\ \\lim_{x\\to ${excl.position}^+} f(x) = ${excl.signeDroit === 1 ? "+\\infty" : "-\\infty"}`);
    } else if (p === "av") {
      const vas = ex.exclusions.filter((e) => e.type !== "pointVide");
      termes.push(vas.length > 0 ? `\\text{AV : } ${vas.map((e) => `x=${e.position}`).join(",\\ ")}` : "\\text{Aucune asymptote verticale}");
    } else if (p === "coefDirecteur") {
      if (ex.infini.type === "oblique") termes.push(`a=${ex.infini.pente}`);
      else if (ex.infini.type === "aucune") termes.push(`a=${ex.infini.signeCoefDirecteurMoins === 1 ? "+\\infty" : "-\\infty"}\\ /\\ ${ex.infini.signeCoefDirecteurPlus === 1 ? "+\\infty" : "-\\infty"}`);
    } else if (p === "coefB") {
      if (ex.infini.type === "oblique") termes.push(`b=${ex.infini.ordonnee}`);
    } else if (p === "asymptoteInfini") {
      if (ex.infini.type === "horizontale") termes.push(`\\text{AH : } y=${ex.infini.limite}`);
      else if (ex.infini.type === "oblique") termes.push(`\\text{AO : } y=${formatPenteOrdonnee(ex.infini.pente, ex.infini.ordonnee)}`);
      else termes.push("\\text{Aucune asymptote horizontale ni oblique}");
    }
  }
  return termes;
}

/** ax + b propre : « x », « −x », « 2x », sans « 1x » ni « + 0 » (audit 5e ch. 4, point 36). */
export function formatPenteOrdonnee(pente: number, ordonnee: number): string {
  const terme = pente === 0 ? "" : pente === 1 ? "x" : pente === -1 ? "-x" : `${pente}x`;
  if (terme === "") return `${ordonnee}`;
  if (ordonnee === 0) return terme;
  return `${terme}${ordonnee > 0 ? "+" : "-"}${Math.abs(ordonnee)}`;
}

/** Expression de l'asymptote réellement recoupée (écran "casSpecial"), SANS le préfixe "y=" — pour
 * substitution directe dans "f(x) = {expression}" (jamais "f(x) = y=...", deux signes "=" redondants
 * — voir l'exemple explicite de `prompt5gen24correctionrefonte2.md`, point 6 : "f(x) = −2x−2").
 * N'est appelée que lorsque `casSpecial` existe, donc `infini.type` est TOUJOURS "horizontale" ou
 * "oblique" (jamais "aucune", qui n'a pas d'asymptote à recouper — voir `core5e/etudeComplete.types.ts`). */
function formatExpressionAsymptoteLatex(infini: ComportementInfiniEtude): string {
  return infini.type === "horizontale" ? `${infini.limite}` : infini.type === "oblique" ? formatPenteOrdonnee(infini.pente, infini.ordonnee) : "";
}

// ============================================================================
// Variante bonus — formatage des propriétés en langage naturel (inchangé).
// ============================================================================

export function formatProprietesConstructionInverseTexte(proprietes: ProprietesConstructionInverse): string[] {
  const r = `${proprietes.racineDenominateur}`.replace("-", "−");
  const p1 = `${r} est une racine du dénominateur de f (f n'est pas définie en x = ${r}).`;
  const asymptote = proprietes.asymptote;
  const p2 =
    asymptote.type === "horizontale"
      ? `f admet une asymptote horizontale d'équation y = ${`${asymptote.limite}`.replace("-", "−")} en +∞ et en −∞ (le degré du numérateur est égal à celui du dénominateur, et le rapport de leurs coefficients dominants vaut ${`${asymptote.limite}`.replace("-", "−")}).`
      : `f admet une asymptote oblique d'équation y = ${formatPenteOrdonnee(asymptote.pente, asymptote.ordonnee).replace(/-/g, "−")} (le degré du numérateur dépasse d'exactement 1 celui du dénominateur).`;
  return [p1, p2];
}

// ============================================================================
// Écran récapitulatif final — une ligne par écran RÉELLEMENT traversé.
// ============================================================================

export function estPhaseTexteSimple(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): boolean {
  return exercice.mode === "constructionInverse" || phase === "constructionInverse";
}

export function formatReponseAttendueTexte(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): string {
  if (exercice.mode === "constructionInverse" && phase === "constructionInverse") {
    return formatProprietesConstructionInverseTexte(exercice.proprietes).join(" ");
  }
  return "";
}

function formatValeurOuInfiniLatex(v: { fini: true; valeur: number } | { fini: false; signe: 1 | -1 }): string {
  return v.fini ? `${v.valeur}` : v.signe === 1 ? "+\\infty" : "-\\infty";
}

export function formatReponseAttenduePhaseLatex(exercice: ExerciceEtudeCompletePipeline, phase: PhaseEtudeComplete): string[] {
  switch (phase) {
    case "domaine":
      return [`\\{${exercice.exclusions.map((e) => e.position).join(",\\ ")}\\}`];
    case "typeLimite":
      return [exercice.exclusions.map((e) => `x=${e.position} :\\ ${formatFormeExclusionLatex(e.type === "pointVide")}`).join(",\\quad ")];
    case "pointVideSimplification": {
      const p = exercice.exclusions.find((e) => e.type === "pointVide");
      return p && exercice.coeffsM && exercice.coeffsDVraie ? [`\\dfrac{${formatPolynomeLatexVarie(exercice.coeffsM, seedExercice(exercice))}}{${formatPolynomeLatexVarie(exercice.coeffsDVraie, seedExercice(exercice))}}`] : [];
    }
    case "pointVideLimite": {
      const p = exercice.exclusions.find((e) => e.type === "pointVide");
      return [formatValeurLatex(p?.valeurPointVide as number)];
    }
    case "pointVideConclusion":
      // Plus d'écran (décision I) — conservé pour l'adaptateur d'évaluation (refonte à venir).
      return ["\\text{Non (pas d'AV) ; Non (hors domaine)}"];
    case "limitesGD1":
    case "limitesGD2": {
      const excl = phase === "limitesGD1" ? exercice.exclusions[0] : exercice.exclusions[1];
      if (excl.type === "vaDouble") return [`${excl.signeGauche === 1 ? "+\\infty" : "-\\infty"}`];
      return [`${excl.signeGauche === 1 ? "+\\infty" : "-\\infty"}\\ /\\ ${excl.signeDroit === 1 ? "+\\infty" : "-\\infty"}`];
    }
    case "av": {
      const vas = exercice.exclusions.filter((e) => e.type !== "pointVide");
      return [vas.length > 0 ? vas.map((e) => `x=${e.position}`).join(",\\ ") : "\\text{aucune}"];
    }
    case "infini": {
      const infini = exercice.infini;
      const moins = infini.type === "horizontale" ? { fini: true as const, valeur: infini.limite } : infini.type === "oblique" ? { fini: false as const, signe: (infini.pente >= 0 ? -1 : 1) as 1 | -1 } : { fini: false as const, signe: infini.signeMoinsInfini };
      const plus = infini.type === "horizontale" ? { fini: true as const, valeur: infini.limite } : infini.type === "oblique" ? { fini: false as const, signe: (infini.pente >= 0 ? 1 : -1) as 1 | -1 } : { fini: false as const, signe: infini.signePlusInfini };
      return [`${formatValeurOuInfiniLatex(moins)}\\ /\\ ${formatValeurOuInfiniLatex(plus)}`];
    }
    case "coefDirecteur": {
      const infini = exercice.infini;
      if (infini.type === "oblique") return [`${infini.pente}`];
      if (infini.type === "aucune") return [`${formatValeurOuInfiniLatex({ fini: false, signe: infini.signeCoefDirecteurMoins })}\\ /\\ ${formatValeurOuInfiniLatex({ fini: false, signe: infini.signeCoefDirecteurPlus })}`];
      return [];
    }
    case "coefB": {
      const infini = exercice.infini;
      return infini.type === "oblique" ? [`${infini.ordonnee}`] : [];
    }
    case "asymptoteInfini": {
      if (exercice.infini.type === "horizontale") return [`y=${exercice.infini.limite}`];
      if (exercice.infini.type === "oblique") return [`y=${formatPenteOrdonnee(exercice.infini.pente, exercice.infini.ordonnee)}`];
      return ["\\text{aucune}"];
    }
    case "casSpecial":
      return exercice.casSpecial ? [`(${exercice.casSpecial.x}\\,;\\,${exercice.casSpecial.y})`] : [];
    default:
      return [];
  }
}
