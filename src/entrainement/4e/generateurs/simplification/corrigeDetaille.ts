import type { Exercice } from "../../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../../core/simplification.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { PhaseSimplification } from "../../moteur/typesSimplification";
import { phasesExercice } from "../../moteur/sessionSimplification";
import { libelleCategorie } from "../../ui/categorieLabels";
import { formatFractionSimplifiee, formatPolynome, formatPolynomeMisEnEvidence } from "../../ui/formatSimplification";
import { formatMembreGauche } from "../../ui/formatEquation";
import { q } from "../../ui/corrigeChapitre3";
import {
  COURS_SIMPLIFIER,
  deltaDe,
  formeFactoriseeCote,
  fractionPapier,
  lignesDelta,
  lignesFacteurNul,
  lignesFacteursNonNuls,
  lignesFactorisation,
  lignesFactorisationCasGeneral,
  lignesMiseEnEvidenceNumerique,
  lignesRacinesFormule,
  lignesReconnaissance,
  lignesRedeveloppement,
  lignesSimplificationFraction,
  pgcdListe,
  rac,
  trinomeDe,
  utiliseDelta,
  utiliseFactorisation,
  utiliseFormule,
  utiliseReconnaissance,
  type Trinome,
  finaliserCorrige,
} from "../../ui/corrigeSecondDegre1";

/**
 * Corrigé détaillé « comme au tableau » de gen3 (simplifier une fraction rationnelle,
 * `AppSimplification.tsx`) — règle `.claude/rules/feuilles-evaluations.md`. Une étape (lettre) par
 * ÉCRAN, dans l'ordre réel des écrans de l'instance (`moteur/sessionSimplification.ts::phasesExercice`,
 * même source que la barre de progression) : côté dénominateur (mise en évidence, méthode, Δ ou
 * factorisation, conditions d'existence, forme factorisée), côté numérateur, puis simplification.
 * Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceSimplification;
type Poly = Exercice | PolynomeLineaire;

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export function phasesSimplification(instance: E): PhaseSimplification[] {
  return phasesExercice(instance);
}

export function lettrePhaseSimplification(instance: E, phase: PhaseSimplification): string {
  return LETTRES[phasesSimplification(instance).indexOf(phase)] ?? "a";
}

function estP1(p: Poly): p is PolynomeLineaire {
  return "k" in p;
}

/** Racines distinctes triées d'un côté (P1 : sa racine p). */
function racinesCote(p: Poly): number[] {
  if (estP1(p)) return [p.p];
  const [r1, r2] = [...p.solution.racines].sort((x, y) => x - y);
  return r1 === r2 ? [r1!] : [r1!, r2!];
}

export function ceLatex(instance: E): string {
  return racinesCote(instance.denominateur)
    .map((v) => `x\\neq ${q(v)}`)
    .join("\\text{ et }");
}

const COTE = { D: "dénominateur", N: "numérateur" } as const;

/** Trinôme réduit (divisé par le PGCD des coefficients) : c'est lui que l'écran montre entre parenthèses. */
function trinomeReduit(p: Exercice): Trinome {
  const g = pgcdListe([p.enonce.a, p.enonce.b, p.enonce.c]);
  return { a: p.enonce.a / g, b: rac(p.enonce.b / g), c: p.enonce.c / g };
}

// ---------------------------------------------------------------------------------------------
// Étapes d'un côté
// ---------------------------------------------------------------------------------------------

export function etapeReduction(p: Poly, nom: "D" | "N", l: string): EtapeCorrection[] {
  return [
    utilise(l, [texte(`On factorise tout avant de simplifier ${COURS_SIMPLIFIER} : on commence par mettre en évidence le plus grand facteur numérique commun aux coefficients du ${COTE[nom]}.`)]),
    calcul(l, lignesMiseEnEvidenceNumerique(p, nom)),
    resultat(l, [latex(`${nom}(x)=${formatPolynomeMisEnEvidence(p)}`)]),
  ];
}

export function etapeReconnaissance(p: Exercice, nom: "D" | "N", l: string): EtapeCorrection[] {
  const t = trinomeReduit(p);
  const reduit = formatMembreGauche({ a: t.a, b: t.b.c, c: t.c });
  const g = pgcdListe([p.enonce.a, p.enonce.b, p.enonce.c]);
  const intro: FragmentConsigne[] = g > 1 ? [texte("Dans "), latex(`${nom}(x)=${formatPolynomeMisEnEvidence(p)}`), texte(", sur le trinôme "), latex(reduit), texte(" :")] : [texte("Sur "), latex(`${nom}(x)=${reduit}`), texte(" :")];
  return [utilise(l, utiliseReconnaissance()), calcul(l, lignesReconnaissance(t, p.categorie), intro), resultat(l, [texte(`Méthode (${COTE[nom]}) : ${libelleCategorie(p.categorie)}`)])];
}

