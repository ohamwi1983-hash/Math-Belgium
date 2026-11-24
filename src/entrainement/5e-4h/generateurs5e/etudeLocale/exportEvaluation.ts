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
import { profilEtudeLocale } from "../profilsEvaluationDerivees28-30";

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

const LETTRES = "abcdefgh";

// ============================================================================
// Tableau de signes en LaTeX (réutilisé par 5gen30, `lectureGraphiqueDerivees/exportEvaluation.ts`).
// ============================================================================

export { tableauSignesEtudeLatex };

// ============================================================================
// Énoncé.
// ============================================================================

function entete(exercice: ExerciceEtudeLocale): FragmentConsigne[] {
  const avance = exercice.niveau === "avance";
  return [texte(avance ? "On considère la fonction f ; ses dérivées f' et f'' sont données : " : "On considère la fonction f ; sa dérivée f' est donnée : "), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))];
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
  const fPrime = "Recherche les zéros de f', étudie le signe de f' et les variations de f, puis détermine les éventuels extremums de f (abscisse, nature et valeur).";
  const fSeconde = exercice.niveau === "avance" ? " Étudie de même le signe de f'' et la concavité de f, puis détermine ses éventuels points d'inflexion (abscisse et valeur)." : "";
  const precision = irrationnelle(exercice) ? " Donne les abscisses en valeur exacte ; les valeurs de f peuvent être arrondies au centième." : " Donne des valeurs exactes.";
  return `${domaine}${fPrime}${fSeconde}${precision}`;
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

const POIDS_ECRAN: Record<EcranEtudeLocale, number> = { domaine: 0.5, resoudreFPrime: 2, tableauFPrime: 2, extremums: 1.5, resoudreFSeconde: 2, tableauFSeconde: 2, inflexions: 1.5 };

const CRITERE_ECRAN: Record<EcranEtudeLocale, string> = {
  domaine: "Domaine de définition",
  resoudreFPrime: "Zéros de f' (toutes les solutions)",
  tableauFPrime: "Tableau de signes de f', variations et nature de chaque zéro",
  extremums: "Valeur de f en chaque extremum",
  resoudreFSeconde: "Zéros de f''",
  tableauFSeconde: "Tableau de signes de f'', concavité et points d'inflexion",
  inflexions: "Valeur de f en chaque point d'inflexion",
};

/** Poids ramenés à un total de 4, au demi-point, aucun critère sous 0,5 (plus forts restes). */
export function repartirSurQuatre(poids: number[]): number[] {
  const total = poids.reduce((t, p) => t + p, 0);
  const brut = poids.map((p) => (p / total) * 8); // en demi-points
  const unites = brut.map((b) => Math.max(1, Math.floor(b)));
  let reste = 8 - unites.reduce((t, u) => t + u, 0);
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
  const erreurs: ErreurFrequente[] = [{ description: [texte("Un zéro de f' déclaré extremum sans vérifier le changement de signe")], cout: "0 pt sur la nature de ce point" }];
  erreurs.push({ description: [texte("Valeur de l'extremum calculée avec f' au lieu de f")], cout: "0 pt sur cette valeur" });
  if (exercice.type === "rationnelleAvecCE") erreurs.push({ description: [texte("Valeurs interdites oubliées dans le tableau de signes")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveEtudeLocale(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: irrationnelle(exercice) ? [[texte("Valeurs de f arrondies au centième")]] : [[texte("Fractions non simplifiées ou décimaux exacts équivalents")]],
  };
}

/** Niveau 1–7 : f′ (et f″) DONNÉES, démarche imposée par la consigne (méthode 0) ; aucun écran de
 * pure lecture (chaque écran calcule ou raisonne sur un signe) ; piège dans les DONNÉES : valeurs
 * interdites à porter dans le tableau (rationnelle avec CE). La racine double n'est pas notée en piège :
 * c'est le verdict de l'élève (nature du point). */
function criteresDifficulteEtudeLocale(exercice: ExerciceEtudeLocale): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeEtudeLocale(exercice), []), methode: 0, piege: exercice.type === "rationnelleAvecCE" ? 1 : 0 };
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
  calculatriceIndispensable: ["polynomiale-irrationnelle-base", "polynomiale-irrationnelle-avance"],
};
