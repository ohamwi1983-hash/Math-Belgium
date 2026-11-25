import type { ExerciceExtensionsBinomialeNormaleBayes } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN52 } from "../../ui6e/formatExtensionsBinomialeNormaleBayes";
import { donneesEnLigne, fractionLatex, milliersTexte } from "../../ui6e/fragmentsCombinatoire";
import { phasesPourExercice } from "../../moteur6e/typesExtensionsBinomialeNormaleBayes";
import type { PhaseExtensionsBinomialeNormaleBayes } from "../../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { bayesD, esperanceF, totaleD, totalF } from "../../moteur6e/verificationExtensionsBinomialeNormaleBayes";
import { versNombre } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { ar, dl, frag } from "../../ui6e/corrigeVariablesAleatoires";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeExtensions } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtensionsBinomialeNormaleBayes } from "./index";

/**
 * Adaptateur papier de `6gen52` (extensions : épreuves composées, Bayes, loi reconstruite — 6e ch. 8,
 * § 7, processus 3 TRANSFÉRER) — refonte du lot E de l'audit : situation en prose avec sa question,
 * consigne globale SANS méthode (plus de « utilise le logarithme », « par différence ») ; les écrans
 * deviennent les étapes du corrigé (modèle, calculs, conclusion). F ne définit plus X : la variable est
 * posée dans le corrigé (c'est le travail de modélisation).
 *
 * Profil (règle du 24/11) : aucune réponse donnée directement par la calculatrice (modéliser, Bayes,
 * loi reconstruite) → pas de `exacte` ; A exige le logarithme → `calcul: 'calculatrice'` et
 * `calculatriceIndispensable` sur A ; D et F se calculent à la main (décimaux exacts). Aucun cas
 * particulier (les variantes B, C, E qui en avaient sont retirées, décision 3). Pas de table de Φ :
 * la loi normale (ancienne famille C) n'y est plus.
 */

type E = ExerciceExtensionsBinomialeNormaleBayes;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function proba(r: Rationnel): string {
  const x = versNombre(r);
  if (Math.abs(Number(x.toFixed(6)) - x) < 1e-12) return dl(x);
  return `${fractionLatex(r)}\\approx ${ar(x, 3)}`;
}

export function situationPapier52(e: E): FragmentConsigne[] {
  if (e.famille === "A") return [t(`${e.texte} Combien de ${e.unite} faut-il au minimum pour que la probabilité qu'${e.evenement} dépasse `), l(dl(e.seuil)), t(" ?")];
  if (e.famille === "D") return donneesEnLigne(FORMAT_6GEN52.donnees(e));
  const lignes = FORMAT_6GEN52.donnees(e);
  return [...donneesEnLigne(lignes), t(` Quel montant total, en euros, peut-on attendre chaque mois des ${milliersTexte(e.population)} ${e.individus} ?`)];
}

export const CONSIGNE_A_52 = "Réponds en justifiant par un calcul.";
export const CONSIGNE_D_52 = "Réponds en justifiant ta démarche ; donne la probabilité exacte ou arrondie au millième.";
export const CONSIGNE_F_52 = "Réponds en justifiant ta démarche.";

function questions(e: E): { consigne: FragmentConsigne[]; etapes: string[] }[] {
  const c = e.famille === "A" ? CONSIGNE_A_52 : e.famille === "D" ? CONSIGNE_D_52 : CONSIGNE_F_52;
  return [{ consigne: frag(c), etapes: lettresEcrans(phasesPourExercice, e) }];
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.famille === "A") return [l(`n=${e.valeurN}`), t(` ${e.unite}`)];
  if (e.famille === "D") return [l(`P(S)=${dl(versNombre(totaleD(e)))}`), t(" ; "), l(`P(C_{${e.j + 1}}\\mid S)=${proba(bayesD(e))}`)];
  return [l(`E(X)=${dl(esperanceF(e))}`), t(" € ; total attendu : "), l(`${dl(totalF(e))}`), t(" €")];
}

