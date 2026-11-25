import type { ExerciceDenombrementFondamental } from "../../core6e/denombrementFondamental.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_PAPIER_43, FORMAT_6GEN43, situationPapier43 } from "../../ui6e/formatDenombrementFondamental";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementFondamental";
import type { PhaseDenombrementFondamental } from "../../moteur6e/typesDenombrementFondamental";
import { combinaisonBig } from "../../moteur6e/saisieCombinatoire";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeDenombrementFondamental } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementFondamental } from "./index";

/**
 * Adaptateur papier de `6gen43` (dénombrement fondamental) — refonte du lot E (audit 6e ch. 7) : énoncé =
 * situation en prose avec sa question (sans le total ni les nombres « sans le chiffre » que l'écran
 * donnait) + « Réponds en justifiant ta démarche. » (regroupable a), b), c)) ; corrigé « comme au
 * tableau » partagé avec l'écran ; barème par écran ; niveau et durée mesurés.
 *
 * Profil (Casio Graph Math+) : C « combinaison » `calculatrice` quand Cₙᵖ dépasse 2 000 (mains de cartes),
 * rien ailleurs (produits courts, factorielles ≤ 8!). Aucun cas particulier. Groupes à verdict (le nom
 * de la variante dit le groupement ou la formule) : `groupe_groupement` (C) et `groupe_cercle` (E), niveau
 * et durée constants dans chaque groupe (`sansCharge`, nombres 0).
 */

type E = ExerciceDenombrementFondamental;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export function profilDenombrementFondamental(e: E): ProfilInstance {
  if (e.famille === "C" && e.formule === "combinaison" && combinaisonBig(e.n, e.p) > 2000n) return { casParticulier: null, calcul: "calculatrice" };
  return { casParticulier: null };
}

function valeur(e: E): number {
  switch (e.famille) {
    case "B":
      return e.sousType === "direct" ? e.diagonales : e.n;
    case "D":
      return e.resultatFinal;
    default:
      return e.resultat;
  }
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.famille === "B") return e.sousType === "direct" ? [l(milliers(e.diagonales)), t(" diagonales")] : [l(`n=${e.n}`), t(" côtés")];
  return [l(`N=${milliers(valeur(e))}`)];
}

function criteres(e: E): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeDenombrementFondamental(e), []);
  switch (e.famille) {
    case "A":
      // Méthode 1 (principe multiplicatif, complément ou inclusion-exclusion du cours) ; piège dans les
      // données : 0 parmi les chiffres utilisables (interdit en tête seulement).
      return { ...base, methode: 1, piege: e.chiffres.includes(0) ? 1 : 0, nombres: 0 };
    case "B":
      return { ...base, methode: 1, piege: e.sousType === "inverse" ? 1 : 0, nombres: 0 };
    case "C":
    case "E":
      return { ...base, methode: 1, piege: 0, nombres: 0, sansCharge: true };
    case "D":
      return { ...base, methode: 1, piege: 0, nombres: 0 };
  }
}

