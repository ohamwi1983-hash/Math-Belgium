import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleCParite, ExerciceFamilleD, ExerciceTiragesArbres, FractionExacte } from "../core6e/tiragesArbres.types";
import type { PhaseTiragesArbres } from "../moteur6e/typesTiragesArbres";
import { ciblesEcran } from "../moteur6e/verificationTiragesArbres";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen31` (tirages et arbres).
 * Dispatch sur `exercice.famille` puis `phase`.
 *
 * Audit 6e ch. 6 (lot 6gen31) :
 * - aides uniquement en termes de chemins de l'arbre, de règle du produit, d'événement contraire
 *   et de n! — jamais C(n,k), « loi binomiale », « loi hypergéométrique » ni dérangements D(n)
 *   (notions du chapitre suivant), toujours en LaTeX, jamais en notation clavier ;
 * - placeholders hors tirage : jamais une valeur ni une équation à recopier, seulement l'annonce de
 *   la précision réellement acceptée par `diagnostiquerProbabilite` (forme exacte, ou décimal arrondi
 *   au centième — au millième quand la probabilité est inférieure à 0,1) ;
 * - typographie : guillemets « », pas de « boule(s) », pas de majuscules d'insistance, un seul
 *   vocabulaire par contexte (« lettre », « chanson »), réponses attendues en fractions exactes.
 *
 * Les petites fonctions de calcul exportées (chemins, fractions, comptages) servent aussi à
 * l'adaptateur papier `generateurs6e/tiragesArbres/exportEvaluation.ts` (une seule source).
 *
 * Toutes les quantités affichées se recalculent ici en fractions EXACTES (entiers), indépendamment
 * de `generateurs6e/` ; seule l'annonce de précision lit les cibles numériques du moteur.
 */

export interface ChampDef {
  label: string;
  placeholder: string;
  /** Aperçu LaTeX en direct de la saisie (expression ou équation). */
  apercu?: boolean;
  /** Champ large (équation) : les champs de l'écran s'empilent au lieu de se partager une ligne. */
  pleineLargeur?: boolean;
}

/** Texte brut mêlé à du LaTeX inline court, rendu via `components/RenduFragments.tsx`. La prose va
 * TOUJOURS dans `texte()`, seule une notation courte va dans `latex()`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latexFrag(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Espace insécable (guillemets, « n° 3 »). */
const NBSP = " ";
function guillemets(s: string): string {
  return `«${NBSP}${s}${NBSP}»`;
}

const NOMBRES_EN_LETTRES = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six"];
function enLettres(n: number): string {
  return NOMBRES_EN_LETTRES[n] ?? String(n);
}
export function singulier(adjectifPluriel: string): string {
  return adjectifPluriel.replace(/s$/, "");
}
/** « une boule rouge », « deux boules rouges » (accord, jamais « boule(s) »). */
function boules(n: number, adjectifPluriel: string): string {
  return n === 1 ? `une boule ${singulier(adjectifPluriel)}` : `${enLettres(n)} boules ${adjectifPluriel}`;
}
function initiale(adjectif: string): string {
  return adjectif.charAt(0).toUpperCase();
}

// ============================================================================
// Fractions exactes.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

export function reduire(f: FractionExacte): FractionExacte {
  const g = pgcd(f.num, f.den);
  return { num: f.num / g, den: f.den / g };
}
export function somme(...fs: FractionExacte[]): FractionExacte {
  return fs.reduce((acc, f) => reduire({ num: acc.num * f.den + f.num * acc.den, den: acc.den * f.den }), { num: 0, den: 1 });
}
function produit(...fs: FractionExacte[]): FractionExacte {
  return fs.reduce((acc, f) => reduire({ num: acc.num * f.num, den: acc.den * f.den }), { num: 1, den: 1 });
}
export function complement(f: FractionExacte): FractionExacte {
  return reduire({ num: f.den - f.num, den: f.den });
}

/** Fraction irréductible LaTeX — jamais de décimal. */
export function formatFractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 !== den < 0 ? "-" : "";
  const r = reduire({ num: Math.abs(num), den: Math.abs(den) });
  return r.den === 1 ? `${signe}${r.num}` : `${signe}\\dfrac{${r.num}}{${r.den}}`;
}
export function fx(f: FractionExacte): string {
  return formatFractionLatex(f.num, f.den);
}
/** Fraction NON réduite (composition de l'urne, lisible sur l'arbre). */
function fxBrute(num: number, den: number): string {
  return `\\dfrac{${num}}{${den}}`;
}

/** Annonce de la précision acceptée (règle de `diagnostiquerProbabilite`). */
function annoncePrecision(cible: number | undefined): string {
  return cible !== undefined && Math.abs(cible) < 0.1 ? "forme exacte ou arrondi au millième" : "forme exacte ou arrondi au centième";
}
function champProba(label: string, cible: number | undefined, apercu = true): ChampDef {
  return { label, placeholder: annoncePrecision(cible), apercu };
}

// ============================================================================
// Urne à 2 couleurs (familles A et D) — chemins de l'arbre.
// ============================================================================

/** Branches successives d'un chemin (0 = couleur 1, 1 = couleur 2), en fractions non réduites. */
export function branchesChemin(n1: number, n2: number, avecRemise: boolean, chemin: readonly number[]): FractionExacte[] {
  let r1 = n1;
  let r2 = n2;
  return chemin.map((c) => {
    const f = { num: c === 0 ? r1 : r2, den: r1 + r2 };
    if (!avecRemise) {
      if (c === 0) r1--;
      else r2--;
    }
    return f;
  });
}
export function probCheminFraction(n1: number, n2: number, avecRemise: boolean, chemin: readonly number[]): FractionExacte {
  return produit(...branchesChemin(n1, n2, avecRemise, chemin));
}
export function produitLatex(n1: number, n2: number, avecRemise: boolean, chemin: readonly number[]): string {
  return branchesChemin(n1, n2, avecRemise, chemin)
    .map((f) => fxBrute(f.num, f.den))
    .join("\\times ");
}
function tousLesChemins(k: number): number[][] {
  let chemins: number[][] = [[]];
  for (let i = 0; i < k; i++) chemins = chemins.flatMap((c) => [[...c, 0], [...c, 1]]);
  return chemins;
}
function modeTirage(avecRemise: boolean): string {
  return avecRemise ? "avec remise" : "sans remise";
}

// ============================================================================
// Famille A — k tirages avec/sans remise.
// ============================================================================

export function cheminsEcran3A(ex: ExerciceFamilleA): number[][] {
  return tousLesChemins(ex.k).filter((c) => c.filter((x) => x === 0).length === ex.m);
}
export function fractionsA(ex: ExerciceFamilleA) {
  const p1 = probCheminFraction(ex.n1, ex.n2, ex.avecRemise, new Array<number>(ex.k).fill(0));
  const p2 = probCheminFraction(ex.n1, ex.n2, ex.avecRemise, new Array<number>(ex.k).fill(1));
  const p3 = ex.questionEcran3 === "auMoinsUne" ? complement(p2) : somme(...cheminsEcran3A(ex).map((c) => probCheminFraction(ex.n1, ex.n2, ex.avecRemise, c)));
  return { p1, p2, p3 };
}

function consigneGeneraleA(ex: ExerciceFamilleA): FragmentConsigne[] {
  const precision = ex.avecRemise ? "chaque boule tirée est remise dans l'urne avant le tirage suivant" : "une boule tirée n'est pas remise dans l'urne";
  return [texte(`Une urne contient ${ex.n1} boules ${ex.labelCouleur1} et ${ex.n2} boules ${ex.labelCouleur2}. On tire au hasard ${enLettres(ex.k)} boules l'une après l'autre, ${modeTirage(ex.avecRemise)} : ${precision}.`)];
}

function blocDonneesA(ex: ExerciceFamilleA): string[] {
  return [`${ex.n1}\\ \\text{${ex.labelCouleur1}}`, `${ex.n2}\\ \\text{${ex.labelCouleur2}}`, `${ex.k}\\ \\text{tirages ${modeTirage(ex.avecRemise)}}`];
}

export function questionEcran3A(ex: ExerciceFamilleA): string {
  return ex.questionEcran3 === "auMoinsUne" ? `au moins une boule ${singulier(ex.labelCouleur1)}` : `exactement ${boules(ex.m, ex.labelCouleur1)}`;
}

function consigneEcranA(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte(`Calcule la probabilité de tirer ${boules(ex.k, ex.labelCouleur1)}, puis celle de tirer ${boules(ex.k, ex.labelCouleur2)}.`)];
  if (phase === "aEcran2") return [texte(`Calcule la probabilité que les ${enLettres(ex.k)} boules tirées soient de la même couleur.`)];
  return [texte(`Calcule la probabilité de tirer ${questionEcran3A(ex)}.`)];
}

export function libelleEcran3A(ex: ExerciceFamilleA): string {
  const c = singulier(ex.labelCouleur1);
  return ex.questionEcran3 === "auMoinsUne" ? `au moins une ${c}` : `exactement ${ex.m} ${ex.m > 1 ? ex.labelCouleur1 : c}`;
}

function champsA(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): ChampDef[] {
  const cibles = ciblesEcran(ex, phase) ?? [];
  if (phase === "aEcran1") {
    // Libellés longs : champs empilés (côte à côte, chacun ne garderait qu'une centaine de pixels à 390 px).
    return [champProba(`P(${ex.k} ${ex.labelCouleur1}) =`, cibles[0], false), champProba(`P(${ex.k} ${ex.labelCouleur2}) =`, cibles[1], false)].map((c) => ({ ...c, pleineLargeur: true }));
  }
  if (phase === "aEcran2") return [champProba("P(même couleur) =", cibles[0])];
  return [champProba(`P(${libelleEcran3A(ex)}) =`, cibles[0])];
}

function aideNiveau1A(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): AideAvecLatex {
  if (phase === "aEcran1") {
    const urne = ex.avecRemise ? "Avec remise, l'urne est la même à chaque tirage." : "Sans remise, il reste une boule de moins à chaque tirage, et une boule de moins de la couleur qui vient d'être tirée.";
    return { texte: `Sur l'arbre des tirages, ${guillemets(boules(ex.k, ex.labelCouleur1))} est un seul chemin : la même couleur à chaque tirage. Sa probabilité est le produit des probabilités de ses branches. ${urne}`, latex: null };
  }
  if (phase === "aEcran2") return { texte: `Les événements ${guillemets(`toutes ${ex.labelCouleur1}`)} et ${guillemets(`toutes ${ex.labelCouleur2}`)} sont incompatibles : additionne leurs probabilités, calculées à l'étape 1.`, latex: null };
  if (ex.questionEcran3 === "auMoinsUne") {
    return { texte: `Le contraire de ${guillemets(`au moins une boule ${singulier(ex.labelCouleur1)}`)} est ${guillemets(`aucune boule ${singulier(ex.labelCouleur1)}`)}, c'est-à-dire ${boules(ex.k, ex.labelCouleur2)} : un seul chemin de l'arbre.`, latex: "P(\\overline{E})=1-P(E)" };
  }
  return { texte: `Repère sur l'arbre les chemins qui contiennent exactement ${boules(ex.m, ex.labelCouleur1)}. Ils ont tous la même probabilité (les mêmes facteurs, dans un autre ordre) : additionne-les, ou multiplie la probabilité d'un chemin par le nombre de chemins.`, latex: null };
}

