import type { Exercice } from "../../core/generateur.types";
import type { ExerciceSignesProduit, FacteurSignesProduit, ValeurCellule } from "../../core/signesProduit.types";
import type { PhaseSignesProduit } from "../../moteur/typesSignesProduit";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { exerciceSimplifie, necessiteSimplification } from "../../moteur/simplificationEquation";
import { bonneReponseMethode } from "../../moteur/verificationSignesProduit";
import { formatFacteurLatex, formatFormeFactoriseeSignesProduit } from "../../ui/formatSignesProduit";
import { formatSolutionEnsembleProduitLatex } from "../../ui/formatSolutionEnsembleProduit";
import { formatPolynome } from "../../ui/formatSimplification";
import { nombreTexte, q, qp } from "../../ui/corrigeChapitre3";
import {
  COURS_PRODUIT,
  COURS_SIGNE_TRINOME,
  etapeChamp1,
  etapeFactorisationCasGeneral,
  etapeRacines,
  etapeReconnaissance,
  etapeReductionDivision,
  lignesRacineLineaire,
  lignesLectureSolution,
  ligneSigneIrreductible,
  ligneSigneLineaire,
  ligneSigneTrinome,
  racinesDistinctes,
  valeurTest,
} from "../../ui/corrigeSecondDegre2";
import { ordreLignesGrille } from "./grille";
import { tableauSignesLatex } from "./tableauSignesLatex";

/**
 * Corrigé détaillé « comme au tableau » de gen5 (signe d'un produit de plusieurs facteurs) — règle
 * `.claude/rules/feuilles-evaluations.md`. UNE étape par ÉCRAN du générateur, dans l'ordre de la
 * session (`ecransSignesProduit`, même séquence que `phasePourFacteur` / `soumettreReponse…` de
 * `moteur/sessionSignesProduit.ts`) : par facteur (racine d'un facteur du premier degré ; réduction,
 * méthode, forme factorisée ou Δ, racines, factorisation après Δ d'un facteur factorisable ;
 * méthode puis signe d'un facteur irréductible), puis le tableau de signes et l'ensemble-solution.
 * Un facteur réduit à l'écran (« réduction ») est traité réduit aux écrans suivants, comme la session.
 * Partagé par l'adaptateur papier et l'appli (`AppSignesProduit.tsx`, étape ratée).
 */

type E = ExerciceSignesProduit;

