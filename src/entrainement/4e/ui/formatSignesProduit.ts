import type { Enonce } from "../core/generateur.types";
import type { ExerciceSignesProduit, FacteurSignesProduit } from "../core/signesProduit.types";
import type { LigneRef } from "../generateurs/signesProduit/grille";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./formatEquation";
import { SYMBOLE_LATEX } from "./formatInequation";

/**
 * kx - kp, développé — jamais "k(x-p)" (règle générale du projet : l'énoncé n'affiche jamais un
 * facteur pré-factorisé, voir CLAUDE.md). Exportée : réutilisée telle quelle par l'exercice
 * "inéquations rationnelles" (formatInequationRationnelle.ts) pour ses deux polynômes linéaires.
 */
export function formatLineaireDeveloppe(k: number, p: number): string {
  const kx = k === 1 ? "x" : k === -1 ? "-x" : `${k}x`;
  const constante = -k * p;
  if (constante === 0) return kx;
  return `${kx} ${constante > 0 ? "+" : "-"} ${Math.abs(constante)}`;
}

/** Un facteur tel qu'affiché dans l'énoncé (toujours développé, jamais pré-factorisé). */
export function formatFacteurLatex(facteur: FacteurSignesProduit): string {
  if (facteur.type === "lineaire") return formatLineaireDeveloppe(facteur.polynome.k, facteur.polynome.p);
  return formatMembreGauche(facteur.type === "quadratique_factorisable" ? facteur.exercice.enonce : facteur.enonce);
}

