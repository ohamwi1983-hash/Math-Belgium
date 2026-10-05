import { create, all } from "mathjs";
import type { MathNode } from "mathjs";

const math = create(all);

/** Le ruleset `simplify` PAR DÉFAUT de mathjs contient des règles de "collecte de facteur commun"
 * (ex. `n3*n1 + n3*n2 -> n3*(n1+n2)`, indices 23/25-37) et de "collecte de puissance" (ex.
 * `vd*(vd*n1+n2) -> vd^2*n1+vd*n2`, indices 15-21) qui vont dans le sens EXACTEMENT INVERSE de ce que
 * cette plateforme demande (distribuer, jamais re-factoriser) — vérifié empiriquement : ajouter les
 * règles de distribution ci-dessous PAR-DESSUS le ruleset complet ne suffit pas, mathjs re-factorise
 * le résultat distribué dès qu'un facteur commun existe (`6*x+6*1` restait `6*(x+1)`), et combiner les
 * règles de puissance avec les règles de regroupement de fraction produit des artefacts du type
 * `(3*x-4)^0*(3*x-4)` au lieu de `3*x-4`. Retirer ces 2 groupes de règles (indices figés pour la
 * version de mathjs pinnée, voir `package-lock.json`) élimine les deux problèmes sans toucher au
 * reste du ruleset (constantes, signes, structure). */
const INDICES_REGLES_EXCLUES = new Set([15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]);

/** Règles de DISTRIBUTION explicites (produit sur somme/différence dans les deux sens) — mathjs
 * `simplify()` ne distribue pas par défaut (vérifié empiriquement). Ces 4 règles couvrent le besoin
 * réel de la plateforme pour A.2/B.1 (`promptcorrectionsround2.md`) : coefficients distribués,
 * parenthèses superflues retirées.
 *
 * **Regroupement en fraction unique DÉLIBÉRÉMENT ABANDONNÉ** (essayé, puis retiré) : 4 règles
 * symétriques `n1/n2 ± n3 -> (n1 ± n3*n2)/n2` fonctionnaient sur le cas isolé (`-(√(-x-4)/(3x-4))+4`
 * → une fraction), mais dès qu'une expression combine 2 fractions indépendantes de part et d'autre
 * d'une DIVISION — `(A ± fraction1) / (B ± fraction2)`, un cas RÉEL et FRÉQUENT dans les compositions
 * "riche" de 5gen3 (ex. extérieure `rationnelle` ∘ intérieure `racineSurFraction`) — la recherche de
 * point fixe de mathjs (`simplify.js`, boucle `while (!visited[str])`, aucune limite de pas ni de
 * temps) n'atteint plus jamais de point fixe en un temps raisonnable : reproduit à coup sûr avec
 * `(-(3/(4*x+5))-3)/(4*(3/(4*x+5))+6)`, qui bloque le thread principal plus de 30 secondes (chaque
 * moitié seule se simplifie en ~20 ms, mais leur division combinée explose). Un gel de l'interface
 * de plusieurs dizaines de secondes est un défaut bien plus grave qu'une fraction non regroupée —
 * les 4 règles de regroupement ne sont donc PAS incluses ci-dessous, contrairement à une version
 * antérieure de ce fichier. Vérifié sans régression sur des centaines de compositions réelles
 * (5gen1/5gen2/5gen3, voir les tests). */
const REGLES_SIMPLIFICATION = math.simplify.rules.filter((_regle, index) => !INDICES_REGLES_EXCLUES.has(index)).concat([
  "n1*(n2+n3) -> n1*n2 + n1*n3",
  "n1*(n2-n3) -> n1*n2 - n1*n3",
  "(n1+n2)*n3 -> n1*n3 + n2*n3",
  "(n1-n2)*n3 -> n1*n3 - n2*n3",
]);

/** Étape interne exportée UNIQUEMENT pour la vérification d'équivalence numérique par les tests
 * (comparer `noeud.evaluate({x})` à `evaluerExpressionGenerale` sur la formule d'origine) — jamais
 * consommée ailleurs dans l'application, qui n'a besoin que du LaTeX final (`simplifierLatex`). Lève
 * si mathjs ne parvient pas à interpréter l'expression (contrairement à `simplifierLatex`, qui
 * absorbe l'exception) : c'est le comportement voulu pour un test, qui doit savoir distinguer un
 * échec de parsing d'une vraie divergence numérique.
 */