function aideNiveau2A(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): AideAvecLatex {
  const i1 = initiale(ex.labelCouleur1);
  const i2 = initiale(ex.labelCouleur2);
  if (phase === "aEcran1") {
    const premier = produitLatex(ex.n1, ex.n2, ex.avecRemise, new Array<number>(ex.k).fill(0));
    const debutAutre = branchesChemin(ex.n1, ex.n2, ex.avecRemise, [1])[0];
    return { texte: "Le premier chemin, produit non effectué (l'autre se construit de la même façon) :", latex: `\\begin{gathered}P(${ex.k}\\ \\text{${ex.labelCouleur1}})=${premier}\\\\ P(${ex.k}\\ \\text{${ex.labelCouleur2}})=${fxBrute(debutAutre.num, debutAutre.den)}\\times\\cdots\\end{gathered}` };
  }
  const { p1, p2 } = fractionsA(ex);
  if (phase === "aEcran2") return { texte: "Les deux probabilités à additionner (somme non effectuée) :", latex: `${fx(p1)}+${fx(p2)}` };
  if (ex.questionEcran3 === "auMoinsUne") return { texte: `Avec la probabilité de ${boules(ex.k, ex.labelCouleur2)} (étape 1) :`, latex: `1-${fx(p2)}` };
  const chemins = cheminsEcran3A(ex);
  const noms = chemins.map((c) => c.map((x) => (x === 0 ? i1 : i2)).join("")).join(", ");
  return { texte: `${chemins.length} chemins conviennent (${noms}). Nombre de chemins × probabilité d'un chemin, produit non effectué :`, latex: `${chemins.length}\\times ${produitLatex(ex.n1, ex.n2, ex.avecRemise, chemins[0])}` };
}

