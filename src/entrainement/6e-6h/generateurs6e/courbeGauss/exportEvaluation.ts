import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceCG } from "../../core6e/courbeGauss";
import { phases } from "../../core6e/courbeGauss";
import { consigne, figureAire, figureQuatre, question, reponse, SITUATION_AIRE, situationRegle } from "../../ui6e/formatCourbeGauss";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCG } from "./index";
import { correctionDetailleeCG } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen117` « Courbe de Gauss : aires et règle empirique ». Énoncé papier : aires
 * → « 𝒩(0 ; 1) » + la figure (une cloche, ou quatre cloches A–D, SVG sans identifiant) + la question en
 * deux temps (quelle probabilité / quelle figure, puis l'écriture avec Φ) ; règle empirique → contexte
 * + X ∼ 𝒩(μ ; σ) + la question. Les deux écrans sont les étapes a, b du corrigé ; la réponse
 * graphique (bonne figure, zone de la règle) est dans le corrigé (`figureHtml`). Aucune valeur de Φ à
 * lire : pas de table jointe. Le type d'aire est un verdict tiré dans chaque série (jamais dans
 * `forme`, qui ne dit que la variante ou la question de la règle) ; niveau et durée constants dans un
 * verdict (lecture a, transformation b, méthode 0, piège = borne négative tirée indépendamment).
 * Aucun cas particulier, aucun `calcul`. Regroupement écarté : figure ou contexte propre à l'instance.
 */

type E = ExerciceCG;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

const aires = (e: E) => e.variante === "aire" || e.variante === "figure";

function figure(e: E): string | undefined {
  if (e.variante === "aire") return figureAire(e.aire, 300);
  if (e.variante === "figure") return figureQuatre(e);
  return undefined;
}

function construireEnonce(e: E): SectionExercice {
  const fig = figure(e);
  return {
    enteteFragments: fr(aires(e) ? [...SITUATION_AIRE, { type: "texte", valeur: " " }, ...question(e)] : [...situationRegle(e), { type: "texte", valeur: " " }, ...question(e)]),
    ...(fig ? { enteteHtml: fig } : {}),
    questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })),
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const [p1, p2] = phases(e);
  return aires(e) ? [...fr(reponse(e, p1!)), t(" ; "), ...fr(reponse(e, p2!))] : fr(reponse(e, "pourcent"));
}

function enoncePapier(e: E): EnoncePapier {
  const fig = figure(e);
  return {
    section: { enteteFragments: fr(aires(e) ? SITUATION_AIRE : situationRegle(e)), ...(fig ? { enteteHtml: fig } : {}), questions: [{ consigne: fr(question(e)) }] },
    etapesParQuestion: [["a", "b"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  if (aires(e)) return { ...etapesDuCorrige(correctionDetailleeCG(e), ["a"]), methode: 0, piege: 1, nombres: 0, sansCharge: true };
  return { ...etapesDuCorrige(correctionDetailleeCG(e)), methode: 1, piege: e.variante === "regleUnCote" ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  if (aires(e))
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t(e.variante === "aire" ? "Probabilité représentée : " : "Figure : "), ...fr(reponse(e, phases(e)[0]!))], points: 2 },
        { sousQuestion: "b", critere: [t("Écriture avec Φ en des nombres positifs : "), ...fr(reponse(e, "phi"))], points: 2 },
      ],
      erreursFrequentes: [
        { description: [t("Aire à gauche et aire à droite confondues")], cout: "0 pt sur l'étape concernée" },
        ...(e.aire.a < 0 ? [{ description: [t("Φ traitée comme une fonction paire (Φ(−t) = Φ(t))")], cout: "0 pt sur l'étape 2" }] : []),
      ],
      reponsesAcceptees: [[t("Toute écriture équivalente avec des valeurs de Φ en des nombres positifs")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Nombre d'écarts-types : "), ...fr(reponse(e, "k"))], points: 1.5 },
      { sousQuestion: "b", critere: [t("Pourcentage (règle empirique, symétrie) : "), ...fr(reponse(e, "pourcent"))], points: 2.5 },
    ],
    erreursFrequentes: [
      ...(e.variante === "regleUnCote" ? [{ description: [t("Partage par 2 oublié (les deux côtés comptés) ou moitié de 50 % oubliée")], cout: "moitié des points de l'étape 2" }] : [{ description: [t("Pourcentage dans l'intervalle et hors de l'intervalle confondus")], cout: "moitié des points de l'étape 2" }]),
      { description: [t("Écart en unités donné au lieu du nombre d'écarts-types")], cout: "0 pt sur l'étape 1" },
    ],
    reponsesAcceptees: [[t("Le pourcentage de la règle empirique (68,3 ; 95,4 ; 99,7 %) ou la valeur exacte de la table (68,27 ; 95,45 ; 99,73 %), et ce qui s'en déduit")]],
  };
}

/** `forme` = variante (aires) ou question de la règle (écrite dans l'énoncé) — jamais le type d'aire. */
export function profilCG(e: E): ProfilInstance {
  return { casParticulier: null, forme: aires(e) ? e.variante : `${e.variante}|${e.question}` };
}

export const adaptateurEvaluationCG: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Courbe de Gauss : aires et règle empirique — Évaluation",
  nomFichierBase: "courbe-gauss-regle-empirique",
  genererInstance: genererExerciceCG,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCG,
  bareme,
  enoncePapier,
  profilInstance: profilCG,
};
