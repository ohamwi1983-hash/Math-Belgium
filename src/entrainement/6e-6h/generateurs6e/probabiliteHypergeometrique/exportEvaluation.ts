import type { ExerciceProbabiliteHypergeometrique } from "../../core6e/probabiliteHypergeometrique.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN47, compositionTexte, questionsPapier47, situationPapier47 } from "../../ui6e/formatProbabiliteHypergeometrique";
import { phasesPourExercice } from "../../moteur6e/typesProbabiliteHypergeometrique";
import { rationnel } from "../../moteur6e/saisieCombinatoire";
import { CC, valeurProbabilite } from "../../ui6e/corrigeCombinatoire";
import { construireAdaptateurCombinatoire } from "../adaptateurCombinatoire";
import { correctionDetailleeProbabiliteHypergeometrique } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabiliteHypergeometrique } from "./index";

/**
 * Adaptateur papier de `6gen47` (Probabilité hypergéométrique) — refonte du lot E (audit 6e ch. 7) :
 * énoncé = situation en prose (avec ses nombres : plus rien de coupé à l'impression) + consigne de
 * précision ; B garde deux VRAIES questions (séquence, puis composition) ; corrigé « comme au tableau »
 * partagé avec l'écran ; barème par écran ; niveau et durée mesurés.
 *
 * Profil (tirage équilibré) — calculatrice des élèves de 6e (6h) : Casio Graph Math+.
 * - A : `calcul: 'exacte'` (décision du 24/11 : N, K, n, k donnés, `HypergeoPD` donne directement la
 *   probabilité) ; cas particulier « aucun » (k = 0) ou « tous » (k = n) : une combinaison vaut 1, le
 *   calcul se raccourcit (variantes A_aucun, A_tous ; jamais A_exactement).
 * - B : raisonnement (produit, nombre d'ordres) → pas de `calcul`.
 * - C : `calculatrice` quand la plus grande combinaison dépasse 2 000 (calcul à la main déraisonnable),
 *   sinon rien (tiré dans les deux cas). Aucun verdict, aucune `forme` (la variante suffit).
 */

type E = ExerciceProbabiliteHypergeometrique;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const LIBELLE_CAS_PARTICULIER_6GEN47 = "Inclure un cas particulier (aucun succès ou que des succès)";

function binom(n: number, k: number): number {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

export function profilProbabiliteHypergeometrique(e: E): ProfilInstance {
  if (e.famille === "A") return { casParticulier: e.sousType === "exactement" ? null : e.sousType, calcul: "exacte" };
  if (e.famille === "C") return binom(e.principal.N, e.principal.n) > 2000 ? { casParticulier: null, calcul: "calculatrice" } : { casParticulier: null };
  return { casParticulier: null };
}

function probaA(e: E & { famille: "A" }) {
  return rationnel(BigInt(e.numerateurFacteur1) * BigInt(e.numerateurFacteur2), e.denominateur);
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [l(`P(X=${e.k})=${valeurProbabilite(probaA(e))}`)];
    case "B":
      return [t("a) "), l(valeurProbabilite(rationnel(e.numerateurSequence, e.denominateurSequence))), t(" ; b) "), l(valeurProbabilite(rationnel(e.numerateurComposition, e.denominateurComposition)))];
    case "C":
      return [l(`P=${valeurProbabilite(rationnel(e.numerateurCombine, e.denominateurCombine))}`)];
  }
}

function criteres(e: E): CriteresDifficulte {
  // Méthode 1 : reconnaître le modèle (sans remise, hypergéométrique / règle du produit / indépendance)
  // parmi ceux du cours ; aucune donnée piège. Nombres : détectés sur le corrigé (arrondi).
  return { ...etapesDuCorrige(correctionDetailleeProbabiliteHypergeometrique(e), []), methode: 1, piege: 0 };
}

function bareme(e: E): BaremeExercice {
  const accepte = [[t("La fraction non simplifiée, ou un arrondi correct au millième (davantage de décimales pour une petite probabilité)")]];
  switch (e.famille) {
    case "A":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Loi reconnue et formule posée avec les nombres : "), l(`\\dfrac{${CC(e.K, e.k)}\\times ${CC(e.N - e.K, e.n - e.k)}}{${CC(e.N, e.n)}}`)], points: 2 },
          { sousQuestion: "b", critere: [t("Combinaisons calculées et probabilité : "), l(valeurProbabilite(probaA(e)))], points: 2 },
        ],
        erreursFrequentes: [
          { description: [t("Dénominateur faux ("), l(e.k === e.n ? CC(e.K, e.n) : CC(e.N, e.k)), t(" au lieu de "), l(CC(e.N, e.n)), t(")")], cout: "0 pt sur l'étape 1" },
          { description: [t("Probabilité « avec remise » (puissances) pour un tirage sans remise")], cout: "0 pt sur les étapes 1 et 2" },
        ],
        reponsesAcceptees: accepte,
      };
    case "B":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Produit des probabilités successives (une boule de moins à chaque tirage) : "), l(valeurProbabilite(rationnel(e.numerateurSequence, e.denominateurSequence)))], points: 1.5 },
          { sousQuestion: "b", critere: [t("Nombre d'ordres : "), l(`${CC(3, e.a)}=${e.nombreArrangements}`)], points: 1 },
          { sousQuestion: "c", critere: [t(`Probabilité de ${compositionTexte(e)} : `), l(valeurProbabilite(rationnel(e.numerateurComposition, e.denominateurComposition)))], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Probabilités « avec remise » (dénominateur constant)")], cout: "moitié des points de l'étape 1" },
          { description: [t("Composition confondue avec la séquence (ordres oubliés)")], cout: "0 pt sur les étapes 2 et 3" },
        ],
        reponsesAcceptees: [...accepte, [t("b) par la formule "), l(`\\dfrac{${CC(e.n1, e.a)}\\times ${CC(e.n2, e.b)}}{${CC(e.N, 3)}}`), t(" (toute la question)")]],
      };
    case "C":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Numéros principaux : "), l(`P_1=${valeurProbabilite(rationnel(e.principal.numerateur, e.principal.denominateur))}`)], points: 1.5 },
          { sousQuestion: "b", critere: [t("Numéros bonus : "), l(`P_2=${valeurProbabilite(rationnel(e.bonus.numerateur, e.bonus.denominateur))}`)], points: 1.5 },
          { sousQuestion: "c", critere: [t("Indépendance : produit "), l(`P_1\\times P_2`)], points: 1 },
        ],
        erreursFrequentes: [{ description: [t("Somme "), l("P_1+P_2"), t(" au lieu du produit")], cout: "0 pt sur l'étape 3" }],
        reponsesAcceptees: accepte,
      };
  }
}

export const adaptateurEvaluationProbabiliteHypergeometrique: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, ReturnType<typeof phasesPourExercice>[number]>({
  titreDocument: "Probabilité hypergéométrique — Évaluation",
  nomFichierBase: "probabilite-hypergeometrique",
  genererInstance: genererExerciceProbabiliteHypergeometrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  format: FORMAT_6GEN47,
  phases: phasesPourExercice,
  situation: situationPapier47,
  questions: questionsPapier47,
  reponseBreve,
  correction: correctionDetailleeProbabiliteHypergeometrique,
  bareme,
  criteres,
  profil: profilProbabiliteHypergeometrique,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER_6GEN47,
});