function reponseA(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): string[] {
  const { p1, p2, p3 } = fractionsA(ex);
  if (phase === "aEcran1") return [`P(${ex.k}\\ \\text{${ex.labelCouleur1}})=${fx(p1)}`, `P(${ex.k}\\ \\text{${ex.labelCouleur2}})=${fx(p2)}`];
  if (phase === "aEcran2") return [`P(\\text{même couleur})=${fx(somme(p1, p2))}`];
  return [`P(\\text{${libelleEcran3A(ex)}})=${fx(p3)}`];
}

// ============================================================================
// Famille B — arrangements au hasard.
// ============================================================================

export function factorielle(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function permutations(n: number): number[][] {
  if (n === 0) return [[]];
  return permutations(n - 1).flatMap((p) => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)]));
}
export function compterArrangements(n: number, test: (bienPlaces: number) => boolean): number {
  return permutations(n).filter((p) => test(p.filter((v, i) => v === i).length)).length;
}
/** Nombre de façons de placer r objets sans qu'aucun ne soit à sa place (r ≤ 3 ici). */
export function toutesMalPlacees(r: number): number {
  return compterArrangements(r, (b) => b === 0);
}
export function nombrePaires(n: number): number {
  return (n * (n - 1)) / 2;
}

export function objetB(ex: ExerciceFamilleB): { nom: string; noms: string } {
  return ex.contexte === "lettres" ? { nom: "lettre", noms: "lettres" } : { nom: "chanson", noms: "chansons" };
}
function numero(i: number): string {
  return `n°${NBSP}${i}`;
}

function consigneGeneraleB(ex: ExerciceFamilleB): FragmentConsigne[] {
  if (ex.contexte === "lettres") {
    return [texte(`On glisse au hasard ${ex.n} lettres, numérotées de 1 à ${ex.n}, dans ${ex.n} enveloppes numérotées de 1 à ${ex.n}, une lettre par enveloppe. Une lettre est ${guillemets("bien placée")} si elle se trouve dans l'enveloppe qui porte son numéro.`)];
  }
  return [texte(`Une playlist de ${ex.n} chansons, numérotées de 1 à ${ex.n}, est lue dans un ordre choisi au hasard. Une chanson est ${guillemets("bien placée")} si elle passe à la position qui porte son numéro.`)];
}

function blocDonneesB(ex: ExerciceFamilleB): string[] {
  return [`${ex.n}\\ \\text{${objetB(ex).noms}}`];
}

