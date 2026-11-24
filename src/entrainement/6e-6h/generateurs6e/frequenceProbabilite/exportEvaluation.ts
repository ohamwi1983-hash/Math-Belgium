import type { ExerciceFrequenceProbabilite } from "../../core6e/frequenceProbabilite.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeFrequenceProbabilite } from "./corrigeDetaille";
import {
  conclusionTexte,
  ecartsPourcent,
  entierLatex,
  entierTexte,
  reponseAttendueFragments,
  texteRegleDecision,
} from "../../ui6e/formatFrequenceProbabilite";
import { phasesPourExercice } from "../../moteur6e/typesFrequenceProbabilite";
import type { PhaseFrequenceProbabilite } from "../../moteur6e/typesFrequenceProbabilite";
import { effectifAttendu } from "../../moteur6e/verificationFrequenceProbabilite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFrequenceProbabilite } from "./index";
import type { IdVarianteFrequenceProbabilite } from "./index";
import { profilFrequenceProbabilite } from "../profilsEvaluationFrequenceProbabilite";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFrequenceProbabilite>` de `6gen75` « Fréquence et
 * probabilité » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `enoncePapier` : données (tableau des effectifs en tableau KaTeX, règle de décision en prose avec
 *   tous ses paliers) + consigne globale ; les VRAIES questions restent distinctes (A : le dé est-il
 *   équilibré ? puis l'effectif attendu ; B : quel modèle ? puis l'effectif attendu ; C : modèle a
 *   priori ? l'affirmation ? l'effectif attendu). Le verdict n'est jamais annoncé : la question de
 *   l'effectif attendu dit « la probabilité du modèle s'il est retenu, sinon la fréquence ».
 * - Corrigé détaillé : « Étape n — consigne » par écran, Méthode / Calcul / Conclusion / Piège ;
 *   figures (`figureHtml`) : grille des 36 couples surlignée (B, étape 1), diagramme des fréquences
 *   face au modèle (étape 3).
 * - Version aménagée : même énoncé (pas de champ dédié, décision de l'utilisateur).
 */

const LETTRES = "abcd";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] {
  return reponseAttendueFragments(e, phase).map((fr) => (fr.type === "texte" ? t(fr.valeur) : f(fr.valeur)));
}

// ---------------------------------------------------------------------------------------------
// Énoncé papier
// ---------------------------------------------------------------------------------------------

function tableauLatex(entete: string, colonnes: string[], valeurs: number[]): string {
  const cols = "|c".repeat(colonnes.length + 1) + "|";
  return `\\begin{array}{${cols}}\\hline \\text{${entete}} & ${colonnes.join(" & ")} \\\\ \\hline \\text{Effectif} & ${valeurs.map(entierLatex).join(" & ")} \\\\ \\hline\\end{array}`;
}

function regle(): FragmentConsigne[] {
  return [
    t(" Règle de décision : l'écart entre une fréquence "),
    f("f"),
    t(" et une probabilité "),
    f("p"),
    t(" est jugé significatif quand l'écart relatif "),
    f("\\dfrac{|f-p|}{p}"),
    t(` dépasse ${texteRegleDecision()}.`),
  ];
}

function entetePapier(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  const n = f(`n=${entierLatex(e.n)}`);
  switch (e.famille) {
    case "A":
      return [
        t("On lance un dé à six faces "),
        n,
        t(" fois et on note la face obtenue. Effectif de chaque face : "),
        f(tableauLatex("Face", ["1", "2", "3", "4", "5", "6"], e.effectifs)),
        t(`. On étudie l'événement E : « ${e.evenement.libelle} ».`),
        ...regle(),
      ];
    case "B":
      return [
        t("On lance deux dés à six faces "),
        n,
        t(" fois et on note à chaque fois la somme des deux faces. Effectif de chaque somme : "),
        f(tableauLatex("Somme", ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], e.effectifs)),
        t(`. On étudie l'événement E : « ${e.evenement.libelle} ».`),
        ...regle(),
      ];
    case "C":
      return [
        t(`On lance ${e.objet.nom} `),
        n,
        t(
          ` fois : ${e.objet.sujet} est retombé${e.objet.sujet.startsWith("la ") ? "e" : ""} ${e.objet.issue} ${entierTexte(e.effectif)} fois, et ${e.objet.autreIssue} ${entierTexte(e.n - e.effectif)} fois. On note E l'événement « ${e.objet.sujet} retombe ${e.objet.issue} ». Un camarade affirme que ${e.objet.sujet} retombe ${e.objet.issue} ${e.affirmation.texte}.`,
        ),
        ...regle(),
      ];
  }
}

function questionEffectif(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  const N = f(`N=${entierLatex(e.nouveauxEssais)}`);
  if (e.famille === "C") return [t("En estimant la probabilité de E par la fréquence observée (fraction exacte, sans arrondi), combien de fois peut-on s'attendre à ce que E se réalise sur "), N, t(" nouveaux lancers ?")];
  return [
    t("Combien de fois peut-on s'attendre à ce que E se réalise sur "),
    N,
    t(` nouveaux lancers ? Utilise la probabilité ${e.famille === "A" ? "d'un dé équilibré si ce modèle" : "du modèle de la grille s'il"} est retenu, sinon la fréquence observée (fraction exacte, sans arrondi).`),
  ];
}