/** (F1)(F2)(F3) ◇ 0 — produit de facteurs parenthésés, jamais développé en un seul grand polynôme. */
export function formatEnonceSignesProduitLatex(exercice: ExerciceSignesProduit): string {
  const facteurs = exercice.facteurs.map((f) => `(${formatFacteurLatex(f)})`).join("");
  return `${facteurs} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Version "bloc fitter" de `formatEnonceSignesProduitLatex` (`promptblocfittertousgenerateurs.md`)
 * — un fragment KaTeX par facteur parenthésé (chacun déjà self-balancé : `(...)`) plutôt qu'une
 * seule chaîne concaténée, pour un retour à la ligne propre ENTRE facteurs sur mobile étroit —
 * jusqu'à 3 facteurs, dont un facteur factorisable peut porter un coefficient dominant explicite
 * (`a(x-r1)(x-r2)`), rendant la concaténation directe potentiellement large. Le symbole/`0` final
 * reste attaché au dernier facteur (même principe que `formatTermesApercuSolutionProduit`).
 */
export function formatTermesEnonceSignesProduitLatex(exercice: ExerciceSignesProduit): string[] {
  const facteurs = exercice.facteurs.map((f) => `(${formatFacteurLatex(f)})`);
  const dernier = facteurs.length - 1;
  return facteurs.map((f, i) => (i === dernier ? `${f} ${SYMBOLE_LATEX[exercice.symbole]} 0` : f));
}

/**
 * Un facteur sous sa forme FACTORISÉE finale (une fois la reconnaissance/factorisation de ce
 * facteur confirmée, ou immédiatement pour un facteur qui n'a jamais besoin d'être factorisé) —
 * jamais développé pour un facteur factorisable, contrairement à `formatFacteurLatex` (utilisé
 * pour l'énoncé de départ, toujours développé). Un facteur linéaire ou irréductible reste
 * identique aux deux fonctions (rien à factoriser). Le coefficient dominant `a` d'un facteur
 * factorisable est toujours réinjecté explicitement (jamais implicite), y compris négatif —
 * `formatFormeFactoriseeDepuisRacines` (ui/formatEquation.ts) le dérive directement de `enonce.a`
 * et des racines confirmées, jamais de `solution.formeFactorisee` (absent pour cas_general).
 */
function formatFacteurFactoriseLatex(facteur: FacteurSignesProduit): string {
  if (facteur.type !== "quadratique_factorisable") return formatFacteurLatex(facteur);
  return formatFormeFactoriseeSignesProduit(facteur.exercice.enonce, facteur.exercice.solution.racines);
}

/**
 * Forme factorisée d'un facteur factorisable, telle qu'affichée par ce générateur — identique à
 * `formatFormeFactoriseeDepuisRacines` (ui/formatEquation.ts), sauf pour une mise en évidence à
 * `a = -1` : `-x(x + 5)` plutôt que `x(-x - 5)` (audit gen5). Ce contournement partagé n'existait
 * que parce que la vérification refusait un x précédé d'une négation, ce qu'elle accepte désormais
 * (`estUnProduitAvecXExplicite`, moteur/expressionAlgebrique.ts) — gardé local à ce générateur pour
 * ne changer l'affichage d'aucun autre.
 */
export function formatFormeFactoriseeSignesProduit(enonce: Enonce, racines: [number, number]): string {
  const [r1, r2] = racines;
  if (enonce.a === -1 && r1 !== r2 && (r1 === 0 || r2 === 0)) {
    const r = r1 === 0 ? r2 : r1;
    return `-x(${r > 0 ? `x - ${r}` : `x + ${-r}`})`;
  }
  return formatFormeFactoriseeDepuisRacines(enonce, racines);
}

/**
 * Facteurs d'un produit déjà décomposé, chacun prêt à être juxtaposé au précédent — jamais de
 * parenthèses autour d'un facteur qui est lui-même déjà un produit (`(x(x + 5))`, audit gen5) :
 * - facteur linéaire/irréductible : `(…)`, comme dans l'énoncé ;
 * - facteur factorisé commençant par x ou `(` : tel quel (`(x + 2)x(x + 5)`) ;
 * - commençant par un coefficient : tel quel en tête, précédé de `\cdot` ailleurs (jamais
 *   `(x + 2)2(x - 1)…`) ;
 * - commençant par un signe − : tel quel en tête, entre grandes parenthèses ailleurs (jamais
 *   `(x + 2)-x(x + 5)`, qui se lirait comme une soustraction).
 */
function facteursFactorisesJuxtaposables(exercice: ExerciceSignesProduit): string[] {
  return exercice.facteurs.map((f, i) => {
    if (f.type !== "quadratique_factorisable") return `(${formatFacteurLatex(f)})`;
    const forme = formatFacteurFactoriseLatex(f);
    if (i === 0) return forme;
    if (forme.startsWith("-")) return `\\bigl(${forme}\\bigr)`;
    if (/^\d/.test(forme)) return `\\cdot ${forme}`;
    return forme;
  });
}

/**
 * Décomposition COMPLÈTE en facteurs (promptgenerateur5signesProduit.md, point 8) : utilisée à
 * partir de l'étape "tableau de signes" (tous les facteurs factorisables de l'exercice ont déjà
 * été confirmés à ce stade, par construction de la séquence — voir sessionSignesProduit.ts) —
 * chaque facteur factorisable apparaît sous sa forme `a(x-r1)(x-r2)` (coefficient dominant
 * toujours explicite, y compris négatif), les facteurs linéaires/irréductibles restent identiques
 * à l'énoncé de départ. Jamais utilisée avant que la factorisation ait eu lieu (les écrans
 * méthode/racines affichent l'état actuel du SEUL facteur en cours, voir
 * ui/etatActuelSignesProduit.ts).
 */
export function formatEnonceSignesProduitFactoriseLatex(exercice: ExerciceSignesProduit): string {
  const facteurs = facteursFactorisesJuxtaposables(exercice).join("");
  return `${facteurs} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** Version "bloc fitter" de `formatEnonceSignesProduitFactoriseLatex` — même principe que
 * `formatTermesEnonceSignesProduitLatex` ci-dessus, appliqué à la décomposition déjà factorisée. */
export function formatTermesEnonceSignesProduitFactoriseLatex(exercice: ExerciceSignesProduit): string[] {
  const facteurs = facteursFactorisesJuxtaposables(exercice);
  const dernier = facteurs.length - 1;
  return facteurs.map((f, i) => (i === dernier ? `${f} ${SYMBOLE_LATEX[exercice.symbole]} 0` : f));
}

/** x - r ou x + |r|, jamais "(x - 0)" — libellé monique d'une ligne P1 (le coefficient dominant, toujours positif dans le tableau — voir grille.ts, n'a jamais de ligne propre). */
function formatFacteurRacineMonique(r: number): string {
  return r === 0 ? "x" : r > 0 ? `x - ${r}` : `x + ${Math.abs(r)}`;
}

/** La racine portée par une ligne "p1" — même logique que racineDeLigne (grille.ts), dupliquée ici car non exportée (calcul trivial, pas de couplage supplémentaire souhaité). */
function racineDeLigneP1(facteurs: FacteurSignesProduit[], ref: Extract<LigneRef, { kind: "p1" }>): number {
  const facteur = facteurs[ref.facteurIndex];
  if (facteur.type === "lineaire") return facteur.polynome.p;
  const [r1, r2] = [...(facteur as Extract<FacteurSignesProduit, { type: "quadratique_factorisable" }>).exercice.solution.racines].sort(
    (a, b) => a - b,
  );
  return ref.racineIndex === 0 ? r1 : r2;
}

/**
 * Libellé d'une ligne du tableau, dans le même ordre canonique que la grille elle-même
 * (ordreLignesGrille, réutilisée telle quelle — jamais recalculée différemment) :
 * - "p0" : le coefficient dominant négatif brut (ex: "-2"), jamais sa magnitude seule — celui d'un
 *   facteur linéaire ou celui d'un facteur factorisable (promptgenerateur5signesProduit.md, point 8).
 * - "p1" : forme monique x-r pour une racine d'un facteur factorisable, ou pour un facteur linéaire
 *   dont le coefficient vaut 1 ou est négatif (dans ce dernier cas déjà divulgué par sa propre
 *   ligne "p0" juste au-dessus) — mais le facteur complet kx-kp, développé, quand son coefficient
 *   est positif et différent de 1 : ce facteur n'a alors JAMAIS de ligne "p0" séparée (un
 *   coefficient positif reste invisible au signe), donc le montrer sous forme monique reviendrait à
 *   le simplifier silencieusement sans jamais l'expliquer à l'élève
 *   (promptgenerateur5signesProduit.md, point 3) — cohérence stricte avec l'énoncé/état actuel.
 * - "p2" : expression complète du facteur irréductible (même rendu que dans l'énoncé).
 * - "carre" : « (x − r)² » (forme monique, le coefficient dominant négatif ayant sa ligne "p0").
 */
export function formatLigneLabel(facteurs: FacteurSignesProduit[], ref: LigneRef): string {
  if (ref.kind === "p0") {
    const facteur = facteurs[ref.facteurIndex];
    return String(facteur.type === "lineaire" ? facteur.polynome.k : (facteur as Extract<FacteurSignesProduit, { type: "quadratique_factorisable" }>).exercice.enonce.a);
  }
  if (ref.kind === "p2") {
    return formatFacteurLatex(facteurs[ref.facteurIndex]);
  }
  if (ref.kind === "carre") {
    const facteurCarre = facteurs[ref.facteurIndex] as Extract<FacteurSignesProduit, { type: "quadratique_factorisable" }>;
    const r = facteurCarre.exercice.solution.racines[0];
    return r === 0 ? "x^2" : `(${formatFacteurRacineMonique(r)})^2`;
  }
  const facteur = facteurs[ref.facteurIndex];
  if (facteur.type === "lineaire" && facteur.polynome.k > 0 && facteur.polynome.k !== 1) {
    return formatLineaireDeveloppe(facteur.polynome.k, facteur.polynome.p);
  }
  return formatFacteurRacineMonique(racineDeLigneP1(facteurs, ref));
}

/**
 * Ligne d'en-tête "x" pour les colonnes REMPLISSABLES du tableau (mêmes 2n+1 colonnes que le
 * corps, alternance zone/point) — ne contient jamais -∞/+∞ (prompt-corrections-tableau-
 * signes-3points.md, point 1 : "-∞ et +∞ sont des étiquettes de bornes, pas des colonnes à
 * remplir"). Chaque racine (croissant) occupe sa colonne point ; toutes les colonnes zone
 * (y compris la première et la dernière) sont vides dans cet en-tête — les étiquettes -∞/+∞ sont
 * rendues à part, dans des colonnes de bordure dédiées, sans cellule de signe en dessous (voir
 * EtapeGrilleSignes.tsx / TableauSignesRecap.tsx).
 */
export function formatEnTeteInterieur(racines: number[]): string[] {
  const n = racines.length;
  const entete: string[] = Array.from({ length: 2 * n + 1 }, () => "");
  racines.forEach((racine, j) => {
    entete[2 * j + 1] = String(racine);
  });
  return entete;
}
