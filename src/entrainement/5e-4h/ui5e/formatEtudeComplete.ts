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
    return `\\dfrac{${n}}{${d}}`;
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

export function formatLabelTypeLimiteLatex(position: number): string {
  return `\\lim_{x\\to ${position}} f(x)=`;
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
      return "Classification des limites";
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
    case "domaine": {
      const n = ex.exclusions.length;
      return `Donne ${n === 1 ? "la valeur" : "les valeurs"} à exclure du domaine de définition de f`;
    }
    case "typeLimite":
      return "Pour chaque valeur exclue, de quel type de limite s'agit-il ?";
    case "pointVideSimplification":
      return "Factorise le numérateur et le dénominateur de f, puis simplifie le facteur commun. Écris la forme simplifiée de f(x).";
    case "pointVideLimite": {
      const p = ex.exclusions.find((e) => e.type === "pointVide");
      return `Calcule la limite de f en x=${p?.position} à l'aide de la forme simplifiée (forme exacte ou décimale arrondie au centième).`;
    }
    case "pointVideConclusion":
      return "Réponds aux deux questions suivantes.";
    case "limitesGD1":
    case "limitesGD2": {
      const position = positionLimitesGD(ex, phase);
      return `Détermine la limite à GAUCHE puis à DROITE de x=${position} (forme exacte ou décimale arrondie au centième, ou +inf/-inf).`;
    }
    case "av":
      return "Donne la ou les équation(s) de la ou des asymptote(s) verticale(s) AV";
    case "infini":
      return "Détermine les limites suivantes (forme exacte ou décimale arrondie au centième, ou +inf/-inf).";
    case "coefDirecteur":
      return "Détermine les limites suivantes (forme exacte ou décimale arrondie au centième, ou +inf/-inf).";
    case "coefB":
      return "Détermine les limites suivantes (forme exacte ou décimale arrondie au centième, ou +inf/-inf).";
    case "asymptoteInfini":
      return "Donne la ou les équation(s) de la ou des asymptote(s) (horizontale AH, oblique AO).";
    case "casSpecial": {
      const expression = formatExpressionAsymptoteLatex(ex.infini);
      return `\\text{La courbe de f recoupe réellement son asymptote en un point réel. Résous l'équation } f(x) = ${expression} \\text{ pour trouver les coordonnées de ce point.}`;
    }
    default:
      return "";
  }
}

export function texteAideNiveau1(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): string {
  if (exercice.mode === "constructionInverse" || phase === "constructionInverse") {
    return "Choisis d'abord un dénominateur simple qui s'annule à la bonne valeur (ex. (x-r)), puis ajuste le numérateur pour obtenir l'asymptote demandée.";
  }
  switch (phase) {
    case "domaine":
      return "Une valeur est exclue du domaine si elle annule le DÉNOMINATEUR de f — y compris si elle annule aussi le numérateur (point vide, toujours exclu du domaine).";
    case "typeLimite":
      return "Si le numérateur s'annule AUSSI à cette valeur (en plus du dénominateur), c'est une forme 0/0 — sinon la limite est infinie.";
    case "pointVideSimplification":
      return "Factorise séparément le numérateur et le dénominateur : la valeur exclue doit apparaître comme racine des deux.";
    case "pointVideLimite":
      return "Remplace x par la valeur exclue dans la forme SIMPLIFIÉE (jamais dans la forme d'origine, qui donnerait 0/0).";
    case "pointVideConclusion":
      return "Un point vide (0/0, simplifiable) n'est jamais une asymptote verticale — mais la fonction d'origine reste malgré tout indéfinie à cet endroit.";
    case "limitesGD1":
    case "limitesGD2":
      return "Piège classique : une racine DOUBLE du dénominateur ne donne jamais deux limites différentes — le signe du dénominateur ne change pas de part et d'autre.";
    case "av":
      return "Un point vide (0/0, simplifiable) n'est PAS une asymptote verticale — seule une exclusion où le dénominateur seul s'annule en est une.";
    case "infini":
      return "Pour une limite à l'infini, ne conserve que les termes de plus haut degré du numérateur et du dénominateur.";
    case "coefDirecteur":
      return "a=lim f(x)/x compare le degré du numérateur à celui du dénominateur PLUS 1 : égal → pente finie (AO), supérieur → a infini (aucune asymptote).";
    case "coefB":
      return "b=lim(f(x)-a·x) : remplace a par la valeur déjà trouvée à l'écran précédent, réduis au même dénominateur, puis ne conserve que les termes de plus haut degré.";
    case "asymptoteInfini":
      return "Si lim f(x) est finie, c'est une AH (y=cette valeur). Si lim f(x) est infinie mais a=lim f(x)/x est finie et non nulle, c'est une AO.";
    case "casSpecial":
      return "Pose l'égalité f(x) = asymptote(x), réduis au même dénominateur, puis résous l'équation obtenue au numérateur.";
    default:
      return "";
  }
}