export function simplifierNoeud(formuleEvaluable: string) {
  return math.simplify(formuleEvaluable, REGLES_SIMPLIFICATION);
}

/**
 * Fonction de simplification partagée (B.1, `promptcorrectionsround2.md`) — prend la forme
 * ÉVALUABLE d'une expression déjà construite (syntaxe `evaluerExpressionGenerale`, systématiquement
 * pleinement parenthésée par construction, ex. `(2)*((3*x-4))+(-9)`) et produit un LaTeX propre :
 * coefficients distribués, parenthèses superflues retirées, fraction ± terme regroupée en une seule
 * fraction — jamais appliquée à l'intérieur d'une puissance/racine/valeur absolue qui doit rester
 * groupée (mathjs distingue déjà correctement un facteur non additif d'une somme).
 *
 * Ne touche JAMAIS la forme évaluable elle-même (`courant.formule` reste la source de vérité pour la
 * vérification par échantillonnage) — uniquement l'affichage. Repli sur `latexOriginal` si mathjs ne
 * parvient pas à interpréter l'expression (jamais d'exception remontée à l'appelant).
 */
function nettoyerLatex(brut: string): string {
  return brut
    .replace(/\\cdot\s*(?=[a-zA-Z\\{])/g, "")
    .replace(/\\frac(?![a-zA-Z])/g, "\\dfrac")
    .replace(/\{\s+/g, "{")
    .replace(/\s+\}/g, "}")
    .trim();
}

export function simplifierLatex(formuleEvaluable: string, latexOriginal: string): string {
  try {
    return nettoyerLatex(simplifierNoeud(formuleEvaluable).toTex());
  } catch {
    return latexOriginal;
  }
}

type NoeudAppel = { fn: unknown; args: MathNode[] };
type NoeudOperateur = { op: unknown; fn: unknown; args: MathNode[]; implicit?: boolean };
type NoeudParenthese = { content: MathNode };
type NoeudSymbole = { name: string };

/**
 * Extrait chaque appel de fonction (`sqrt`/`cbrt`/`abs`, seules fonctions utilisées par les 4
 * familles composables de 5gen3) de `noeud` en un symbole opaque frais (`R0`, `R1`...), après avoir
 * D'ABORD fusionné récursivement son propre argument via `fusionnerAtomesRecursif` — nécessaire pour
 * une composition riche∘riche, où un `sqrt(...)` peut lui-même contenir un autre `sqrt(...)`
 * substitué (ex. `sqrt((3-4*sqrt(u))/(2*sqrt(u)-2))`, `u` déjà fusionnée avant que le niveau
 * extérieur ne soit traité). Un même sous-arbre irrationnel (même appel, mêmes arguments après
 * fusion — comparé par `.toString()`) réutilise TOUJOURS le même symbole (`atomesParTexte`) : sans
 * cette déduplication, une fraction apparaissant 2 fois dans l'expression substituée (ex. le
 * radicande de l'intérieure réutilisé au numérateur ET au dénominateur de l'extérieure) serait vue
 * comme 2 quantités indépendantes par `rationalize`, l'empêchant de reconnaître — et donc de
 * simplifier — les occurrences réellement identiques.
 */
function extraireAtomes(noeud: MathNode, atomes: Map<string, MathNode>, atomesParTexte: Map<string, string>, compteur: { n: number }): MathNode {
  if (noeud.type === "FunctionNode") {
    const appel = noeud as unknown as NoeudAppel;
    const argsFusionnes = appel.args.map((a) => fusionnerAtomesRecursif(a));
    const noeudAtome = new math.FunctionNode(appel.fn as never, argsFusionnes);
    const cle = noeudAtome.toString();
    let symbole = atomesParTexte.get(cle);
    if (symbole === undefined) {
      symbole = `R${compteur.n++}`;
      atomesParTexte.set(cle, symbole);
      atomes.set(symbole, noeudAtome);
    }
    return new math.SymbolNode(symbole);
  }
  if (noeud.type === "ParenthesisNode") return extraireAtomes((noeud as unknown as NoeudParenthese).content, atomes, atomesParTexte, compteur);
  if (noeud.type === "OperatorNode") {
    const op = noeud as unknown as NoeudOperateur;
    return new math.OperatorNode(op.op as never, op.fn as never, op.args.map((a) => extraireAtomes(a, atomes, atomesParTexte, compteur)), op.implicit);
  }
  return noeud;
}

/** Réinjecte chaque symbole opaque (`R0`, `R1`...) par son atome d'origine — inverse d'`extraireAtomes`. */
function substituerAtomes(noeud: MathNode, atomes: Map<string, MathNode>): MathNode {
  if (noeud.type === "SymbolNode") {
    const original = atomes.get((noeud as unknown as NoeudSymbole).name);
    return original ?? noeud;
  }
  if (noeud.type === "ParenthesisNode") return new math.ParenthesisNode(substituerAtomes((noeud as unknown as NoeudParenthese).content, atomes));
  if (noeud.type === "OperatorNode") {
    const op = noeud as unknown as NoeudOperateur;
    return new math.OperatorNode(op.op as never, op.fn as never, op.args.map((a) => substituerAtomes(a, atomes)), op.implicit);
  }
  if (noeud.type === "FunctionNode") {
    const appel = noeud as unknown as NoeudAppel;
    return new math.FunctionNode(appel.fn as never, appel.args.map((a) => substituerAtomes(a, atomes)));
  }
  return noeud;
}

/**
 * `math.rationalize()` calcule EN INTERNE certaines étapes (alternance de règles "succ. div."/"distr.
 * div.", `node_modules/mathjs/.../rationalize.js`) avec des nombres flottants natifs plutôt qu'en
 * arithmétique exacte — vérifié empiriquement (`scratch-repro*.mjs`, prompt utilisateur signalant des
 * coefficients comme `2.2222222222222223`/`5.666666666666666` dans 5gen3, alors même que TOUS les
 * coefficients d'origine sont entiers/rationnels simples) : reconfigurer l'instance mathjs entière en
 * `number: "Fraction"` ne corrige PAS le problème (testé) — l'algorithme perd déjà l'exactitude à une
 * étape interne AVANT toute conversion, produisant une erreur de conversion en aval plutôt qu'un
 * résultat exact. Seul un correctif EN SORTIE fonctionne : chaque nombre flottant produit est en
 * réalité une fraction exacte à petit dénominateur bruitée par l'arithmétique flottante (les
 * coefficients d'origine sont toujours des entiers simples) — `math.fraction(valeur)` (approximation
 * par fractions continues, bibliothèque `fraction.js`) la retrouve exactement à partir du flottant
 * bruité, `ConstantNode` acceptant nativement une `Fraction` comme valeur (rendue en `\frac{a}{b}` par
 * `.toTex()`, sans changement de comportement pour un entier déjà exact — jamais transformé en
 * fraction, `Number.isInteger` le filtre en amont). `noeud.transform(...)` — méthode native mathjs,
 * visite récursive de TOUS les nœuds, y compris les opérandes profondément imbriqués — jamais un
 * second appel à `rationalize` sur le résultat corrigé : réinjecter une expression déjà exacte dans
 * `rationalize` réintroduit le même bruit flottant à la ré-analyse (vérifié empiriquement), l'exactitude
 * ne doit être imposée qu'une seule fois, en tout dernier.
 *
 * **Résidu trouvé en vérifiant CE correctif** (jamais supposé suffisant sans re-tester le palier 2 de
 * `moteur5e/verificationComposerFonctions.ts`, `diagnostiquerFormuleDirectionSimplifiee`) : remplacer
 * le flottant par un `ConstantNode(Fraction)` produit un nœud de forme DIFFÉRENTE de ce que `math.parse`
 * construit pour la même fraction tapée par l'élève (`"17/3"` → un `OperatorNode` "divide" de 2
 * `ConstantNode` entiers, jamais un unique nœud `Fraction`) — la comparaison structurelle du palier 2
 * (tri des termes par `.toString()`) échouait donc à tort (`correct_non_simplifie`) même pour une
 * réponse élève déjà exacte et maximalement simplifiée. Corrigé en construisant le TEXTE de la fraction
 * (`"17/3"`/`"-23/18"`, signe porté par `Fraction.s`) puis en le repassant par `math.parse` — garantit
 * STRUCTURELLEMENT le même arbre qu'une saisie élève équivalente, par construction (les deux chemins
 * passent par le même parseur).
 */
function remplacerDecimalesParFractions(noeud: MathNode): MathNode {
  return noeud.transform((n) => {
    if (n.type === "ConstantNode" && typeof (n as unknown as { value: unknown }).value === "number") {
      const valeur = (n as unknown as { value: number }).value;
      if (!Number.isInteger(valeur)) {
        const f = math.fraction(valeur);
        return math.parse(`${f.s < 0 ? "-" : ""}${f.n}/${f.d}`);
      }
    }
    return n;
  });
}

/**
 * Cœur récursif de `simplifierEnFractionUnique` : sépare `noeud` en une "coquille" purement
 * rationnelle (fractions/sommes/produits en `x` et en symboles opaques) et des atomes irrationnels
 * (chaque appel `sqrt`/`cbrt`/`abs`, dont l'intérieur est fusionné récursivement de la même façon),
 * fusionne la coquille en une fraction unique via `math.rationalize` — jamais bloquée par un appel de
 * fonction irrésolu, l'extraction d'atomes l'ayant justement éliminé de la coquille —, corrige les
 * coefficients décimaux de `rationalize` en fractions exactes (`remplacerDecimalesParFractions`, voir
 * sa doc), puis réinjecte les atomes. Ne lève jamais : repli sur la coquille distribuée (non fusionnée)
 * si `rationalize` échoue malgré l'absence de tout appel de fonction (non observé empiriquement sur
 * 5gen3, mais `rationalize` reste un algorithme externe dont on ne garantit pas la réussite sur 100%
 * des formes rationnelles).
 */
function fusionnerAtomesRecursif(noeud: MathNode): MathNode {
  const atomes = new Map<string, MathNode>();
  const atomesParTexte = new Map<string, string>();
  const coquille = extraireAtomes(noeud, atomes, atomesParTexte, { n: 0 });
  let rationalisee: MathNode;
  try {
    rationalisee = remplacerDecimalesParFractions(math.rationalize(coquille.toString()));
  } catch {
    rationalisee = coquille;
  }
  return substituerAtomes(rationalisee, atomes);
}

/**
 * Regroupement en UNE SEULE fraction, y compris à travers des atomes irrationnels (`sqrt`/`cbrt`/
 * `abs`) traités comme opaques — généralisation de l'algorithme `math.rationalize` (polynomial,
 * distinct de la recherche de règles de `simplify()` ci-dessus qui n'inclut délibérément pas le
 * regroupement fraction±terme, voir le commentaire d'en-tête : ne boucle jamais indéfiniment, réussit
 * ou échoue en quelques dizaines de ms). `rationalize` seul échoue dès qu'un appel de fonction
 * apparaît dans l'expression ("There is an unsolved function call") — ce qui, avant cette
 * généralisation, faisait retomber TOUTE composition "riche" de 5gen3 (contenant un `sqrt`, même
 * loin de la structure en fraction à regrouper) sur `simplifierLatex` (jamais de regroupement de
 * fraction). `fusionnerAtomesRecursif` contourne cette limite en extrayant chaque appel de fonction
 * en un symbole opaque AVANT d'appeler `rationalize`, puis en le réinjectant — ex. `9 / (sqrt(3x-1)/
 * (x-5) - 5)` (rationnelle ∘ racineSurFraction, jusque-là jamais combinée) → `(9x-45)/(sqrt(3x-1)+25-
 * 5x)`. Pour une composition où AUCUNE structure de fraction n'entoure les atomes (ex. `sqrt(A/B)`
 * où `A` et `B` ne contiennent chacun qu'UNE seule fraction, déjà la forme la plus réduite —
 * confirmé empiriquement sur le cas signalé, `sqrt((3-4t)/(2t-2))` avec `t` un atome sqrt(fraction))
 * le résultat est inchangé, sans être une régression : rien de plus n'est mathématiquement
 * combinable dans ce cas précis.
 *
 * Ne lève jamais (repli interne sur la coquille non fusionnée en cas d'échec improbable de
 * `rationalize`) — ne retourne `null` que si `formuleEvaluable` elle-même n'est pas interprétable
 * par mathjs (`math.parse` lève).
 */
export function simplifierEnFractionUnique(formuleEvaluable: string): string | null {
  try {
    return nettoyerLatex(fusionnerAtomesRecursif(math.parse(formuleEvaluable)).toTex());
  } catch {
    return null;
  }
}

/** Étape interne exportée UNIQUEMENT pour la vérification d'équivalence numérique par les tests
 * (même convention que `simplifierNoeud` ci-dessus) — jamais consommée ailleurs dans l'application.
 * Lève si mathjs ne parvient pas à interpréter l'expression. */
export function simplifierEnFractionUniqueNoeud(formuleEvaluable: string) {
  return fusionnerAtomesRecursif(math.parse(formuleEvaluable));
}
