/**
 * Couche B — vérification pour 5gen3 ("Composer f et g — expressions et domaines"). Écran
 * "formule" (par direction) : texte libre, statut à 3 valeurs, MÊME patron que
 * `verificationDecompositionFonction.ts` (5gen2) — comparaison par échantillonnage à la formule de
 * référence déjà calculée à la génération (`dir.formule`), jamais une comparaison à "la"
 * décomposition canonique. Écrans "c1"/"c2"/"domaine" : réutilisent DIRECTEMENT
 * `verifierEnsembleReelGuide` (`verificationDomaineDefinition.ts`, 5gen1, moteur→moteur — même
 * chantier, import explicitement autorisé). Écran "conditions" (riche uniquement) : nombre de lignes
 * FIXE (`dir.conditions.length`), comparaison sans tenir compte de l'ordre des lignes.
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
// 2e palier — « simplifiée au maximum » (audit 5e ch. 1, décision E). L'ancienne version exigeait la
// forme CANONIQUE produite par mathjs : « (12x+18)/7 », « 6(2x+3)/7 » ou « 3x/(6x+4) » étaient
// refusées alors qu'elles sont parfaitement simplifiées. Désormais, toute forme ÉQUIVALENTE (palier 1,
// numérique) et BIEN STRUCTURÉE est acceptée :
//   - pas de fraction dans une fraction (numérateur/dénominateur sans fraction à dénominateur variable) ;
//   - pas de « fraction ± terme » : une somme ne contient aucun terme à dénominateur variable ;
//   - pas de produit non développé à l'intérieur d'une somme (« 2(x+1) + 3 ») ;
//   - termes semblables regroupés (« 2x + 3x + 1 » refusée) ;
//   - même exigence, récursivement, sous chaque racine (une racine d'UNE fraction reste admise : c'est
//     la forme même de la famille « fraction sous racine »).
// Une forme équivalente qui ne respecte pas ce critère est `correct_non_simplifie` : message dédié,
// SANS consommer de tentative (`soumettreReponseFormule`, `sessionComposerFonctions.ts`).
// `StatutVerification` (3 valeurs, partagé par toute la plateforme) n'est jamais élargi : ce statut à
// 4 valeurs reste local à cet écran.
// ============================================================================

const mathSimplification = create(all);

/** Saisie élève → syntaxe mathjs (sans changer le sens) : « − », « · », « × », « ÷ », « √ »,
 * exposants unicode, virgule décimale, point de multiplication « . » (décimal seulement entre
 * chiffres), « racine(…) », et « x(…) » (mathjs y verrait un appel de fonction x). */
function normaliserPourMathjs(texte: string): string {
  return texte
    .replace(/[−–]/g, "-")
    .replace(/[·×⋅∙]/g, "*")
    .replace(/÷/g, "/")
    .replace(/√\s*(\(|\d+(?:[.,]\d+)?|[a-zA-Z]+)/g, (_tout: string, cible: string) => (cible === "(" ? "sqrt(" : `sqrt(${cible})`))
    .replace(/√/g, "sqrt")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\.(?=\s*[A-Za-z(])/g, "*")
    .replace(/([A-Za-z)\]])\.(?=[0-9])/g, "$1*")
    .replace(/\bracinecarree\b/gi, "sqrt")
    .replace(/\bracine\b/gi, "sqrt")
    .replace(/\bx\s*\(/g, "x*(");
}

type NoeudOperateur = { fn: string; args: MathNode[] };

function sansParentheses(noeud: MathNode): MathNode {
  let n = noeud;
  while (n.type === "ParenthesisNode") n = (n as unknown as { content: MathNode }).content;
  return n;
}

function fonctionOperateur(noeud: MathNode): string | null {
  return noeud.type === "OperatorNode" ? (noeud as unknown as NoeudOperateur).fn : null;
}

function dependDeX(noeud: MathNode): boolean {
  return noeud.filter((n) => n.type === "SymbolNode" && (n as unknown as { name: string }).name === "x").length > 0;
}

/** Une division dont le dénominateur dépend de x, cherchée SANS entrer dans les arguments d'une
 * fonction (une racine est vérifiée séparément, récursivement). */
function contientFractionVariable(noeud: MathNode): boolean {
  const n = sansParentheses(noeud);
  if (n.type === "FunctionNode") return false;
  if (n.type !== "OperatorNode") return false;
  const op = n as unknown as NoeudOperateur;
  if (op.fn === "divide" && dependDeX(op.args[1])) return true;
  return op.args.some(contientFractionVariable);
}

function termesSomme(noeud: MathNode): MathNode[] {
  const n = sansParentheses(noeud);
  const fn = fonctionOperateur(n);
  if (fn === "add" || fn === "subtract") return (n as unknown as NoeudOperateur).args.flatMap(termesSomme);
  if (fn === "unaryMinus" || fn === "unaryPlus") return termesSomme((n as unknown as NoeudOperateur).args[0]);
  return [n];
}

function estSomme(noeud: MathNode): boolean {
  return termesSomme(noeud).length >= 2;
}