function consigneEcranB(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): FragmentConsigne[] {
  const { nom, noms } = objetB(ex);
  if (phase === "bEcran1") {
    if (ex.demandeEcran1 === "une") return [texte(`Calcule la probabilité que la ${nom} ${numero(ex.positionsEcran1[0])} soit bien placée.`)];
    return [texte(`Calcule la probabilité que les ${noms} ${numero(ex.positionsEcran1[0])} et ${numero(ex.positionsEcran1[1])} soient toutes les deux bien placées.`)];
  }
  if (phase === "bEcran2") return [texte(`Calcule la probabilité que toutes les ${noms} soient bien placées.`)];
  if (phase === "bEcran3") return [texte(ex.k === 1 ? `Calcule la probabilité qu'exactement une ${nom} soit bien placée.` : `Calcule la probabilité qu'exactement ${enLettres(ex.k)} ${noms} soient bien placées.`)];
  if (ex.demandeEcran4 === "auMoinsTrois") return [texte(`Calcule la probabilité qu'au moins trois ${noms} soient bien placées.`)];
  return [texte(`Calcule la probabilité qu'aucune ${nom} ne soit bien placée.`)];
}

function champsB(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): ChampDef[] {
  const cible = (ciblesEcran(ex, phase) ?? [])[0];
  if (phase === "bEcran1") {
    const label = ex.demandeEcran1 === "une" ? `P(${numero(ex.positionsEcran1[0])} bien placée) =` : `P(${numero(ex.positionsEcran1[0])} et ${numero(ex.positionsEcran1[1])} bien placées) =`;
    return [champProba(label, cible)];
  }
  if (phase === "bEcran2") return [champProba("P(toutes bien placées) =", cible)];
  if (phase === "bEcran3") return [champProba(`P(exactement ${ex.k} bien placée${ex.k > 1 ? "s" : ""}) =`, cible)];
  return [champProba(ex.demandeEcran4 === "auMoinsTrois" ? "P(au moins 3 bien placées) =" : "P(aucune bien placée) =", cible)];
}

function produitFactorielle(n: number): string {
  return `${n}!=${Array.from({ length: n }, (_, i) => n - i).join("\\times ")}=${factorielle(n)}`;
}

/** Écran 3 : nombre de façons de choisir les objets bien placés, avec sa justification. */
export function choixBienPlaces(ex: ExerciceFamilleB): { nombre: number; justification: string } {
  const { nom, noms } = objetB(ex);
  const r = ex.n - ex.k;
  if (ex.k === 1) return { nombre: ex.n, justification: `${ex.n} choix pour la ${nom} bien placée` };
  if (r === 2) return { nombre: nombrePaires(ex.n), justification: `${nombrePaires(ex.n)} paires possibles pour les deux ${noms} mal placées` };
  return { nombre: nombrePaires(ex.n), justification: `${nombrePaires(ex.n)} paires possibles pour les deux ${noms} bien placées` };
}

function aideNiveau1B(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): AideAvecLatex {
  const { nom, noms } = objetB(ex);
  const place = ex.contexte === "lettres" ? "enveloppe" : "position";
  if (phase === "bEcran1") {
    if (ex.demandeEcran1 === "une") return { texte: `La ${nom} ${numero(ex.positionsEcran1[0])} peut se retrouver à n'importe laquelle des ${ex.n} places, avec la même probabilité ; une seule est la bonne.`, latex: null };
    return { texte: `Arbre à deux niveaux : d'abord la ${nom} ${numero(ex.positionsEcran1[0])} (une bonne ${place} sur ${ex.n}), puis la ${nom} ${numero(ex.positionsEcran1[1])} parmi les ${ex.n - 1} places restantes. Multiplie les probabilités le long du chemin.`, latex: null };
  }
  if (phase === "bEcran2") return { texte: `Sur l'arbre des placements (la ${nom} ${numero(1)}, puis la ${numero(2)}, etc.), un seul chemin place tout correctement. Le nombre total de chemins est ${ex.n}!, et ils sont tous équiprobables.`, latex: null };
  if (phase === "bEcran3") return { texte: `Compte les arrangements favorables : choisis d'abord quelles ${noms} sont bien placées, puis place toutes les autres de façon qu'aucune ne soit à sa place. Divise ensuite par le nombre total d'arrangements, ${ex.n}!.`, latex: null };
  if (ex.demandeEcran4 === "auMoinsTrois") return { texte: `${guillemets("Au moins trois")}, c'est exactement trois, exactement quatre ou toutes les cinq : des cas incompatibles, à additionner. Exactement quatre est impossible : la cinquième serait forcément à sa place.`, latex: null };
  return { texte: `Passe par l'événement contraire, ${guillemets(`au moins une ${nom} bien placée`)} : c'est exactement une, exactement deux… ou toutes. Exactement ${ex.n - 1} est impossible : la dernière serait forcément à sa place.`, latex: "P(\\overline{E})=1-P(E)" };
}

