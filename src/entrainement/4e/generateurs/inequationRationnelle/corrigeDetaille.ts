import type { Enonce, Exercice } from "../../core/generateur.types";
import type { ExerciceInequationRationnelle, ValeurCelluleQuotient } from "../../core/inequationRationnelle.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { PhaseInequationRationnelle } from "../../moteur/sessionInequationRationnelle";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { exerciceSimplifie, facteurCommun, necessiteSimplification } from "../../moteur/simplificationEquation";
import { formatFacteurRacine, formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../../ui/formatEquation";
import { SYMBOLE_LATEX } from "../../ui/formatInequation";
import {
  formatEnonceCombineDenominateurCarreLatex,
  formatEnonceCombineNiveau3Latex,
  formatEnonceCombineNiveau4Latex,
  formatEnonceCombineSansFacteurCommunLatex,
  formatEnonceInequationRationnelleLatex,
  formatEnonceOriginalComplet,
  formatExpressionIsoleeDenominateurCarreLatex,
  formatExpressionIsoleeLatex,
  formatExpressionIsoleeNiveau3Latex,
  formatExpressionIsoleeNiveau4Latex,
  formatExpressionIsoleeSansFacteurCommunLatex,
  formatLineaireDeveloppeExact,
  formatMembreGaucheCubique,
} from "../../ui/formatInequationRationnelle";
import { formatFractionSimplifiee, formatPolynome } from "../../ui/formatSimplification";
import { formatSolutionEnsembleProduitLatex } from "../../ui/formatSolutionEnsembleProduit";
import { nombreTexte, polynome, q } from "../../ui/corrigeChapitre3";
import {
  COURS_DENOMINATEUR,
  COURS_RATIONNELLE,
  COURS_SIMPLIFIER,
  etapeChamp1,
  etapeFactorisationCasGeneral,
  etapeRacines,
  etapeReconnaissance,
  etapeReductionDivision,
  etapeReductionMiseEnEvidence,
  formeMonique,
  lignesDiscriminant,
  lignesFormuleRacine,
  lignesLectureSolution,
  lignesProduitNul,
  lignesRacineLineaire,
  ligneConstante,
  ligneSigneLineaire,
  racinesDistinctes,
  valeurTest,
} from "../../ui/corrigeSecondDegre2";
import { libelleCategorie } from "../../ui/categorieLabels";
import { tableauSignesLatex, type CelluleSigne } from "../signesProduit/tableauSignesLatex";

/**
 * Corrigé détaillé « comme au tableau » de gen6 (inéquations rationnelles) — règle
 * `.claude/rules/feuilles-evaluations.md`. UNE étape par ÉCRAN, dans l'ordre réel de la session
 * (`ecransInequationRationnelle`, même séquence que `ordrePhases` d'`AppInequationRationnelle.tsx` et
 * les `phase:` de `moteur/sessionInequationRationnelle.ts`) : isoler, combiner, CE, racine du
 * numérateur, mécanisme « méthode la plus rapide » sur le dénominateur / le numérateur / la fraction à
 * simplifier, tableau de signes, ensemble-solution. Un polynôme réduit à l'écran « réduction » est
 * traité réduit aux écrans suivants, comme la session (`exerciceSimplifie`). Partagé par l'adaptateur
 * papier et l'appli (qui passe l'instance INITIALE, avant toute réduction).
 */

type E = ExerciceInequationRationnelle;
type Phase = PhaseInequationRationnelle;

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function estP1(p: Exercice | PolynomeLineaire): p is PolynomeLineaire {
  return "k" in p;
}

function p2(p: Exercice | PolynomeLineaire): Exercice {
  if (estP1(p)) throw new Error("corrigeDetaille (gen6) : polynôme du second degré attendu");
  return p;
}

/** Le polynôme tel que la session le traite après l'écran « réduction » (s'il a lieu). */
function traite(ex: Exercice): Exercice {
  return necessiteSimplification(ex) ? exerciceSimplifie(ex) : ex;
}

function sequenceP2(ex: Exercice): Phase[] {
  return [...(necessiteSimplification(ex) ? (["reduction"] as Phase[]) : []), "reconnaissance", "champ1", "champ2", ...(ex.categorie === "cas_general" ? (["factorisation"] as Phase[]) : [])];
}

/** Écrans de l'exercice, dans l'ordre de la session (instance INITIALE). */
export function ecransInequationRationnelle(e: E): Phase[] {
  switch (e.niveau) {
    case "niveau1":
      return ["ce", "racineNumerateur", "grille", "intervalle"];
    case "niveau2":
      return ["isoler", "combiner", "ce", "racineNumerateur", "grille", "intervalle"];
    case "cubique":
      return ["ce", "miseEnEvidence", ...sequenceP2(e.numerateur), "grille", "intervalle"];
    case "facteurCommun": {
      const D = p2(e.fraction.denominateur);
      const N = p2(e.fraction.numerateur);
      return [
        "ce",
        ...(necessiteSimplification(D) ? (["simplifierDenomReduction"] as Phase[]) : []),
        "simplifierDenomReconnaissance",
        "simplifierDenomChamp1",
        "simplifierDenomChamp2",
        ...(D.categorie === "cas_general" ? (["simplifierDenomFactorisation"] as Phase[]) : []),
        ...(necessiteSimplification(N) ? (["simplifierNumReduction"] as Phase[]) : []),
        "simplifierNumReconnaissance",
        "simplifierNumChamp1",
        "simplifierNumChamp2",
        ...(N.categorie === "cas_general" ? (["simplifierNumFactorisation"] as Phase[]) : []),
        "simplifierFraction",
        "grille",
        "intervalle",
      ];
    }
    case "sansFacteurCommun":
      return [
        "isoler",
        "combiner",
        ...(necessiteSimplification(e.denominateur) ? (["denomReduction"] as Phase[]) : []),
        "denomReconnaissance",
        "denomChamp1",
        ...(e.denominateur.categorie === "cas_general" ? (["denomFactorisation"] as Phase[]) : []),
        "ce",
        ...sequenceP2(e.numerateur),
        "grille",
        "intervalle",
      ];
    default:
      return ["isoler", "combiner", "ce", ...sequenceP2(e.numerateur), "grille", "intervalle"];
  }
}

/** Lettre de l'écran `phase` (chaque phase apparaît au plus une fois par exercice). */
export function lettrePhaseInequationRationnelle(e: E, phase: Phase): string {
  return LETTRES[ecransInequationRationnelle(e).indexOf(phase)] ?? "";
}

// ---------------------------------------------------------------------------------------------
// Polynômes (coefficients décroissants)
// ---------------------------------------------------------------------------------------------

type Poly = number[];

function lin(p: PolynomeLineaire): Poly {
  return [p.k, -p.k * p.p];
}

function tri(e: Enonce): Poly {
  return [e.a, e.b, e.c];
}

function mul(u: Poly, v: Poly): Poly {
  const r = Array(u.length + v.length - 1).fill(0);
  u.forEach((a, i) => v.forEach((b, j) => (r[i + j] += a * b)));
  return r;
}

function fois(c: number, u: Poly): Poly {
  return u.map((a) => c * a);
}

function valeur(u: Poly, x: number): number {
  return u.reduce((acc, a) => acc * x + a, 0);
}

function polyLatex(u: Poly): string {
  return polynome(u);
}

/** `A` suivi de `B` dans une somme : « A-3x+2 » ou « A+3x-2 ». */
function suite(a: string, b: string): string {
  return b.startsWith("-") ? `${a}${b}` : `${a}+${b}`;
}

/** Facteur parenthésé sauf « x » seul. */
function par(s: string): string {
  return s === "x" ? "x" : `(${s})`;
}

function linTex(p: PolynomeLineaire): string {
  return formatLineaireDeveloppeExact(p.k, p.p);
}

// ---------------------------------------------------------------------------------------------
// Consignes (une par écran)
// ---------------------------------------------------------------------------------------------

function nomP2(e: E): string {
  return e.niveau === "cubique" ? "le facteur du second degré" : "le numérateur";
}

export function consigneEcranInequationRationnelle(e: E, phase: Phase): FragmentConsigne[] {
  const sym = SYMBOLE_LATEX[e.symbole];
  switch (phase) {
    case "isoler":
      return [texte("Ramène l'inéquation à la forme « … "), latex(`${sym} 0`), texte(" » (tout dans le membre de gauche).")];
    case "combiner":
      return [texte("Écris le membre de gauche en une seule fraction (même dénominateur).")];
    case "ce":
      return Array.isArray(e.ce) ? [texte("Détermine les conditions d'existence (CE).")] : [texte("Détermine la condition d'existence (CE).")];
    case "racineNumerateur":
      return [texte("Détermine la racine du numérateur.")];
    case "denomReduction":
      return [texte("Réduis le dénominateur (divise-le par le plus grand diviseur commun positif de ses coefficients).")];
    case "denomReconnaissance":
      return [texte("Choisis la méthode la plus rapide pour factoriser le dénominateur.")];
    case "denomChamp1":
      return e.niveau === "sansFacteurCommun" && e.denominateur.categorie === "cas_general" ? [texte("Calcule le discriminant du dénominateur.")] : [texte("Factorise le dénominateur.")];
    case "denomFactorisation":
      return [texte("Écris la forme factorisée du dénominateur.")];
    case "miseEnEvidence":
      return [texte("Mets "), latex("x"), texte(" en évidence dans le numérateur.")];
    case "reduction":
      return [texte(`Réduis ${nomP2(e)} (divise-le par le plus grand diviseur commun positif de ses coefficients).`)];
    case "reconnaissance":
      return [texte(`Choisis la méthode la plus rapide pour factoriser ${nomP2(e)}.`)];
    case "champ1": {
      const N = "numerateur" in e && !estP1(e.numerateur) ? e.numerateur : null;
      return N && N.categorie === "cas_general" ? [texte(`Calcule le discriminant ${nomP2(e) === "le numérateur" ? "du numérateur" : "du facteur du second degré"}.`)] : [texte(`Factorise ${nomP2(e)}.`)];
    }
    case "champ2":
      return [texte(`Donne les racines ${nomP2(e) === "le numérateur" ? "du numérateur" : "du facteur du second degré"}.`)];
    case "factorisation":
      return [texte(`Écris la forme factorisée ${nomP2(e) === "le numérateur" ? "du numérateur" : "du facteur du second degré"}.`)];
    case "simplifierDenomReduction":
      return [texte("Mets en évidence le facteur commun des coefficients du dénominateur.")];
    case "simplifierDenomReconnaissance":
      return [texte("Choisis la méthode la plus rapide pour factoriser le dénominateur.")];
    case "simplifierDenomChamp1":
      return e.niveau === "facteurCommun" && p2(e.fraction.denominateur).categorie === "cas_general" ? [texte("Calcule le discriminant du dénominateur.")] : [texte("Factorise le dénominateur.")];
    case "simplifierDenomChamp2":
      return [texte("Donne les racines du dénominateur.")];
    case "simplifierDenomFactorisation":
      return [texte("Écris la forme factorisée du dénominateur.")];
    case "simplifierNumReduction":
      return [texte("Mets en évidence le facteur commun des coefficients du numérateur.")];
    case "simplifierNumReconnaissance":
      return [texte("Choisis la méthode la plus rapide pour factoriser le numérateur.")];
    case "simplifierNumChamp1":
      return e.niveau === "facteurCommun" && p2(e.fraction.numerateur).categorie === "cas_general" ? [texte("Calcule le discriminant du numérateur.")] : [texte("Factorise le numérateur.")];
    case "simplifierNumChamp2":
      return [texte("Donne les racines du numérateur.")];
    case "simplifierNumFactorisation":
      return [texte("Écris la forme factorisée du numérateur.")];
    case "simplifierFraction":
      return [texte("Simplifie la fraction.")];
    case "grille":
      return [texte("Dresse le tableau de signes de la fraction.")];
    case "intervalle":
      return [texte("Donne l'ensemble des solutions de l'inéquation.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Isoler, combiner
// ---------------------------------------------------------------------------------------------

function isoleeLatex(e: E): string {
  switch (e.niveau) {
    case "niveau2":
      return formatExpressionIsoleeLatex(e);
    case "niveau3":
      return formatExpressionIsoleeNiveau3Latex(e);
    case "niveau4":
      return formatExpressionIsoleeNiveau4Latex(e);
    case "denominateurCarre":
      return formatExpressionIsoleeDenominateurCarreLatex(e);
    case "sansFacteurCommun":
      return formatExpressionIsoleeSansFacteurCommunLatex(e);
    default:
      return "";
  }
}

function combineeLatex(e: E): string {
  switch (e.niveau) {
    case "niveau2":
      return formatEnonceInequationRationnelleLatex(e);
    case "niveau3":
      return formatEnonceCombineNiveau3Latex(e);
    case "niveau4":
      return formatEnonceCombineNiveau4Latex(e);
    case "denominateurCarre":
      return formatEnonceCombineDenominateurCarreLatex(e);
    case "sansFacteurCommun":
      return formatEnonceCombineSansFacteurCommunLatex(e);
    default:
      return "";
  }
}

/** Membre de gauche d'une inéquation « … ◇ 0 ». */
function gaucheDe(ineq: string, e: E): string {
  const i = ineq.lastIndexOf(` ${SYMBOLE_LATEX[e.symbole]} `);
  return (i >= 0 ? ineq.slice(0, i) : ineq).trim().replace(/\\frac/g, "\\dfrac");
}

function etapeIsoler(sq: string, e: E): EtapeCorrection[] {
  const sym = SYMBOLE_LATEX[e.symbole];
  let justif: string | FragmentConsigne[] = "";
  if (e.niveau === "niveau2" || e.niveau === "denominateurCarre" || e.niveau === "sansFacteurCommun") justif = e.k > 0 ? `on soustrait ${nombreTexte(e.k)} aux deux membres` : `on ajoute ${nombreTexte(-e.k)} aux deux membres`;
  else if (e.niveau === "niveau3") justif = [texte("on soustrait "), latex(linTex(e.p1_3)), texte(" aux deux membres")];
  else if (e.niveau === "niveau4") justif = [texte("on soustrait "), latex(`\\dfrac{${linTex(e.numerateurDroitAvantCombinaison)}}{${linTex(e.denominateurDroit)}}`), texte(" aux deux membres")];
  return [
    utilise(sq, [texte(`On ne multiplie jamais par le dénominateur (son signe dépend de x) : on passe tout dans le membre de gauche pour comparer une seule expression à 0 ${COURS_RATIONNELLE}.`)]),
    calcul(sq, [ligne(formatEnonceOriginalComplet(e).replace(/\\frac/g, "\\dfrac")), ligne(`\\iff ${gaucheDe(isoleeLatex(e), e)} ${sym} 0`, justif)]),
    resultat(sq, [latex(isoleeLatex(e).replace(/\\frac/g, "\\dfrac"))]),
  ];
}

/** Lignes de `N0/D + L` mis au même dénominateur (L constant ou du premier degré). */
function lignesCombinaisonTerme(gauche: string, n0: Poly, dTex: string, dPoly: Poly, l: Poly, lTexProduit: string, nFinal: string, carre = false): LigneCalcul[] {
  // Membre de gauche seul sur sa ligne : les fractions (insécables) gardent toute la largeur.
  const lignes: LigneCalcul[] = [ligne(gauche), ligne(`=\\dfrac{${suite(polyLatex(n0), lTexProduit)}}{${dTex}}`, "même dénominateur")];
  if (carre && l.length === 1) {
    const c = l[0];
    const dDev = polyLatex(dPoly);
    lignes.push(ligne(`=\\dfrac{${polyLatex(n0)}${c < 0 ? "-" : "+"}${Math.abs(c) === 1 ? "" : q(Math.abs(c))}(${dDev})}{${dTex}}`, "on développe le carré"));
  }
  const produit = mul(l, dPoly);
  lignes.push(ligne(`=\\dfrac{${suite(polyLatex(n0), polyLatex(produit))}}{${dTex}}`, "on distribue"));
  lignes.push(ligne(`=\\dfrac{${nFinal}}{${dTex}}`, "on réduit le numérateur"));
  return lignes;
}

/** Terme `L·D` écrit avant distribution (signe « + » ajouté par `suite`) : « -3(x-2) », « (x+1)(x-2) », « -(2x-1)(x+3) ». */
function produitEcrit(l: Poly, dPar: string): string {
  if (l.length === 1) {
    const c = l[0];
    return `${c < 0 ? "-" : ""}${Math.abs(c) === 1 ? "" : q(Math.abs(c))}${dPar}`;
  }
  // L du premier degré : on garde son opposé entre parenthèses si son coefficient est négatif.
  if (l[0] < 0) return `-${par(polyLatex(fois(-1, l)))}${dPar}`;
  return `${par(polyLatex(l))}${dPar}`;
}

function etapeCombiner(sq: string, e: E): EtapeCorrection[] {
  const gauche = gaucheDe(isoleeLatex(e), e);
  let lignes: LigneCalcul[] = [];
  switch (e.niveau) {
    case "niveau2": {
      const d = lin(e.denominateur);
      const dTex = linTex(e.denominateur);
      lignes = lignesCombinaisonTerme(gauche, lin(e.numerateurAvantCombinaison), dTex, d, [-e.k], produitEcrit([-e.k], par(dTex)), linTex(e.numerateur));
      break;
    }
    case "niveau3": {
      const dTex = linTex(e.denominateur);
      const l = fois(-1, lin(e.p1_3));
      lignes = lignesCombinaisonTerme(gauche, lin(e.numerateurAvantCombinaison), dTex, lin(e.denominateur), l, produitEcrit(l, par(dTex)), formatMembreGauche(e.numerateur.enonce));
      break;
    }
    case "denominateurCarre": {
      const base = linTex(e.denominateur);
      const dTex = e.denominateur.p === 0 ? `${base}^2` : `(${base})^2`;
      const d = mul(lin(e.denominateur), lin(e.denominateur));
      lignes = lignesCombinaisonTerme(gauche, [e.A], dTex, d, [-e.k], produitEcrit([-e.k], dTex), formatMembreGauche(e.numerateur.enonce), true);
      break;
    }
    case "sansFacteurCommun": {
      const dTex = formatMembreGauche(e.denominateur.enonce);
      lignes = lignesCombinaisonTerme(gauche, tri(e.numerateurAvantCombinaison), dTex, tri(e.denominateur.enonce), [-e.k], produitEcrit([-e.k], par(dTex)), formatMembreGauche(e.numerateur.enonce));
      break;
    }
    case "niveau4": {
      const n1 = linTex(e.numerateurGaucheAvantCombinaison);
      const d2 = linTex(e.denominateurGauche);
      const n3 = linTex(e.numerateurDroitAvantCombinaison);
      const d4 = linTex(e.denominateurDroit);
      const den = `${par(d2)}${par(d4)}`;
      const p1 = mul(lin(e.numerateurGaucheAvantCombinaison), lin(e.denominateurDroit));
      const p2 = mul(lin(e.numerateurDroitAvantCombinaison), lin(e.denominateurGauche));
      lignes = [
        ligne(gauche),
        ligne(`=\\dfrac{${par(n1)}${par(d4)}-${par(n3)}${par(d2)}}{${den}}`, "même dénominateur, une seule fraction"),
        ligne(`=\\dfrac{${polyLatex(p1)}-(${polyLatex(p2)})}{${den}}`, "on développe chaque produit"),
        ligne(`=\\dfrac{${formatMembreGauche(e.numerateur.enonce)}}{${den}}`, "on réduit le numérateur"),
      ];
      break;
    }
    default:
      break;
  }
  return [
    utilise(sq, [texte(`Somme de fractions : on réduit au même dénominateur, puis on développe et on réduit le numérateur ${COURS_RATIONNELLE}.`)]),
    calcul(sq, lignes),
    resultat(sq, [texte("Une seule fraction : "), latex(combineeLatex(e).replace(/\\frac/g, "\\dfrac"))]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Conditions d'existence, racines
// ---------------------------------------------------------------------------------------------

/** Résolution de `P(x) = 0` pour un trinôme (dénominateur à simplifier) : formule ou forme factorisée. */
function lignesTrinomeNul(ex: Exercice): LigneCalcul[] {
  const e = ex.enonce;
  const [r1, r2] = ex.solution.racines;
  if (ex.categorie === "cas_general") return [...lignesDiscriminant(e), ...lignesFormuleRacine(e, 1, "-"), ...lignesFormuleRacine(e, 2, "+")];
  return [ligne(`${formatMembreGauche(e)}=0`), ...lignesProduitNul(e.a, r1, r2, true, `on factorise : ${libelleCategorie(ex.categorie).toLowerCase()}`).map((l, i) => (i === 0 ? { ...l, latex: `\\iff ${l.latex}` } : l))];
}

function texteCE(ce: number | [number, number]): string {
  if (!Array.isArray(ce)) return `\\text{CE} : x \\neq ${q(ce)}`;
  const [u, v] = racinesDistinctes(ce);
  return `\\text{CE} : x \\neq ${q(u)} \\text{ et } x \\neq ${q(v)}`;
}

function etapeCE(sq: string, e: E): EtapeCorrection[] {
  let lignes: LigneCalcul[] = [];
  switch (e.niveau) {
    case "niveau1":
    case "niveau2":
    case "niveau3":
    case "cubique":
      lignes = lignesRacineLineaire(e.denominateur.k, -e.denominateur.k * e.denominateur.p);
      break;
    case "denominateurCarre": {
      const base = linTex(e.denominateur);
      lignes = [ligne(`${e.denominateur.p === 0 ? `${base}^2` : `(${base})^2`}=0`), ...lignesRacineLineaire(e.denominateur.k, -e.denominateur.k * e.denominateur.p).map((l, i) => (i === 0 ? { ...l, justification: "un carré est nul quand sa base est nulle" } : l))];
      break;
    }
    case "niveau4":
      lignes = [...lignesRacineLineaire(e.denominateurGauche.k, -e.denominateurGauche.k * e.denominateurGauche.p), ...lignesRacineLineaire(e.denominateurDroit.k, -e.denominateurDroit.k * e.denominateurDroit.p)];
      break;
    case "sansFacteurCommun": {
      const D = traite(e.denominateur);
      const [r1, r2] = D.solution.racines;
      lignes = lignesProduitNul(D.enonce.a, r1, r2, true, "dénominateur factorisé");
      break;
    }
    case "facteurCommun":
      lignes = lignesTrinomeNul(p2(e.fraction.denominateur));
      break;
  }
  return [
    utilise(sq, [texte(`Condition d'existence : un dénominateur ne peut pas être nul ; on cherche les valeurs de x qui l'annulent ${COURS_DENOMINATEUR}.`)]),
    calcul(sq, lignes),
    resultat(sq, [latex(texteCE(e.ce))]),
  ];
}

function etapeRacineNumerateur(sq: string, n: PolynomeLineaire): EtapeCorrection[] {
  return [
    utilise(sq, [texte(`Racine du numérateur (premier degré) : la valeur de x qui l'annule ${COURS_RATIONNELLE}.`)]),
    calcul(sq, lignesRacineLineaire(n.k, -n.k * n.p)),
    resultat(sq, [texte("Racine du numérateur : "), latex(`x = ${q(n.p)}`)]),
  ];
}

function etapeMiseEnEvidenceCubique(sq: string, quad: Enonce): EtapeCorrection[] {
  const forme = `x(${formatMembreGauche(quad)})`;
  return [
    utilise(sq, [texte(`Mise en évidence : x est un facteur des trois termes du numérateur ${COURS_RATIONNELLE}.`)]),
    calcul(sq, [ligne(`${formatMembreGaucheCubique(quad)}=${forme}`, "mise en évidence de x")]),
    resultat(sq, [latex(forme)]),
  ];
}

function etapeSimplifierFraction(sq: string, e: Extract<E, { niveau: "facteurCommun" }>): EtapeCorrection[] {
  const N = p2(e.fraction.numerateur);
  const D = p2(e.fraction.denominateur);
  const [n1, n2] = N.solution.racines;
  const [d1, d2] = D.solution.racines;
  const simplifiee = formatFractionSimplifiee(e.fraction).replace(/\\frac/g, "\\dfrac");
  const r = e.fraction.racineCommune;
  return [
    utilise(sq, [texte(`Simplifier une fraction rationnelle : on divise numérateur et dénominateur par leur facteur commun ; sa racine reste une valeur interdite ${COURS_SIMPLIFIER}.`)]),
    calcul(sq, [
      ligne(`\\dfrac{${formatMembreGauche(N.enonce)}}{${formatMembreGauche(D.enonce)}}=\\dfrac{${formeMonique(N.enonce.a, n1, n2)}}{${formeMonique(D.enonce.a, d1, d2)}}`, "formes factorisées"),
      ligne(`=${simplifiee}`, [texte("on simplifie par "), latex(`(${formatFacteurRacine(r)})`), texte(" et les coefficients par leur PGCD")]),
    ]),
    resultat(sq, [latex(simplifiee), texte(", avec "), latex(texteCE(e.ce).replace("\\text{CE} : ", ""))]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Tableau de signes
// ---------------------------------------------------------------------------------------------

interface LigneGrille {
  libelle: string;
  valeurs: readonly ValeurCelluleQuotient[];
  signe: LigneCalcul;
}

function paire(v: readonly [number, number]): [number, number] {
  return [...v].sort((a, b) => a - b) as [number, number];
}

function monique(r: number): LigneGrille["signe"] {
  return r === 0 ? ligne("x=0", "facteur x : − avant 0, + après") : ligneSigneLineaire(1, -r, r);
}

function ligneLineaire(p: PolynomeLineaire, valeurs: readonly ValeurCelluleQuotient[]): LigneGrille {
  return { libelle: linTex(p), valeurs, signe: ligneSigneLineaire(p.k, -p.k * p.p, p.p) };
}

function ligneMonique(r: number, valeurs: readonly ValeurCelluleQuotient[]): LigneGrille {
  return { libelle: formatLineaireDeveloppeExact(1, r), valeurs, signe: monique(r) };
}

/** Lignes du tableau (même ordre que les composants `EtapeGrilleQuotient*.tsx`), avec le signe de chacune. */
function lignesGrille(e: E): LigneGrille[] {
  switch (e.niveau) {
    case "niveau1":
    case "niveau2":
      return [ligneLineaire(e.numerateur, e.grille.ligneNumerateur), ligneLineaire(e.denominateur, e.grille.ligneDenominateur)];
    case "niveau3":
    case "denominateurCarre": {
      const [r1, r2] = paire(e.numerateur.solution.racines);
      const lignes: LigneGrille[] = [];
      if (e.grille.ligneCoefficient) lignes.push({ libelle: q(e.numerateur.enonce.a), valeurs: e.grille.ligneCoefficient, signe: ligneConstante(e.numerateur.enonce.a) });
      if (r1 === r2) {
        const lab = r1 === 0 ? "x^2" : `(${formatLineaireDeveloppeExact(1, r1)})^2`;
        lignes.push({ libelle: lab, valeurs: e.grille.lignesNumerateur[0], signe: ligne(`${lab}\\geq 0`, `un carré est positif, nul en x = ${nombreTexte(r1)}`) });
      } else lignes.push(ligneMonique(r1, e.grille.lignesNumerateur[0]), ligneMonique(r2, e.grille.lignesNumerateur[1]));
      if (e.niveau === "niveau3") lignes.push(ligneLineaire(e.denominateur, e.grille.ligneDenominateur));
      else {
        const base = linTex(e.denominateur);
        const lab = e.denominateur.p === 0 ? `${base}^2` : `(${base})^2`;
        lignes.push({ libelle: lab, valeurs: e.grille.ligneDenominateur, signe: ligne(`${lab}\\geq 0`, `un carré est positif ; nul en x = ${nombreTexte(e.denominateur.p)}, valeur interdite (double barre)`) });
      }
      return lignes;
    }
    case "niveau4": {
      const [n1, n2] = paire(e.numerateur.solution.racines);
      return [ligneMonique(n1, e.grille.lignesNumerateur[0]), ligneMonique(n2, e.grille.lignesNumerateur[1]), ligneLineaire(e.denominateurGauche, e.grille.lignesDenominateur[0]), ligneLineaire(e.denominateurDroit, e.grille.lignesDenominateur[1])];
    }
    case "sansFacteurCommun": {
      const [n1, n2] = paire(e.numerateur.solution.racines);
      const [d1, d2] = paire(e.denominateur.solution.racines);
      return [ligneMonique(n1, e.grille.lignesNumerateur[0]), ligneMonique(n2, e.grille.lignesNumerateur[1]), ligneMonique(d1, e.grille.lignesDenominateur[0]), ligneMonique(d2, e.grille.lignesDenominateur[1])];
    }
    case "facteurCommun":
      return [ligneLineaire(e.numerateurSimplifie, e.grille.ligneNumerateur), ligneLineaire(e.denominateurSimplifie, e.grille.ligneDenominateur)];
    case "cubique": {
      const [q1, q2] = paire(e.numerateur.solution.racines);
      return [
        { libelle: "x", valeurs: e.grille.lignesNumerateur[0], signe: monique(0) },
        ligneMonique(q1, e.grille.lignesNumerateur[1]),
        ligneMonique(q2, e.grille.lignesNumerateur[2]),
        ligneLineaire(e.denominateur, e.grille.ligneDenominateur),
      ];
    }
  }
}

export function tableauSignesQuotientLatex(e: E): string {
  const lignes = lignesGrille(e).map((l) => ({ libelle: l.libelle, valeurs: [...l.valeurs] as CelluleSigne[] }));
  return tableauSignesLatex(e.racines, lignes, { libelle: "\\text{quotient}", valeurs: [...e.grille.ligneQuotient] as CelluleSigne[] });
}

/** Numérateur et dénominateur de la fraction étudiée (une seule fraction, simplifiée s'il le faut). */
function fractionEtudiee(e: E): { n: Poly; d: Poly } {
  switch (e.niveau) {
    case "niveau1":
    case "niveau2":
      return { n: lin(e.numerateur), d: lin(e.denominateur) };
    case "niveau3":
      return { n: tri(e.numerateur.enonce), d: lin(e.denominateur) };
    case "denominateurCarre":
      return { n: tri(e.numerateur.enonce), d: mul(lin(e.denominateur), lin(e.denominateur)) };
    case "niveau4":
      return { n: tri(e.numerateur.enonce), d: mul(lin(e.denominateurGauche), lin(e.denominateurDroit)) };
    case "sansFacteurCommun":
      return { n: tri(e.numerateur.enonce), d: tri(e.denominateur.enonce) };
    case "facteurCommun":
      return { n: lin(e.numerateurSimplifie), d: lin(e.denominateurSimplifie) };
    case "cubique":
      return { n: [...tri(e.numerateur.enonce), 0], d: lin(e.denominateur) };
  }
}

/** Valeur du quotient étudié en x (figure « courbe et signes » de l'écran, `CourbeSignes`). */
export function valeurQuotientEtudie(e: E, x: number): number {
  const { n, d } = fractionEtudiee(e);
  return valeur(n, x) / valeur(d, x);
}

function etapeGrille(sq: string, e: E): EtapeCorrection[] {
  const t = valeurTest(e.racines);
  const { n, d } = fractionEtudiee(e);
  const vn = valeur(n, t);
  const vd = valeur(d, t);
  const v = vn / vd;
  const lignes = lignesGrille(e);
  return [
    utilise(sq, [texte(`Tableau de signes d'un quotient : une ligne par facteur du numérateur et du dénominateur ; signe du quotient par la règle des signes ; double barre aux valeurs interdites ${COURS_RATIONNELLE}.`)]),
    calcul(sq, [ligne(`x\\in\\{${racinesDistinctes(e.racines).map(q).join("\\,;\\,")}\\}`, "racines du numérateur et valeurs interdites, rangées : les colonnes"), ...lignes.map((l) => l.signe)], [], "Signe de chaque facteur"),
    resultat(sq, [latex(tableauSignesQuotientLatex(e))]),
    verification(sq, [texte(`Valeur test dans la dernière zone, en x = ${nombreTexte(t)} : `), latex(`\\dfrac{${q(vn)}}{${q(vd)}}${Number.isInteger(v) ? "" : `=${q(v)}`}${v > 0 ? ">" : "<"}0`), texte(`, d'où le signe ${v > 0 ? "+" : "−"} de la dernière colonne.`)]),
    ...(e.niveau === "denominateurCarre" ? [lignePiege(sq, piegeInequationRationnelle(e))] : []),
  ];
}

const RETENIR: Record<E["symbole"], string> = {
  "<": "on garde les zones où le quotient est strictement négatif",
  ">": "on garde les zones où le quotient est strictement positif",
  "≤": "on garde les zones où le quotient est négatif et les racines du numérateur ; les valeurs interdites restent exclues",
  "≥": "on garde les zones où le quotient est positif et les racines du numérateur ; les valeurs interdites restent exclues",
};

function etapeIntervalle(sq: string, e: E): EtapeCorrection[] {
  const piegeIci = e.niveau === "niveau1" || e.niveau === "cubique" || e.niveau === "facteurCommun";
  return [
    utilise(sq, [texte(`Lecture du tableau, ligne du quotient : ${RETENIR[e.symbole]} ${COURS_RATIONNELLE}.`)]),
    calcul(sq, lignesLectureSolution(e.racines, e.grille.ligneQuotient, e.symbole, "quotient")),
    resultat(sq, [latex(`S = ${formatSolutionEnsembleProduitLatex(e.solution)}`)]),
    ...(piegeIci ? [lignePiege(sq, piegeInequationRationnelle(e))] : []),
  ];
}

/** Piège unique, le plus pertinent pour le niveau. */
export function piegeInequationRationnelle(e: E): FragmentConsigne[] {
  switch (e.niveau) {
    case "facteurCommun":
      return [texte("Simplifier la fraction ne supprime pas la valeur interdite du facteur commun : elle reste exclue de S.")];
    case "denominateurCarre":
      return [texte("Un dénominateur au carré est positif : il ne change pas le signe du quotient, mais sa racine reste une valeur interdite.")];
    case "niveau1":
    case "cubique":
      return [texte("Une valeur interdite est toujours exclue de S, même avec ≤ ou ≥ : crochet ouvert.")];
    default:
      return [texte("Ne jamais multiplier les deux membres par le dénominateur : son signe dépend de x. On compare une seule fraction à 0.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------------------------

function formeMiseEnEvidence(ex: Exercice): string {
  const g = facteurCommun(ex.enonce);
  const { a, b, c } = ex.enonce;
  return `${g}(${formatMembreGauche({ a: a / g, b: b / g, c: c / g })})`;
}

/** Forme factorisée attendue au champ 1 d'un trinôme (même source que l'écran : `solution.formeFactorisee`). */
function formeChamp1(ex: Exercice): string {
  return ex.solution.formeFactorisee ?? formatFormeFactoriseeDepuisRacines(ex.enonce, ex.solution.racines);
}

function etapesEcran(e: E, phase: Phase, sq: string): EtapeCorrection[] {
  const raisonReduction = "on divise par un nombre positif : le signe du quotient ne change pas";
  switch (phase) {
    case "isoler":
      return [...etapeIsoler(sq, e), ...(e.niveau !== "niveau1" && e.niveau !== "cubique" && e.niveau !== "facteurCommun" && e.niveau !== "denominateurCarre" ? [lignePiege(sq, piegeInequationRationnelle(e))] : [])];
    case "combiner":
      return etapeCombiner(sq, e);
    case "ce":
      return etapeCE(sq, e);
    case "racineNumerateur":
      return e.niveau === "niveau1" || e.niveau === "niveau2" ? etapeRacineNumerateur(sq, e.numerateur) : [];
    case "miseEnEvidence":
      return e.niveau === "cubique" ? etapeMiseEnEvidenceCubique(sq, e.numerateur.enonce) : [];
    case "simplifierFraction":
      return e.niveau === "facteurCommun" ? etapeSimplifierFraction(sq, e) : [];
    case "grille":
      return etapeGrille(sq, e);
    case "intervalle":
      return etapeIntervalle(sq, e);
    default:
      break;
  }
  // Mécanisme « méthode la plus rapide »
  if (phase.startsWith("denom")) {
    if (e.niveau !== "sansFacteurCommun") return [];
    const D0 = e.denominateur;
    const D = traite(D0);
    const nom = "le dénominateur";
    if (phase === "denomReduction") return etapeReductionDivision(sq, D0.enonce, nom, formatPolynome(D), raisonReduction);
    if (phase === "denomReconnaissance") return etapeReconnaissance(sq, D.enonce, D.categorie, nom);
    if (phase === "denomChamp1") return etapeChamp1(sq, D, nom, formeChamp1(D));
    return etapeFactorisationCasGeneral(sq, D, nom, formatFormeFactoriseeDepuisRacines(D.enonce, D.solution.racines));
  }
  if (phase.startsWith("simplifier")) {
    if (e.niveau !== "facteurCommun") return [];
    const cote = phase.startsWith("simplifierDenom") ? "Denom" : "Num";
    const P = p2(cote === "Denom" ? e.fraction.denominateur : e.fraction.numerateur);
    const nom = cote === "Denom" ? "le dénominateur" : "le numérateur";
    const etape = phase.slice(`simplifier${cote}`.length);
    if (etape === "Reduction") return etapeReductionMiseEnEvidence(sq, P.enonce, nom, formeMiseEnEvidence(P));
    if (etape === "Reconnaissance") return etapeReconnaissance(sq, P.enonce, P.categorie, nom);
    if (etape === "Champ1") return etapeChamp1(sq, P, nom, formeChamp1(P));
    if (etape === "Champ2") return etapeRacines(sq, P, nom);
    return etapeFactorisationCasGeneral(sq, P, nom, formatFormeFactoriseeDepuisRacines(P.enonce, P.solution.racines));
  }
  if (!("numerateur" in e) || estP1(e.numerateur)) return [];
  const N0 = e.numerateur;
  const N = traite(N0);
  const nom = nomP2(e);
  switch (phase) {
    case "reduction":
      return etapeReductionDivision(sq, N0.enonce, nom, formatPolynome(N), raisonReduction);
    case "reconnaissance":
      return etapeReconnaissance(sq, N.enonce, N.categorie, nom);
    case "champ1":
      return etapeChamp1(sq, N, nom, formeChamp1(N));
    case "champ2":
      return etapeRacines(sq, N, nom);
    default:
      return etapeFactorisationCasGeneral(sq, N, nom, formatFormeFactoriseeDepuisRacines(N.enonce, N.solution.racines));
  }
}

export function correctionDetailleeInequationRationnelle(e: E): EtapeCorrection[] {
  return ecransInequationRationnelle(e).flatMap((phase, i) => etapesEcran(e, phase, LETTRES[i]));
}

/** Polynôme du second degré traité à l'écran `phase` (pour savoir s'il relève du cas général). */
function polynomeDeLaPhase(e: E, phase: Phase): Exercice | null {
  if (phase.startsWith("denom")) return e.niveau === "sansFacteurCommun" ? e.denominateur : null;
  if (phase.startsWith("simplifierDenom")) return e.niveau === "facteurCommun" ? p2(e.fraction.denominateur) : null;
  if (phase.startsWith("simplifierNum")) return e.niveau === "facteurCommun" ? p2(e.fraction.numerateur) : null;
  return "numerateur" in e && !estP1(e.numerateur) ? e.numerateur : null;
}

/**
 * Lettres des écrans comptés comme LECTURES pour le niveau et la durée : identification (méthode)
 * ou recopie immédiate (réduction / mise en évidence d'un diviseur commun, racines lues sur la forme
 * factorisée, forme factorisée réécrite avec les racines trouvées).
 */
export function lettresLectureInequationRationnelle(e: E): string[] {
  return ecransInequationRationnelle(e)
    .map((phase, i) => {
      const casGeneral = polynomeDeLaPhase(e, phase)?.categorie === "cas_general";
      const lecture = /Reconnaissance$|^reconnaissance$|Reduction$|^reduction$|Factorisation$|^factorisation$/.test(phase) || (/Champ2$|^champ2$/.test(phase) && !casGeneral);
      return lecture ? LETTRES[i] : "";
    })
    .filter(Boolean);
}
