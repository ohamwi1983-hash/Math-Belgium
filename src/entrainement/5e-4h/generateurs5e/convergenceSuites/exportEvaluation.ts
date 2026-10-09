import type {
  ExerciceConvergenceArithmetique,
  ExerciceConvergenceGeometrique,
  ExerciceConvergenceQuelconque,
  ExerciceConvergenceSuite,
  VarianteConvergenceSuite,
} from "../../core5e/convergenceSuites.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneGenerale,
  consignePhase,
  formatExpressionDiviseeLatex,
  formatTermesDonneesLatex,
  libelleClassificationAttendue,
  texteAideNiveau1,
  texteAideNiveau2,
} from "../../ui5e/formatConvergenceSuites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConvergenceSuite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceConvergenceSuite>` pour 5gen16 (Convergence et
 * divergence des suites) — feuille d'évaluation.
 *
 * Mirroring de l'écran interactif (`App5gen16.tsx`, `moteur5e/typesConvergenceSuites.ts::ordreComplet`) :
 * les variantes "arithmetique"/"geometrique" n'ont qu'UN SEUL écran (classification catégorielle
 * directe) → UNE question ; "quelconque" en a DEUX ("diviserQuelconque" puis "classifierQuelconque")
 * → DEUX questions, lettrées a)/b) en correction (même convention que
 * `generateurs6e/equationsCyclometriques/exportEvaluation.ts`, `generateurs/caracteristiquesFonction/exportEvaluation.ts`).
 * Toutes les consignes réutilisent mot pour mot `consignePhase`/`consigneGenerale`
 * (`ui5e/formatConvergenceSuites.ts`, déjà la source de vérité affichée à l'écran par
 * `EtapeClassificationConvergence.tsx`/`EtapeDiviserQuelconque.tsx`) ; le corrigé réutilise
 * directement `libelleClassificationAttendue`/`formatExpressionDiviseeLatex`/`texteAideNiveau1`/
 * `texteAideNiveau2` — jamais redérivés ici. Seules les justifications de
 * "classificationArithmetique"/"classificationGeometrique" sont écrites localement
 * (`raisonArithmetiqueLatex`/`raisonGeometriqueLatex`, aucune fonction équivalente déjà exportée de
 * `formatConvergenceSuites.ts`) : elles instancient un fait mathématique général et constant
 * (r=0⟹constante donc converge vers u₁, r>0⟹+∞, r<0⟹-∞ ; q=1⟹u₁, |q|<1⟹0, q>1⟹±∞ selon signe(u₁),
 * q=-1⟹oscille sans converger, q<-1⟹oscille en divergeant) avec le r/q/u₁ RÉELS de l'instance —
 * jamais un recalcul de la classification elle-même, qui reste toujours lue sur
 * `exercice.classification`.
 */

function enteteConvergence(exercice: ExerciceConvergenceSuite) {
  return [texte(`${consigneGenerale(exercice)} `), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))];
}

/** Justification LaTeX pour "classificationArithmetique" — voir le commentaire de tête de fichier :
 * fait général instancié avec le `r` réel, la classification restant celle déjà tranchée par le
 * générateur (`exercice.classification`), jamais recalculée ici. */
function raisonArithmetiqueLatex(exercice: ExerciceConvergenceArithmetique): string {
  if (exercice.classification === "convergeVersU1") return `r = ${exercice.r} = 0 \\Rightarrow u_n \\text{ est constante : converge vers } u_1 = ${exercice.u1}.`;
  if (exercice.classification === "divergePlusInfini") return `r = ${exercice.r} > 0 \\Rightarrow u_n \\text{ diverge vers } +\\infty.`;
  return `r = ${exercice.r} < 0 \\Rightarrow u_n \\text{ diverge vers } -\\infty.`;
}

/** Justification LaTeX pour "classificationGeometrique" — même principe que ci-dessus ; réutilise
 * `formatTermesDonneesLatex(exercice)[1]` (déjà le "q=..." formaté en fraction irréductible par
 * `ui5e/formatConvergenceSuites.ts`, jamais reformaté indépendamment ici). */
