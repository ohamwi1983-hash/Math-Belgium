import type { ExerciceGraphiqueContexte, QuestionGraphique, ReponseLectureGraphique, TypeQuestionGraphique } from "../core/graphiqueContexte.types";
import type { Morceau } from "../core/inequation.types";
import { verifierListeMorceaux } from "../ui/listeMorceaux";

/**
 * gen70 — session d'un exercice « graphique en contexte » : 2 écrans par question.
 * - écran pair : « quelle caractéristique ? » — choix fermé, UNE seule tentative (un choix faux clôt
 *   l'écran, la bonne caractéristique est révélée) ;
 * - écran impair : la lecture — `tentativesMax` tentatives, 2 paliers d'aide (méthode, puis repère
 *   tracé sur le graphique). Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

export const TENTATIVES_LECTURE = 3;
export const NIVEAU_AIDE_MAX = 2;

export type BilanEcran = "correcte" | "aide" | "revele";

export interface EtatSessionGraphiqueContexte {
  exercice: ExerciceGraphiqueContexte;
  /** 0 … 2n − 1 ; pair = caractéristique, impair = lecture de la question ⌊indexEcran/2⌋. */
  indexEcran: number;
  tentativesUtilisees: number;
  niveauAide: number;
  /** Un bilan par écran clos, dans l'ordre. */
  bilans: BilanEcran[];
  terminee: boolean;
}

export function demarrerSessionGraphiqueContexte(generer: () => ExerciceGraphiqueContexte): EtatSessionGraphiqueContexte {
  return { exercice: generer(), indexEcran: 0, tentativesUtilisees: 0, niveauAide: 0, bilans: [], terminee: false };
}

export function questionCourante(etat: EtatSessionGraphiqueContexte): QuestionGraphique {
  return etat.exercice.questions[Math.floor(etat.indexEcran / 2)]!;
}

export function nombreEcrans(exercice: ExerciceGraphiqueContexte): number {
  return exercice.questions.length * 2;
}

function clore(etat: EtatSessionGraphiqueContexte, bilan: BilanEcran): EtatSessionGraphiqueContexte {
  const indexEcran = etat.indexEcran + 1;
  return {
    ...etat,
    indexEcran,
    tentativesUtilisees: 0,
    niveauAide: 0,
    bilans: [...etat.bilans, bilan],
    terminee: indexEcran >= nombreEcrans(etat.exercice),
  };
}

export function verifierType(etat: EtatSessionGraphiqueContexte, type: TypeQuestionGraphique): boolean {
  return questionCourante(etat).type === type;
}

/** Écran « caractéristique » : toujours clos après le premier choix. */
export function soumettreType(etat: EtatSessionGraphiqueContexte, type: TypeQuestionGraphique): EtatSessionGraphiqueContexte {
  return clore({ ...etat, tentativesUtilisees: 1 }, verifierType(etat, type) ? "correcte" : "revele");
}

const EPS = 1e-9;
const egal = (a: number, b: number) => Math.abs(a - b) < EPS;

/** Les intervalles de variation se notent avec des crochets fermés, mais seule la lecture des bornes
 * est évaluée ici (le choix des crochets est l'objet des questions d'inéquation). */
function fermer(m: Morceau): Morceau {
  return { ...m, crochetGauche: "[", crochetDroit: "]" };
}

export function verifierLecture(q: QuestionGraphique, reponse: ReponseLectureGraphique): boolean {
  if (q.type !== reponse.type) return false;
  switch (q.type) {
    case "image":
      return reponse.type === "image" && egal(reponse.valeur, q.y);
    case "antecedent": {
      if (reponse.type !== "antecedent") return false;
      const saisies = [...reponse.valeurs].sort((a, b) => a - b);
      const attendues = [...q.solutions].sort((a, b) => a - b);
      return saisies.length === attendues.length && saisies.every((v, i) => egal(v, attendues[i]!));
    }
    case "inequation":
      return reponse.type === "inequation" && verifierListeMorceaux(reponse.morceaux, q.solution);
    case "extremum":
      return reponse.type === "extremum" && egal(reponse.moment, q.x) && egal(reponse.valeur, q.y);
    case "variation":
      return reponse.type === "variation" && verifierListeMorceaux(reponse.morceaux.map(fermer), q.intervalles.map(fermer));
    case "tendance":
      return reponse.type === "tendance" && egal(reponse.valeur, q.L);
  }
}

export function soumettreLecture(etat: EtatSessionGraphiqueContexte, reponse: ReponseLectureGraphique): EtatSessionGraphiqueContexte {
  if (verifierLecture(questionCourante(etat), reponse)) return clore(etat, etat.niveauAide > 0 ? "aide" : "correcte");
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  if (tentativesUtilisees >= TENTATIVES_LECTURE) return clore(etat, "revele");
  return { ...etat, tentativesUtilisees };
}

export function activerAide(etat: EtatSessionGraphiqueContexte): EtatSessionGraphiqueContexte {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}
