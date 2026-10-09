import type { ContexteExtD, ExerciceExtD } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille D ("Théorème de Bayes à 3 catégories") pour `6gen52`. EXTENSION
 * de la philosophie de vérification de `generateurs6e/independanceBayes/familleC.ts` (`6gen32`
 * famille C, 2 catégories/causes) à 3 catégories — un IMPORT DIRECT est impossible ici (contrairement
 * aux autres familles de ce générateur) : la forme algébrique de `6gen32` famille C est câblée en dur
 * pour EXACTEMENT 2 causes (`p`/`1-p`, une seule conditionnelle connue `q1`, la seconde `q2` déduite
 * PAR SOUSTRACTION UNIQUE `1-p`) — passer à 3 catégories change la STRUCTURE même du calcul (3
 * probabilités d'appartenance sommant à 1, 2 conditionnelles connues, la 3e déduite par une formule
 * des probabilités totales à 3 TERMES au lieu de 2) : généraliser reviendrait à réécrire la fonction
 * entière, pas à la réutiliser (voir `docs/historique-6e.md`, section "Création — 6gen52" pour la
 * discussion complète et le mirroir "`independanceBayes/familleB.ts`, pourquoi le tableau 2×2 de
 * `6gen30` n'est pas réutilisé", même raisonnement).
 *
 * Ce qui EST repris de `6gen32` famille C, c'est la PHILOSOPHIE : `q1·r1`/`q2·r2` (probabilités
 * conjointes) toujours RECALCULÉES depuis les données brutes, jamais stockées ; la probabilité
 * manquante (`P(critère∩catégorie3)`, ici DÉDUITE PAR DIFFÉRENCE plutôt que par simple complément
 * 1-p) et la conditionnelle finale (`r3`) ne sont JAMAIS stockées non plus — toujours recalculées à
 * chaque appel de vérification (convention CLAUDE.md "vérification par cohérence interne").
 *
 * **Génération** : `q1`/`q2`/`q3` sommant à 1 (partition à 3 catégories), `r1`/`r2` connues, `r3`
 * tirée puis IMMÉDIATEMENT convertie en `pTotal=q1·r1+q2·r2+q3·r3` (moyenne pondérée de 3 valeurs
 * dans (0,1), donc TOUJOURS dans (0,1) — aucun retirage nécessaire, contrairement à `6gen32` famille
 * C qui devait écarter les coïncidences avec le piège du sens inversé : ce piège n'existe pas ici,
 * la conditionnelle demandée porte sur une 3e catégorie ENTIÈREMENT DISTINCTE de `r1`/`r2`, jamais
 * un simple "1 moins" d'une valeur déjà affichée).
 */

const CONTEXTES_D: readonly ContexteExtD[] = [
  {
    id: "assurance",
    texte: "Une compagnie d'assurance classe ses clients en 3 catégories selon leur profil de risque.",
    labelCategorie1: "profil à faible risque",
    labelCategorie2: "profil à risque moyen",
    labelCategorie3: "profil à haut risque",
    labelCritere: "le client déclare un sinistre dans l'année",
  },
  {
    id: "usine",
    texte: "Une usine reçoit des pièces de 3 fournisseurs différents.",
    labelCategorie1: "provient du fournisseur A",
    labelCategorie2: "provient du fournisseur B",
    labelCategorie3: "provient du fournisseur C",
    labelCritere: "la pièce est défectueuse",
  },
  {
    id: "ecole",
    texte: "Dans une école, les élèves suivent l'une de 3 filières.",
    labelCategorie1: "suit la filière scientifique",
    labelCategorie2: "suit la filière littéraire",
    labelCategorie3: "suit la filière artistique",
    labelCritere: "l'élève poursuit des études supérieures",
  },
];

const CANDIDATS_Q: readonly number[] = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
const CANDIDATS_R: readonly number[] = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
const ECART_MINIMAL_Q3 = 0.1;

/** Tire `q1`,`q2`,`q3` sommant EXACTEMENT à 1, chacune ≥ `ECART_MINIMAL_Q3` (évite une 3e catégorie
 * anecdotique, dénominateur `q3` trop petit à l'écran 4 — retirage borné, mirroir `6gen32`
 * `construireFamilleBReconstruire`). */
function tirerPartition3(): [number, number, number] {
  for (let tentative = 0; tentative < 200; tentative++) {
    const q1 = tirerParmi(CANDIDATS_Q);
    const q2 = tirerParmi(CANDIDATS_Q);
    const q3 = Math.round((1 - q1 - q2) * 100) / 100;
    if (q3 >= ECART_MINIMAL_Q3 && q3 <= 0.6) return [q1, q2, q3];
  }
  /* c8 ignore next */
  throw new Error("tirerPartition3 : aucune partition valide trouvée après 200 tentatives");
}

/** Construction déterministe (`q1`/`q2`/`q3`/`r1`/`r2`/`r3` fixés) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. `r3` sert UNIQUEMENT à calculer `pTotal` (jamais
 * stocké dans l'exercice retourné — dérivable, voir en-tête de fichier). */
export function construireAvecValeurs(q1: number, q2: number, q3: number, r1: number, r2: number, r3: number, contexte?: ContexteExtD): ExerciceExtD {
  const pTotal = q1 * r1 + q2 * r2 + q3 * r3;
  return { famille: "D", contexte: contexte ?? tirerParmi(CONTEXTES_D), q1, q2, q3, r1, r2, pTotal };
}

export function construireFamilleD(): ExerciceExtD {
  const [q1, q2, q3] = tirerPartition3();
  const r1 = tirerParmi(CANDIDATS_R);
  let r2 = tirerParmi(CANDIDATS_R);
  for (let essai = 0; essai < 20 && r2 === r1; essai++) r2 = tirerParmi(CANDIDATS_R);
  const r3 = tirerParmi(CANDIDATS_R);
  return construireAvecValeurs(q1, q2, q3, r1, r2, r3);
}
