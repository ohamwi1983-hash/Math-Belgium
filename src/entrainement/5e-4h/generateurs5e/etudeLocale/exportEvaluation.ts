import type { ExerciceEtudeLocale } from "../../core5e/etudeLocale.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneEcranEtudeLocale, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../../ui5e/formatEtudeLocale";
import { tableauSignesEtudeLatex } from "../../ui5e/corrigeDerivees1";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeEtudeLocale } from "./corrigeDetaille";
import { ordreEcransEtudeLocale, type EcranEtudeLocale } from "../../moteur5e/typesEtudeLocale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeLocale } from "./index";
import { PARAMETRES_ETUDE_LOCALE, profilEtudeLocale } from "../profilsEvaluationDerivees28-30";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeLocale>` pour 5gen29 (Étude locale) — feuille
 * d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = f, f' (et f'' au niveau avancé) DONNÉES, comme à l'écran, et UNE consigne
 * globale : domaine (fonction rationnelle), zéros de f', signe de f' et variations, extremums
 * (abscisse, nature, valeur) ; au niveau avancé, la même chose pour f'' (concavité, points
 * d'inflexion). Aucun rappel de méthode dans l'énoncé (le piège « zéro sans changement de signe »
 * est dans le corrigé). Les écrans du générateur (`ordreEcransEtudeLocale`) sont les étapes du
 * corrigé ; les tableaux de signes y sont dessinés (`tableauSignesEtudeLatex`, à partir de
 * `tableauFPrimeAttendu`/`tableauFSecondeAttendu`, la MÊME source que la vérification de l'écran).
 */

const LETTRES = "abcdefghijkl";

// ============================================================================
// Tableau de signes en LaTeX (réutilisé par 5gen30, `lectureGraphiqueDerivees/exportEvaluation.ts`).
// ============================================================================

export { tableauSignesEtudeLatex };

// ============================================================================
// Énoncé.
// ============================================================================

function entete(exercice: ExerciceEtudeLocale): FragmentConsigne[] {
  const avance = exercice.niveau === "avance";
  // Option « à calculer » (lot C) : seule f est donnée.
  if (exercice.deriveesACalculer) return [texte("On considère la fonction "), latex(formatTermesDonneesLatex(exercice)[0]), texte(".")];
  return [texte(avance ? "On considère la fonction f ; ses dérivées f′ et f″ sont données : " : "On considère la fonction f ; sa dérivée f′ est donnée : "), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))];
}

function consigneEtape(ecran: EcranEtudeLocale): FragmentConsigne[] {
  return [texte(consigneEcranEtudeLocale(ecran).replace("Complète le tableau", "Dresse le tableau"))];
}

function construireEnonceEtudeLocale(exercice: ExerciceEtudeLocale): SectionExercice {
  return { enteteFragments: entete(exercice), questions: ordreEcransEtudeLocale(exercice).map((ecran) => ({ consigne: consigneEtape(ecran) })) };
}

function irrationnelle(exercice: ExerciceEtudeLocale): boolean {
  return exercice.type === "polynomiale" && exercice.natureRacines === "irrationnelle";
}

function consignePapier(exercice: ExerciceEtudeLocale): string {
  const domaine = exercice.type !== "polynomiale" ? "Détermine le domaine de définition de f. " : "";
  const fPrime = "Recherche les zéros de f′, étudie le signe de f′ et les variations de f, puis détermine les éventuels extremums de f (abscisse, nature et valeur).";
  const fSeconde = exercice.niveau === "avance" ? " Étudie de même le signe de f″ et la concavité de f, puis détermine ses éventuels points d'inflexion (abscisse et valeur)." : "";
  // Lot C (question 4) : valeurs exactes partout, racines irrationnelles comprises.
  const precision = " Donne des valeurs exactes.";
  const derivees = exercice.deriveesACalculer ? (exercice.niveau === "avance" ? "Calcule f′(x) et f″(x). " : "Calcule f′(x). ") : "";
  return `${domaine}${derivees}${fPrime}${fSeconde}${precision}`;
}

function enoncePapierEtudeLocale(exercice: ExerciceEtudeLocale): EnoncePapier {
  return {
    section: { enteteFragments: entete(exercice), questions: [{ consigne: [texte(consignePapier(exercice))] }] },
    etapesParQuestion: [ordreEcransEtudeLocale(exercice).map((_, i) => LETTRES[i])],
  };
}

// ============================================================================
// Réponse brève, corrigé, barème.
// ============================================================================

function joindre(latexs: string[], separateur = " ; "): FragmentConsigne[] {
  return latexs.flatMap((l, i) => [...(i === 0 ? [] : [texte(separateur)]), latex(l)]);
}

function aExtremums(exercice: ExerciceEtudeLocale): boolean {
  return exercice.classificationFPrime.some((c) => c !== "ni_lun_ni_lautre");
}

function aInflexions(exercice: ExerciceEtudeLocale): boolean {
  return exercice.classificationFSeconde.some((c) => c === "pi");
}

function reponseBreveEtudeLocale(exercice: ExerciceEtudeLocale): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = aExtremums(exercice) ? joindre(formatReponseAttenduePhaseLatex(exercice, "extremums")) : [texte("aucun extremum")];
  const natures = formatReponseAttenduePhaseLatex(exercice, "tableauFPrime");
  fragments.push(texte(" ("), ...joindre(natures), texte(")"));
  if (exercice.niveau === "avance") {
    fragments.push(texte(" — "), ...(aInflexions(exercice) ? joindre(formatReponseAttenduePhaseLatex(exercice, "inflexions")) : [texte("aucun point d'inflexion")]));
  }
  return fragments;
}

const POIDS_ECRAN: Record<EcranEtudeLocale, number> = { domaine: 0.5, deriverFPrime: 1, deriverFSeconde: 1, resoudreFPrime: 2, tableauFPrime: 2, extremums: 1.5, resoudreFSeconde: 2, tableauFSeconde: 2, inflexions: 1.5 };

const CRITERE_ECRAN: Record<EcranEtudeLocale, string> = {
  domaine: "Domaine de définition",
  deriverFPrime: "Dérivée f′(x) correcte",
  deriverFSeconde: "Dérivée seconde f″(x) correcte",
  resoudreFPrime: "Zéros de f′ (toutes les solutions)",
  tableauFPrime: "Tableau de signes de f′, variations et nature de chaque zéro",
  extremums: "Valeur de f en chaque extremum",
  resoudreFSeconde: "Zéros de f″",
  tableauFSeconde: "Tableau de signes de f″, concavité et points d'inflexion",
  inflexions: "Valeur de f en chaque point d'inflexion",
};

/** Poids ramenés à un total de 4, au demi-point, aucun critère sous 0,5 (plus forts restes). Au-delà
 * de 8 critères (rationnelle, niveau avancé, dérivées à calculer : 9 écrans), 0,5 chacun ne tient plus
 * dans 4 points : le total devient 0,5 × nombre de critères (4,5) — sans cette borne, la boucle de
 * retrait ne trouvait plus aucun critère au-dessus de 0,5 et ne s'arrêtait jamais (barème, évaluation
 * et feuille figés). */
export function repartirSurQuatre(poids: number[]): number[] {
  const total = poids.reduce((t, p) => t + p, 0);
  const demiPoints = Math.max(8, poids.length);
  const brut = poids.map((p) => (p / total) * demiPoints); // en demi-points
  const unites = brut.map((b) => Math.max(1, Math.floor(b)));
  let reste = demiPoints - unites.reduce((t, u) => t + u, 0);
  const ordre = brut.map((b, i) => ({ i, r: b - Math.floor(b) })).sort((a, b) => b.r - a.r || poids[b.i] - poids[a.i]);
  for (let k = 0; reste > 0; k = (k + 1) % ordre.length, reste--) unites[ordre[k].i]++;
  for (let k = ordre.length - 1; reste < 0; k = (k - 1 + ordre.length) % ordre.length) {
    if (unites[ordre[k].i] > 1) {
      unites[ordre[k].i]--;
      reste++;
    }
  }
  return unites.map((u) => u / 2);
}

function baremeEtudeLocale(exercice: ExerciceEtudeLocale): BaremeExercice {
  const ordre = ordreEcransEtudeLocale(exercice);
  const points = repartirSurQuatre(ordre.map((e) => POIDS_ECRAN[e]));
  const criteres: CritereBareme[] = ordre.map((e, i) => ({ sousQuestion: LETTRES[i], critere: [texte(CRITERE_ECRAN[e])], points: points[i] }));
  const erreurs: ErreurFrequente[] = [{ description: [texte("Un zéro de f′ déclaré extremum sans vérifier le changement de signe")], cout: "0 pt sur la nature de ce point" }];
  erreurs.push({ description: [texte("Valeur de l'extremum calculée avec f′ au lieu de f")], cout: "0 pt sur cette valeur" });
  if (exercice.type === "rationnelleAvecCE") erreurs.push({ description: [texte("Valeurs interdites oubliées dans le tableau de signes")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveEtudeLocale(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: irrationnelle(exercice) ? [[texte("Valeur exacte sous une autre forme équivalente (par exemple 4√2 − 4)")]] : [[texte("Fractions non simplifiées ou décimaux exacts équivalents")]],
  };
}

/** Niveau 1–7 : f′ (et f″) DONNÉES, démarche imposée par la consigne (méthode 0) ; aucun écran de
 * pure lecture (chaque écran calcule ou raisonne sur un signe) ; piège dans les DONNÉES : valeurs
 * interdites à porter dans le tableau (rationnelle avec CE). La racine double n'est pas notée en piège :
 * c'est le verdict de l'élève (nature du point). */
function criteresDifficulteEtudeLocale(exercice: ExerciceEtudeLocale): CriteresDifficulte {
  // Groupe à verdict « racines » (lot D) : la racine double (aucun extremum, un écran de moins) prend
  // le niveau et la durée des racines simples au même niveau — la feuille ne trahit pas le verdict.
  const reference = exercice.type === "polynomiale" && exercice.natureRacines === "double" ? referenceRacinesSimples(exercice) : exercice;
  return { ...etapesDuCorrige(correctionDetailleeEtudeLocale(reference), []), methode: 0, piege: exercice.type === "rationnelleAvecCE" ? 1 : 0 };
}

/** f(x) = 2x³ − 6x + d (zéros de f′ : −1 et 1 ; f″ s'annule en 0), même niveau et même option. */
function referenceRacinesSimples(e: ExerciceEtudeLocale): ExerciceEtudeLocale {
  const entier = (n: number) => ({ exact: true as const, valeur: { num: n, den: 1 } });
  return {
    type: "polynomiale",
    natureRacines: "simple",
    niveau: e.niveau,
    a: 2,
    b: 0,
    c: -6,
    d: e.type === "polynomiale" ? e.d : 1,
    racinesFPrime: [entier(-1), entier(1)],
    classificationFPrime: ["max", "min"],
    racinesFSeconde: e.niveau === "avance" ? [entier(0)] : [],
    classificationFSeconde: e.niveau === "avance" ? ["pi"] : [],
    exclusionsCE: [],
    deriveesACalculer: e.deriveesACalculer,
  };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionEtudeLocale(exercice: ExerciceEtudeLocale): BlocCorrection[] {
  return correctionDetailleeEtudeLocale(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationEtudeLocale: AdaptateurFeuilleExercices<ExerciceEtudeLocale> = {
  titreDocument: "Étude locale (extremums et points critiques) — Évaluation",
  nomFichierBase: "etude-locale-extremums",
  genererInstance: genererExerciceEtudeLocale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceEtudeLocale,
  construireCorrection: construireCorrectionEtudeLocale,
  criteresDifficulte: criteresDifficulteEtudeLocale,
  reponseBreve: reponseBreveEtudeLocale,
  correctionDetaillee: correctionDetailleeEtudeLocale,
  bareme: baremeEtudeLocale,
  enoncePapier: enoncePapierEtudeLocale,
  profilInstance: profilEtudeLocale,
  // Lot C (question 4) : plus de calculatrice indispensable — valeurs exactes en e ± √r.
  parametresAuChoix: PARAMETRES_ETUDE_LOCALE,
  groupesVerdict: [
    { id: "groupe_racines_base", label: "Polynomiale — racines simples ou double, tiré au hasard (base)", variantes: ["polynomiale-simple-base", "polynomiale-double-base"], formeCommune: true },
    { id: "groupe_racines_avance", label: "Polynomiale — racines simples ou double, tiré au hasard (avancé)", variantes: ["polynomiale-simple-avance", "polynomiale-double-avance"], formeCommune: true },
  ],
};
