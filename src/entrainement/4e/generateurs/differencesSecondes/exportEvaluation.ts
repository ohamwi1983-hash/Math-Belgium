import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, GroupeVerdict, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceDifferences } from "../../core/differencesSecondes.types";
import { consignePapier, consignesEcrans, enonceFragments, reponseComplete, tableauSvg, verdict } from "../../ui/formatDifferencesSecondes";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDifferences } from "./index";
import { profilDifferences } from "./profil";
import { correctionDetailleeDifferences } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen124 « Premier ou second degré ? Différences
 * secondes ». Énoncé papier = le tableau de valeurs (SVG) + l'énoncé + la consigne globale ; les
 * écrans deviennent les étapes du corrigé (a différences premières, b secondes avec le tableau en
 * escalier, c verdict, d expression — absente pour « ni l'un ni l'autre »).
 */

type E = ExerciceDifferences;

function tableauHtml(e: E): string {
  return `<div class="paragraphe" style="text-align:center">${tableauSvg(e, 0)}</div>`;
}

function lettres(e: E): string[] {
  return verdict(e) === "aucun" ? ["a", "b", "c"] : ["a", "b", "c", "d"];
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(), enteteHtml: tableauHtml(e), questions: consignesEcrans(e).slice(0, lettres(e).length).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: enonceFragments(), enteteHtml: tableauHtml(e), questions: [{ consigne: consignePapier() }] }, etapesParQuestion: [lettres(e)] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseComplete(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Niveau et durée CONSTANTS dans le groupe à verdict (ils ne doivent pas trahir le verdict, comme
 * gen74) : quatre étapes qui transforment (différences, différences secondes, verdict, expression),
 * méthode imposée, aucun piège dans les données (le premier degré ou la valeur décalée sont des
 * verdicts), nombres exacts. */
function criteresDifficulte(): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 0, methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const v = verdict(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres:
      v === "aucun"
        ? [
            { sousQuestion: "a", critere: [texte("Différences premières correctes")], points: 1 },
            { sousQuestion: "b", critere: [texte("Différences secondes correctes")], points: 1.5 },
            { sousQuestion: "c", critere: [texte("Verdict justifié par deux différences secondes différentes")], points: 1.5 },
          ]
        : [
            { sousQuestion: "a", critere: [texte("Différences premières correctes")], points: 1 },
            { sousQuestion: "b", critere: [texte("Différences secondes correctes")], points: 1 },
            { sousQuestion: "c", critere: [texte("Verdict justifié")], points: 0.5 },
            { sousQuestion: "d", critere: v === "second" ? [texte("Coefficients "), latex("a"), texte(", "), latex("b"), texte(", "), latex("c"), texte(" et expression de "), latex("f")] : [texte("Coefficients "), latex("m"), texte(", "), latex("p"), texte(" et expression de "), latex("f")], points: 1.5 },
          ],
    erreursFrequentes: [
      { description: [texte("Soustractions dans le mauvais sens (valeur de gauche moins celle de droite)")], cout: "−0,5 sur a) et b)" },
      ...(v === "second" ? [{ description: [texte("Différence seconde prise pour "), latex("a"), texte(" au lieu de "), latex("2a")], cout: "−1 sur d)" }] : []),
      ...(v === "premier" ? [{ description: [texte("Verdict « second degré » parce que les différences secondes sont constantes (nulles)")], cout: "0 pt sur c)" }] : []),
      ...(v === "aucun" ? [{ description: [texte("Verdict tiré des deux premières différences secondes seulement")], cout: "0 pt sur c)" }] : []),
    ],
    reponsesAcceptees: [[texte("Différences écrites sous le tableau (en escalier) au lieu d'être listées")]],
  };
}

const GROUPES_VERDICT: GroupeVerdict[] = [{ id: "groupe_degre", label: "Degré à reconnaître (au hasard : premier, second, ni l'un ni l'autre)", variantes: ["secondEntier", "secondDemi", "premier", "aucun"] }];

export const adaptateurEvaluationDifferences: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilDifferences,
  titreDocument: "Premier ou second degré ? Différences secondes — Évaluation",
  nomFichierBase: "differences-secondes",
  genererInstance: genererExerciceDifferences,
  catalogueVariantes: CATALOGUE_VARIANTES,
  groupesVerdict: GROUPES_VERDICT,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDifferences,
  bareme,
  enoncePapier,
};
