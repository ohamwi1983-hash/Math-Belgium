/**
 * Couche B (5e) — types pour 5gen6 ("Arcs et secteurs"). Le mode "deuxVersTrois" a une séquence
 * d'écrans DYNAMIQUE (les 3 quantités manquantes, ordonnées par dépendance — voir
 * `quantitesManquantes`) — la phase est directement le NOM de la quantité demandée
 * (`QuantiteArcSecteur`), jamais un nom de phase arbitraire ; le mode "conversion" a une seule
 * phase ("conversion"). Aucun mécanisme de continuité nécessaire (contrairement à 5gen5) : la
 * cible de chaque écran est déjà connue EXACTEMENT depuis la génération (voir
 * `core5e/arcsSecteurs.types.ts`).
 */
import { DEPENDANCES_ARC_SECTEUR, ORDRE_RESOLUTION_ARC_SECTEUR } from "../core5e/arcsSecteurs.types";
import type { ExerciceArcSecteur, ExerciceModeConversion, ExerciceModeDeuxVersTrois, GenerateurExerciceArcSecteur, QuantiteArcSecteur } from "../core5e/arcsSecteurs.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseArcSecteur = QuantiteArcSecteur | "conversion";

/** Les 3 quantités manquantes, dans l'ordre des ÉCRANS : à chaque étape, la première quantité de
 * `ORDRE_RESOLUTION_ARC_SECTEUR` qu'une formule de `DEPENDANCES_ARC_SECTEUR` permet de calculer
 * avec les données et les quantités déjà trouvées. Toujours possible pour les 9 paires de
 * données (vérifié par script, audit 5e ch. 2) ; repli défensif sur l'ordre fixe sinon. */
export function quantitesManquantes(exercice: ExerciceModeDeuxVersTrois): QuantiteArcSecteur[] {
  const disponibles = new Set<QuantiteArcSecteur>(exercice.connues);
  const restantes = ORDRE_RESOLUTION_ARC_SECTEUR.filter((q) => !disponibles.has(q));
  const ordre: QuantiteArcSecteur[] = [];
  while (restantes.length > 0) {
    const i = restantes.findIndex((q) => DEPENDANCES_ARC_SECTEUR[q].some((requis) => requis.every((x) => disponibles.has(x))));
    const suivante = restantes.splice(i >= 0 ? i : 0, 1)[0];
    ordre.push(suivante);
    disponibles.add(suivante);
  }
  return ordre;
}

export function phaseInitiale(exercice: ExerciceArcSecteur): PhaseArcSecteur {
  if (exercice.mode === "conversion") return "conversion";
  return quantitesManquantes(exercice)[0];
}

/** Phase après `phaseActuelle` — "termine" une fois les 3 quantités manquantes toutes traitées
 * (deuxVersTrois) ou immédiatement après l'unique écran (conversion). */
export function phaseApres(exercice: ExerciceArcSecteur, phaseActuelle: PhaseArcSecteur): PhaseArcSecteur | "termine" {
  if (exercice.mode === "conversion") return "termine";
  const manquantes = quantitesManquantes(exercice);
  const index = manquantes.indexOf(phaseActuelle as QuantiteArcSecteur);
  return index + 1 < manquantes.length ? manquantes[index + 1] : "termine";
}

export interface ResultatExerciceDeuxVersTrois {
  mode: "deuxVersTrois";
  exercice: ExerciceModeDeuxVersTrois;
  /** Une entrée par quantité manquante (toujours exactement 3) — jamais de champs `number|null`
   * fixes : l'ensemble des quantités notées varie réellement d'un exercice à l'autre. */
  scores: Partial<Record<QuantiteArcSecteur, number>>;
  reveles: Partial<Record<QuantiteArcSecteur, boolean>>;
}

export interface ResultatExerciceConversion {
  mode: "conversion";
  exercice: ExerciceModeConversion;
  score: number;
  revele: boolean;
}

export type ResultatExerciceArcSecteur = ResultatExerciceDeuxVersTrois | ResultatExerciceConversion;

export interface EtatSessionArcSecteur {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceArcSecteur;
  exerciceCourant: ExerciceArcSecteur;
  phase: PhaseArcSecteur;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase (même principe que sessionComposeeGraphique.ts). */
  niveauAide: number;
  scoresPartiels: Partial<Record<QuantiteArcSecteur, number>>;
  revelesPartiels: Partial<Record<QuantiteArcSecteur, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceArcSecteur[];
  terminee: boolean;
}
