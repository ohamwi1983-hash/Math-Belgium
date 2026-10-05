/**
 * Couche core — "Équations/inéquations du second degré en contexte", cinquante-septième générateur
 * (position dans `App.tsx` — ajouté après le cinquante-sixième, `promptimplementationgen57.md`,
 * même convention "position = ordre de création" — voir CLAUDE.md). Spec :
 * `specgen56equationinequationseconddegre.md` ("gen56" dans son propre nom de fichier, sans
 * incidence sur la position réelle — voir la section CLAUDE.md dédiée pour le détail complet de
 * cette divergence de numérotation).
 *
 * **Écrans 1-4 réutilisés TELS QUELS depuis "Problèmes d'optimisation"** (gen55, position 55),
 * restructurés par `promptimplementationgen57.md` (remplace l'ancienne réutilisation des écrans
 * "isolement"/"construction"/"domaine", architecture à 8 écrans) : `base: ExerciceOptimisation`
 * embarque un exercice gen55 complet et VALIDE, réutilisé directement par les composants
 * `EtapeIdentificationOptimisation`/`EtapeContrainteEtGrandeurOptimisation`/
 * `EtapeSystemeOptimisation`/`EtapeDomaineOptimisation` ET les fonctions `verifierIdentification`/
 * `verifierContrainteEtGrandeur`/`verifierSysteme`/`verifierDomaine`
 * (`moteur/verificationOptimisation.ts`, moteur→moteur explicitement autorisé) — jamais dupliqués :
 * un changement futur sur ces composants/fonctions côté gen55 se répercute automatiquement ici.
 * `base.famille` est un membre de `FamilleOptimisationModelisation`/`FamilleOptimisationFonctionDonnee`
 * élargi spécifiquement pour ce générateur (voir `core/optimisation.types.ts`) —
 * `base.sommet`/`base.sommetDansDomaine`/`base.optimal`/`base.optionsInterpretation`/`base.sens`
 * sont calculés correctement (mathématiquement valides) mais jamais surfacés par CE générateur
 * (aucun écran "sommet"/"decision"/"interpretation" de gen55 n'est réutilisé) — champs requis par le
 * TYPE `ExerciceOptimisation` uniquement, voir CLAUDE.md pour la justification complète de ce choix
 * (réutilisation directe vs contrat séparé).
 *
 * **Deux voies, fixées par famille (jamais tirées indépendamment)** — `base.variante==="modelisation"`
 * (6 familles sur 8, écrans 1-4 ci-dessus intégralement parcourus, `identification` conditionnelle à
 * `base.identificationXY`, jamais renseigné par les 8 familles actuelles) ou
 * `base.variante==="fonctionDonnee"` (`chuteObjet`/`distanceFreinage` — coefficients PHYSIQUES
 * directement communiqués, jamais issus d'une élimination à 2 variables ; écrans 1-4 SAUTÉS
 * entièrement, fonction et domaine déjà donnés dans l'énoncé).
 *
 * **2 variantes, écrans 5-8 propres** — `equation` : traduire le seuil en `f(x)=k`, résoudre (TOUJOURS
 * exactement 2 racines mathématiques réelles par construction — "cible d'abord", voir
 * `generateurs/equationInequationSecondDegre/racines.ts`), valider CHAQUE racine contre le domaine
 * de `base` (rejet éventuel). `inequation` : traduire en `f(x)>k`/`f(x)<k` (`sens` fixé par famille,
 * cohérent avec l'orientation de la parabole — jamais les deux sens pour une même famille), résoudre
 * l'intervalle BRUT (toujours borné par construction), l'intersecter avec le domaine de `base`.
 *
 * **`voieSysteme` — 2 écrans additionnels EN AMONT de la séquence, famille `achatGroupe`
 * uniquement** (extension `ca355440-specgen55optimisationseconddegre.md`/
 * `f56fd11e-specgen56equationinequationseconddegre.md`, voir CLAUDE.md) : `true` ssi
 * `famille==="achatGroupe"` — la situation narrative pose un VRAI système à 2 équations à 2
 * inconnues (`x·y=M` la situation réelle, `(x+a)(y-b)=M` la situation hypothétique), jamais une
 * simple relation déjà donnée comme les autres familles. `systeme` porte les 3 données narratives
 * (`M`/`a`/`b`) nécessaires à l'écran "poserSysteme", non `null` ssi `voieSysteme` — `null` pour
 * toutes les autres familles, qui n'ont jamais ce système à poser. `voieSysteme` saute directement
 * "identification"/"contrainteEtGrandeur" (les écrans 0a/0b posent déjà les 2 équations) et rejoint
 * "systeme" (réutilisé, isoler+substituer+développer) puis "domaine", avant de sauter à son tour
 * "poserEquationInequation" (substituer dans l'équation d'origine produit directement l'équation
 * finale, sans seuil `k` séparé) pour rejoindre "resoudre" directement.
 */