function aideNiveau2B(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): AideAvecLatex {
  const { noms } = objetB(ex);
  if (phase === "bEcran1") {
    if (ex.demandeEcran1 === "une") return { texte: "En situation d'équiprobabilité :", latex: "P=\\dfrac{\\text{nombre de cas favorables}}{\\text{nombre de cas possibles}}" };
    return { texte: "Règle du produit, produit non effectué :", latex: `\\dfrac{1}{${ex.n}}\\times\\dfrac{1}{${ex.n - 1}}` };
  }
  if (phase === "bEcran2") return { texte: "Nombre total d'arrangements :", latex: produitFactorielle(ex.n) };
  if (phase === "bEcran3") {
    const r = ex.n - ex.k;
    const mal = toutesMalPlacees(r);
    const choix = choixBienPlaces(ex);
    const facons = r === 2 ? "1 façon (on les échange)" : "2 façons (chacune décalée d'un cran, dans un sens ou dans l'autre)";
    return { texte: `${choix.justification} ; les ${r} autres ${noms}, toutes mal placées : ${facons}. Calcul non effectué :`, latex: `\\dfrac{${choix.nombre}\\times ${mal}}{${ex.n}!}` };
  }
  if (ex.demandeEcran4 === "auMoinsTrois") {
    return { texte: `Exactement trois : ${nombrePaires(ex.n)} paires possibles pour les deux ${noms} mal placées, échangées (1 façon). Toutes les cinq : 1 arrangement. Calcul non effectué :`, latex: `\\dfrac{${nombrePaires(ex.n)}\\times 1+0+1}{${ex.n}!}` };
  }
  // n ∈ {3, 4} : exactement 1 → n × (façons de mal placer les n − 1 autres), exactement 2 (n = 4) → paires × 1, toutes → 1.
  const termes = [`${ex.n}\\times ${toutesMalPlacees(ex.n - 1)}`];
  if (ex.n === 4) termes.push(`${nombrePaires(4)}\\times 1`);
  termes.push("1");
  return { texte: "Arrangements avec au moins une bien placée (exactement une, exactement deux, toutes), calcul non effectué :", latex: `1-\\dfrac{${termes.join("+")}}{${ex.n}!}` };
}

function reponseB(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): string[] {
  const n = ex.n;
  if (phase === "bEcran1") {
    if (ex.demandeEcran1 === "une") return [`P(\\text{n° ${ex.positionsEcran1[0]} bien placée})=${formatFractionLatex(1, n)}`];
    return [`P(\\text{n° ${ex.positionsEcran1[0]} et n° ${ex.positionsEcran1[1]} bien placées})=${formatFractionLatex(1, n * (n - 1))}`];
  }
  if (phase === "bEcran2") return [`P(\\text{toutes bien placées})=${formatFractionLatex(1, factorielle(n))}`];
  if (phase === "bEcran3") return [`P(\\text{exactement ${ex.k} bien placée${ex.k > 1 ? "s" : ""}})=${formatFractionLatex(compterArrangements(n, (b) => b === ex.k), factorielle(n))}`];
  if (ex.demandeEcran4 === "auMoinsTrois") return [`P(\\text{au moins 3 bien placées})=${formatFractionLatex(compterArrangements(n, (b) => b >= 3), factorielle(n))}`];
  return [`P(\\text{aucune bien placée})=${formatFractionLatex(compterArrangements(n, (b) => b === 0), factorielle(n))}`];
}

// ============================================================================
// Famille C — dé truqué.
// ============================================================================

const MULTIPLES = ["", "", "le double", "le triple", "le quadruple", "le quintuple"];

export function facesDe(ex: ExerciceFamilleC): number {
  return ex.faces ?? 6;
}
export function probFaceFraction(ex: ExerciceFamilleC, face: number): FractionExacte {
  if (ex.sousType === "special") return face === ex.faceSpeciale ? ex.p0 : ex.p;
  return face % 2 === 0 ? ex.p : ex.q;
}
/** Faces concernées par l'écran 3. */
export function facesEcran3(ex: ExerciceFamilleC): number[] {
  const toutes = Array.from({ length: facesDe(ex) }, (_, i) => i + 1);
  const cible = ex.sousType === "special" ? (ex.ecran3Cible ?? "deuxFaces") : ex.ecran3Cible;
  if (cible === "pair") return toutes.filter((f) => f % 2 === 0);
  if (cible === "impair") return toutes.filter((f) => f % 2 === 1);
  if (ex.sousType === "special") return [ex.faceSpeciale, ex.autreFace].sort((a, b) => a - b);
  return ex.sousEnsemble ?? [];
}
function listeFaces(faces: number[]): string {
  if (faces.length <= 1) return faces.join("");
  return `${faces.slice(0, -1).join(", ")} ou ${faces[faces.length - 1]}`;
}
function plusProbable(ex: ExerciceFamilleCParite): "pair" | "impair" {
  return ex.plusProbable ?? "pair";
}

function consigneGeneraleC(ex: ExerciceFamilleC): FragmentConsigne[] {
  const n = facesDe(ex);
  const de = `On lance un dé truqué à ${n} faces, numérotées de 1 à ${n}.`;
  if (ex.sousType === "special") {
    return [texte(`${de} La face ${ex.faceSpeciale} a une probabilité de `), latexFrag(fx(ex.p0)), texte(` ; les ${n - 1} autres faces ont toutes la même probabilité, notée `), latexFrag("p"), texte(".")];
  }
  const relation = plusProbable(ex) === "pair" ? `la probabilité de chaque face paire est ${MULTIPLES[ex.r]} de celle de chaque face impaire` : `la probabilité de chaque face impaire est ${MULTIPLES[ex.r]} de celle de chaque face paire`;
  return [texte(`${de} Les faces paires ont toutes la même probabilité `), latexFrag("p"), texte(", les faces impaires toutes la même probabilité "), latexFrag("q"), texte(`, et ${relation}.`)];
}

function blocDonneesC(ex: ExerciceFamilleC): string[] {
  const de = `\\text{dé à ${facesDe(ex)} faces}`;
  if (ex.sousType === "special") return [de, `P(\\text{face ${ex.faceSpeciale}})=${fx(ex.p0)}`];
  return [de];
}