function raisonGeometriqueLatex(exercice: ExerciceConvergenceGeometrique): string {
  const qLatex = formatTermesDonneesLatex(exercice)[1];
  switch (exercice.classification) {
    case "convergeVersU1":
      return `${qLatex} = 1 \\Rightarrow u_n \\text{ est constante : converge vers } u_1 = ${exercice.u1}.`;
    case "convergeVersZero":
      return `${qLatex}, \\ |q|<1 \\Rightarrow u_n \\to 0.`;
    case "divergePlusInfini":
      return `${qLatex} > 1 \\text{ et } u_1 = ${exercice.u1} > 0 \\Rightarrow u_n \\text{ diverge vers } +\\infty.`;
    case "divergeMoinsInfini":
      return `${qLatex} > 1 \\text{ et } u_1 = ${exercice.u1} < 0 \\Rightarrow u_n \\text{ diverge vers } -\\infty.`;
    case "oscilleNeConvergePas":
      return `${qLatex} = -1 \\Rightarrow u_n \\text{ oscille entre } u_1 \\text{ et } -u_1 \\text{ : ne converge pas.}`;
    case "oscilleDivergeSansLimite":
      return `${qLatex} < -1 \\Rightarrow u_n \\text{ oscille avec une amplitude croissante : diverge sans limite.}`;
  }
}

function construireEnonceConvergenceSuite(exercice: ExerciceConvergenceSuite): SectionExercice {
  if (exercice.variante === "quelconque") {
    return {
      enteteFragments: enteteConvergence(exercice),
      questions: [
        { consigne: [texte(consignePhase(exercice, "diviserQuelconque"))], reponse: { type: "lignes", nombre: 2 } },
        { consigne: [texte(consignePhase(exercice, "classifierQuelconque"))], reponse: { type: "lignes", nombre: 3 } },
      ],
    };
  }
  const phase = exercice.variante === "arithmetique" ? "classificationArithmetique" : "classificationGeometrique";
  return {
    enteteFragments: enteteConvergence(exercice),
    questions: [{ consigne: [texte(consignePhase(exercice, phase))], reponse: { type: "lignes", nombre: 2 } }],
  };
}

function construireCorrectionConvergenceSuite(exercice: ExerciceConvergenceSuite): BlocCorrection[] {
  if (exercice.variante === "arithmetique") {
    return [
      {
        type: "paragraphe",
        fragments: [texte(`Réponse : ${libelleClassificationAttendue(exercice, "classificationArithmetique")}. `), latex(raisonArithmetiqueLatex(exercice))],
      },
    ];
  }
  if (exercice.variante === "geometrique") {
    return [
      {
        type: "paragraphe",
        fragments: [texte(`Réponse : ${libelleClassificationAttendue(exercice, "classificationGeometrique")}. `), latex(raisonGeometriqueLatex(exercice))],
      },
    ];
  }

  const exo: ExerciceConvergenceQuelconque = exercice;
  const blocA: BlocCorrection = { type: "paragraphe", fragments: [texte("a) "), latex(formatExpressionDiviseeLatex(exo))] };

  const labelB = libelleClassificationAttendue(exo, "classifierQuelconque");
  const justificationB = exo.classification === "limiteValeur" ? texteAideNiveau2(exo, "classifierQuelconque") : texteAideNiveau1(exo, "classifierQuelconque");
  const blocB: BlocCorrection = { type: "paragraphe", fragments: [texte(`b) Réponse : ${labelB}. `), latex(justificationB)] };

  return [blocA, blocB];
}

export const adaptateurEvaluationConvergenceSuites: AdaptateurFeuilleExercices<ExerciceConvergenceSuite> = {
  titreDocument: "Convergence et divergence des suites — Évaluation",
  nomFichierBase: "convergence-suites",
  genererInstance: genererExerciceConvergenceSuite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteConvergenceSuite),
  construireEnonce: construireEnonceConvergenceSuite,
  construireCorrection: construireCorrectionConvergenceSuite,
  // NON regroupable : la variante "quelconque" produit 2 questions par instance (les 2 autres n'en
  // ont qu'1), condition explicitement exclue par `AdaptateurFeuilleExercices.regroupable`.
};