export function etapeChamp1(p: Exercice, nom: "D" | "N", l: string): EtapeCorrection[] {
  if (p.categorie === "cas_general") {
    const t = trinomeDe(p);
    return [
      utilise(l, [...utiliseDelta(), texte(" On le calcule sur "), latex(`${nom}(x)=${formatPolynome(p)}`), texte(".")]),
      calcul(l, lignesDelta(t)),
      resultat(l, [latex(`\\Delta=${q(deltaDe(t))}`)]),
    ];
  }
  const forme = (p.solution.formeFactorisee ?? "").replace(/\s+/g, "");
  return [utilise(l, utiliseFactorisation(p.categorie)), calcul(l, lignesFactorisation(p, { nom }, forme, formatPolynome(p))), resultat(l, [latex(`${nom}(x)=${forme}`)])];
}

/** Racines par la formule (cas général) — pour les CE (dénominateur) ou les racines du numérateur. */
function lignesRacinesCasGeneral(p: Exercice): LigneCalcul[] {
  const t = trinomeDe(p);
  return lignesRacinesFormule(t).lignes;
}

function etapeCE(instance: E, l: string): EtapeCorrection[] {
  const d = instance.denominateur as Exercice;
  const res = resultat(l, [texte("CE : "), latex(ceLatex(instance))]);
  const regle: FragmentConsigne[] = [texte(`Une fraction n'existe que si son dénominateur est non nul : chaque racine du dénominateur est une valeur interdite, la condition d'existence se lit avant toute simplification ${COURS_SIMPLIFIER}.`)];
  if (d.categorie === "cas_general") {
    const delta = deltaDe(trinomeDe(d));
    const lignesCE = racinesCote(d).map((r) => ligne(`x\\neq ${q(r)}`, "racine du dénominateur : valeur interdite"));
    return [
      utilise(l, [...regle, texte(" "), ...utiliseFormule()]),
      calcul(l, lignesRacinesCasGeneral(d), [latex(`\\Delta=${q(delta)}>0`), texte(" : deux racines distinctes.")], "Racines de D(x)"),
      calcul(l, lignesCE, [], "Conditions"),
      res,
    ];
  }
  const forme = (d.solution.formeFactorisee ?? "").replace(/\s+/g, "");
  return [utilise(l, regle), calcul(l, lignesFacteursNonNuls(forme), [texte("Sur "), latex(`D(x)=${forme}`), texte(" :")]), res];
}

function etapeCEDirecte(instance: E, l: string): EtapeCorrection[] {
  const d = instance.denominateur as PolynomeLineaire;
  const facteur = { alpha: d.k, beta: rac(-d.k * d.p), latex: formatPolynome(d).replace(/\s+/g, ""), carre: false };
  return [
    utilise(l, [texte(`Une fraction n'existe que si son dénominateur est non nul ${COURS_SIMPLIFIER}.`)]),
    calcul(l, lignesFacteurNul(facteur, "le dénominateur doit être non nul", "\\neq")),
    resultat(l, [texte("CE : "), latex(ceLatex(instance))]),
  ];
}

export function etapeRacinesNumerateur(p: Exercice, l: string): EtapeCorrection[] {
  const r = racinesCote(p);
  const delta = deltaDe(trinomeDe(p));
  return [
    utilise(l, utiliseFormule()),
    calcul(l, lignesRacinesCasGeneral(p), [latex(`\\Delta=${q(delta)}>0`), texte(" : deux racines distinctes.")]),
    resultat(l, [texte("Racines du numérateur : "), ...r.flatMap((v, i) => [...(i > 0 ? [texte(" et ")] : []), latex(`x=${q(v)}`)])]),
  ];
}

export function etapeFactorisation(p: Exercice, nom: "D" | "N", l: string): EtapeCorrection[] {
  const forme = formeFactoriseeCote(p);
  return [
    utilise(l, utiliseFactorisation("cas_general")),
    calcul(l, lignesFactorisationCasGeneral(p, { nom })),
    resultat(l, [latex(`${nom}(x)=${forme}`)]),
    verification(l, [texte("On redéveloppe :")], lignesRedeveloppement(p, { nom })),
  ];
}

// ---------------------------------------------------------------------------------------------
// Simplification finale
// ---------------------------------------------------------------------------------------------

function valeurPoly(p: Poly, x: number): number {
  return estP1(p) ? p.k * (x - p.p) : p.enonce.a * x * x + p.enonce.b * x + p.enonce.c;
}

/** x remplacé par t dans une expression simple (« 2x », « x - 3 », « 3(x + 1) »…). */
function substituer(expr: string, t: number): string {
  const tt = t < 0 ? `(${t})` : String(t);
  return expr.replace(/(\d)x/g, `$1\\cdot ${tt}`).replace(/x/g, tt);
}

