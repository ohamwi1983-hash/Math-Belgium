import type { ExerciceDetectiveEspace, ThemeDetectiveEspace, TypeErreurEspace } from "../../core/detectiveEspace.types";
import { genererCavaliere } from "./cavaliere";
import { choisir } from "./commun";
import { genererDroites } from "./droites";
import { genererParallelisme } from "./parallelisme";
import { genererPlan } from "./plan";
import { genererSection } from "./section";

/**
 * Générateur de gen107 — « Détective d'erreurs : géométrie dans l'espace ». Tout le hasard passe
 * par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et
 * le QR code d'une feuille rouvre ainsi le MÊME exercice (copie, propositions, ordre).
 *
 * Variante = THÈME de la copie. Dans chaque thème, le TYPE D'ERREUR est tiré uniformément EN
 * PREMIER (trois types par thème), puis — pour les thèmes à trois remarques indépendantes
 * (droites, plan, section) — la LIGNE FAUSSE, uniformément parmi les trois, indépendamment du type ;
 * pour les thèmes « démonstration » et « dessin » (parallélisme, cavalière), le type fixe sa ligne
 * (comme 6gen99). Ce sont les verdicts des écrans a) et b) : tirés avant toute boucle de rejet, ils
 * n'entrent jamais dans `forme` (`profil.ts`).
 */

export const TYPES_PAR_THEME: Record<ThemeDetectiveEspace, TypeErreurEspace[]> = {
  droites: ["croisementApparent", "pasDeCroisement", "faceCommune"],
  plan: ["pointsAlignes", "pointSurDroite", "droitesGauches"],
  section: ["unSeulPoint", "mauvaisCote", "nonCoplanaires"],
  parallelisme: ["temoinsParalleles", "horsDuPlan", "raisonFausse"],
  cavaliere: ["angle", "reduction", "cachees"],
};

export const CATALOGUE_VARIANTES: { id: ThemeDetectiveEspace; label: string }[] = [
  { id: "droites", label: "Position de deux droites (sécantes, parallèles, gauches)" },
  { id: "plan", label: "Données qui déterminent un plan" },
  { id: "section", label: "Section plane d'un cube ou d'un pavé" },
  { id: "parallelisme", label: "Démonstration : deux plans parallèles" },
  { id: "cavaliere", label: "Dessin en perspective cavalière" },
];

export function genererDetectiveEspace(theme: ThemeDetectiveEspace): ExerciceDetectiveEspace {
  const type = choisir(TYPES_PAR_THEME[theme]);
  switch (theme) {
    case "droites":
      return genererDroites(type, Math.floor(Math.random() * 3));
    case "plan":
      return genererPlan(type, Math.floor(Math.random() * 3));
    case "section":
      return genererSection(type, Math.floor(Math.random() * 3));
    case "parallelisme":
      return genererParallelisme(type);
    case "cavaliere":
      return genererCavaliere(type);
  }
}

export function construireAvecVariante(id: string): ExerciceDetectiveEspace {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveEspace();
  return genererDetectiveEspace(id as ThemeDetectiveEspace);
}

/** Tirage libre : un thème au hasard. */
export function genererExerciceDetectiveEspace(): ExerciceDetectiveEspace {
  return genererDetectiveEspace(choisir(CATALOGUE_VARIANTES).id);
}
