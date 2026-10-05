/**
 * Couche présentation (5e) — formatage LaTeX/texte pour l'EXTENSION de 5gen10 (écran 0
 * "reconnaissance" + familles 2/3/4 — voir CLAUDE.md section 5gen10 "Extension — 4 familles").
 * Module FRÈRE de `formatEquationTrig.ts` (famille "directe", inchangé, toujours consommé tel
 * quel par les 3 écrans hérités) — réutilise ses primitives exportées (`formatArgumentLatex`/
 * `formatValeurLatex`/`formatEquationEnonceLatex`/`formatBrancheLatex`) plutôt que de les
 * redévelopper, mais introduit ses propres constantes locales (ex. `NOM_FONCTION_LATEX`) quand la
 * primitive existante n'est pas exportée — même principe de petite duplication déjà établi ailleurs
 * sur la plateforme.
 */
import { formatAngleLabelTexte, formatArgumentLatex, formatBrancheLatex, formatEquationEnonceLatex, formatValeurLatex } from "./formatEquationTrig";
import type {
  BrancheX,
  CoefficientRationnel,
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
  FamilleEquationTrigonometrique,
  FonctionTrig,
  RegimeEquationTrig,
  ValeurPiOuDecimale,
} from "../core5e/equationsTrigonometriques.types";

const NOM_FONCTION_LATEX: Record<FonctionTrig, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };

// ============================================================================
// Écran 0 — Reconnaissance de la technique.
// ============================================================================

export const CONSIGNE_RECONNAISSANCE = "Quelle technique permet de résoudre cette équation trigonométrique ?";

export const OPTIONS_FAMILLE: { id: FamilleEquationTrigonometrique; label: string }[] = [
  { id: "directe", label: "Application directe" },
  { id: "produit", label: "Produit de facteurs" },
  { id: "pythagoricienne", label: "Substitution pythagoricienne" },
  { id: "egalite", label: "Égalité de deux expressions" },
];

function formatFacteurBrutLatex(facteur: ExerciceEquationTrig): string {
  return `\\left(${NOM_FONCTION_LATEX[facteur.fonction]}\\left(${formatArgumentLatex(facteur.a, facteur.b)}\\right) - ${facteur.k.latex}\\right)`;
}

/**
 * E.2 — simplifications d'affichage pour la famille "produit" (les 3 endroits qui construisent une
 * équation depuis un `k.latex` brut, potentiellement 0/1/-1/décimal-négatif : `formatEnonceProduitLatex`
 * pour les DEUX sous-cas "factoree" ET "nonFactoree", et `formatAidePrefacteurNiveau2Latex`
 * ci-dessous) — corrigé après un bug constaté en production : la 1ʳᵉ version ne s'appliquait qu'au
 * sous-cas "nonFactoree", laissant "factoree" afficher "- -2,8"/"- 0" bruts, jamais simplifiés.
 * 4 motifs bruts produits mécaniquement selon la valeur de k (0/1/-1/décimale), jamais nécessaires
 * ailleurs sur la plateforme :
 * 1. "- 0" retiré entièrement (ex. "(cos(x) - 0)" -> "(cos(x))").
 * 2. "- -1" (double négation) simplifié en "+ 1".
 * 3. "fn\left(arg\right)^2" (le carré porte sur toute la parenthèse) réécrit "fn^2\left(arg\right)"
 *    (notation "cos²(x)", jamais "cos(x)²").
 * 4. "1\cdot " (multiplication implicite par 1) retiré — jamais "-1\cdot " (signe réel, conservé),
 *    ni le "1" final d'une décimale virgule comme "2,1\cdot " (bug constaté en production : le "1"
 *    de "2,1" était confondu avec le coefficient "1" à retirer, laissant "2,\cdot " tronqué — la
 *    virgule doit donc être exclue du lookbehind au même titre qu'un chiffre).
 * Chaque passe est un no-op si le motif est absent — application inconditionnelle, sûre sur
 * n'importe quelle chaîne LaTeX produite par ce module.
 */