/** Un terme de somme qui contient encore une somme en FACTEUR (produit ou puissance d'une somme,
 * hors racine) : « 2(x+1) », « (x+1)² », « −(x−3) » dans une somme — rien n'a été développé. */
function contientSommeEnFacteur(terme: MathNode): boolean {
  const n = sansParentheses(terme);
  const fn = fonctionOperateur(n);
  if (fn === "multiply") return (n as unknown as NoeudOperateur).args.some((a) => estSomme(a) || contientSommeEnFacteur(a));
  if (fn === "pow") return estSomme((n as unknown as NoeudOperateur).args[0]);
  if (fn === "divide") {
    const [num] = (n as unknown as NoeudOperateur).args;
    return contientSommeEnFacteur(num) || (fonctionOperateur(sansParentheses(num)) === "multiply" && estSomme(num));
  }
  return false;
}

/** Remplace chaque appel de fonction (racine) par un symbole opaque, dédupliqué par son texte. */
function coquilleSansFonctions(noeud: MathNode): MathNode {
  const parTexte = new Map<string, string>();
  return noeud.transform((n) => {
    if (n.type !== "FunctionNode") return n;
    const cle = n.toString();
    let nom = parTexte.get(cle);
    if (nom === undefined) {
      nom = `R${parTexte.size}`;
      parTexte.set(cle, nom);
    }
    return new mathSimplification.SymbolNode(nom);
  });
}

/** Termes semblables regroupés : une fois développée et réduite (racines opaques), la somme ne doit
 * pas avoir MOINS de termes que la somme écrite. Ne pénalise jamais si mathjs échoue. */
function termesRegroupes(somme: MathNode, nombreTermesEcrits: number): boolean {
  try {
    const reduite = mathSimplification.rationalize(coquilleSansFonctions(somme).toString()) as unknown as MathNode;
    const r = sansParentheses(reduite);
    const numerateur = fonctionOperateur(r) === "divide" ? (r as unknown as NoeudOperateur).args[0] : r;
    return termesSomme(numerateur).length >= nombreTermesEcrits;
  } catch {
    return true;
  }
}

/** Critère de structure de la décision E (voir l'en-tête de cette section). */
export function estFormeBienStructuree(noeud: MathNode): boolean {
  const n = sansParentheses(noeud);
  if (n.type === "FunctionNode") return (n as unknown as { args: MathNode[] }).args.every(estFormeBienStructuree);
  if (n.type !== "OperatorNode") return true;
  const op = n as unknown as NoeudOperateur;
  if (op.fn === "divide") {
    const [num, den] = op.args;
    if (contientFractionVariable(num) || contientFractionVariable(den)) return false;
    return estFormeBienStructuree(num) && estFormeBienStructuree(den);
  }
  const termes = termesSomme(n);
  if (termes.length >= 2) {
    if (termes.some(contientFractionVariable)) return false;
    if (termes.some(contientSommeEnFacteur)) return false;
    if (!termesRegroupes(n, termes.length)) return false;
    return termes.every(estFormeBienStructuree);
  }
  return op.args.every(estFormeBienStructuree);
}

/** Statut LOCAL à 4 valeurs (voir l'en-tête de cette section). */
export type StatutVerificationFormuleSimplifiee = "correct" | "correct_non_simplifie" | "not_equivalent" | "parse_error";

export function diagnostiquerFormuleDirectionSimplifiee(dir: CompositionDirigee, texte: string): StatutVerificationFormuleSimplifiee {
  const statutNumerique = diagnostiquerFormuleDirection(dir, texte);
  if (statutNumerique !== "correct") return statutNumerique;
  let noeud: MathNode;
  try {
    noeud = mathSimplification.parse(normaliserPourMathjs(texte));
  } catch {
    // Syntaxe acceptée par le palier 1 mais pas par mathjs : on ne pénalise jamais l'élève pour une
    // limite de CE palier.
    return "correct";
  }
  return estFormeBienStructuree(noeud) ? "correct" : "correct_non_simplifie";
}

/** `correct` seulement si équivalente ET bien structurée. */
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

/** Une ligne de réponse qui correspond à UNE des conditions attendues (comparateur et seuil). */
export function ligneConditionCorrespond(dir: CompositionDirigee, ligne: ReponseCondition, indexAttendu: number): boolean {
  const c = dir.conditions[indexAttendu];
  return ligne.comparateur === c.comparateur && Math.abs(ligne.seuil - c.seuil) < TOLERANCE_SEUIL;
}

/** Audit 5e ch. 1, point 24 : les 2 lignes portent la même étiquette « g(x) » — l'ordre de saisie ne
 * compte plus (appariement sans remise). */
export function verifierConditionsDirection(dir: CompositionDirigee, reponse: ReponseCondition[]): boolean {
  if (reponse.length !== dir.conditions.length) return false;
  const utilisees = new Set<number>();
  return reponse.every((ligne) => {
    const i = dir.conditions.findIndex((_c, k) => !utilisees.has(k) && ligneConditionCorrespond(dir, ligne, k));
    if (i < 0) return false;
    utilisees.add(i);
    return true;
  });
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