export function questionEcran3C(ex: ExerciceFamilleC): { phrase: string; label: string; latex: string } {
  const cible = ex.sousType === "special" ? (ex.ecran3Cible ?? "deuxFaces") : ex.ecran3Cible;
  if (cible === "pair") return { phrase: "obtenir un nombre pair", label: "P(nombre pair) =", latex: "P(\\text{nombre pair})" };
  if (cible === "impair") return { phrase: "obtenir un nombre impair", label: "P(nombre impair) =", latex: "P(\\text{nombre impair})" };
  const faces = facesEcran3(ex);
  return { phrase: `obtenir ${faces.length === 2 ? "la face" : "l'une des faces"} ${listeFaces(faces)}`, label: `P(face ${listeFaces(faces)}) =`, latex: `P(\\text{face ${listeFaces(faces)}})` };
}

function consigneEcranC(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): FragmentConsigne[] {
  if (phase === "cEcran1") {
    if (ex.sousType === "special") return [texte("Écris l'équation qui exprime que la somme des probabilités de toutes les faces vaut 1.")];
    return [texte("Traduis par une équation la relation entre "), latexFrag("p"), texte(" et "), latexFrag("q"), texte(" donnée par l'énoncé, puis écris l'équation qui exprime que la somme des probabilités de toutes les faces vaut 1 (dans l'ordre de ton choix).")];
  }
  if (phase === "cEcran2") return ex.sousType === "special" ? [texte("Résous cette équation : calcule "), latexFrag("p"), texte(".")] : [texte("Résous ce système : calcule "), latexFrag("p"), texte(" et "), latexFrag("q"), texte(".")];
  return [texte(`Calcule la probabilité d'${questionEcran3C(ex).phrase}.`)];
}

function champsC(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): ChampDef[] {
  if (phase === "cEcran1") {
    if (ex.sousType === "special") return [{ label: "Équation :", placeholder: "équation d'inconnue p", apercu: true, pleineLargeur: true }];
    return [
      { label: "Équation 1 :", placeholder: "équation en p et q", apercu: true, pleineLargeur: true },
      { label: "Équation 2 :", placeholder: "équation en p et q", apercu: true, pleineLargeur: true },
    ];
  }
  const cibles = ciblesEcran(ex, phase) ?? [];
  if (phase === "cEcran2") {
    if (ex.sousType === "special") return [champProba("p =", cibles[0])];
    return [champProba("p =", cibles[0], false), champProba("q =", cibles[1], false)];
  }
  return [champProba(questionEcran3C(ex).label, cibles[0])];
}

export function equationsC(ex: ExerciceFamilleC): string[] {
  const n = facesDe(ex);
  if (ex.sousType === "special") return [`${fx(ex.p0)}+${n - 1}p=1`];
  const h = n / 2;
  return [plusProbable(ex) === "pair" ? `p=${ex.r}q` : `q=${ex.r}p`, `${h}p+${h}q=1`];
}

function aideNiveau1C(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): AideAvecLatex {
  const n = facesDe(ex);
  if (phase === "cEcran1") {
    if (ex.sousType === "special") return { texte: `La face ${ex.faceSpeciale} a une probabilité connue ; chacune des ${n - 1} autres faces a la probabilité p. La somme de ces ${n} probabilités vaut 1.`, latex: null };
    const mot = MULTIPLES[ex.r];
    return { texte: `${guillemets(`Est ${mot} de`)} se traduit par une multiplication par ${ex.r}. Pour la somme : il y a ${n / 2} faces paires (probabilité p chacune) et ${n / 2} faces impaires (probabilité q chacune).`, latex: null };
  }
  if (phase === "cEcran2") {
    if (ex.sousType === "special") return { texte: "Isole p : soustrais la probabilité connue des deux membres, puis divise par le nombre de faces de probabilité p.", latex: null };
    return { texte: "Remplace, dans l'équation de la somme, la probabilité exprimée par la relation : il ne reste qu'une inconnue. Calcule-la, puis déduis l'autre de la relation.", latex: null };
  }
  return { texte: "Des faces différentes donnent des événements incompatibles : additionne les probabilités des faces demandées, en utilisant les valeurs de l'étape 2.", latex: null };
}

function aideNiveau2C(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): AideAvecLatex {
  const n = facesDe(ex);
  if (phase === "cEcran1") {
    const somme = `P(1)+P(2)+\\cdots+P(${n})=1`;
    if (ex.sousType === "special") return { texte: "Écris la somme face par face, puis remplace chaque probabilité (la probabilité connue, ou p) et regroupe les p :", latex: somme };
    const fort = plusProbable(ex) === "pair" ? "paire" : "impaire";
    const faible = plusProbable(ex) === "pair" ? "impaire" : "paire";
    return { texte: `Relation : la probabilité d'une face ${fort} est égale à ${ex.r} fois celle d'une face ${faible}. Somme : écris-la face par face, puis regroupe les p et les q :`, latex: somme };
  }
  if (phase === "cEcran2") {
    if (ex.sousType === "special") return { texte: "Équation à résoudre :", latex: `${fx(ex.p0)}+${n - 1}p=1` };
    const h = n / 2;
    const substituee = plusProbable(ex) === "pair" ? `${h}\\times ${ex.r}q+${h}q=1` : `${h}p+${h}\\times ${ex.r}p=1`;
    return { texte: "Après substitution (résolution non effectuée) :", latex: substituee };
  }
  const termes = facesEcran3(ex).map((f) => fx(probFaceFraction(ex, f)));
  return { texte: "Somme à effectuer :", latex: termes.join("+") };
}