function bareme(e: E): BaremeExercice {
  const rep = reponseBreve(e);
  const lettres = lettresEcrans(phasesPourExercice, e);
  const parEtape = (libelles: string[], poids: number[]) => libelles.map((x, i) => ({ sousQuestion: lettres[i], critere: [t(x)], points: poids[i] }));
  switch (e.famille) {
    case "A": {
      const n = lettres.length;
      const crit =
        n === 1
          ? parEtape(["Cases imposées, cases libres et produit"], [4])
          : n === 2
            ? parEtape(["Cases contraintes d'abord (nombre de choix justifié)", "Cases suivantes et produit"], [1.5, 2.5])
            : e.sousType === "parite"
              ? parEtape(["Deux cas selon le dernier chiffre (0 ou non)", "Cases du milieu", "Somme des deux cas"], [1.5, 1, 1.5])
              : parEtape([e.sousType === "contientUnChiffre" ? "Passage par le complément : premier chiffre sans le chiffre donné" : "Inclusion-exclusion : premier chiffre sans les deux chiffres", "Nombres sans le (ou les) chiffre(s)", "Total recalculé et résultat"], [1, 1.5, 1.5]);
      crit[crit.length - 1].critere.push(t(" : "), l(milliers(e.resultat)));
      return {
        reponseFinale: rep,
        criteres: crit,
        erreursFrequentes: [
          ...(e.chiffres.includes(0) ? [{ description: [t("0 accepté en première position (ou interdit ailleurs)")], cout: "−1" }] : []),
          ...(e.sousType === "contientDeuxChiffres" ? [{ description: [t("Nombres « ni l'un ni l'autre » non rajoutés")], cout: "0 pt sur l'étape 3" }] : []),
        ],
        reponsesAcceptees: [[t("Le résultat écrit comme produit de facteurs")]],
      };
    }
    case "B":
      return e.sousType === "direct"
        ? { reponseFinale: rep, criteres: parEtape(["Formule justifiée et calcul : "], [4]).map((c) => ({ ...c, critere: [...c.critere, l(`D(${e.n})=${milliers(e.diagonales)}`)] })), erreursFrequentes: [{ description: [t("Division par 2 oubliée")], cout: "−2" }] }
        : {
            reponseFinale: rep,
            criteres: [
              { sousQuestion: "a", critere: [t("Équation : "), l(`n^2-3n-${milliers(e.constanteEquation)}=0`)], points: 2 },
              { sousQuestion: "b", critere: [t("Résolution, solution négative rejetée : "), l(`n=${e.n}`)], points: 2 },
            ],
            erreursFrequentes: [{ description: [t("Solution négative gardée")], cout: "−1" }],
          };
    case "C":
      return {
        reponseFinale: rep,
        criteres: [
          { sousQuestion: "a", critere: [t("Groupement reconnu et justifié (ordre, répétition, tous les éléments)")], points: 2 },
          { sousQuestion: "b", critere: [t("Calcul : "), l(milliers(e.resultat))], points: 2 },
        ],
        erreursFrequentes: [{ description: [t("Ordre compté à tort (ou oublié)")], cout: "0 pt sur l'étape 1" }],
        reponsesAcceptees: [[t("Le résultat écrit comme produit ou avec la notation du cours (calculatrice interdite)")]],
      };
    case "D":
      return {
        reponseFinale: rep,
        criteres: parEtape(["Nombre d'unités (un bloc = une unité)", "Rangement des unités", "Ordre interne des blocs et produit"], [1, 1, 2]),
        erreursFrequentes: [{ description: [t("Ordre interne des blocs oublié (ou compté alors qu'il est imposé)")], cout: "0 pt sur l'étape 3" }],
      };
    case "E":
      return {
        reponseFinale: rep,
        criteres: [
          { sousQuestion: "a", critere: [t(e.sousType === "table" ? "Rotations seulement : " : "Rotations et retournement : "), l(e.sousType === "table" ? `(${e.n}-1)!` : `\\dfrac{(${e.n}-1)!}{2}`)], points: 2 },
          { sousQuestion: "b", critere: [t("Calcul : "), l(milliers(e.resultat))], points: 2 },
        ],
        erreursFrequentes: [{ description: [l(`${e.n}!`), t(" (rotations comptées)")], cout: "0 pt sur l'étape 1" }],
      };
  }
}

export const adaptateurEvaluationDenombrementFondamental: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseDenombrementFondamental>({
  titreDocument: "Dénombrement fondamental — Évaluation",
  nomFichierBase: "denombrement-fondamental",
  genererInstance: genererExerciceDenombrementFondamental,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  format: FORMAT_6GEN43,
  phases: phasesPourExercice,
  situation: situationPapier43,
  questions: (e) => [{ consigne: [t(CONSIGNE_PAPIER_43)], etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeDenombrementFondamental,
  bareme,
  criteres,
  profil: profilDenombrementFondamental,
  groupesVerdict: [
    { id: "groupe_groupement", label: "C — Reconnaître le groupement (permutation, arrangement, avec répétition, combinaison)", variantes: ["C_cartesContraintes", "C_motsLettresDistinctes", "C_motsRepetition", "C_motsPositionFixee", "C_arrangement"] },
    { id: "groupe_cercle", label: "E — Permutation circulaire (table ronde ou bracelet)", variantes: ["E_table", "E_collier"] },
  ],
});
