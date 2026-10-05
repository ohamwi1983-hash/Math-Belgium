/**
 * Couche B — vérification pour 5gen3 ("Composer f et g — expressions et domaines"). Écran
 * "formule" (par direction) : texte libre, statut à 3 valeurs, MÊME patron que
 * `verificationDecompositionFonction.ts` (5gen2) — comparaison par échantillonnage à la formule de
 * référence déjà calculée à la génération (`dir.formule`), jamais une comparaison à "la"
 * décomposition canonique. Écrans "c1"/"c2"/"domaine" : réutilisent DIRECTEMENT
 * `verifierEnsembleReelGuide` (`verificationDomaineDefinition.ts`, 5gen1, moteur→moteur — même
 * chantier, import explicitement autorisé). Écran "conditions" (riche uniquement) : comparaison
 * structurée position-par-position (`dir.conditions`, ordre FIXE et déjà connu, jamais une liste
 * add-as-needed — voir `core5e/composerFonctions.types.ts`).
 */
import { all, create } from "mathjs";
import type { MathNode } from "mathjs";
import type { ComparateurSeuil, CompositionDirigee } from "../core5e/composerFonctions.types";
import type { EnsembleReelGuide, MorceauEnsemble } from "../core5e/domaineDefinition.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { verifierEnsembleReelGuide } from "./verificationDomaineDefinition";

const TOLERANCE_ABSOLUE = 1e-6;
const TOLERANCE_RELATIVE = 1e-6;
const MIN_COMPARAISONS_VALIDES = 15;

/**
 * ⚠️ La composition de 5gen3 empile 2 couches déjà elles-mêmes restreintes (rationnelle/
 * irrationnelle/racineSurFraction/fractionSousRacine) — son domaine RÉEL peut être un intervalle
 * étroit, parfois presque entièrement hors d'une grille fixe `[-15,15]` pas `0.25` (bug réel trouvé
 * par Playwright : sur 121 points échantillonnés, un seul tombait dans le domaine, sous le seuil
 * `MIN_COMPARAISONS_VALIDES` — même la formule de référence comparée à elle-même échouait). Corrigé
 * en échantillonnant DIRECTEMENT à l'intérieur du domaine DÉJÀ CALCULÉ à la génération
 * (`dir.domaine`) plutôt qu'une grille aveugle — garantit toujours assez de points valides, quelle
 * que soit l'étroitesse réelle du domaine.
 */
const POINTS_PAR_MORCEAU = 40;
const LARGEUR_PAR_DEFAUT = 20;

function pointsDansMorceau(m: Pick<MorceauEnsemble, "inf" | "sup">): number[] {
  const inf: number = m.inf === null ? (m.sup === null ? -LARGEUR_PAR_DEFAUT / 2 : m.sup - LARGEUR_PAR_DEFAUT) : m.inf;
  const sup: number = m.sup === null ? (m.inf === null ? LARGEUR_PAR_DEFAUT / 2 : m.inf + LARGEUR_PAR_DEFAUT) : m.sup;
  const largeur = sup - inf;
  const marge = Math.max(largeur * 0.01, 1e-4);
  const debut = inf + marge;
  const fin = sup - marge;
  if (fin <= debut) return [(inf + sup) / 2];
  const pts: number[] = [];
  for (let i = 0; i <= POINTS_PAR_MORCEAU; i++) pts.push(debut + (i / POINTS_PAR_MORCEAU) * (fin - debut));
  return pts;
}

function pointsEchantillonDomaine(domaine: EnsembleReelGuide): number[] {
  if (domaine.forme === "reel") return pointsDansMorceau({ inf: null, sup: null });
  if (domaine.forme === "prive_points") {
    const points = [...domaine.points].sort((a, b) => a - b);
    const morceaux: Pick<MorceauEnsemble, "inf" | "sup">[] = [];
    let gauche: number | null = null;
    for (const p of points) {
      morceaux.push({ inf: gauche, sup: p });
      gauche = p;
    }
    morceaux.push({ inf: gauche, sup: null });
    return morceaux.flatMap(pointsDansMorceau);
  }
  return domaine.morceaux.flatMap(pointsDansMorceau);
}