/**
 * Aide niveau 2 — TOUJOURS un exemple travaillé sur une fonction/un cas DIFFÉRENT de l'exercice
 * affiché, jamais la réponse de l'exercice en cours (`promptcorrectiontransversaleecarts5gen24.md`,
 * point C). Les fonctions/valeurs d'exemple sont choisies HORS de la plage réellement générée par
 * `generateurs5e/etudeComplete/index.ts` (positions d'exclusion dans [-6;6], AH/pente dans [-4;4])
 * pour exclure toute coïncidence, même accidentelle, avec la réponse attendue.
 */
export function texteAideNiveau2(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): string {
  if (exercice.mode === "constructionInverse" || phase === "constructionInverse") {
    return "\\text{Exemple : pour une racine en } x=20 \\text{ et une AH } y=15\\text{, essaie } f(x)=\\dfrac{15x+1}{x-20}.";
  }
  if (exercice.mode !== "etude") return "";
  switch (phase) {
    case "domaine":
      return "\\text{Exemple : pour } g(x)=\\dfrac{x+1}{(x-30)(x+20)}\\text{, les valeurs exclues sont } x=30 \\text{ et } x=-20.";
    case "typeLimite":
      return "\\text{Exemple : pour } g(x)=\\dfrac{(x-30)(x+1)}{(x-30)(x-50)}\\text{, en } x=30 \\text{ (numérateur ET dénominateur nuls) c'est } 0/0\\text{ ; en } x=50\\text{ (dénominateur seul nul) c'est } \\infty.";
    case "pointVideSimplification":
      return "\\text{Exemple : } g(x)=\\dfrac{(x-30)(x+20)}{(x-30)(x-10)} \\text{ se simplifie en } \\dfrac{x+20}{x-10}.";
    case "pointVideLimite":
      return "\\text{Exemple : pour la forme simplifiée } g(x)=\\dfrac{x+20}{x-10}\\text{ évaluée en } x=30\\text{, on obtient } g(30)=2,5.";
    case "pointVideConclusion":
      return "\\text{Exemple : pour un point vide en } x=30\\text{, il n'y a pas d'AV en } x=30\\text{, et } x=30 \\text{ n'appartient pas au domaine.}";
    case "limitesGD1":
    case "limitesGD2":
      return "\\text{Exemple : pour } g(x)=\\dfrac{1}{x-30}\\text{, juste avant } x=30 \\text{ le dénominateur est négatif (limite } -\\infty\\text{), juste après il est positif (limite } +\\infty\\text{).}";
    case "av":
      return "\\text{Exemple : si les exclusions sont } x=30\\text{ (vraie AV) et } x=50\\text{ (point vide), alors AV : } x=30 \\text{ seulement.}";
    case "infini":
      if (exercice.infini.type === "oblique") return "\\text{Exemple : pour } g(x)=\\dfrac{2x^{2}+1}{x-10}\\text{, le reste de la division tend vers 0 : seul le quotient } 2x+20 \\text{ compte pour la limite.}";
      return "\\text{Exemple : pour } g(x)=\\dfrac{3x^{2}}{x^{2}-10}\\text{, ne conserve que le rapport des termes dominants } \\dfrac{3x^{2}}{x^{2}}=3.";
    case "coefDirecteur":
      return "\\text{Exemple : pour } g(x)=\\dfrac{2x^{3}}{x-10}\\text{, a=lim g(x)/x est le rapport des coefficients dominants de } 2x^{3} \\text{ et } x(x-10)\\text{, soit une limite infinie.}";
    case "coefB":
      return "\\text{Exemple : pour } g(x)=\\dfrac{2x^{2}+1}{x-10}\\text{ (a=2 déjà trouvé), } g(x)-2x=\\dfrac{20x+1}{x-10}\\text{, dont la limite en } \\pm\\infty \\text{ est } 20.";
    case "asymptoteInfini":
      return "\\text{Exemple : si lim g(x)=15 (finie), AH : } y=15\\text{. Si a=20 et lim(g(x)-20x)=-10, AO : } y=20x-10.";
    case "casSpecial":
      return "\\text{Exemple : pour } g(x)=x+\\dfrac{x-15}{(x-1)(x-2)} \\text{ (asymptote } y=x\\text{), pose } x+\\dfrac{x-15}{(x-1)(x-2)}=x\\text{, multiplie par } (x-1)(x-2) \\text{ pour obtenir } x-15=0\\text{, donc } x=15.";
    default:
      return "";
  }
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
      termes.push(ex.exclusions.map((e) => `\\lim_{x\\to ${e.position}} f(x) = ${e.type === "pointVide" ? "0/0" : "\\infty"}`).join(",\\ "));
    } else if (p === "pointVideSimplification") {
      const point = ex.exclusions.find((e) => e.type === "pointVide");
      if (point && ex.coeffsM && ex.coeffsDVraie) {
        termes.push(`f(x) = \\dfrac{${formatPolynomeLatexVarie(ex.coeffsM, seedExercice(ex))}}{${formatPolynomeLatexVarie(ex.coeffsDVraie, seedExercice(ex))}} \\text{ si } x\\neq ${point.position}`);
      }
    } else if (p === "pointVideLimite") {
      const point = ex.exclusions.find((e) => e.type === "pointVide");
      if (point) termes.push(`\\text{Point retiré : } (${point.position}\\,;\\,${formatValeurLatex(point.valeurPointVide as number)})`);
    } else if (p === "pointVideConclusion") {
      termes.push("\\text{Point vide : pas d'AV, hors domaine.}");
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

function formatPenteOrdonnee(pente: number, ordonnee: number): string {
  const signe = ordonnee >= 0 ? "+" : "-";
  return `${pente}x${signe}${Math.abs(ordonnee)}`;
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
  const p1 = `${proprietes.racineDenominateur} est une racine du dénominateur de f (f n'est pas définie en x=${proprietes.racineDenominateur}).`;
  const asymptote = proprietes.asymptote;
  const p2 =
    asymptote.type === "horizontale"
      ? `f admet une asymptote horizontale d'équation y=${asymptote.limite} en +∞ et en −∞ (le degré du numérateur est égal à celui du dénominateur, et le rapport de leurs coefficients dominants vaut ${asymptote.limite}).`
      : `f admet une asymptote oblique d'équation y=${formatPenteOrdonnee(asymptote.pente, asymptote.ordonnee)} (le degré du numérateur dépasse d'exactement 1 celui du dénominateur).`;
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
      return [exercice.exclusions.map((e) => (e.type === "pointVide" ? "0/0" : "\\infty")).join(",\\ ")];
    case "pointVideSimplification": {
      const p = exercice.exclusions.find((e) => e.type === "pointVide");
      return p && exercice.coeffsM && exercice.coeffsDVraie ? [`\\dfrac{${formatPolynomeLatexVarie(exercice.coeffsM, seedExercice(exercice))}}{${formatPolynomeLatexVarie(exercice.coeffsDVraie, seedExercice(exercice))}}`] : [];
    }
    case "pointVideLimite": {
      const p = exercice.exclusions.find((e) => e.type === "pointVide");
      return [formatValeurLatex(p?.valeurPointVide as number)];
    }
    case "pointVideConclusion":
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
