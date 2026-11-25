import type { ExerciceBinomialeSequenceOrdonnee } from "../../core6e/binomialeSequenceOrdonnee.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN48, evenementLatex, questionsPapier48, situationPapier48 } from "../../ui6e/formatBinomialeSequenceOrdonnee";
import { phasesPourExercice } from "../../moteur6e/typesBinomialeSequenceOrdonnee";
import type { PhaseBinomialeSequenceOrdonnee } from "../../moteur6e/typesBinomialeSequenceOrdonnee";
import { resultatExact } from "../../moteur6e/verificationBinomialeSequenceOrdonnee";
import { arrangementBig, rationnel } from "../../moteur6e/saisieCombinatoire";
import { valeurProbabilite } from "../../ui6e/corrigeCombinatoire";
import { construireAdaptateurCombinatoire } from "../adaptateurCombinatoire";
import { correctionDetailleeBinomialeSequenceOrdonnee } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomialeSequenceOrdonnee } from "./index";

/**
 * Adaptateur papier de `6gen48` (loi binomiale, séquence exacte) — refonte du lot E (audit 6e ch. 7) :
 * énoncé = situation en prose (n, p, X nommé, événement en KaTeX) + consigne de précision ; la stratégie,
 * les valeurs de k et les termes passent dans le corrigé (une lettre par écran, partagé avec l'appli).
 *
 * Profil (tirage équilibré, Casio Graph Math+) — consigne du lot E : `exacte` seulement quand la
 * calculatrice donnerait directement la réponse ET que le calcul à la main reste raisonnable (p = 1/2 en
 * binomiale) :
 * - A « exactement / aucun / tous » : p = 1/2 → `exacte` ; p ≠ 1/2 → `calculatrice` (puissances de 0,7…) ;
 * - A « au moins / au plus » : la stratégie est évaluée → rien si p = 1/2, `calculatrice` sinon ;
 * - B : produit de fractions → rien.
 * Cas particulier « aucun » / « tous » (un coefficient vaut 1, une puissance disparaît). La stratégie
 * (somme / complément) est un verdict de l'élève : jamais dans le profil.
 */

type E = ExerciceBinomialeSequenceOrdonnee;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const LIBELLE_CAS_PARTICULIER_6GEN48 = "Inclure un cas particulier (aucun succès ou que des succès)";

export function profilBinomialeSequenceOrdonnee(e: E): ProfilInstance {
  if (e.famille === "B") return { casParticulier: null };
  const cas = e.typeQuestion === "aucun" || e.typeQuestion === "tous" ? e.typeQuestion : null;
  const demi = Math.abs(e.p - 0.5) < 1e-9;
  if (e.strategie === "termeUnique") return { casParticulier: cas, calcul: demi ? "exacte" : "calculatrice" };
  return demi ? { casParticulier: cas } : { casParticulier: cas, calcul: "calculatrice" };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.famille === "B") return [l(`P=${valeurProbabilite(rationnel(1n, arrangementBig(e.n, e.k)))}`)];
  return [l(`P(${evenementLatex(e)})=${valeurProbabilite(resultatExact(e))}`)];
}

function criteres(e: E): CriteresDifficulte {
  // Méthode 1 : reconnaître la loi (A) ou la règle du produit sans remise (B) parmi les modèles du cours.
  // Aucune donnée piège. A : `sansCharge` — le nombre de lignes dépend de la stratégie (somme ou
  // complément), verdict de l'élève qui ne doit pas changer le niveau imprimé.
  return { ...etapesDuCorrige(correctionDetailleeBinomialeSequenceOrdonnee(e), []), methode: 1, piege: 0, ...(e.famille === "A" ? { sansCharge: true } : {}) };
}

function bareme(e: E): BaremeExercice {
  const accepte = [[t("La fraction exacte, ou un arrondi correct au millième (davantage de décimales pour une très petite probabilité)")]];
  if (e.famille === "B")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Probabilité de chaque tirage (un objet de moins à chaque fois)")], points: 2 },
        { sousQuestion: "b", critere: [t("Produit : "), l(valeurProbabilite(rationnel(1n, arrangementBig(e.n, e.k))))], points: 2 },
      ],
      erreursFrequentes: [{ description: [t("Calcul avec remise : "), l(`\\dfrac{1}{${e.n}^{${e.k}}}`)], cout: "0 pt sur l'étape 2" }],
      reponsesAcceptees: [...accepte, [l(`\\dfrac{1}{A_{${e.n}}^{${e.k}}}`), t(" calculé")]],
    };
  const res = [l(`P(${evenementLatex(e)})=${valeurProbabilite(resultatExact(e))}`)];
  const criteresA =
    e.strategie === "termeUnique"
      ? [
          { sousQuestion: "a", critere: [t("Loi binomiale reconnue ("), l(`n=${e.n}`), t(", "), l(`p=${String(e.p).replace(".", "{,}")}`), t(")")], points: 1 },
          { sousQuestion: "b", critere: [t("Un seul terme, "), l(`k=${e.k}`)], points: 0.5 },
          { sousQuestion: "c", critere: [t("Terme "), l("C_n^k\\,p^k\\,(1-p)^{n-k}"), t(" calculé : "), ...res], points: 2.5 },
        ]
      : [
          { sousQuestion: "a", critere: [t("Loi binomiale reconnue et stratégie (somme directe ou complément)")], points: 1 },
          { sousQuestion: "b", critere: [t("Valeurs de k : "), l(`\\{${e.termesACalculer.join("\\,;")}\\}`)], points: 0.5 },
          { sousQuestion: "c", critere: [t("Termes calculés")], points: 1.5 },
          { sousQuestion: "d", critere: [t(e.strategie === "somme" ? "Somme : " : "Complément : "), ...res], points: 1 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres: criteresA,
    erreursFrequentes: [
      { description: [t("Coefficient "), l("C_n^k"), t(" oublié")], cout: "moitié des points de l'étape 3" },
      ...(e.strategie === "complement" ? [{ description: [t("Probabilité de l'événement contraire donnée sans la retirer de 1")], cout: "0 pt sur l'étape 4" }] : []),
      ...(e.strategie === "somme" ? [{ description: [t("Borne oubliée (« au moins » ou « au plus » contient la valeur donnée)")], cout: "moitié des points" }] : []),
    ],
    reponsesAcceptees: [...accepte, ...(e.strategie === "termeUnique" ? [] : [[t("La somme directe comme le complément : les deux méthodes valent tous les points si le calcul est juste")]])],
  };
}

export const adaptateurEvaluationBinomialeSequenceOrdonnee: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseBinomialeSequenceOrdonnee>({
  titreDocument: "Probabilité binomiale et séquence exacte — Évaluation",
  nomFichierBase: "binomiale-sequence-ordonnee",
  genererInstance: genererExerciceBinomialeSequenceOrdonnee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  format: FORMAT_6GEN48,
  phases: phasesPourExercice,
  situation: situationPapier48,
  questions: questionsPapier48,
  reponseBreve,
  correction: correctionDetailleeBinomialeSequenceOrdonnee,
  bareme,
  criteres,
  profil: profilBinomialeSequenceOrdonnee,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER_6GEN48,
});
