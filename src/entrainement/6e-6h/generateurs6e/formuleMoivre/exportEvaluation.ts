import type { ExerciceFormuleMoivre } from "../../core6e/formuleMoivre.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatFormuleMoivre";
import { phasesPourExercice } from "../../moteur6e/typesFormuleMoivre";
import type { PhaseFormuleMoivre } from "../../moteur6e/typesFormuleMoivre";
import { profilFormuleMoivre } from "../profilsEvaluationComplexes37-39";
import { correctionDetailleeFormuleMoivre, piegeEtape } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormuleMoivre } from "./index";
import type { IdVarianteFormuleMoivre } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormuleMoivre>` pour `6gen38` (Formule de Moivre :
 * développer cos(nx) et sin(nx)) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : « Exprime cos(4x) et sin(4x) en fonction de cos(x) et sin(x)… » (ou cos(nx), ou
 *   sin(nx)/sin(x), en fonction de cos(x) seulement), avec la formule de Moivre rappelée ; les trois
 *   écrans (développement, séparation réel/imaginaire, formules finales) deviennent les étapes du
 *   corrigé.
 * - Corrigé : coefficients du triangle de Pascal, puissances de i, puis la substitution
 *   sin²(x) = 1 − cos²(x) écrite terme à terme quand la cible est en cos(x) seul.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

const nx = (e: ExerciceFormuleMoivre) => `${e.n}x`;

/** Une ligne du récapitulatif de l'écran, sans le libellé `\text{…}` ni la ponctuation finale. */
function sansTexte(s: string): string {
  return s.replace(/^\\text\{[^}]*\}/, "").replace(/\\text\{ ;\}$/, "");
}

/** Somme longue (développement de l'étape 1) coupée en morceaux de trois termes : la formule passe à
 * la ligne entre deux morceaux au lieu de déborder. Les termes de l'étape 1 sont tous positifs
 * (jointure par « + »). */
function sommeCoupee(debut: string, termes: string[]): FragmentConsigne[] {
  const morceaux: FragmentConsigne[] = [];
  for (let i = 0; i < termes.length; i += 3) {
    const bloc = termes.slice(i, i + 3).join("+");
    morceaux.push(f(i === 0 ? `${debut}${bloc}` : `+${bloc}`));
    if (i + 3 < termes.length) morceaux.push(t(" "));
  }
  return morceaux;
}

function reponseFinale(e: ExerciceFormuleMoivre): FragmentConsigne[] {
  const lignes = formatReponseAttenduePhaseLatex(e, "ecran3").map(sansTexte);
  return lignes.flatMap((l, i) => (i === 0 ? [f(l)] : [t(" ; "), f(l)]));
}

function reponse(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): FragmentConsigne[] {
  if (phase === "ecran1") return sommeCoupee(`(\\cos(x)+i\\sin(x))^{${e.n}}=`, formatReponseAttenduePhaseLatex(e, "ecran1")[0].split("+"));
  if (phase === "ecran2") {
    const [reels, imaginaires] = formatReponseAttenduePhaseLatex(e, "ecran2").map(sansTexte);
    return [t("termes réels : "), f(reels), t(" ; termes imaginaires : "), f(imaginaires)];
  }
  return reponseFinale(e);
}

// ============================================================================
// Énoncé papier et étapes.
// ============================================================================

function entetePapier(e: ExerciceFormuleMoivre): FragmentConsigne[] {
  const consigne = consigneGenerale(e).map((fr, i) => (i === 0 && fr.type === "texte" ? { ...fr, valeur: fr.valeur.replace(/^Formule de Moivre : exprime /, "Exprime ") } : fr));
  return [...consigne, t(" On rappelle la formule de Moivre : "), f(`(\\cos(x)+i\\sin(x))^{${e.n}}=\\cos(${nx(e)})+i\\sin(${nx(e)})`), t(".")];
}

function titreEtape(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): FragmentConsigne[] {
  if (phase === "ecran1") return consigneEcran(e, phase);
  if (phase === "ecran2") {
    return [
      t("Simplifie chaque puissance de i dans le développement obtenu à l'étape 1 ("),
      f("i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i"),
      t(", période 4), puis sépare les termes d'indice k pair (réels) des termes d'indice k impair (imaginaires)."),
    ];
  }
  if (e.cible === "cosSeul") return [t("Écris "), f(`\\cos(${nx(e)})`), t(" en fonction de "), f("\\cos(x)"), t(" seulement, grâce à "), f("\\sin^2(x)=1-\\cos^2(x)"), t(".")];
  if (e.cible === "sinSurSin") return [t("Écris "), f(`\\dfrac{\\sin(${nx(e)})}{\\sin(x)}`), t(" en fonction de "), f("\\cos(x)"), t(" seulement, grâce à "), f("\\sin^2(x)=1-\\cos^2(x)"), t(".")];
  return [t("Identifie les parties réelle et imaginaire : écris "), f(`\\cos(${nx(e)})`), t(" et "), f(`\\sin(${nx(e)})`), t(".")];
}

function construireEnonce(e: ExerciceFormuleMoivre): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceFormuleMoivre): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function reponseBreve(e: ExerciceFormuleMoivre): FragmentConsigne[] {
  return reponseFinale(e);
}

function enoncePapier(e: ExerciceFormuleMoivre): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeFormuleMoivre;

function difficulte(e: ExerciceFormuleMoivre): 1 | 2 | 3 {
  return e.n >= 5 || e.cible !== "standard" ? 3 : 2;
}

function bareme(e: ExerciceFormuleMoivre): BaremeExercice {
  const finales = formatReponseAttenduePhaseLatex(e, "ecran3").map(sansTexte);
  const criteresFinaux =
    e.cible === "standard"
      ? [
          { sousQuestion: "c", critere: [f(finales[0])], points: 1 },
          { sousQuestion: "c", critere: [f(finales[1])], points: 1 },
        ]
      : [{ sousQuestion: "c", critere: [f(finales[0])], points: 2 }];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Développement par le binôme de Newton (coefficients et puissances)")], points: 1 },
      { sousQuestion: "b", critere: [t("Puissances de i simplifiées, termes réels et imaginaires séparés")], points: 1 },
      ...criteresFinaux,
    ],
    erreursFrequentes: phasesPourExercice(e).map((phase) => ({ description: piegeEtape(e, phase), cout: "−1" })),
    reponsesAcceptees: [[t("Termes écrits dans un autre ordre"), ...(e.cible === "standard" ? [] : [t(" ; polynôme non ordonné mais réduit")])]],
  };
}

export const adaptateurEvaluationFormuleMoivre: AdaptateurFeuilleExercices<ExerciceFormuleMoivre> = {
  titreDocument: "Formule de Moivre — Évaluation",
  nomFichierBase: "formule-moivre",
  genererInstance: genererExerciceFormuleMoivre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteFormuleMoivre),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilFormuleMoivre,
};