export function simplifierAffichageProduit(latex: string): string {
  let s = latex;
  // 3. "fn\left(ARG\right)^2" -> "fn^2\left(ARG\right)" — l'argument ne contient jamais lui-même
  // \left(/\right) dans ce module (formatArgumentLatex ne les émet pas), un match non-gourmand est
  // donc toujours exact.
  s = s.replace(/\\(sin|cos|tan)\\left\(([\s\S]*?)\\right\)\^2/g, "\\$1^2\\left($2\\right)");
  // 2. double négation "- -X" -> "+ X" (X = chiffre ou début de \frac/\sqrt) — AVANT le retrait du
  // "- 0" (qui ne cible qu'un simple zéro final, jamais un "- -0" improbable).
  s = s.replace(/-\s*-(?=\d|\\)/g, "+ ");
  // 1. terme "- 0" en fin de facteur (juste avant une parenthèse fermante ou en fin de chaîne).
  s = s.replace(/\s*-\s*0(?=\\right\)|$)/g, "");
  // 4. "1\cdot " isolé — jamais précédé d'un chiffre, d'une virgule décimale ou d'un signe "-"
  // (qui en ferait respectivement le "1" final d'une décimale comme "2,1", ou un "-1\cdot " réel).
  s = s.replace(/(?<![\d,-])1\\cdot\s*/g, "");
  return s;
}

/** Énoncé "produit" — équation MIXTE non factorisée (T²=k₂T) pour "nonFactoree" (même référence
 * que `diagnostiquerFactorisationProduit`), déjà FACTORISÉE pour "factoree" (rien à factoriser) —
 * les 2 sous-cas passent par les mêmes simplifications d'affichage E.2 (`simplifierAffichageProduit`,
 * jamais réservées à un seul sous-cas, voir son en-tête). */
export function formatEnonceProduitLatex(exercice: ExerciceProduitFacteurs): string {
  if (exercice.sousCas === "factoree") {
    return simplifierAffichageProduit(`${formatFacteurBrutLatex(exercice.facteur1)}${formatFacteurBrutLatex(exercice.facteur2)} = 0`);
  }
  const fn = NOM_FONCTION_LATEX[exercice.facteur2.fonction];
  const arg = formatArgumentLatex(exercice.facteur2.a, exercice.facteur2.b);
  return simplifierAffichageProduit(`${fn}\\left(${arg}\\right)^2 = ${exercice.facteur2.k.latex}\\cdot ${fn}\\left(${arg}\\right)`);
}

function formatTermeSigneLatex(coef: number, expr: string, premier: boolean): string {
  if (coef === 0) return "";
  const signe = coef < 0 ? "-" : premier ? "" : "+";
  const magnitude = Math.abs(coef);
  const coefTexte = expr !== "" && magnitude === 1 ? "" : `${magnitude}`;
  return `${signe}${coefTexte}${expr}`;
}

/** Équation MIXTE d'origine (identité pythagoricienne pas encore appliquée) — même référence que
 * `evaluerMixtePythagoricienne` (`moteur5e/verificationEquationTrig.ts`), reconstruite ici en LaTeX
 * pour l'affichage uniquement (jamais consommée par la vérification). */
export function formatEnonceMixteLatex(exercice: ExercicePythagoricienne): string {
  const { alpha, beta, gamma, fonctionCible } = exercice;
  const autre = fonctionCible === "cos" ? "\\sin^2(x)" : "\\cos^2(x)";
  const cible = fonctionCible === "cos" ? "\\cos(x)" : "\\sin(x)";
  const t1 = formatTermeSigneLatex(-alpha, autre, true);
  const t2 = formatTermeSigneLatex(beta, cible, t1 === "");
  const t3 = formatTermeSigneLatex(alpha + gamma, "", t1 === "" && t2 === "");
  const membres = [t1, t2, t3].filter((t) => t !== "");
  return `${membres.length > 0 ? membres.join("") : "0"} = 0`;
}

/** Polynôme CIBLE (pur, une seule fonction) — α·T²+β·T+γ=0, T=cos(x) ou sin(x). Réutilisée par
 * l'aide de l'écran "conversionPythagoricienne" (formule à ATTEINDRE, jamais donnée directement en
 * LaTeX-résultat). */
export function formatPolynomeCibleLatex(exercice: ExercicePythagoricienne): string {
  const { alpha, beta, gamma, fonctionCible } = exercice;
  const T = `${fonctionCible === "cos" ? "\\cos" : "\\sin"}(x)`;
  const t1 = formatTermeSigneLatex(alpha, `${T}^2`, true);
  const t2 = formatTermeSigneLatex(beta, T, t1 === "");
  const t3 = formatTermeSigneLatex(gamma, "", t1 === "" && t2 === "");
  const membres = [t1, t2, t3].filter((t) => t !== "");
  return `${membres.length > 0 ? membres.join("") : "0"} = 0`;
}

