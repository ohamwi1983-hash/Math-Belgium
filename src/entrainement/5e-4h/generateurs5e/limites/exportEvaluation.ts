import type { ExerciceLimite } from "../../core5e/limites.types";
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
import {
  consignePhase,
  formatBlocDonneesLatex,
  formatReponseAttenduePhaseLatex,
} from "../../ui5e/formatLimites";
import { ordreComplet, type PhaseLimite } from "../../moteur5e/typesLimites";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeLimite, lettrePhaseLimite } from "./corrigeDetaille";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimite } from "./index";
import { LIBELLE_CAS_LIMITES, profilLimite } from "../profilsEvaluationLimites20-21";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimite>` pour 5gen20 (Limites, reconnaissance et
 * calcul) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la limite (bloc display `\lim_{x\to…}`) et la consigne globale « Détermine cette
 * limite en justifiant ta démarche ». Les écrans du générateur (reconnaître la forme, factoriser,
 * étudier les signes, terme dominant…) sont des étapes d'APPRENTISSAGE : ils passent dans le corrigé
 * (« Étape n — consigne », une étape par phase de `ordreComplet`, mêmes consignes que l'écran).
 *
 * Corrigé détaillé « comme au tableau » : `./corrigeDetaille.ts` (partagé avec `App5gen20.tsx`, une
 * lettre par écran de `ordreComplet`) ; réponses attendues de l'écran (`formatReponseAttenduePhaseLatex`)
 * pour la réponse brève et le barème.
 *
 * `regroupable` : non — le bloc `\lim_{x\to a}` a besoin du mode display, que seul le chemin non
 * regroupé conserve (en-tête formé d'une formule seule).
 */

const LETTRES = "abcdefgh";

function etapes(exercice: ExerciceLimite): PhaseLimite[] {
  return ordreComplet(exercice);
}

function lettre(exercice: ExerciceLimite, phase: PhaseLimite): string {
  return LETTRES[etapes(exercice).indexOf(phase)] ?? "a";
}

function construireEnonceLimite(exercice: ExerciceLimite): SectionExercice {
  return {
    enteteFragments: [latex(formatBlocDonneesLatex(exercice))],
    questions: etapes(exercice).map((phase) => ({ consigne: [texte(consignePhase(exercice, phase))] })),
  };
}

const CONSIGNE_PAPIER = "Détermine cette limite en justifiant ta démarche.";

function enoncePapierLimite(exercice: ExerciceLimite): EnoncePapier {
  return {
    section: { enteteFragments: [latex(formatBlocDonneesLatex(exercice))], questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [etapes(exercice).map((p) => lettre(exercice, p))],
  };
}

// ---------------------------------------------------------------------------------------------
// Valeurs de substitution.
// ---------------------------------------------------------------------------------------------

/** Dernière réponse attendue de l'écran (la valeur de la limite), écrite avec la limite de l'énoncé
 * pour se lire seule : « \lim_{x\to 2} \dfrac{…}{…}=\dfrac{1}{2} ». */
function limiteFinaleLatex(exercice: ExerciceLimite): string {
  const ordre = etapes(exercice);
  const valeur = formatReponseAttenduePhaseLatex(exercice, ordre[ordre.length - 1])[0].replace(/^\\lim=/, "");
  return `${formatBlocDonneesLatex(exercice)}=${valeur}`;
}

function reponseBreveLimite(exercice: ExerciceLimite): FragmentConsigne[] {
  if (exercice.famille === "limiteInfiniePoint" && exercice.sousCas === "racineSimple") {
    const [gauche, droite] = formatReponseAttenduePhaseLatex(exercice, "limitesGaucheDroite");
    return [latex(gauche), texte(" et "), latex(droite), texte(" : la limite n'existe pas.")];
  }
  return [latex(limiteFinaleLatex(exercice))];
}

// ---------------------------------------------------------------------------------------------
// Barème, difficulté.
// ---------------------------------------------------------------------------------------------

function baremeLimite(exercice: ExerciceLimite): BaremeExercice {
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  let criteres: CritereBareme[];
  const erreurs: ErreurFrequente[] = [];
  const acceptees: FragmentConsigne[][] = [];
  switch (exercice.famille) {
    case "limiteReelle":
      criteres = [c("a", "Dénominateur non nul vérifié (substitution directe permise)", 1), c("a", "Numérateur et dénominateur évalués", 1.5), c("a", "Limite exacte et simplifiée", 1.5)];
      erreurs.push({ description: [texte("Conclure sans vérifier que le dénominateur ne s'annule pas")], cout: "−1" });
      acceptees.push([texte("Valeur décimale arrondie au centième")]);
      break;
    case "formeIndeterminee":
      criteres = [c("a", "Forme 0/0 reconnue", 1), c("b", "Numérateur et dénominateur factorisés", 1.5), c("c", "Facteur commun simplifié et limite exacte", 1.5)];
      erreurs.push({ description: [texte("Écrire « limite = 0/0 » ou « la limite n'existe pas »")], cout: "0 pt sur la conclusion" });
      break;
    case "limiteInfiniePoint":
      criteres =
        exercice.sousCas === "racineSimple"
          ? [c("a", "Forme k/0 reconnue", 0.5), c("b", "Dénominateur factorisé", 1), c("c", "Limites à gauche et à droite (signes justifiés)", 1.5), c("d", "Conclusion : la limite n'existe pas", 1)]
          : [c("a", "Forme k/0 reconnue", 0.5), c("b", "Dénominateur factorisé (racine double)", 1), c("c", "Signe du numérateur et du dénominateur des deux côtés", 1.5), c("d", "Conclusion : limite infinie et son signe", 1)];
      erreurs.push({ description: [texte("Oublier une des deux limites latérales, ou se tromper de signe")], cout: "−0,5 par limite" });
      if (exercice.sousCas === "racineDouble") erreurs.push({ description: [texte("Conclure « n'existe pas » alors que les deux limites sont égales")], cout: "0 pt sur la conclusion" });
      break;
    case "limiteInfini":
      criteres =
        exercice.sousCas === "degresEgaux"
          ? [c("a", "Forme ∞/∞ reconnue", 0.5), c("b", "Termes dominants du numérateur et du dénominateur", 1.5), c("c", "Rapport des coefficients dominants : limite exacte", 2)]
          : [c("a", "Forme ∞/∞ reconnue", 0.5), c("b", "Termes dominants du numérateur et du dénominateur", 1), c("c", "Rapport des termes dominants simplifié", 1.5), c("d", "Conclusion (valeur ou infini et son signe)", 1)];
      erreurs.push({ description: [texte("Comparer les termes constants au lieu des termes de plus haut degré")], cout: "0 pt sur b)" });
      if (exercice.sousCas === "numerateurPlusGrand") erreurs.push({ description: [texte("Signe de l'infini sans tenir compte du sens (puissance impaire de x)")], cout: "−0,5" });
      break;
  }
  return { reponseFinale: reponseBreveLimite(exercice), criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

/** Niveau 1–7 (`.claude/rules/feuilles-evaluations.md`, « Niveau de difficulté et durée ») : la
 * conclusion de la forme k/0 (limites latérales égales ou non) est un écran de pure décision ;
 * méthode 0 pour la substitution directe (imposée), 1 sinon (reconnaître la forme et choisir la
 * technique) ; piège dans les DONNÉES : forme k/0 (constant dans les deux sous-cas : le nombre de
 * limites est le verdict), puissance impaire en −∞ quand la limite est infinie. */
function criteresDifficulteLimite(exercice: ExerciceLimite): CriteresDifficulte {
  const lecture = exercice.famille === "limiteInfiniePoint" ? [lettrePhaseLimite(exercice, "conclureLimite")] : [];
  const piege =
    exercice.famille === "limiteInfiniePoint" ||
    (exercice.famille === "limiteInfini" && exercice.sousCas === "numerateurPlusGrand" && exercice.direction === "moins" && exercice.degreResultat % 2 === 1)
      ? 1
      : 0;
  return { ...etapesDuCorrige(correctionDetailleeLimite(exercice), lecture), methode: exercice.famille === "limiteReelle" ? 0 : 1, piege };
}

/** Ancien corrigé (repli, documents Word) : les étapes du corrigé détaillé, en paragraphes. */
function construireCorrectionLimite(exercice: ExerciceLimite): BlocCorrection[] {
  return correctionDetailleeLimite(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationLimites: AdaptateurFeuilleExercices<ExerciceLimite> = {
  titreDocument: "Limites, reconnaissance et calcul — Évaluation",
  nomFichierBase: "limites",
  genererInstance: genererExerciceLimite,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceLimite,
  construireCorrection: construireCorrectionLimite,
  criteresDifficulte: criteresDifficulteLimite,
  reponseBreve: reponseBreveLimite,
  correctionDetaillee: correctionDetailleeLimite,
  bareme: baremeLimite,
  enoncePapier: enoncePapierLimite,
  profilInstance: profilLimite,
  libelleCasParticulier: LIBELLE_CAS_LIMITES,
};