function questionsPapier(e: ExerciceFrequenceProbabilite): QuestionExercice[] {
  switch (e.famille) {
    case "A":
      return [
        { consigne: [t("Ce dé peut-il être considéré comme équilibré ? Justifie en comparant la fréquence observée de E à sa probabilité pour un dé équilibré, à l'aide de la règle de décision.")] },
        { consigne: questionEffectif(e) },
      ];
    case "B":
      return [
        {
          consigne: [
            t("Calcule la probabilité de E si les deux dés sont équilibrés, puis, à l'aide de la règle de décision, dis si les résultats confirment ce modèle ou plutôt celui des 11 sommes équiprobables (probabilité "),
            f("\\dfrac{1}{11}"),
            t(" pour chaque somme)."),
          ],
        },
        { consigne: questionEffectif(e) },
      ];
    case "C":
      return [
        { consigne: [t("Peut-on calculer a priori la probabilité de E ? Justifie.")] },
        { consigne: [t("L'affirmation du camarade est-elle compatible avec les résultats ? Justifie à l'aide de la fréquence observée de E et de la règle de décision.")] },
        { consigne: questionEffectif(e) },
      ];
  }
}

function etapesParQuestion(e: ExerciceFrequenceProbabilite): string[][] {
  return e.famille === "C" ? [["a"], ["b", "c"], ["d"]] : [["a", "b", "c"], ["d"]];
}

/** Titre d'étape (corrigé « Étape n — … » et ancien énoncé une-question-par-écran) : consigne
 * d'écran sans tournure d'écran, et sans annoncer le verdict de l'étape 3 à l'étape 4. */
function titreEtape(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] {
  switch (phase) {
    case "ecran1":
      if (e.famille === "A") return [t("Si le dé est équilibré, quelle est la probabilité de E ?")];
      if (e.famille === "B") return [t("Si les deux dés sont équilibrés, quelle est la probabilité de E ?")];
      return [t("Peut-on calculer a priori la probabilité de E ?")];
    case "ecran2":
      return [t("Calcule la fréquence observée "), f("f"), t(" de E.")];
    case "ecran3":
      if (e.famille === "A") return [t("Compare "), f("f"), t(" à la probabilité d'un dé équilibré à l'aide de la règle de décision, puis conclus.")];
      if (e.famille === "B") return [t("Applique la règle de décision au modèle de la grille, puis à celui des 11 sommes équiprobables : que confirment les résultats ?")];
      return [t("Applique la règle de décision à la valeur affirmée : que conclut-on ?")];
    case "ecran4":
      return questionEffectif(e);
  }
}

function construireEnonce(e: ExerciceFrequenceProbabilite): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceFrequenceProbabilite): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function reponseBreveQuestions(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  const ecarts = ecartsPourcent(e);
  const detail = f(`\\dfrac{|f-p|}{p}\\approx ${ecarts.modele}\\,\\%${ecarts.modele <= ecarts.seuil ? "\\leqslant" : ">"}${ecarts.seuil}\\,\\%`);
  const effectif = f(entierLatex(effectifAttendu(e)));
  if (e.famille === "C") return [t("a) Non (issues non équiprobables) ; b) "), ...reponse(e, "ecran2"), t(", "), detail, t(` : ${conclusionTexte(e)} ; c) `), effectif];
  return [t("a) "), ...reponse(e, "ecran1"), t(", "), ...reponse(e, "ecran2"), t(", "), detail, t(` : ${conclusionTexte(e)} ; b) `), effectif];
}

function enoncePapier(e: ExerciceFrequenceProbabilite): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: questionsPapier(e) }, etapesParQuestion: etapesParQuestion(e), reponseBreve: reponseBreveQuestions(e) };
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------








/** Niveau (`niveauDifficulte.ts`) : une étape par écran ; l'écran 1 de C (« peut-on calculer a priori
 * la probabilité ? ») est une lecture / décision sans calcul ; méthode 1 ; piège dans les données en
 * B seulement (le modèle des 11 sommes équiprobables est proposé à côté de celui de la grille) ;
 * nombres 1 (calculatrice : fréquence, écart relatif). Étape de la règle de décision sans charge :
 * niveau et durée constants quel que soit le verdict. */
function criteresDifficulte(e: ExerciceFrequenceProbabilite): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeFrequenceProbabilite(e), e.famille === "C" ? ["a"] : []);
  return { ...base, lettresSansCharge: [...(base.lettresSansCharge ?? []), "c"], methode: 1, piege: e.famille === "B" ? 1 : 0, nombres: 1 };
}

function reponseBreve(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  return reponseBreveQuestions(e);
}

/** Poids par étape (somme 4, aucun critère sous 0,5). */
function poids(e: ExerciceFrequenceProbabilite): number[] {
  return e.famille === "A" ? [0.5, 1, 1.5, 1] : [1, 0.5, 1.5, 1];
}

function bareme(e: ExerciceFrequenceProbabilite): BaremeExercice {
  const phases = phasesPourExercice(e);
  const p = poids(e);
  const erreurs = correctionDetailleeFrequenceProbabilite(e)
    .filter((l) => l.type === "piege")
    .map((l) => l.fragments);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(e, phase), points: p[i] })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [
      [t("Probabilité et fréquence : fraction, décimal correctement arrondi avec au moins deux chiffres significatifs, ou pourcentage")],
      [t("Effectif attendu : à une unité près")],
      [t("Conclusion de l'étape 3 : seulement si elle s'appuie sur l'écart relatif comparé au seuil")],
    ],
  };
}

export const adaptateurEvaluationFrequenceProbabilite: AdaptateurFeuilleExercices<ExerciceFrequenceProbabilite> = {
  titreDocument: "Fréquence et probabilité — Évaluation",
  nomFichierBase: "frequence-probabilite",
  genererInstance: genererExerciceFrequenceProbabilite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteFrequenceProbabilite),
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee: correctionDetailleeFrequenceProbabilite,
  criteresDifficulte,
  bareme,
  enoncePapier,
  profilInstance: profilFrequenceProbabilite,
  calculatriceIndispensable: true,
};