function proches(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE_ABSOLUE + TOLERANCE_RELATIVE * Math.max(Math.abs(a), Math.abs(b));
}

export function diagnostiquerFormuleComposee(reference: string, texte: string, domaineReference: EnsembleReelGuide): StatutVerification {
  if (texte.trim() === "") return "parse_error";
  let comparaisonsValides = 0;
  try {
    for (const x of pointsEchantillonDomaine(domaineReference)) {
      const soumisBrut = evaluerExpressionGenerale(texte, x);
      const soumis = Number.isFinite(soumisBrut) ? soumisBrut : null;
      const attenduBrut = evaluerExpressionGenerale(reference, x);
      const attendu = Number.isFinite(attenduBrut) ? attenduBrut : null;
      if (soumis === null && attendu === null) continue;
      if ((soumis === null) !== (attendu === null)) return "not_equivalent";
      if (!proches(soumis as number, attendu as number)) return "not_equivalent";
      comparaisonsValides++;
    }
  } catch {
    return "parse_error";
  }
  return comparaisonsValides >= MIN_COMPARAISONS_VALIDES ? "correct" : "not_equivalent";
}

export function diagnostiquerFormuleDirection(dir: CompositionDirigee, texte: string): StatutVerification {
  return diagnostiquerFormuleComposee(dir.formule, texte, dir.domaine);
}
export function verifierFormuleDirection(dir: CompositionDirigee, texte: string): boolean {
  return diagnostiquerFormuleDirection(dir, texte) === "correct";
}

// ============================================================================
// 2e palier de vérification — "correcte MAIS pas simplifiée au maximum" (écran "formule"
// uniquement). `StatutVerification` (3 valeurs, `moteur/statutVerification.ts`) est un type PARTAGÉ
// par toute la plateforme — ne jamais l'élargir à une 4e valeur (obligerait tout `switch` exhaustif
// existant, sur tous les chantiers, à traiter un cas qui ne concerne QUE cet écran). Statut LOCAL à
// 4 valeurs, consommé UNIQUEMENT par `EtapeFormuleComposerFonctions.tsx` (message affiché) et par
// `verifierFormuleDirectionSimplifiee` ci-dessous (gate score/avancement) — jamais ailleurs.
//
// Principe : `dir.formule` (texte évaluable) est déjà la référence numérique existante ; `dir.latex`
// (construit via `simplifierLatex`, `generateurs5e/simplificationExpression.ts`) en est la forme
// LaTeX déjà simplifiée au sens de la plateforme — mais ce module (Couche B, `moteur5e/`) ne peut
// JAMAIS importer `generateurs5e/simplificationExpression.ts` (règle non négociable CLAUDE.md,
// "moteur*/ n'importe jamais generateurs*/ et vice versa") : le ruleset mathjs "distribue, jamais ne
// re-factorise" est donc DUPLIQUÉ ici à l'identique plutôt qu'importé — même principe déjà appliqué
// à `ComparateurSeuil` (`core5e/composerFonctions.types.ts`, dupliqué depuis `solveur.ts` pour la
// même raison d'architecture).
//
// Détecter "correct mais pas simplifié" exige plus qu'une comparaison de chaînes brutes : "2x+3" et
// "3+2x" sont TOUS LES DEUX pleinement simplifiés, seulement écrits dans un ordre différent — une
// comparaison naïve (chaîne brute, ou même `simplify(...).toString()` des deux côtés : vérifié
// empiriquement que mathjs ne trie PAS toujours les termes d'une somme de façon cohérente au-delà de
// 2 termes) les distinguerait à tort. `canonicaliser()` ci-dessous résout ce problème EN PLUS de la
// simplification mathjs : aplatit les chaînes +/- et */ commutatives en listes de termes/facteurs,
// leur donne un signe normalisé, puis les TRIE par leur représentation textuelle avant de
// reconstruire l'arbre — deux expressions algébriquement identiques mais écrites dans un ordre
// différent produisent alors TOUJOURS la même chaîne canonique, quel que soit le nombre de termes.
//
// Le test décisif : canonicaliser(texte élève BRUT, sans passer par simplify) contre canonicaliser
// (simplify(dir.formule)) (la référence, déjà réduite). Si les deux chaînes coïncident, l'élève a
// écrit une forme déjà pleinement développée/réduite (à un simple réordonnancement commutatif près)
// — "correct". Si elles diffèrent alors que le palier 1 (numérique) a déjà validé l'équivalence
// mathématique, l'élève a laissé quelque chose à distribuer/regrouper/réduire — "correct_non_simplifie".
// ============================================================================

