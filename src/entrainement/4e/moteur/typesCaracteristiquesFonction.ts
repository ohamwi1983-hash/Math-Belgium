import type {
  ExerciceCaracteristiquesFonction,
  GenerateurExerciceCaracteristiquesFonction,
  PhaseCaracteristiquesFonction,
} from "../core/caracteristiquesFonction.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 8 scores toujours des `number` — aucune étape n'est sautable ici (graphique unique, toujours affiché). */
export interface ResultatExerciceCaracteristiquesFonction {
  scoreDomaine: number;
  domaineRevele: boolean;
  scoreZeros: number;
  zerosRevele: boolean;
  scoreCroissance: number;
  croissanceRevele: boolean;
  scoreDecroissance: number;
  decroissanceRevele: boolean;
  scoreConstance: number;
  constanceRevele: boolean;
  scoreOrdonnee: number;
  ordonneeRevele: boolean;
  scoreValeur: number;
  valeurRevele: boolean;
  scoreAsymptotes: number;
  asymptotesRevele: boolean;
}

export interface EtatSessionCaracteristiquesFonction {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceCaracteristiquesFonction;
  indexExercice: number;
  exerciceCourant: ExerciceCaracteristiquesFonction;
  phase: PhaseCaracteristiquesFonction;
  etapeCourante: EtatEtapeTentatives;
  scoreDomaineExercice: number | null;
  domaineRevele: boolean;
  scoreZerosExercice: number | null;
  zerosRevele: boolean;
  scoreCroissanceExercice: number | null;
  croissanceRevele: boolean;
  scoreDecroissanceExercice: number | null;
  decroissanceRevele: boolean;
  scoreConstanceExercice: number | null;
  constanceRevele: boolean;
  scoreOrdonneeExercice: number | null;
  ordonneeRevele: boolean;
  scoreValeurExercice: number | null;
  valeurRevele: boolean;
  resultats: ResultatExerciceCaracteristiquesFonction[];
  terminee: boolean;
}