function etapeSimplification(instance: E, l: string): EtapeCorrection[] {
  const finale = fractionPapier(formatFractionSimplifiee(instance));
  const interdites = racinesCote(instance.denominateur);
  const t = [1, 2, 3, 4, 5, -1, -2, -3, 6, 7].find((v) => !interdites.includes(v) && valeurPoly(instance.denominateur, v) !== 0 && valeurPoly(instance.numerateur, v) !== 0)!;
  const nv = valeurPoly(instance.numerateur, t);
  const dv = valeurPoly(instance.denominateur, t);
  const lignesVerif = [
    ligne(`F(${t})=\\dfrac{${q(nv)}}{${q(dv)}}`, [latex(`N(${t})=${q(nv)}`), texte(" et "), latex(`D(${t})=${q(dv)}`)]),
    ...(q(nv / dv) !== `\\dfrac{${q(nv)}}{${q(dv)}}` ? [ligne(`=${q(nv / dv)}`)] : []),
    ligne(`${substituer(finale, t)}=${q(nv / dv)}`, "la fraction simplifiée donne la même valeur ✓"),
  ];
  return [
    utilise(l, [texte(`On simplifie des facteurs, jamais des termes : numérateur et dénominateur factorisés, on enlève le facteur commun, puis on divise les coefficients par leur PGCD ${COURS_SIMPLIFIER}.`)]),
    calcul(l, lignesSimplificationFraction(instance, "F(x)")),
    resultat(l, [latex(`F(x)=${finale}`), texte(", pour "), latex(ceLatex(instance))]),
    verification(l, [texte("Valeur test "), latex(`x=${t}`), texte(" (permise) :")], lignesVerif),
    piege(l, [
      texte("Les conditions d'existence se lisent avant de simplifier : "),
      latex(`x=${q(instance.racineCommune)}`),
      texte(" reste interdit même si le facteur commun a disparu de la fraction simplifiée."),
    ]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------------------------

export function correctionDetailleeSimplification(instance: E): EtapeCorrection[] {
  return finaliserCorrige(correctionDetailleeSimplificationBrut(instance));
}

function correctionDetailleeSimplificationBrut(instance: E): EtapeCorrection[] {
  const D = instance.denominateur;
  const N = instance.numerateur;
  return phasesSimplification(instance).flatMap((phase) => {
    const l = lettrePhaseSimplification(instance, phase);
    switch (phase) {
      case "denomReduction":
      case "denomReductionP1":
        return etapeReduction(D, "D", l);
      case "numReduction":
      case "numReductionP1":
        return etapeReduction(N, "N", l);
      case "denomReconnaissance":
        return etapeReconnaissance(D as Exercice, "D", l);
      case "numReconnaissance":
        return etapeReconnaissance(N as Exercice, "N", l);
      case "denomChamp1":
        return etapeChamp1(D as Exercice, "D", l);
      case "numChamp1":
        return etapeChamp1(N as Exercice, "N", l);
      case "denomChamp2":
        return etapeCE(instance, l);
      case "ceDirecte":
        return etapeCEDirecte(instance, l);
      case "numChamp2":
        return etapeRacinesNumerateur(N as Exercice, l);
      case "denomFactorisation":
        return etapeFactorisation(D as Exercice, "D", l);
      case "numFactorisation":
        return etapeFactorisation(N as Exercice, "N", l);
      case "simplification":
        return etapeSimplification(instance, l);
    }
  });
}

/** Consigne de chaque écran (titres « Étape n — … » du corrigé). */
export function consigneEtapeSimplification(instance: E, phase: PhaseSimplification): FragmentConsigne[] {
  const D = instance.denominateur;
  const N = instance.numerateur;
  const casGeneral = (p: Poly) => !estP1(p) && p.categorie === "cas_general";
  switch (phase) {
    case "denomReduction":
    case "denomReductionP1":
      return [texte("Mets le facteur numérique commun du dénominateur "), latex(`D(x)=${formatPolynome(D)}`), texte(" en évidence.")];
    case "numReduction":
    case "numReductionP1":
      return [texte("Mets le facteur numérique commun du numérateur "), latex(`N(x)=${formatPolynome(N)}`), texte(" en évidence.")];
    case "denomReconnaissance":
      return [texte("Choisis la méthode la plus rapide pour factoriser le dénominateur.")];
    case "numReconnaissance":
      return [texte("Choisis la méthode la plus rapide pour factoriser le numérateur.")];
    case "denomChamp1":
      return [texte(casGeneral(D) ? "Calcule le discriminant Δ du dénominateur." : "Factorise le dénominateur.")];
    case "numChamp1":
      return [texte(casGeneral(N) ? "Calcule le discriminant Δ du numérateur." : "Factorise le numérateur.")];
    case "denomChamp2":
      return [texte("Donne les conditions d'existence de la fraction.")];
    case "ceDirecte":
      return [texte("Donne la condition d'existence de la fraction.")];
    case "numChamp2":
      return [texte("Donne les racines du numérateur.")];
    case "denomFactorisation":
      return [texte("Écris la forme factorisée du dénominateur.")];
    case "numFactorisation":
      return [texte("Écris la forme factorisée du numérateur.")];
    case "simplification":
      return [texte("Simplifie la fraction.")];
  }
}