/** Énoncé "égalité" — équation d'origine AVANT conversion (2 fonctions trigonométriques
 * différentes, sauf tanVersTan où le second membre porte déjà un signe "-" à corriger). */
export function formatEnonceEgaliteLatex(exercice: ExerciceEgaliteExpressions): string {
  const argA = formatArgumentLatex(exercice.a1, exercice.b1);
  const argB = formatArgumentLatex(exercice.a2, exercice.b2);
  if (exercice.identite === "tanVersTan") return `\\tan\\left(${argA}\\right) = -\\tan\\left(${argB}\\right)`;
  const fnA = exercice.identite === "cosVersCos" ? "\\cos" : "\\sin";
  const fnB = exercice.identite === "cosVersCos" ? "\\sin" : "\\cos";
  return `${fnA}\\left(${argA}\\right) = ${fnB}\\left(${argB}\\right)`;
}

/** Énoncé complet de l'exercice, quelle que soit la famille — affiché sur l'écran 0
 * "reconnaissance" ET (pour produit/pythagoricienne/egalite) réaffiché comme rappel sur leur
 * premier écran propre. */
export function formatEnonceEquationTrigonometriqueLatex(exercice: ExerciceEquationTrigonometrique): string {
  switch (exercice.famille) {
    case "directe":
      return formatEquationEnonceLatex(exercice.exercice);
    case "produit":
      return formatEnonceProduitLatex(exercice);
    case "pythagoricienne":
      return formatEnonceMixteLatex(exercice);
    case "egalite":
      return formatEnonceEgaliteLatex(exercice);
  }
}

// ============================================================================
// Famille "produit" — écrans "prefacteur"/"separerFacteurs"/"argumentProduit"/"isolerXProduit"/
// "solutionsProduit".
// ============================================================================

export const CONSIGNE_PREFACTEUR = "Factorise cette équation.";
export const TEXTE_AIDE_PREFACTEUR_NIVEAU1 =
  "Les deux termes partagent un même facteur — la fonction trigonométrique elle-même. Mets-la en évidence, comme tu le ferais avec X²−a·X = X(X−a).";
export function formatAidePrefacteurNiveau2Latex(exercice: ExerciceProduitFacteurs): string {
  const fn = NOM_FONCTION_LATEX[exercice.facteur2.fonction];
  const arg = formatArgumentLatex(exercice.facteur2.a, exercice.facteur2.b);
  return simplifierAffichageProduit(`${fn}\\left(${arg}\\right)\\left(${fn}\\left(${arg}\\right) - ${exercice.facteur2.k.latex}\\right) = 0`);
}

export const CONSIGNE_SEPARER_FACTEURS = "Écris les 2 équations correspondantes.";
export const TEXTE_AIDE_SEPARER_FACTEURS_NIVEAU1 = "\"A·B = 0\" équivaut à \"A = 0 OU B = 0\" — jamais une somme (A+B=0 est une équation totalement différente).";
export function formatAideSepararFacteursNiveau2Latex(exercice: ExerciceProduitFacteurs): string[] {
  return [formatEquationEnonceLatex(exercice.facteur1), formatEquationEnonceLatex(exercice.facteur2)];
}

/** Question templatée par fonction (D.1), réutilisée par les familles "directe" ET "produit" (une
 * instance par facteur pour cette dernière). "sin"/"cos"/"tan" nommés littéralement (jamais
 * "sinus"/"cosinus"/"tangente" en toutes lettres) — la valeur cible (`k.latex`) est rendue à part en
 * KaTeX par l'appelant, jamais concaténée ici (chaîne plate, pas de LaTeX). */
export function formatQuestionArgumentTexte(fonction: FonctionTrig): string {
  return `Quelles sont les valeurs d'angles (en rad) dont le ${fonction} vaut`;
}

export const CONSIGNE_ARGUMENT_PRODUIT = "Résous l'argument de chacune des 2 équations.";
export const CONSIGNE_ISOLER_X_PRODUIT = "Résous ces équations ci-dessus et donne les valeurs de x.";

export const CONSIGNE_SOLUTIONS_PRODUIT = "Liste toutes les solutions distinctes dans [0;2π[ (l'union des 2 facteurs, une valeur par point).";