const mathSimplification = create(all);

/** Même ruleset que `generateurs5e/simplificationExpression.ts::REGLES_SIMPLIFICATION` — voir sa
 * doc-string pour la justification empirique complète (retrait des règles de re-factorisation/
 * collecte de puissance, ajout de 4 règles de distribution explicites, abandon délibéré du
 * regroupement fraction±terme qui fait exploser la recherche de point fixe de mathjs sur certaines
 * compositions riches de ce même générateur). Indices figés pour la version de mathjs pinnée
 * (`package.json`) — dupliqués ici plutôt qu'importés, voir la note d'architecture ci-dessus. */
const INDICES_REGLES_EXCLUES = new Set([15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]);
const REGLES_SIMPLIFICATION = mathSimplification.simplify.rules.filter((_regle: unknown, index: number) => !INDICES_REGLES_EXCLUES.has(index)).concat([
  "n1*(n2+n3) -> n1*n2 + n1*n3",
  "n1*(n2-n3) -> n1*n2 - n1*n3",
  "(n1+n2)*n3 -> n1*n3 + n2*n3",
  "(n1-n2)*n3 -> n1*n3 - n2*n3",
]);

/** Aplatit une chaîne +/- (traverse `ParenthesisNode`/`unaryMinus`/`subtract`/`add` imbriqués,
 * jamais une simple paire) en une liste de termes signés, chacun déjà `canonicaliser()`é —
 * nécessaire pour trier des sommes de 3 termes ou plus (voir note d'en-tête : mathjs seul n'y
 * parvient pas de façon fiable). */
function aplatirSomme(noeud: MathNode, signe: 1 | -1): { signe: 1 | -1; noeud: MathNode }[] {
  if (noeud.type === "ParenthesisNode") return aplatirSomme((noeud as unknown as { content: MathNode }).content, signe);
  if (noeud.type === "OperatorNode") {
    const op = noeud as unknown as { fn: string; args: MathNode[] };
    if (op.fn === "add") return [...aplatirSomme(op.args[0], signe), ...aplatirSomme(op.args[1], signe)];
    if (op.fn === "subtract") return [...aplatirSomme(op.args[0], signe), ...aplatirSomme(op.args[1], (-signe as 1 | -1))];
    if (op.fn === "unaryMinus") return aplatirSomme(op.args[0], (-signe as 1 | -1));
  }
  return [{ signe, noeud: canonicaliser(noeud) }];
}

/** Aplatit une chaîne * commutative (jamais à travers une division, non-commutative — voir
 * `canonicaliser()`, branche "divide"). */
function aplatirProduit(noeud: MathNode): MathNode[] {
  if (noeud.type === "ParenthesisNode") return aplatirProduit((noeud as unknown as { content: MathNode }).content);
  if (noeud.type === "OperatorNode" && (noeud as unknown as { fn: string }).fn === "multiply") {
    const op = noeud as unknown as { args: MathNode[] };
    return [...aplatirProduit(op.args[0]), ...aplatirProduit(op.args[1])];
  }
  return [canonicaliser(noeud)];
}

/** Extrait un éventuel signe "-" porté par `noeud` lui-même (négation explicite, constante
 * négative, ou 1er facteur négatif d'un produit) — sans ça, un terme comme "-2*x" garderait son
 * signe "collé" au facteur 2 au lieu d'être hissé au niveau du terme de la somme, désynchronisant le
 * tri des cas comme "-2x+5" (brut) vs "5-2x" (mathjs, qui préfère parfois `unaryMinus(2*x)`). */
