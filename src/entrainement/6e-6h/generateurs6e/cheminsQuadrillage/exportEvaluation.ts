import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceChemins, VarianteChemins } from "../../core6e/cheminsQuadrillage";
import { phasesChemins } from "../../core6e/cheminsQuadrillage";
import { CONSIGNE_PAPIER, consigne, question, reponse, situation } from "../../ui6e/formatCheminsQuadrillage";
import { figureChemins } from "../../ui6e/figureCheminsQuadrillage";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChemins } from "./index";
import { correctionDetailleeChemins } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen106` « Chemins dans un quadrillage ». Énoncé papier = situation + figure
 * (quadrillage, A, B, P ; nœuds marqués) + question + « Justifie ton dénombrement. » ; les écrans
 * deviennent les étapes du corrigé, dont la dernière montre un chemin d'exemple sur la figure
 * (`figureHtml`). `forme` = variante (total / passage / éviter : structure visible dans l'énoncé, aucun
 * verdict). Aucun cas particulier, aucun `calcul` (la calculatrice donne Cₙᵏ, pas le modèle des
 * chemins : décision du 24/11). Regroupement a), b), c) écarté : situation et figure propres à chaque
 * instance (comme 6gen162).
 */

type E = ExerciceChemins;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), enteteHtml: figureChemins(e), questions: phasesChemins(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, "chemins"));
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation(e)), enteteHtml: figureChemins(e), questions: [{ consigne: fr([...question(e), { type: "texte", valeur: ` ${CONSIGNE_PAPIER}` }]) }] },
    etapesParQuestion: [phasesChemins(e).map((_, i) => LETTRES[i]!)],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: phasesChemins(e).flatMap((p, i) => [t(i > 0 ? " ; " : ""), ...fr(reponse(e, p))]) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode 1 : le modèle « mot de flèches » est celui du cours ; total : l'écran a (compter les
  // déplacements) est une lecture de la figure. Piège dans les DONNÉES : P à éviter (complément).
  return { ...etapesDuCorrige(correctionDetailleeChemins(e), e.variante === "total" ? ["a"] : []), methode: 1, piege: e.variante === "eviter" ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const ph = phasesChemins(e);
  const criteres: BaremeExercice["criteres"] =
    e.variante === "total"
      ? [
          { sousQuestion: "a", critere: [t("Déplacements comptés : "), ...fr(reponse(e, "pas"))], points: 1 },
          { sousQuestion: "b", critere: [t("Chemin = choix des places des flèches vers le haut : "), ...fr(reponse(e, "chemins"))], points: 3 },
        ]
      : [
          { sousQuestion: "a", critere: [t(e.variante === "passage" ? "Chemins de A à P : " : "Tous les chemins de A à B : "), ...fr(reponse(e, ph[0]!))], points: 1.5 },
          { sousQuestion: "b", critere: [t(e.variante === "passage" ? "Chemins de P à B : " : "Chemins par P (produit) : "), ...fr(reponse(e, ph[1]!))], points: 1.5 },
          { sousQuestion: "c", critere: [t(e.variante === "passage" ? "Produit (principe de multiplication) : " : "Complément : "), ...fr(reponse(e, "chemins"))], points: 1 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [t("Nombre de chemins pris égal à 2 exposant le nombre de déplacements (déplacements supposés libres)")], cout: "0 pt sur le comptage" },
      { description: [t("Factorielle du nombre de déplacements, sans diviser par les flèches de même sorte")], cout: "moitié des points du comptage" },
      ...(e.variante === "passage" ? [{ description: [t("Somme au lieu du produit des chemins A → P et P → B")], cout: "0 pt sur la dernière étape" }] : []),
      ...(e.variante === "eviter" ? [{ description: [t("Seuls les chemins de A à P retirés du total (produit oublié)")], cout: "moitié des points des deux dernières étapes" }] : []),
    ],
    reponsesAcceptees: [[t("Résultat laissé sous forme de combinaisons (par exemple un produit de deux combinaisons) si le calcul est posé ; Cₙᵏ ou Cₙⁿ⁻ᵏ indifféremment")]],
  };
}

export function profilChemins(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationChemins: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Chemins dans un quadrillage — Évaluation",
  nomFichierBase: "chemins-quadrillage",
  genererInstance: genererExerciceChemins,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante(id as VarianteChemins),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeChemins,
  bareme,
  enoncePapier,
  profilInstance: profilChemins,
};