export interface EcranSignesProduit {
  phase: PhaseSignesProduit;
  /** Position (0-based) du facteur dans l'énoncé ; −1 pour le tableau et l'ensemble-solution. */
  position: number;
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Écrans de l'exercice, dans l'ordre de la session. */
export function ecransSignesProduit(e: E): EcranSignesProduit[] {
  const ecrans: EcranSignesProduit[] = [];
  e.facteurs.forEach((f, position) => {
    if (f.type === "lineaire") ecrans.push({ phase: "racineLineaire", position });
    else if (f.type === "quadratique_irreductible") ecrans.push({ phase: "methodeFacteur", position }, { phase: "signeIrreductible", position });
    else {
      if (necessiteSimplification(f.exercice)) ecrans.push({ phase: "reductionFacteur", position });
      ecrans.push({ phase: "methodeFacteur", position }, { phase: "factorisationChamp1", position }, { phase: "factorisationChamp2", position });
      if (f.exercice.categorie === "cas_general") ecrans.push({ phase: "factorisationFactorisation", position });
    }
  });
  ecrans.push({ phase: "grille", position: -1 }, { phase: "intervalle", position: -1 });
  return ecrans;
}

/** Lettre de l'écran (phase + facteur courant de la session) — `exercice` = l'instance INITIALE. */
export function lettreEcranSignesProduit(e: E, phase: PhaseSignesProduit, positionFacteur: number): string {
  const i = ecransSignesProduit(e).findIndex((x) => x.phase === phase && (x.position === -1 || x.position === positionFacteur));
  return LETTRES[i] ?? "";
}

/** Le facteur factorisable tel que la session le traite (réduit si l'écran « réduction » a eu lieu). */
function factorisableTraite(ex: Exercice): Exercice {
  return necessiteSimplification(ex) ? exerciceSimplifie(ex) : ex;
}

function nomFacteur(position: number): string {
  return `le facteur ${position + 1}`;
}

/** Consigne d'un écran (titre « Étape n — … » du corrigé, et question de `construireEnonce`). */
export function consigneEcranSignesProduit(e: E, ecran: EcranSignesProduit): FragmentConsigne[] {
  if (ecran.phase === "grille") return [texte("Dresse le tableau de signes du produit.")];
  if (ecran.phase === "intervalle") return [texte("Donne l'ensemble des solutions de l'inéquation.")];
  const f = e.facteurs[ecran.position];
  const brut = formatFacteurLatex(f);
  const traite = f.type === "quadratique_factorisable" ? formatPolynome(factorisableTraite(f.exercice)) : brut;
  switch (ecran.phase) {
    case "racineLineaire":
      return [texte("Détermine la racine du facteur "), latex(brut), texte(".")];
    case "reductionFacteur":
      return [texte("Réduis le facteur "), latex(brut), texte(" : divise-le par le plus grand diviseur commun positif de ses coefficients.")];
    case "methodeFacteur":
      return [texte("Choisis la méthode la plus rapide pour factoriser le facteur "), latex(traite), texte(".")];
    case "factorisationChamp1":
      return f.type === "quadratique_factorisable" && f.exercice.categorie === "cas_general"
        ? [texte("Calcule le discriminant du facteur "), latex(traite), texte(".")]
        : [texte("Factorise le facteur "), latex(traite), texte(".")];
    case "factorisationChamp2":
      return [texte("Donne les racines du facteur "), latex(traite), texte(".")];
    case "factorisationFactorisation":
      return [texte("Écris la forme factorisée du facteur "), latex(traite), texte(".")];
    default:
      return [texte("Détermine le signe du facteur "), latex(brut), texte(".")];
  }
}

// ---------------------------------------------------------------------------------------------
// Tableau de signes (une ligne par facteur BRUT de l'énoncé — mêmes cellules que la grille)
// ---------------------------------------------------------------------------------------------

/** "+"×"+"="+" et "-"×"-"="+", "+"×"-"="-", tout "0" absorbe — même règle que la ligne produit de
 * `construireGrille` (grille.ts), appliquée aux seules lignes d'UN facteur brut. */
function combinerSignes(a: ValeurCellule, b: ValeurCellule): ValeurCellule {
  if (a === "0" || b === "0") return "0";
  return a === b ? "+" : "-";
}

function lignesParFacteurBrut(e: E): ValeurCellule[][] {
  const refs = ordreLignesGrille(e.facteurs);
  const groupes: ValeurCellule[][][] = e.facteurs.map(() => []);
  refs.forEach((ref, i) => groupes[ref.facteurIndex].push(e.grille.lignes[i]));
  const nbColonnes = e.grille.produit.length;
  return groupes.map((lignesDuFacteur) =>
    Array.from({ length: nbColonnes }, (_, colonne) => lignesDuFacteur.reduce<ValeurCellule>((acc, l) => combinerSignes(acc, l[colonne]), "+")),
  );
}

export function tableauSignesProduitLatex(e: E): string {
  const lignes = lignesParFacteurBrut(e).map((valeurs, i) => ({ libelle: formatFacteurLatex(e.facteurs[i]), valeurs }));
  return tableauSignesLatex(e.racines, lignes, { libelle: "\\text{produit}", valeurs: e.grille.produit });
}

/** Valeur d'un facteur (forme de l'énoncé) en un point. */
function valeurFacteur(f: FacteurSignesProduit, x: number): number {
  if (f.type === "lineaire") return f.polynome.k * (x - f.polynome.p);
  const { a, b, c } = f.type === "quadratique_factorisable" ? f.exercice.enonce : f.enonce;
  return a * x * x + b * x + c;
}

/** Signe de chaque facteur (règle du premier degré, signe du trinôme, Δ < 0). */
function ligneSigneFacteur(f: FacteurSignesProduit): LigneCalcul {
  if (f.type === "lineaire") return ligneSigneLineaire(f.polynome.k, -f.polynome.k * f.polynome.p, f.polynome.p);
  if (f.type === "quadratique_irreductible") return ligneSigneIrreductible(f.enonce);
  const [r1, r2] = [...f.exercice.solution.racines].sort((u, v) => u - v);
  return ligneSigneTrinome(formatFacteurLatex(f), f.exercice.enonce.a, r1, r2);
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

const RETENIR: Record<E["symbole"], string> = {
  "<": "on garde les zones où le produit est strictement négatif (racines exclues)",
  ">": "on garde les zones où le produit est strictement positif (racines exclues)",
  "≤": "on garde les zones où le produit est négatif, et les racines où il s'annule",
  "≥": "on garde les zones où le produit est positif, et les racines où il s'annule",
};

function etapeRacineLineaire(sq: string, k: number, p: number, nom: string): EtapeCorrection[] {
  const lignes = lignesRacineLineaire(k, -k * p);
  return [
    utilise(sq, [texte(`Racine d'un facteur du premier degré : la valeur de x qui l'annule ${COURS_PRODUIT}.`)]),
    calcul(sq, lignes),
    resultat(sq, [texte(`Racine du ${nom.replace(/^le /, "")} : `), latex(`x = ${q(p)}`)]),
  ];
}

function etapeSigneIrreductible(sq: string, f: Extract<FacteurSignesProduit, { type: "quadratique_irreductible" }>, nom: string): EtapeCorrection[] {
  const { a } = f.enonce;
  return [
    utilise(sq, [texte(`Signe d'un trinôme sans racine (Δ < 0) : il a partout le signe de a ${COURS_SIGNE_TRINOME}.`)]),
    calcul(sq, [ligneSigneIrreductible(f.enonce), ligne(`a=${q(a)}${a > 0 ? ">" : "<"}0`, "coefficient de x²")]),
    resultat(sq, [texte(`${nom[0].toUpperCase()}${nom.slice(1)} est toujours ${f.signe === "+" ? "positif" : "négatif"}.`)]),
  ];
}

function etapeGrille(sq: string, e: E): EtapeCorrection[] {
  const t = valeurTest(e.racines);
  const valeurs = e.facteurs.map((f) => valeurFacteur(f, t));
  const produit = valeurs.reduce((u, v) => u * v, 1);
  return [
    utilise(sq, [texte(`Tableau de signes : une ligne par facteur, avec son signe ; dans chaque colonne, le signe du produit est le produit des signes (règle des signes) ${COURS_PRODUIT}.`)]),
    calcul(sq, [ligne(`x\\in\\{${racinesDistinctes(e.racines).map(q).join("\\,;\\,")}\\}`, "racines de tous les facteurs, rangées : les colonnes du tableau"), ...e.facteurs.map(ligneSigneFacteur)], [], "Signe de chaque facteur"),
    resultat(sq, [latex(tableauSignesProduitLatex(e))]),
    verification(sq, [texte(`Valeur test dans la dernière zone, en x = ${nombreTexte(t)} : `), latex(`${valeurs.map((v) => qp(v)).join("\\cdot ")}=${q(produit)}${produit > 0 ? ">" : "<"}0`), texte(`, d'où le signe ${produit > 0 ? "+" : "−"} de la dernière colonne.`)]),
    lignePiege(sq, piegeSignesProduit(e)),
  ];
}

function etapeIntervalle(sq: string, e: E): EtapeCorrection[] {
  return [
    utilise(sq, [texte(`Lecture du tableau, ligne du produit : ${RETENIR[e.symbole]} ${COURS_PRODUIT}.`)]),
    calcul(sq, lignesLectureSolution(e.racines, e.grille.produit, e.symbole, "produit")),
    resultat(sq, [latex(`S = ${formatSolutionEnsembleProduitLatex(e.solution)}`)]),
  ];
}

/** Piège unique, le plus pertinent pour l'instance (dans l'étape du tableau). */
export function piegeSignesProduit(e: E): FragmentConsigne[] {
  const carre = e.facteurs.find((f) => f.type === "quadratique_factorisable" && f.exercice.solution.racines[0] === f.exercice.solution.racines[1]);
  if (carre) return [texte("En une racine double, le produit s'annule mais ne change pas de signe : ne pas alterner les signes de part et d'autre.")];
  if (e.facteurs.some((f) => f.type === "lineaire" && f.polynome.k < 0)) return [texte("Un facteur du premier degré à coefficient de x négatif est positif avant sa racine : ne pas recopier « − puis + » par réflexe.")];
  if (e.facteurs.some((f) => f.type === "quadratique_irreductible")) return [texte("Un facteur sans racine (Δ < 0) a une ligne entière du même signe, sans 0 : il ne crée aucune colonne.")];
  return [texte(e.symbole === "<" || e.symbole === ">" ? "Inégalité stricte : les racines (produit nul) sont exclues, crochets ouverts." : "Inégalité large : les racines (produit nul) font partie des solutions, crochets fermés.")];
}

function etapesEcran(e: E, ecran: EcranSignesProduit, sq: string): EtapeCorrection[] {
  if (ecran.phase === "grille") return etapeGrille(sq, e);
  if (ecran.phase === "intervalle") return etapeIntervalle(sq, e);
  const f = e.facteurs[ecran.position];
  const nom = nomFacteur(ecran.position);
  if (f.type === "lineaire") return etapeRacineLineaire(sq, f.polynome.k, f.polynome.p, nom);
  if (f.type === "quadratique_irreductible") {
    return ecran.phase === "methodeFacteur" ? etapeReconnaissance(sq, f.enonce, "irreductible", nom) : etapeSigneIrreductible(sq, f, nom);
  }
  const traite = factorisableTraite(f.exercice);
  const forme = formatFormeFactoriseeSignesProduit(traite.enonce, traite.solution.racines);
  switch (ecran.phase) {
    case "reductionFacteur":
      return etapeReductionDivision(sq, f.exercice.enonce, nom, formatPolynome(traite), "les racines et le signe du facteur, donc du produit, ne changent pas");
    case "methodeFacteur":
      return etapeReconnaissance(sq, traite.enonce, bonneReponseMethode(f), nom);
    case "factorisationChamp1":
      return etapeChamp1(sq, traite, nom, forme);
    case "factorisationChamp2":
      return etapeRacines(sq, traite, nom);
    default:
      return etapeFactorisationCasGeneral(sq, traite, nom, forme);
  }
}

export function correctionDetailleeSignesProduit(e: E): EtapeCorrection[] {
  return ecransSignesProduit(e).flatMap((ecran, i) => etapesEcran(e, ecran, LETTRES[i]));
}

/**
 * Lettres des écrans comptés comme LECTURES pour le niveau et la durée (1 min, sans niveau) :
 * identification (méthode, signe d'un facteur sans racine) ou recopie immédiate (réduction par un
 * diviseur commun, racines lues sur la forme factorisée, forme factorisée réécrite avec les racines
 * trouvées). Restent des étapes : racine d'un facteur du premier degré, forme factorisée / Δ,
 * racines par la formule, tableau, ensemble-solution.
 */
export function lettresLectureSignesProduit(e: E): string[] {
  return ecransSignesProduit(e)
    .map((ecran, i) => {
      const f = ecran.position >= 0 ? e.facteurs[ecran.position] : null;
      const casGeneral = f?.type === "quadratique_factorisable" && f.exercice.categorie === "cas_general";
      // Lot E (audit 4e ch. 2) : le choix de la méthode (décision) et la factorisation après Δ
      // (calcul) comptent comme des étapes ; restent des lectures le signe d'un facteur sans racine
      // (signe de a), la réduction et les racines lues sur une forme factorisée.
      const lecture = ecran.phase === "signeIrreductible" || ecran.phase === "reductionFacteur" || (ecran.phase === "factorisationChamp2" && !casGeneral);
      return lecture ? LETTRES[i] : "";
    })
    .filter(Boolean);
}