function extraireSigne(noeud: MathNode): { noeud: MathNode; signe: 1 | -1 } {
  if (noeud.type === "OperatorNode" && (noeud as unknown as { fn: string }).fn === "unaryMinus") {
    const interieur = extraireSigne((noeud as unknown as { args: MathNode[] }).args[0]);
    return { noeud: interieur.noeud, signe: (-interieur.signe as 1 | -1) };
  }
  if (noeud.type === "ConstantNode" && typeof (noeud as unknown as { value: unknown }).value === "number" && ((noeud as unknown as { value: number }).value as number) < 0) {
    const valeur = (noeud as unknown as { value: number }).value;
    return { noeud: new mathSimplification.ConstantNode(-valeur), signe: -1 };
  }
  if (noeud.type === "OperatorNode" && (noeud as unknown as { fn: string }).fn === "multiply") {
    const op = noeud as unknown as { args: MathNode[] };
    const gauche = extraireSigne(op.args[0]);
    if (gauche.signe < 0) return { noeud: new mathSimplification.OperatorNode("*", "multiply", [gauche.noeud, op.args[1]]), signe: -1 };
  }
  return { noeud, signe: 1 };
}

/**
 * Canonicalisation structurelle — reconstruit `noeud` en triant chaque chaîne +/- et chaque chaîne
 * * commutative par la représentation textuelle de ses termes/facteurs (`.toString()`, déjà
 * déterministe), pour que 2 expressions algébriquement identiques mais écrites/simplifiées dans un
 * ordre différent produisent TOUJOURS la même chaîne finale. Division/puissance/fonctions :
 * jamais réordonnées (non commutatives), seulement descendues récursivement.
 */
function canonicaliser(noeud: MathNode): MathNode {
  if (noeud.type === "ParenthesisNode") return canonicaliser((noeud as unknown as { content: MathNode }).content);
  const op = noeud as unknown as { fn?: string; args?: MathNode[]; op?: string; implicit?: boolean };
  if (noeud.type === "OperatorNode" && (op.fn === "add" || op.fn === "subtract" || op.fn === "unaryMinus")) {
    const termes = aplatirSomme(noeud, 1).map((t) => {
      const extrait = extraireSigne(t.noeud);
      return { noeud: extrait.noeud, signe: (t.signe * extrait.signe) as 1 | -1 };
    });
    const tries = termes.map((t) => ({ ...t, cle: t.noeud.toString() })).sort((a, b) => (a.cle < b.cle ? -1 : a.cle > b.cle ? 1 : 0));
    let resultat: MathNode = tries[0].signe < 0 ? new mathSimplification.OperatorNode("-", "unaryMinus", [tries[0].noeud]) : tries[0].noeud;
    for (let i = 1; i < tries.length; i++) {
      const t = tries[i];
      resultat = new mathSimplification.OperatorNode(t.signe < 0 ? "-" : "+", t.signe < 0 ? "subtract" : "add", [resultat, t.noeud]);
    }
    return resultat;
  }
  if (noeud.type === "OperatorNode" && op.fn === "multiply") {
    const facteurs = aplatirProduit(noeud)
      .map((f) => ({ noeud: f, cle: f.toString() }))
      .sort((a, b) => (a.cle < b.cle ? -1 : a.cle > b.cle ? 1 : 0));
    let resultat = facteurs[0].noeud;
    for (let i = 1; i < facteurs.length; i++) resultat = new mathSimplification.OperatorNode("*", "multiply", [resultat, facteurs[i].noeud]);
    return resultat;
  }
  if (noeud.type === "OperatorNode" && op.args) {
    return new mathSimplification.OperatorNode(op.op as never, op.fn as never, op.args.map(canonicaliser), op.implicit);
  }
  if (noeud.type === "FunctionNode") {
    const f = noeud as unknown as { fn: unknown; args: MathNode[] };
    return new mathSimplification.FunctionNode(f.fn as never, f.args.map(canonicaliser));
  }
  return noeud;
}

/** Convertit une saisie élève dans une syntaxe mathjs-compatible sans changer le sens de
 * l'expression : exposants unicode (²/³, tolérés par `evaluerExpressionGenerale`, jamais par
 * mathjs), virgule décimale française, alias sqrt (seule fonction réellement utilisée par les 4
 * familles composables — jamais `cbrt`/`abs`, absentes de ce générateur). */