function reponseC(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): string[] {
  if (phase === "cEcran1") return equationsC(ex);
  if (phase === "cEcran2") return ex.sousType === "special" ? [`p=${fx(ex.p)}`] : [`p=${fx(ex.p)}`, `q=${fx(ex.q)}`];
  return [`${questionEcran3C(ex).latex}=${fx(somme(...facesEcran3(ex).map((f) => probFaceFraction(ex, f))))}`];
}

// ============================================================================
// Famille D — arbre pondéré.
// ============================================================================

/** Les 6 branches (fractions non réduites), ordre a…f : 1er tirage (c1, c2), 2e après c1 (c1, c2),
 * 2e après c2 (c1, c2). */
export function branchesArbreD(ex: ExerciceFamilleD): FractionExacte[] {
  const b = (chemin: number[]) => branchesChemin(ex.n1, ex.n2, ex.avecRemise, chemin);
  return [b([0])[0], b([1])[0], b([0, 0])[1], b([0, 1])[1], b([1, 0])[1], b([1, 1])[1]];
}
export const LETTRES_BRANCHES_D = ["a", "b", "c", "d", "e", "f"] as const;

export function couleurD(ex: ExerciceFamilleD, c: number): string {
  return c === 0 ? ex.labelCouleur1 : ex.labelCouleur2;
}
function initialeD(ex: ExerciceFamilleD, c: number): string {
  return c === 0 ? ex.initiale1 : ex.initiale2;
}
export function phraseCheminD(ex: ExerciceFamilleD): string {
  const [c1, c2] = ex.chemin;
  if (c1 === c2) return boules(2, couleurD(ex, c1));
  return `une boule ${singulier(couleurD(ex, c1))} puis une boule ${singulier(couleurD(ex, c2))}`;
}
export function libelleCheminD(ex: ExerciceFamilleD): string {
  const [c1, c2] = ex.chemin;
  return `${singulier(couleurD(ex, c1))} puis ${singulier(couleurD(ex, c2))}`;
}

function consigneGeneraleD(ex: ExerciceFamilleD): FragmentConsigne[] {
  const remise = ex.avecRemise ? "on la remet dans l'urne" : "on ne la remet pas dans l'urne";
  return [texte(`Une urne contient ${ex.n1} boules ${ex.labelCouleur1} et ${ex.n2} boules ${ex.labelCouleur2}. On tire une boule au hasard, on note sa couleur, ${remise}, puis on tire au hasard une deuxième boule.`)];
}

function blocDonneesD(ex: ExerciceFamilleD): string[] {
  return [`${ex.n1}\\ \\text{${ex.labelCouleur1}}`, `${ex.n2}\\ \\text{${ex.labelCouleur2}}`, `2\\ \\text{tirages ${modeTirage(ex.avecRemise)}}`];
}

function consigneEcranD(ex: ExerciceFamilleD, phase: PhaseTiragesArbres): FragmentConsigne[] {
  const cible = singulier(couleurD(ex, ex.couleurCible));
  if (phase === "dEcran1") return [texte("Complète l'arbre pondéré des deux tirages : écris la probabilité portée par chaque branche.")];
  if (phase === "dEcran2") return [texte(`Calcule la probabilité d'obtenir ${phraseCheminD(ex)}.`)];
  if (phase === "dEcran3") return [texte(`Calcule la probabilité d'obtenir exactement une boule ${cible}.`)];
  return [texte(`Calcule la probabilité d'obtenir au moins une boule ${cible}.`)];
}

function champsD(ex: ExerciceFamilleD, phase: PhaseTiragesArbres): ChampDef[] {
  const cibles = ciblesEcran(ex, phase) ?? [];
  const cible = singulier(couleurD(ex, ex.couleurCible));
  // Toutes les branches valent au moins 1/7 (n1, n2 ∈ {2..6}) : précision au centième pour les 6 champs,
  // annoncée en version courte (champs étroits, 2 ou 3 par ligne).
  if (phase === "dEcran1") return LETTRES_BRANCHES_D.map((l, i) => ({ label: `${l} =`, placeholder: Math.abs(cibles[i] ?? 1) < 0.1 ? "exacte ou au millième" : "exacte ou au centième" }));
  if (phase === "dEcran2") return [champProba(`P(${libelleCheminD(ex)}) =`, cibles[0])];
  if (phase === "dEcran3") return [champProba(`P(exactement une ${cible}) =`, cibles[0])];
  return [champProba(`P(au moins une ${cible}) =`, cibles[0])];
}

function aideNiveau1D(ex: ExerciceFamilleD, phase: PhaseTiragesArbres): AideAvecLatex {
  const c = singulier(couleurD(ex, ex.couleurCible));
  const autre = singulier(couleurD(ex, ex.couleurCible === 0 ? 1 : 0));
  if (phase === "dEcran1") {
    const deuxieme = ex.avecRemise ? "la boule a été remise : l'urne est la même qu'au départ." : "il reste une boule de moins dans l'urne, et une boule de moins de la couleur déjà tirée.";
    return { texte: `Au premier tirage, divise le nombre de boules de chaque couleur par le nombre total de boules. Au deuxième tirage, ${deuxieme} Les branches issues d'un même point ont une somme égale à 1.`, latex: null };
  }
  if (phase === "dEcran2") return { texte: "Suis ce chemin sur l'arbre et multiplie les probabilités de ses deux branches (règle du produit).", latex: null };
  if (phase === "dEcran3") return { texte: `${guillemets(`Exactement une boule ${c}`)} correspond à deux chemins : ${c} puis ${autre}, ou ${autre} puis ${c}. Calcule la probabilité de chacun, puis additionne.`, latex: null };
  return { texte: `Le contraire de ${guillemets(`au moins une boule ${c}`)} est ${guillemets(`aucune boule ${c}`)} : un seul chemin, ${autre} puis ${autre}.`, latex: "P(\\overline{E})=1-P(E)" };
}