function criteres(e: E): CriteresDifficulte {
  // Transférer : l'élève construit le modèle (méthode 2) — produit de deux événements indépendants puis
  // « au moins un » (A composée), arbre et inversion du conditionnement (D), variable X et sa loi (F) ;
  // A directe : p est lue dans la situation, seul le modèle « au moins un » est à reconnaître (méthode 1).
  const base = etapesDuCorrige(correctionDetailleeExtensions(e), []);
  if (e.famille === "A") return { ...base, methode: e.sousType === "compose" ? 2 : 1, piege: 0, nombres: 1 };
  return { ...base, methode: 2, piege: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.famille === "A")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Probabilité de succès d'une répétition")], points: 1 },
        { sousQuestion: "b", critere: [t("Modèle « au moins un succès » : "), l("1-(1-p)^n"), t(" > seuil")], points: 1 },
        { sousQuestion: "c", critere: [t("Résolution par le logarithme, sens changé")], points: 1 },
        { sousQuestion: "d", critere: [t("Plus petit entier : "), l(`n=${e.valeurN}`)], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Probabilités des deux épreuves additionnées au lieu d'être multipliées")], cout: "0 pt sur l'étape 1, la suite notée sur cette valeur" },
        { description: [t("Sens de l'inégalité gardé après la division par un logarithme négatif")], cout: "0 pt sur l'étape 3" },
        { description: [t("Entier précédent donné")], cout: "0 pt sur l'étape 4" },
      ],
      reponsesAcceptees: [[t("Une recherche par essais à la calculatrice, si les deux entiers voisins sont contrôlés")]],
    };
  if (e.famille === "D")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Probabilités totales : "), l(`P(S)=${dl(versNombre(totaleD(e)))}`)], points: 1.5 },
        { sousQuestion: "b", critere: [t("Intersection de la catégorie demandée et de "), l("S")], points: 1 },
        { sousQuestion: "c", critere: [t("Bayes : "), l(`P(C_{${e.j + 1}}\\mid S)=${proba(bayesD(e))}`)], points: 1.5 },
      ],
      erreursFrequentes: [
        { description: [t("Moyenne simple des trois pourcentages pour "), l("P(S)")], cout: "0 pt sur l'étape 1" },
        { description: [t("Conditionnement inversé : "), l(`P(S\\mid C_{${e.j + 1}})`), t(" donnée comme réponse")], cout: "0 pt sur l'étape 3" },
      ],
      reponsesAcceptees: [[t("La fraction exacte ou un arrondi au millième ; un arbre de probabilités complet tient lieu de justification")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Variable définie et sa loi (troisième probabilité par différence)")], points: 1.5 },
      { sousQuestion: "b", critere: [t("Espérance : "), l(`E(X)=${dl(esperanceF(e))}`)], points: 1.5 },
      { sousQuestion: "c", critere: [t("Total attendu : "), l(`${dl(totalF(e))}`), t(" €")], points: 1 },
    ],
    erreursFrequentes: [{ description: [t("Moyenne simple des trois montants")], cout: "0 pt sur l'étape 2" }],
    reponsesAcceptees: [[t("Un calcul direct par les effectifs (nombre de personnes par formule × montant), qui donne le même total")]],
  };
}

export function profilExtensions(e: E): ProfilInstance {
  return e.famille === "A" ? { casParticulier: null, calcul: "calculatrice" } : { casParticulier: null };
}

export const adaptateurEvaluationExtensionsBinomialeNormaleBayes: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseExtensionsBinomialeNormaleBayes>({
  titreDocument: "Extensions binomiale, normale et Bayes — Évaluation",
  nomFichierBase: "extensions-binomiale-normale-bayes",
  genererInstance: genererExerciceExtensionsBinomialeNormaleBayes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN52,
  phases: phasesPourExercice,
  situation: situationPapier52,
  questions,
  reponseBreve,
  correction: correctionDetailleeExtensions,
  bareme,
  criteres,
  profil: profilExtensions,
  calculatriceIndispensable: ["A_compose", "A_direct"],
});