function normaliserPourMathjs(texte: string): string {
  return texte
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\bracinecarree\b/gi, "sqrt")
    .replace(/\bracine\b/gi, "sqrt");
}

/** Forme canonique de la version PLEINEMENT SIMPLIFIÉE (mathjs + `canonicaliser`) d'une expression
 * évaluable — `null` si mathjs ne parvient pas à l'interpréter (jamais d'exception remontée). */
function formeCanoniqueSimplifiee(formuleEvaluable: string): string | null {
  try {
    return canonicaliser(mathSimplification.simplify(formuleEvaluable, REGLES_SIMPLIFICATION) as unknown as MathNode).toString();
  } catch {
    return null;
  }
}

/** Forme canonique de l'expression BRUTE (réordonnancement commutatif seulement, AUCUNE
 * simplification algébrique) — comparée à `formeCanoniqueSimplifiee` de la référence, c'est ce qui
 * distingue "déjà simplifiée, juste réordonnée" (les deux coïncident) de "encore à
 * distribuer/réduire" (elles diffèrent). `null` si mathjs ne parvient pas à parser (jamais
 * d'exception). */
function formeCanoniqueBrute(formuleEvaluable: string): string | null {
  try {
    return canonicaliser(mathSimplification.parse(formuleEvaluable)).toString();
  } catch {
    return null;
  }
}

/** Statut LOCAL à 4 valeurs — voir la note d'architecture en tête de cette section pour la raison
 * pour laquelle `StatutVerification` (3 valeurs, partagé par toute la plateforme) n'est jamais
 * élargi. `correct_non_simplifie` : le palier 1 (numérique, `diagnostiquerFormuleDirection`) a
 * validé l'équivalence mathématique, mais la forme canonique brute de la saisie élève ne coïncide
 * pas avec la forme canonique simplifiée de `dir.formule` — reste à développer/regrouper/réduire. */
export type StatutVerificationFormuleSimplifiee = "correct" | "correct_non_simplifie" | "not_equivalent" | "parse_error";

type NoeudAppel = { fn: unknown; args: MathNode[] };
type NoeudOperateurGenerique = { op: unknown; fn: unknown; args: MathNode[]; implicit?: boolean };
type NoeudParenthese = { content: MathNode };
type NoeudSymbole = { name: string };

/** Extrait chaque appel de fonction (sqrt — seule fonction utilisée par les 4 familles composables)
 * en un symbole opaque frais, en fusionnant D'ABORD récursivement son propre argument — même
 * algorithme que `generateurs5e/simplificationExpression.ts::extraireAtomes` (dupliqué ici pour la
 * même raison d'architecture que `REGLES_SIMPLIFICATION` plus haut : `moteur5e/` ne peut jamais
 * importer `generateurs5e/`). Déduplique par texte (`atomesParTexte`) : un même sous-arbre
 * irrationnel réapparaissant 2 fois (ex. `g(x)` substitué à la fois dans le numérateur et le
 * dénominateur d'une extérieure `racineSurFraction`) réutilise le même symbole. */
function extraireAtomes(noeud: MathNode, atomes: Map<string, MathNode>, atomesParTexte: Map<string, string>, compteur: { n: number }): MathNode {
  if (noeud.type === "FunctionNode") {
    const appel = noeud as unknown as NoeudAppel;
    const argsFusionnes = appel.args.map((a) => fusionnerAtomesRecursif(a));
    const noeudAtome = new mathSimplification.FunctionNode(appel.fn as never, argsFusionnes);
    const cle = noeudAtome.toString();
    let symbole = atomesParTexte.get(cle);
    if (symbole === undefined) {
      symbole = `R${compteur.n++}`;
      atomesParTexte.set(cle, symbole);
      atomes.set(symbole, noeudAtome);
    }
    return new mathSimplification.SymbolNode(symbole);
  }
  if (noeud.type === "ParenthesisNode") return extraireAtomes((noeud as unknown as NoeudParenthese).content, atomes, atomesParTexte, compteur);
  if (noeud.type === "OperatorNode") {
    const op = noeud as unknown as NoeudOperateurGenerique;
    return new mathSimplification.OperatorNode(op.op as never, op.fn as never, op.args.map((a) => extraireAtomes(a, atomes, atomesParTexte, compteur)), op.implicit);
  }
  return noeud;
}