function aideNiveau2D(ex: ExerciceFamilleD, phase: PhaseTiragesArbres): AideAvecLatex {
  if (phase === "dEcran1") {
    const n = ex.n1 + ex.n2;
    if (ex.avecRemise) return { texte: "Composition de l'urne au premier tirage, et encore au deuxième :", latex: `\\text{${ex.n1} ${ex.initiale1}, ${ex.n2} ${ex.initiale2} (${n} boules)}` };
    return {
      texte: "Composition de l'urne au deuxième tirage, selon la première boule tirée :",
      latex: `\\text{après ${ex.initiale1} : ${ex.n1 - 1} ${ex.initiale1}, ${ex.n2} ${ex.initiale2}}\\qquad \\text{après ${ex.initiale2} : ${ex.n1} ${ex.initiale1}, ${ex.n2 - 1} ${ex.initiale2}}`,
    };
  }
  const p = (chemin: number[]) => produitLatex(ex.n1, ex.n2, ex.avecRemise, chemin);
  if (phase === "dEcran2") return { texte: "Produit le long du chemin (non effectué) :", latex: p(ex.chemin) };
  if (phase === "dEcran3") return { texte: "Somme des deux chemins (non effectuée) :", latex: `${p([0, 1])}+${p([1, 0])}` };
  const autre = ex.couleurCible === 0 ? 1 : 0;
  return { texte: "Avec l'événement contraire (calcul non effectué) :", latex: `1-${p([autre, autre])}` };
}

function reponseD(ex: ExerciceFamilleD, phase: PhaseTiragesArbres): string[] {
  const i = (c: number) => initialeD(ex, c);
  if (phase === "dEcran1") {
    const b = branchesArbreD(ex);
    return [
      `P(${i(0)}_1)=${fx(b[0])}`,
      `P(${i(1)}_1)=${fx(b[1])}`,
      `P(${i(0)}_2\\mid ${i(0)}_1)=${fx(b[2])}`,
      `P(${i(1)}_2\\mid ${i(0)}_1)=${fx(b[3])}`,
      `P(${i(0)}_2\\mid ${i(1)}_1)=${fx(b[4])}`,
      `P(${i(1)}_2\\mid ${i(1)}_1)=${fx(b[5])}`,
    ];
  }
  const f = (chemin: number[]) => probCheminFraction(ex.n1, ex.n2, ex.avecRemise, chemin);
  const c = singulier(couleurD(ex, ex.couleurCible));
  if (phase === "dEcran2") return [`P(\\text{${libelleCheminD(ex)}})=${fx(f(ex.chemin))}`];
  if (phase === "dEcran3") return [`P(\\text{exactement une ${c}})=${fx(somme(f([0, 1]), f([1, 0])))}`];
  const autre = ex.couleurCible === 0 ? 1 : 0;
  return [`P(\\text{au moins une ${c}})=${fx(complement(f([autre, autre])))}`];
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceTiragesArbres): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC(exercice);
    case "D":
      return consigneGeneraleD(exercice);
  }
}

export function blocDonnees(exercice: ExerciceTiragesArbres): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(exercice, phase);
    case "D":
      return consigneEcranD(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(exercice, phase);
    case "D":
      return champsD(exercice, phase);
  }
}

export function aideNiveau1(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(exercice, phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(exercice, phase);
    case "D":
      return aideNiveau1D(exercice, phase);
  }
}

export function aideNiveau2(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseTiragesArbres, string> = {
  aEcran1: "Étape 1 (une seule couleur)",
  aEcran2: "Étape 2 (même couleur)",
  aEcran3: "Étape 3 (plusieurs chemins)",
  bEcran1: "Étape 1 (positions données)",
  bEcran2: "Étape 2 (toutes bien placées)",
  bEcran3: "Étape 3 (nombre exact de bien placées)",
  bEcran4: "Étape 4 (somme de cas)",
  cEcran1: "Étape 1 (équations)",
  cEcran2: "Étape 2 (résolution)",
  cEcran3: "Étape 3 (probabilité d'un événement)",
  dEcran1: "Étape 1 (branches de l'arbre)",
  dEcran2: "Étape 2 (un chemin)",
  dEcran3: "Étape 3 (exactement une)",
  dEcran4: "Étape 4 (au moins une)",
};

export const LIBELLE_FAMILLE: Record<ExerciceTiragesArbres["famille"], string> = {
  A: "A — Tirages avec ou sans remise",
  B: "B — Arrangements au hasard",
  C: "C — Dé truqué",
  D: "D — Arbre pondéré",
};

/** Réponse CORRECTE de chaque écran (récapitulatif, validation, corrigé des feuilles), en fractions
 * exactes — jamais recalculée depuis la saisie de l'élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): string[] {
  switch (exercice.famille) {
    case "A":
      return reponseA(exercice, phase);
    case "B":
      return reponseB(exercice, phase);
    case "C":
      return reponseC(exercice, phase);
    case "D":
      return reponseD(exercice, phase);
  }
}

