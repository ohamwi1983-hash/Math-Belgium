import type { ExerciceDenombrementCombinatoirePur } from "../../core6e/denombrementCombinatoirePur.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_PAPIER_46, FORMAT_6GEN46, situationPapier46 } from "../../ui6e/formatDenombrementCombinatoirePur";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementCombinatoirePur";
import type { PhaseDenombrementCombinatoirePur } from "../../moteur6e/typesDenombrementCombinatoirePur";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeDenombrementCombinatoirePur } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombinatoirePur } from "./index";

/**
 * Adaptateur papier de `6gen46` (problèmes de dénombrement, processus 3 Transférer) — refonte du lot E
 * (audit 6e ch. 7) : énoncé = situation en prose avec sa question + « Réponds en justifiant ta
 * démarche. » (regroupable a), b), c)) ; corrigé « comme au tableau » partagé avec l'écran.
 *
 * Profil (Casio Graph Math+) : B (groupes non nommés, multinomiale) `calculatrice` à partir de 8 personnes
 * (n!/(t!)ᵐ à la main devient déraisonnable ; 4 ou 6 personnes se font de tête), cas particulier « deux
 * groupes » (une seule combinaison, divisée par 2). A (poker : petits facteurs), C (nᵏ ≤ 10⁶), D (trois
 * dés) : rien. D : le verdict (S₁, S₂ ou égales) est tiré dans la variante, jamais dans le profil ; niveau
 * et durée constants (`sansCharge`, piège 1 pour tous les verdicts).
 */

type E = ExerciceDenombrementCombinatoirePur;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const LIBELLE_CAS_PARTICULIER_6GEN46 = "Inclure un cas particulier (répartition en deux groupes)";

export function profilDenombrementCombinatoirePur(e: E): ProfilInstance {
  if (e.famille === "B") return { casParticulier: e.m === 2 ? "deux-groupes" : null, ...(e.n >= 8 ? { calcul: "calculatrice" as const } : {}) };
  return { casParticulier: null };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [l(milliers(e.resultatFinal)), t(" mains")];
    case "B":
      return [l(milliers(e.resultat)), t(" répartitions")];
    case "C":
      return [l(`${e.n}^{${e.k}}=${milliers(e.resultat)}`)];
    case "D":
      return e.comparaison === "egal" ? [t(`Aussi fréquentes (${e.totalS1} triplets chacune)`)] : [t(`La somme ${e.comparaison === "s1" ? e.s1 : e.s2} (${Math.max(e.totalS1, e.totalS2)} triplets contre ${Math.min(e.totalS1, e.totalS2)})`)];
  }
}

function criteres(e: E): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeDenombrementCombinatoirePur(e), []);
  switch (e.famille) {
    case "A":
      // L'élève construit le modèle de la main (hauteurs, couleurs, cartes qui complètent) : méthode 2.
      return { ...base, methode: 2, piege: 0, nombres: 0 };
    case "B":
      return { ...base, methode: 1, piege: 0 };
    case "C":
      return { ...base, methode: 1, piege: 0, nombres: 0 };
    case "D":
      // Modèle à construire (triplets ordonnés) ; piège dans les données : deux sommes au même nombre de
      // décompositions ne sont pas pour autant équiprobables. Constant pour les trois verdicts.
      return { ...base, methode: 2, piege: 1, nombres: 0, sansCharge: true };
  }
}

function bareme(e: E): BaremeExercice {
  switch (e.famille) {
    case "A":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Combinaison (hauteur puis couleurs) : "), l(milliers(e.etape1))], points: 1.5 },
          { sousQuestion: "b", critere: [t("Cartes qui complètent la main : "), l(milliers(e.etape2))], points: 1.5 },
          { sousQuestion: "c", critere: [t("Produit : "), l(milliers(e.resultatFinal))], points: 1 },
        ],
        erreursFrequentes: [{ description: [t("Cartes restantes choisies sans contrainte de hauteur (mains plus fortes comptées)")], cout: "0 pt sur l'étape 2" }],
        reponsesAcceptees: [[t("Le résultat écrit comme produit de combinaisons et de puissances")]],
      };
    case "B":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Groupes supposés nommés : "), l(`\\dfrac{${e.n}!}{(${e.t}!)^{${e.m}}}=${milliers(e.nommes)}`)], points: 2 },
          { sousQuestion: "b", critere: [t("Division par l'ordre des groupes : "), l(`\\dfrac{${milliers(e.nommes)}}{${e.m}!}=${milliers(e.resultat)}`)], points: 2 },
        ],
        erreursFrequentes: [{ description: [t("Groupes traités comme nommés (pas de division par "), l(`${e.m}!`), t(")")], cout: "0 pt sur l'étape 2" }],
      };
    case "C":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [{ sousQuestion: "a", critere: [t("Modèle "), l("n^k"), t(" justifié et calcul : "), l(`${e.n}^{${e.k}}=${milliers(e.resultat)}`)], points: 4 }],
        erreursFrequentes: [{ description: [t("Base et exposant inversés ("), l(`${e.k}^{${e.n}}`), t(")")], cout: "0 pt" }],
      };
    case "D":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Décompositions des deux sommes")], points: 1 },
          { sousQuestion: "b", critere: [t("Nombre d'ordres de chaque décomposition (6, 3 ou 1)")], points: 1 },
          { sousQuestion: "c", critere: [t("Totaux : "), l(`${e.totalS1}`), t(" et "), l(`${e.totalS2}`)], points: 1 },
          { sousQuestion: "d", critere: [t("Conclusion justifiée par les triplets équiprobables")], points: 1 },
        ],
        erreursFrequentes: [{ description: [t("Conclusion tirée du nombre de décompositions")], cout: "0 pt sur les étapes 2 à 4" }],
      };
  }
}

export const adaptateurEvaluationDenombrementCombinatoirePur: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseDenombrementCombinatoirePur>({
  titreDocument: "Problèmes de dénombrement — Évaluation",
  nomFichierBase: "problemes-denombrement",
  genererInstance: genererExerciceDenombrementCombinatoirePur,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  format: FORMAT_6GEN46,
  phases: phasesPourExercice,
  situation: situationPapier46,
  questions: (e) => [{ consigne: [t(CONSIGNE_PAPIER_46)], etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeDenombrementCombinatoirePur,
  bareme,
  criteres,
  profil: profilDenombrementCombinatoirePur,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER_6GEN46,
});