/** Réinjecte chaque symbole opaque par son atome d'origine — inverse d'`extraireAtomes`. */
function substituerAtomes(noeud: MathNode, atomes: Map<string, MathNode>): MathNode {
  if (noeud.type === "SymbolNode") {
    const original = atomes.get((noeud as unknown as NoeudSymbole).name);
    return original ?? noeud;
  }
  if (noeud.type === "ParenthesisNode") return new mathSimplification.ParenthesisNode(substituerAtomes((noeud as unknown as NoeudParenthese).content, atomes));
  if (noeud.type === "OperatorNode") {
    const op = noeud as unknown as NoeudOperateurGenerique;
    return new mathSimplification.OperatorNode(op.op as never, op.fn as never, op.args.map((a) => substituerAtomes(a, atomes)), op.implicit);
  }
  if (noeud.type === "FunctionNode") {
    const appel = noeud as unknown as NoeudAppel;
    return new mathSimplification.FunctionNode(appel.fn as never, appel.args.map((a) => substituerAtomes(a, atomes)));
  }
  return noeud;
}

/** `math.rationalize()` calcule en interne certaines étapes avec des nombres flottants natifs plutôt
 * qu'en arithmétique exacte (bug réel signalé, capture d'écran 5gen3 : coefficients comme
 * `2.2222222222222223` au lieu de `20/9`) — voir `generateurs5e/simplificationExpression.ts::
 * remplacerDecimalesParFractions` (dupliquée ici, même raison d'architecture que le reste de ce
 * fichier) pour la justification complète du correctif (`math.fraction()` sur chaque `ConstantNode`
 * décimal, jamais un second appel à `rationalize`). Indispensable ICI en particulier : cette fonction
 * alimente `formeCanoniqueFractionUnique`, la RÉFÉRENCE de comparaison de `diagnostiquerFormuleDirectionSimplifiee`
 * — sans ce correctif, la référence contiendrait du bruit décimal jamais reproductible à l'identique
 * par une saisie élève en fraction exacte (`dir.latex`, déjà corrigée côté générateurs), comptant à
 * tort une réponse pourtant maximalement simplifiée comme `correct_non_simplifie`. */
function remplacerDecimalesParFractions(noeud: MathNode): MathNode {
  return noeud.transform((n) => {
    if (n.type === "ConstantNode" && typeof (n as unknown as { value: unknown }).value === "number") {
      const valeur = (n as unknown as { value: number }).value;
      if (!Number.isInteger(valeur)) {
        const f = mathSimplification.fraction(valeur);
        return mathSimplification.parse(`${f.s < 0 ? "-" : ""}${f.n}/${f.d}`);
      }
    }
    return n;
  });
}

/** Cœur récursif — sépare `noeud` en une coquille rationnelle (fusionnée via `math.rationalize`,
 * jamais bloquée par un appel de fonction irrésolu), corrige ses coefficients décimaux en fractions
 * exactes (`remplacerDecimalesParFractions`), puis réinjecte les atomes irrationnels tels quels ; ne
 * lève jamais (repli sur la coquille non fusionnée si `rationalize` échoue malgré l'absence de tout
 * appel de fonction). Voir `simplifierEnFractionUnique` (fichier jumeau côté générateurs) pour la
 * justification complète. */
function fusionnerAtomesRecursif(noeud: MathNode): MathNode {
  const atomes = new Map<string, MathNode>();
  const atomesParTexte = new Map<string, string>();
  const coquille = extraireAtomes(noeud, atomes, atomesParTexte, { n: 0 });
  let rationalisee: MathNode;
  try {
    rationalisee = remplacerDecimalesParFractions(mathSimplification.rationalize(coquille.toString()) as unknown as MathNode);
  } catch {
    rationalisee = coquille;
  }
  return substituerAtomes(rationalisee, atomes);
}

