import type { Composantes, Point } from "./vecteur.types";

/**
 * Couche core — "Calcul de composantes de combinaisons linéaires" (chapitre "Calcul vectoriel").
 * **Remplace en place** (`promptcreationgenerateur21combinaisonslineaires.md`) l'ancienne version
 * plus simple de ce même générateur — `expression = k1(a1V1+b1V2) OP k2(a2V1+b2V2)` figée, sans
 * add-as-needed, sans parenthèses imbriquées à N termes, sans paire de points opposée, sans aide,
 * sans catalogue de variantes — voir CLAUDE.md pour le contraste complet entre les deux versions et
 * la décision explicite de remplacement (consultation utilisateur, un chevauchement de nom quasi
 * identique détecté avant implémentation).
 *
 * **Modèle général — une expression est une liste de GROUPES parenthésés**, combinés par des
 * opérateurs `+`/`-` entre eux : `expression = groupes[0] operateurs[0] groupes[1] ...`. Chaque
 * groupe porte un coefficient externe et 1 à 3 termes signés. Un groupe à **un seul terme** n'a
 * jamais de parenthèses visibles (`coefficientExterne` toujours `1` dans ce cas, le terme porte
 * directement son propre coefficient signé — ex. `5\vec{u}`, jamais `1(5\vec{u})`) ; un groupe à
 * 2-3 termes affiche toujours ses parenthèses et son coefficient externe distribué (ex.
 * `3(5\vec{u}-3\vec{AB}+2\vec{w})`). Ce modèle unique couvre les 5 variantes du catalogue sans
 * branchement de type — seule la FORME des groupes construits diffère (voir
 * `generateurs/combinaisonVecteurs/index.ts`).
 *
 * Un terme référence soit un vecteur LIBRE nommé (`u`/`v`/`w`, sans position), soit un vecteur
 * défini par une paire de points ORIENTÉE (`\vec{AB}` ou `\vec{BA}` — la direction fait partie du
 * terme, `depart`/`arrivee` distincts). `\vec{BA} = -\vec{AB}` : les deux orientations partagent le
 * même "id canonique" (toujours la paire triée alphabétiquement, `"AB"`, jamais `"BA"`) pour le
 * regroupement final — voir `idCanoniqueRef` (`generateurs/combinaisonVecteurs/index.ts`).
 */
export interface VecteurNomme {
  nom: string;
  composantes: Composantes;
}

export type RefVecteurBase =
  | { type: "libre"; nom: string }
  | { type: "pointAPoint"; depart: string; arrivee: string };

export interface TermeVecteur {
  /** Signé, jamais nul — le signe du tout premier terme d'un groupe est le signe propre du terme
   * (ex. `-2\vec{u}` en tête d'un groupe est légitime) ; pour les termes suivants DANS le même
   * groupe, ce signe sépare ce terme du précédent (`+3\vec{v}` après `-2\vec{u}` ⟹ `-2u+3v`). Le
   * signe reliant deux GROUPES différents n'est jamais porté ici — voir `operateurs`. */
  coefficient: number;
  ref: RefVecteurBase;
}

export interface GroupeCombinaison {
  /** Toujours `1` quand `termes.length === 1` (aucun coefficient externe séparé à distribuer —
   * le terme unique porte déjà toute sa magnitude) ; un entier positif (2, 3, 4...) sinon, à
   * distribuer sur chacun des 2-3 termes du groupe. */
  coefficientExterne: number;
  termes: TermeVecteur[];
}

export type VarianteCombinaisonVecteurs = "plate" | "parentheses" | "vecteur-repete" | "paire-opposee" | "complete";

/**
 * `ExerciceCombinaisonVecteurs.baseCanonique` liste les identifiants de vecteurs de base proposés
 * par l'interface "add-as-needed" de l'écran 1 — toujours un sous-ensemble de
 * `{noms de vecteursLibres} ∪ {"AB"}` (jamais `"BA"`, pour forcer la conversion `\vec{BA}=-\vec{AB}`
 * plutôt que de permettre de la contourner — voir le prompt de création).
 */
export interface ExerciceCombinaisonVecteurs {
  variante: VarianteCombinaisonVecteurs;
  /** Toujours exactement 3 vecteurs libres nommés `u`, `v`, `w` (mêmes noms à chaque génération —
   * la variété pédagogique vient de la structure/des valeurs, pas des lettres utilisées). Un
   * vecteur peut légitimement ne jamais apparaître dans `groupes` (son coefficient réduit final
   * est alors 0, "une valeur valide et autorisée" pour l'add-as-needed — voir le prompt). */
  vecteursLibres: VecteurNomme[];
  /** `null` sauf pour les variantes `paire-opposee`/`complete`, qui embarquent toujours exactement
   * une paire de points A/B (jamais plus). */
  points: { A: Point; B: Point } | null;
  /** `t = groupes[0] operateurs[0] groupes[1] ...` — `operateurs.length === groupes.length - 1`. */
  groupes: GroupeCombinaison[];
  operateurs: ("+" | "-")[];
  /** Nom affiché de la combinaison résultat, ex. `"t"` dans `t = ...`. */
  resultatNom: string;
  /** Options de l'add-as-needed de l'écran 1, dans un ordre d'affichage fixe — voir la doc de
   * l'interface ci-dessus. */
  baseCanonique: string[];
  /** Cible de l'écran 1 (réduction symbolique) — une entrée par id de `baseCanonique`, jamais
   * omise même si elle vaut 0 (calculée une fois pour toutes à la génération, jamais recalculée
   * différemment à la vérification — voir `generateurs/combinaisonVecteurs/index.ts`). */
  coefficientsReduits: Record<string, number>;
  /** Cible de l'écran 2 (calcul numérique final). */
  reponse: Composantes;
}

export type GenerateurExerciceCombinaisonVecteurs = () => ExerciceCombinaisonVecteurs;