import type { ExerciceOptimisation, OptionInterpretation } from "./optimisation.types";

export type VarianteEquationInequationSecondDegre = "equation" | "inequation";

export type FamilleEquationInequationSecondDegre =
  | "chuteObjet"
  | "seuilRentabilite"
  | "distanceFreinage"
  | "remplissageReservoir"
  | "rectangleDimensions"
  | "resistancesParallele"
  | "achatGroupe"
  | "triangleRectanglePerimetre";

export interface IntervalleBorne {
  inf: number;
  sup: number;
}

/** Les 3 données narratives du système à poser à l'écran "poserSysteme" (`voieSysteme` uniquement)
 * — `M` (le montant/total réel, `x·y=M`), `a` (variation de prix/coût par personne manquante),
 * `b` (variation de quantité/personnes par personne manquante, `(x+a)(y-b)=M`). Voir
 * `generateurs/equationInequationSecondDegre/familles/achatGroupe.ts` pour la dérivation complète. */
export interface SystemeEquationInequation {
  M: number;
  a: number;
  b: number;
}

interface ExerciceEquationInequationCommun {
  famille: FamilleEquationInequationSecondDegre;
  /** Exercice "Problèmes d'optimisation" complet et valide — `base.variante === "modelisation"` pour
   * les écrans isolement/construction/domaine réutilisés tels quels (voir en-tête de fichier) ;
   * `base.variante === "fonctionDonnee"` pour les familles PHYSIQUES dont les coefficients sont
   * directement communiqués (jamais issus d'une élimination à 2 variables) — ces 3 écrans sont alors
   * SAUTÉS entièrement, `phaseInitiale` démarre directement à "poserEquationInequation" (même
   * principe que `voieSysteme` sur un axe orthogonal — voir CLAUDE.md, "Restructuration — bug actif,
   * voie fonctionDonnee"). */
  base: ExerciceOptimisation;
  /** Seuil introduit à l'écran "poserEquationInequation" (distinct du "sens" du domaine/sommet de
   * `base`, qui ne joue ici aucun rôle). */
  k: number;
  /** `true` ssi `famille==="achatGroupe"` — voir en-tête de fichier, "voieSysteme". */
  voieSysteme: boolean;
  /** Non `null` ssi `voieSysteme` — voir en-tête de fichier. */
  systeme: SystemeEquationInequation | null;
  optionsInterpretation: OptionInterpretation[];
  /** Question finale de l'exercice (ex. "Pour quelle valeur de t la hauteur vaut-elle exactement 45
   * m ?"), affichée PERSISTANTE sur les 7 écrans (`components/QuestionFinale.tsx`, voir CLAUDE.md
   * "Question finale persistante") — TOUJOURS une chaîne réelle (jamais `null`, contrairement à
   * `base.contexte.questionFinale` qui reste `null` pour ce générateur : la vraie question finale
   * de gen57 est celle-ci, jamais celle empruntée à gen55 pour `base`). */
  questionFinale: string;
}

/** `variante: "equation"` — `racinesCandidates` a TOUJOURS exactement 2 éléments triés croissant
 * (discriminant strictement positif par construction, jamais 0 ni 1 — voir `racines.ts`) ;
 * `racinesValides` = le sous-ensemble (0, 1 ou 2) qui tombe dans `base.domaine`. */
export interface ExerciceEquationSecondDegre extends ExerciceEquationInequationCommun {
  variante: "equation";
  racinesCandidates: [number, number];
  racinesValides: number[];
}

/** `variante: "inequation"` — `sens` fixé PAR FAMILLE (cohérent avec l'orientation de la parabole,
 * jamais tiré aléatoirement) : `"gt"` pour une parabole concave (f(x)>k = intervalle borné entre les
 * racines), `"lt"` pour une parabole convexe (f(x)<k = intervalle borné entre les racines). Voir
 * `familles/*.ts` pour l'orientation de chaque famille. `intervalleBrut` = solution de l'inéquation
 * sur R (toujours un intervalle BORNÉ par construction — jamais R tout entier ni l'ensemble vide) ;
 * `intervalleValide` = intersection avec `base.domaine`, TOUJOURS non vide par construction (voir
 * `racines.ts`, jamais besoin de représenter un ensemble vide pour ce générateur). */
export interface ExerciceInequationSecondDegre extends ExerciceEquationInequationCommun {
  variante: "inequation";
  sens: "gt" | "lt";
  intervalleBrut: IntervalleBorne;
  intervalleValide: IntervalleBorne;
}

export type ExerciceEquationInequationSecondDegre = ExerciceEquationSecondDegre | ExerciceInequationSecondDegre;

export type GenerateurExerciceEquationInequationSecondDegre = () => ExerciceEquationInequationSecondDegre;