/** Annonce de précision pour l'écran final "solutionsProduit" — l'union peut mélanger des valeurs
 * venant d'un facteur en régime "exact" (angle remarquable) et d'un facteur en régime "decimal"
 * (possible seulement pour le sous-cas "factoree", où les 2 facteurs sont tirés indépendamment —
 * voir `generateurs5e/equationsTrigonometriques/produitFacteurs.ts`). Formulation volontairement
 * plus précise que `ANNONCE_PRECISION_DECIMAL` (`formatEquationTrig.ts`) : elle reste correcte que
 * l'exercice soit tout-décimal OU mixte, plutôt que d'affirmer à tort que TOUTES les valeurs
 * listées doivent être arrondies quand certaines sont en réalité des angles remarquables exacts. */
export const ANNONCE_PRECISION_PRODUIT_SOLUTIONS = " (arrondis au centième près les valeurs qui ne sont pas des angles remarquables)";

/** Régime à utiliser pour le cercle trigonométrique final — celui, commun, des 2 facteurs quand ils
 * coïncident (toujours le cas pour le sous-cas "nonFactoree", qui partage `(fonction,a,b)`), sinon
 * un repli "decimal" sûr (n'empêche jamais l'affichage, seulement moins élégant). */
export function regimeProduit(exercice: ExerciceProduitFacteurs): RegimeEquationTrig {
  return exercice.facteur1.regime === exercice.facteur2.regime ? exercice.facteur1.regime : "decimal";
}

// ============================================================================
// Famille "pythagoricienne" — écrans "conversionPythagoricienne"/"racinesPythagoricienne"/
// "racinesResolution"/"solutionsPythagoricienne".
// ============================================================================

export const CONSIGNE_CONVERSION_PYTHAGORICIENNE = "Fais en sorte que cette équation soit seulement en sin/cos (ça dépend de l'énoncé).";
export const TEXTE_AIDE_CONVERSION_NIVEAU1 = "Remplace le terme au carré de la fonction NON visée par 1 moins le carré de la fonction visée (ex. sin²(x) = 1-cos²(x)), puis développe et réduis.";
export function formatAideConversionNiveau2Latex(exercice: ExercicePythagoricienne): string {
  return formatPolynomeCibleLatex(exercice);
}

export const CONSIGNE_RACINES_PYTHAGORICIENNE = "Résous cette équation du second degré en sin(...)/cos(...) (selon l'énoncé).";
export const TEXTE_AIDE_RACINES_NIVEAU1 = "C'est une équation du second degré ordinaire — discriminant, ou toute autre technique déjà connue (mise en évidence, produit remarquable...).";

export const CONSIGNE_RACINES_RESOLUTION = "Pour CHAQUE racine trouvée, décide : peut-elle être une valeur de cos(x) ou de sin(x) ? Si oui, résous l'équation correspondante ; sinon, rejette-la.";
export const TEXTE_AIDE_RACINES_RESOLUTION_NIVEAU1 = "cos(x) et sin(x) restent TOUJOURS compris entre -1 et 1 — une racine hors de cet intervalle ne peut correspondre à AUCUNE valeur réelle de x, elle doit être rejetée.";

export const CONSIGNE_SOLUTIONS_PYTHAGORICIENNE = "Liste toutes les solutions distinctes dans [0;2π[ (l'union des racines valides).";

// ============================================================================
// Famille "egalite" — écrans "conversionEgalite"/"resoudreEgalite"/"solutionsEgalite".
// ============================================================================

export const CONSIGNE_CONVERSION_EGALITE = "Convertis l'un des 2 membres pour que les 2 côtés utilisent la MÊME fonction trigonométrique.";

const TEXTE_AIDE_CONVERSION_EGALITE_NIVEAU1: Record<"cosVersCos" | "sinVersSin" | "tanVersTan", string> = {
  cosVersCos: "sin(θ) = cos(π/2-θ) — remplace le membre en sin par un membre en cos.",
  sinVersSin: "cos(θ) = sin(π/2-θ) — remplace le membre en cos par un membre en sin.",
  tanVersTan: "-tan(θ) = tan(-θ) — remplace \"-tan(...)\" par \"tan(-...)\", jamais recopier le signe tel quel devant tan.",
};
export function texteAideConversionEgaliteNiveau1(exercice: ExerciceEgaliteExpressions): string {
  return TEXTE_AIDE_CONVERSION_EGALITE_NIVEAU1[exercice.identite];
}