/** Forme canonique via `fusionnerAtomesRecursif` (regroupement en UNE fraction à travers tout appel
 * sqrt traité comme opaque) — RÉFÉRENCE PRIORITAIRE pour `diagnostiquerFormuleDirectionSimplifiee`
 * ci-dessous : même algorithme que `generateurs5e/simplificationExpression.ts::simplifierEnFractionUnique`
 * (dupliqué ici, même raison d'architecture que `REGLES_SIMPLIFICATION` plus haut), qui construit
 * `dir.latex` — la forme montrée à l'élève (aide niveau 2 ET bloc "état actuel"). Sans cette
 * référence, un élève qui recopie l'aide niveau 2 (désormais une fraction unique regroupée, y compris
 * pour une composition "riche" dès qu'une structure de fraction l'entoure) serait à tort compté
 * "correct_non_simplifie", la comparaison ci-dessous restant sur l'ancienne forme non regroupée.
 * `null` uniquement si `formuleEvaluable` elle-même n'est pas interprétable par mathjs — dans ce cas
 * seulement, `formeCanoniqueSimplifiee` (sans regroupement de fraction) reste la référence, exactement
 * comme `dir.latex` retombe sur `simplifierLatex`. */
function formeCanoniqueFractionUnique(formuleEvaluable: string): string | null {
  try {
    return canonicaliser(fusionnerAtomesRecursif(mathSimplification.parse(formuleEvaluable))).toString();
  } catch {
    return null;
  }
}

export function diagnostiquerFormuleDirectionSimplifiee(dir: CompositionDirigee, texte: string): StatutVerificationFormuleSimplifiee {
  const statutNumerique = diagnostiquerFormuleDirection(dir, texte);
  if (statutNumerique !== "correct") return statutNumerique;
  const formeReference = formeCanoniqueFractionUnique(dir.formule) ?? formeCanoniqueSimplifiee(dir.formule);
  const formeSoumise = formeCanoniqueBrute(normaliserPourMathjs(texte));
  // Impossible de déterminer la forme canonique d'un des deux côtés (mathjs ne parvient pas à
  // parser une syntaxe pourtant acceptée par `evaluerExpressionGenerale`, ex. une notation exotique
  // du palier 1) : ne JAMAIS pénaliser l'élève pour une limitation de CE palier — reste "correct".
  if (formeReference === null || formeSoumise === null) return "correct";
  return formeReference === formeSoumise ? "correct" : "correct_non_simplifie";
}

/** Consommée par `soumettreReponseFormule` (`sessionComposerFonctions.ts`) — `correct_non_simplifie`
 * compte comme INCORRECT pour le score/l'avancement (l'élève ne doit pas pouvoir avancer tant que sa
 * réponse n'est pas réellement simplifiée), seul `EtapeFormuleComposerFonctions.tsx` distingue ce
 * cas pour afficher un message dédié. */
export function verifierFormuleDirectionSimplifiee(dir: CompositionDirigee, texte: string): boolean {
  return diagnostiquerFormuleDirectionSimplifiee(dir, texte) === "correct";
}

/** Réponse à l'écran "conditions" (riche uniquement) — MÊME longueur et MÊME ordre que
 * `dir.conditions` (jamais add-as-needed, l'élève sait déjà combien de conditions poser — révélé
 * par le nombre de champs affichés à l'écran). */
export interface ReponseCondition {
  comparateur: ComparateurSeuil;
  seuil: number;
}

/** Exportée pour `EtapeConditionsComposerFonctions.tsx` (highlight rouge par ligne, A.2) — même
 * tolérance que `verifierConditionsDirection`, jamais dupliquée. */
export const TOLERANCE_SEUIL = 0.01;

export function verifierConditionsDirection(dir: CompositionDirigee, reponse: ReponseCondition[]): boolean {
  if (reponse.length !== dir.conditions.length) return false;
  return dir.conditions.every((c, i) => reponse[i].comparateur === c.comparateur && Math.abs(reponse[i].seuil - c.seuil) < TOLERANCE_SEUIL);
}

export function verifierC1Direction(dir: CompositionDirigee, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, dir.interieure.domaine);
}

export function verifierC2Direction(dir: CompositionDirigee, reponse: EnsembleReelGuide): boolean {
  if (dir.domaineApresCarre === null) return false;
  return verifierEnsembleReelGuide(reponse, dir.domaineApresCarre);
}

export function verifierDomaineDirection(dir: CompositionDirigee, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, dir.domaine);
}
