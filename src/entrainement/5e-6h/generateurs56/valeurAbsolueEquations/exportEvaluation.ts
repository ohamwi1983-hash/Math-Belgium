import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import { ensembleXL } from "../communReels/ensemblesExacts";
import type { ExerciceAbsolue } from "./core/types";
import { consigne, consigneGenerale, enonceL, phases, reponse } from "./ui/format";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAbsolue } from "./index";
import type { IdVarianteAbsolue } from "./index";
import { correctionDetailleeAbsolue } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen18`. Énoncé papier = « Résous dans ℝ : … » (la traduction et les cas
 * passent dans le corrigé « comme au tableau », partagé avec l'appli). Regroupable (« Résous dans ℝ
 * chaque équation ou inéquation »).
 */

type E = ExerciceAbsolue;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [f(`S=${ensembleXL(e.solutions)}`)];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [t("Résous dans "), f("\\mathbb{R}"), t(" : "), f(enonceL(e)), t(".")], questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

/** Étapes lues sur le corrigé (2, ou 3 pour deuxAbsolues), méthode 1 (choisir la traduction selon le
 * signe de c et le symbole) ; piège CONSTANT par variante — equation / inequation : 1 (le signe de c
 * décide, verdict tiré au tiers : niveau et durée identiques dans les trois cas), deuxAbsolues : 0,
 * carre : 1 (solutions négatives) ; `sansCharge`. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeAbsolue(e)), methode: e.variante === "deuxAbsolues" ? 0 : 1, piege: e.variante === "deuxAbsolues" ? 0 : 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const criteres =
    e.variante === "deuxAbsolues"
      ? [
          { sousQuestion: "a", critere: [t("Cas A = B résolu : "), ...reponse(e, "egaux")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Cas A = −B résolu : "), ...reponse(e, "opposes")], points: 1.5 },
          { sousQuestion: "c", critere: [t("Ensemble des solutions : "), ...reponse(e, "ensemble")], points: 1 },
        ]
      : [
          { sousQuestion: "a", critere: [t("Traduction sans valeur absolue, selon le signe de c : "), ...reponse(e, "traduire")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Résolution et ensemble des solutions (crochets) : "), ...reponse(e, "ensemble")], points: 2.5 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [t("Signe de c ignoré (|A| = −3 traduit par A = 3 ou A = −3)")], cout: "0 pt sur la traduction" },
      { description: [t("Sens d'une inégalité non changé en divisant par un négatif")], cout: "−1" },
      { description: [t("Crochet faux (borne comprise ou exclue)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute écriture du même ensemble (accolades, intervalles, ℝ ∖ {…}, ∅) ; « x = … ou x = … » pour une équation")]],
  };
}

/** `forme` = variante + symbole (structure reproduite), JAMAIS le signe de c (verdict). Pas de `calcul`. */
export function profilAbsolue(e: E): ProfilInstance {
  const symbole = e.symbole === "=" ? "egal" : e.symbole === "<" || e.symbole === "\\leq" ? "petit" : "grand";
  return { casParticulier: null, forme: e.variante === "inequation" || e.variante === "carre" ? `${e.variante}|${symbole}` : e.variante };
}

export const adaptateurEvaluationAbsolue: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Équations et inéquations avec valeurs absolues — Évaluation",
  nomFichierBase: "valeurs-absolues-equations",
  genererInstance: genererExerciceAbsolue,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteAbsolue),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeAbsolue,
  bareme,
  enoncePapier,
  profilInstance: profilAbsolue,
};