export function formatAideConversionEgaliteNiveau2Latex(exercice: ExerciceEgaliteExpressions): string {
  const argB = formatArgumentLatex(exercice.a2, exercice.b2);
  if (exercice.identite === "tanVersTan") return `\\tan\\left(-${argB}\\right)`;
  const fnCible = exercice.identite === "cosVersCos" ? "\\cos" : "\\sin";
  return `${fnCible}\\left(\\dfrac{\\pi}{2}-${argB}\\right)`;
}

export const CONSIGNE_RESOUDRE_EGALITE = "Applique l'identité d'égalité, puis isole x dans chaque série (utilise \"k\" comme entier libre).";
const TEXTE_AIDE_RESOUDRE_EGALITE_NIVEAU1: Record<"cosVersCos" | "sinVersSin" | "tanVersTan", string> = {
  cosVersCos: "cos(A)=cos(B) ⟺ A=B+2kπ OU A=-B+2kπ (k entier) — 2 séries distinctes.",
  sinVersSin: "sin(A)=sin(B) ⟺ A=B+2kπ OU A=(π-B)+2kπ (k entier) — 2 séries distinctes.",
  tanVersTan: "tan(A)=tan(B) ⟺ A=B+kπ (k entier) — une seule série, période π.",
};
export function texteAideResoudreEgaliteNiveau1(exercice: ExerciceEgaliteExpressions): string {
  return TEXTE_AIDE_RESOUDRE_EGALITE_NIVEAU1[exercice.identite];
}
export function formatAideResoudreEgaliteNiveau2Latex(exercice: ExerciceEgaliteExpressions): string[] {
  return exercice.branches.map((b: BrancheX) => `x = ${formatBrancheLatex(b)}`);
}

export const CONSIGNE_SOLUTIONS_EGALITE = "Liste toutes les solutions distinctes dans [0;2π[ (une valeur par point).";

// ============================================================================
// Bloc "état actuel" — PAR FAMILLE, à partir du 2e écran de la séquence de CETTE famille (jamais
// sur "reconnaissance", ni sur le tout premier écran d'une famille donnée). Chaque fonction dérive
// UNIQUEMENT de `exercice` (jamais de la saisie brute de l'élève, toujours la valeur CANONIQUE —
// un écran n'est atteint qu'une fois l'écran précédent réellement résolu, correctement ou par
// révélation) — même convention que `formatTermesEtatActuelCELatex` (5gen1). Consommées par un
// petit composant local `EtatActuelXxx` dupliqué dans chaque `Etape*.tsx` concerné (même principe
// que le reste de la plateforme — trop petit pour l'extraction).
// ============================================================================

// --- Famille "directe" ---

/** Réponse attendue de l'écran "argument" — vide si `aucuneSolution` (rien à montrer ici, voir
 * `TEXTE_ARGUMENT_AUCUNE_SOLUTION` pour le texte dédié à ce cas dans le récapitulatif). Membre de
 * gauche = l'ARGUMENT RÉEL substitué (D.2 — ex. "1/2x-3"), jamais le symbole bare "u" (qui n'est
 * plus jamais introduit à l'élève, D.1 ayant retiré toute mention de "u" de la consigne). */
export function formatTermesArgumentDirecteLatex(exercice: ExerciceEquationTrig): string[] {
  const argument = formatArgumentLatex(exercice.a, exercice.b);
  return exercice.branchesU.map((b) => `${argument} = ${formatBrancheLatex(b)}`);
}

/** Réponse attendue de l'écran "isolerX". */
export function formatTermesXDirecteLatex(exercice: ExerciceEquationTrig): string[] {
  return exercice.branchesX.map((b) => `x = ${formatBrancheLatex(b)}`);
}

/** "isolerX" rappelle l'argument déjà posé (écran "argument") ; "solutions" rappelle en plus les
 * branches en x déjà isolées. */
export function formatTermesEtatActuelDirecte(exercice: ExerciceEquationTrig, phase: "isolerX" | "solutions"): string[] {
  const termes = formatTermesArgumentDirecteLatex(exercice);
  if (phase === "isolerX") return termes;
  return [...termes, ...formatTermesXDirecteLatex(exercice)];
}

// --- Famille "produit" ---

function formatTermesPrefacteurConfirme(exercice: ExerciceProduitFacteurs): string[] {
  return exercice.sousCas === "nonFactoree" ? [formatAidePrefacteurNiveau2Latex(exercice)] : [];
}

function formatTermesFacteursSeparesConfirmes(exercice: ExerciceProduitFacteurs): string[] {
  return formatAideSepararFacteursNiveau2Latex(exercice);
}

/** Réponse attendue de l'écran "argumentProduit" — les 2 facteurs traités ensemble, chacun avec son
 * ARGUMENT RÉEL substitué (D.2, même principe que `formatTermesArgumentDirecteLatex`), jamais les
 * symboles bare "u_1"/"u_2". */
export function formatTermesArgumentProduitLatex(exercice: ExerciceProduitFacteurs): string[] {
  const arg1 = formatArgumentLatex(exercice.facteur1.a, exercice.facteur1.b);
  const arg2 = formatArgumentLatex(exercice.facteur2.a, exercice.facteur2.b);
  return [...exercice.facteur1.branchesU.map((b) => `${arg1} = ${formatBrancheLatex(b)}`), ...exercice.facteur2.branchesU.map((b) => `${arg2} = ${formatBrancheLatex(b)}`)];
}

/** Réponse attendue de l'écran "isolerXProduit" — x, les 2 facteurs traités ensemble. */
export function formatTermesXProduitLatex(exercice: ExerciceProduitFacteurs): string[] {
  return [
    ...exercice.facteur1.branchesX.map((b) => `x = ${formatBrancheLatex(b)}`),
    ...exercice.facteur2.branchesX.map((b) => `x = ${formatBrancheLatex(b)}`),
  ];
}

/** Chaque écran rappelle ce qui est déjà confirmé dans CETTE séquence — "separerFacteurs" n'affiche
 * quelque chose que si "prefacteur" a eu lieu avant lui (sousCas "nonFactoree" ; sinon
 * "separerFacteurs" est le tout premier écran de la famille, rien à rappeler) ; les écrans suivants
 * accumulent prefacteur (si présent) → facteurs séparés → argument (u1/u2) → x isolé. */
export function formatTermesEtatActuelProduit(
  exercice: ExerciceProduitFacteurs,
  phase: "separerFacteurs" | "argumentProduit" | "isolerXProduit" | "solutionsProduit",
): string[] {
  if (phase === "separerFacteurs") return formatTermesPrefacteurConfirme(exercice);
  const termes = [...formatTermesPrefacteurConfirme(exercice), ...formatTermesFacteursSeparesConfirmes(exercice)];
  if (phase === "argumentProduit") return termes;
  termes.push(...formatTermesArgumentProduitLatex(exercice));
  if (phase === "isolerXProduit") return termes;
  termes.push(...formatTermesXProduitLatex(exercice));
  return termes;
}

// --- Famille "pythagoricienne" ---

/** Même formatage que le `formatT` local de `EtapeRacinesResolutionPythagoricienne.tsx` (dupliqué,
 * trop petit pour l'extraction — même principe que le reste de la plateforme). Arrondi à la
 * PREMIÈRE décimale (D.1, affichage uniquement — voir `ui5e/formatEquationTrig.ts::arrondi1`) ;
 * sans effet observable ici en pratique (POOL_T ne contient que des multiples de 0,5). */
function formatRacineTLatex(t: number): string {
  const r = Math.round(t * 10) / 10;
  const norm = Object.is(r, -0) ? 0 : r;
  return Number.isInteger(norm) ? String(norm) : norm.toString().replace(".", ",");
}

/** Réponse attendue de l'écran "racinesPythagoricienne" — les 2 racines t1/t2. */
export function formatTermesRacinesTLatex(exercice: ExercicePythagoricienne): string[] {
  const T = exercice.fonctionCible === "cos" ? "\\cos(x)" : "\\sin(x)";
  return [exercice.racine1, exercice.racine2].map((r) => `${T} = ${formatRacineTLatex(r.t)}`);
}

/** Réponse attendue de l'écran "racinesResolution" — pour CHAQUE racine, "rejetée" (si invalide)
 * ou ses branches x résolues. */
export function formatTermesRacinesResolutionLatex(exercice: ExercicePythagoricienne): string[] {
  return [exercice.racine1, exercice.racine2].flatMap((r) => {
    if (r.invalide || r.resolution === null) return [`${formatRacineTLatex(r.t)} : \\text{rejetée}`];
    return r.resolution.branchesX.map((b) => `${formatRacineTLatex(r.t)} : x = ${formatBrancheLatex(b)}`);
  });
}

function formatTermesXPythagoricienneConfirmes(exercice: ExercicePythagoricienne): string[] {
  return [exercice.racine1, exercice.racine2]
    .filter((r) => !r.invalide && r.resolution !== null)
    .flatMap((r) => r.resolution!.branchesX.map((b) => `x = ${formatBrancheLatex(b)}`));
}

/** "racinesPythagoricienne" rappelle la conversion déjà faite ; "racinesResolution" rappelle en
 * plus les racines t trouvées ; "solutionsPythagoricienne" rappelle en plus les racines RÉSOLUES
 * (valides, non rejetées) en x. */
export function formatTermesEtatActuelPythagoricienne(
  exercice: ExercicePythagoricienne,
  phase: "racinesPythagoricienne" | "racinesResolution" | "solutionsPythagoricienne",
): string[] {
  const termes = [formatPolynomeCibleLatex(exercice)];
  if (phase === "racinesPythagoricienne") return termes;
  termes.push(...formatTermesRacinesTLatex(exercice));
  if (phase === "racinesResolution") return termes;
  termes.push(...formatTermesXPythagoricienneConfirmes(exercice));
  return termes;
}

// --- Famille "egalite" ---

const NOM_FONCTION_EGALITE_LATEX: Record<"cosVersCos" | "sinVersSin" | "tanVersTan", string> = {
  cosVersCos: "\\cos",
  sinVersSin: "\\sin",
  tanVersTan: "\\tan",
};

/** Réponse attendue de l'écran "conversionEgalite" — l'équation ENTIÈRE, les 2 côtés désormais sur
 * la même fonction (pas seulement le membre converti isolé, contrairement à
 * `formatAideConversionEgaliteNiveau2Latex`, qui n'aide qu'à cette seule sous-partie). */
export function formatEquationConvertieEgaliteLatex(exercice: ExerciceEgaliteExpressions): string {
  const argA = formatArgumentLatex(exercice.a1, exercice.b1);
  const fn = NOM_FONCTION_EGALITE_LATEX[exercice.identite];
  return `${fn}\\left(${argA}\\right) = ${formatAideConversionEgaliteNiveau2Latex(exercice)}`;
}

function formatTermesConversionEgaliteConfirmee(exercice: ExerciceEgaliteExpressions): string[] {
  return [formatEquationConvertieEgaliteLatex(exercice)];
}

/** "resoudreEgalite" rappelle la conversion déjà faite (l'équation entière, les 2 côtés désormais
 * sur la même fonction) ; "solutionsEgalite" rappelle en plus les branches déjà résolues en x. */
export function formatTermesEtatActuelEgalite(exercice: ExerciceEgaliteExpressions, phase: "resoudreEgalite" | "solutionsEgalite"): string[] {
  const termes = formatTermesConversionEgaliteConfirmee(exercice);
  if (phase === "resoudreEgalite") return termes;
  return [...termes, ...formatAideResoudreEgaliteNiveau2Latex(exercice)];
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE (correcte) de chaque écran, jamais un score fractionnaire
// (voir `components5e/LigneRecap.tsx`/`ResultatPanelEquationTrig.tsx`). Distinct du bloc "état
// actuel" ci-dessus : ici on formate la réponse correcte DE l'écran lui-même, pas ce qui était déjà
// confirmé AVANT lui.
// ============================================================================

/** Texte affiché à la place des branches en u quand `exercice.aucuneSolution` (l'écran "argument"
 * n'a alors aucune branche à montrer — la bonne réponse était le bouton "Aucune solution"). */
export const TEXTE_ARGUMENT_AUCUNE_SOLUTION = "Aucune solution — |k| > 1.";

/** Liste texte (PLAIN, jamais du LaTeX à passer à `<Katex>`) des solutions distinctes — réutilise
 * `formatAngleLabelTexte` (déjà utilisé pour les labels du cercle trigonométrique). `"Aucune
 * solution."` si la liste est vide. */
export function formatSolutionsTexte(solutions: number[], regime: RegimeEquationTrig): string {
  if (solutions.length === 0) return "Aucune solution.";
  return solutions.map((s) => formatAngleLabelTexte(s, regime)).join(", ");
}

export { formatValeurLatex };
export type { CoefficientRationnel, ValeurPiOuDecimale };
