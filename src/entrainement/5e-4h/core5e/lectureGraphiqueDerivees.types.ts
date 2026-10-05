/**
 * Couche core (5e) — contrat pour 5gen30 ("Lecture graphique — dérivées et applications"), 6e et
 * DERNIER générateur du chapitre "Dérivées et applications". Lecture graphique PURE (aucun calcul) :
 * un graphique de f est affiché, l'élève lit directement asymptotes/extrema/signe de f'/f''/
 * concavité/points d'inflexion. Type pur, aucune logique — voir
 * `generateurs5e/lectureGraphiqueDerivees/` pour la génération (y compris le calcul de la vérité
 * terrain par balayage numérique) et `ui5e/lectureGraphiqueDeriveesCourbe.ts` pour le rendu.
 *
 * f(x) = baseTrend(x) + Σ bumpExtremum_i(x) + Σ bumpInflexion_j(x) — `baseTrend` contrôle SEULEMENT
 * le comportement aux bords (même mécanisme que 5gen22, sous-objet `asymptotique`, réutilisé
 * directement), les bumps (gaussiennes pour les extrema, tanh pour les points d'inflexion)
 * contrôlent les positions INTÉRIEURES. Les positions NOMINALES des bumps
 * (`bumpsExtremum[i].positionNominale`...) servent UNIQUEMENT à reconstruire la MÊME courbe de
 * façon déterministe — JAMAIS utilisées directement comme vérité terrain : `extrema`/`inflexions`
 * sont la VRAIE position/valeur/classification, retrouvées par balayage numérique de la courbe
 * RÉELLEMENT construite (voir CLAUDE.md, "vérification par cohérence interne").
 *
 * **Fait vérifié empiriquement, à connaître avant de lire `generateurs5e/lectureGraphiqueDerivees/`** :
 * `extrema`/`inflexions` peuvent légitimement contenir PLUS d'entrées que de bumps placés — le
 * mélange sigmoïde hérité de 5gen22 (`baseTrend`, construction morceau-par-morceau) introduit assez
 * souvent son propre point critique "organique" dans la zone de transition entre 2 gabarits
 * différents, invisible/sans conséquence pour 5gen22 (qui ne teste jamais l'intérieur d'un morceau,
 * "cosmétique et libre" par design) mais qui DOIT être pris en compte ici, où le nombre
 * d'extrema/PI doit rester exactement ce qui est réellement affiché. Le générateur ne les filtre
 * JAMAIS : ils sont intégrés à la vérité terrain comme n'importe quel autre point trouvé par
 * balayage — voir l'en-tête de `generateurs5e/lectureGraphiqueDerivees/courbeNumerique.ts` pour le
 * détail de l'investigation et le paramètre ajusté en conséquence (ALPHA_BLEND_DERIVEES).
 */
import type { ExerciceLectureGraphiqueLimites } from "./lectureGraphiqueLimites.types";

export interface BumpExtremumDerivees {
  positionNominale: number;
  /** Signé — >0 produit un MAX local, <0 un MIN local (vérifié empiriquement, jamais supposé par
   * intuition — voir `courbeNumerique.test.ts`). Magnitude dans [2,4]. */
  amplitude: number;
  /** Dans [0.7,0.9]. */
  largeur: number;
}

export interface BumpInflexionDerivees {
  positionNominale: number;
  /** Signé — le signe ne change que l'orientation visuelle locale (∪→∩ ou l'inverse) autour du
   * point, jamais la NATURE (toujours un vrai point d'inflexion : la dérivée de tanh, sech², ne
   * s'annule jamais). Magnitude dans [1.5,2.5]. */
  amplitude: number;
  /** Dans [0.6,0.8]. */
  largeur: number;
}

export interface ExtremumLectureGraphiqueDerivees {
  /** Position RÉELLE, trouvée par balayage numérique — jamais la position nominale d'un bump. */
  position: number;
  /** f(position), RÉELLE (évaluée sur la courbe complète, base + tous les bumps). */
  valeur: number;
  classification: "max" | "min";
}

export interface InflexionLectureGraphiqueDerivees {
  position: number;
  /** Toujours "pi" ici — contrairement à 5gen29, chaque point trouvé par balayage EST par
   * construction un vrai changement de signe de f'', jamais un cas dégénéré à exclure. */
  classification: "pi";
}

export interface ExerciceLectureGraphiqueDerivees {
  /** Comportement aux bords (AV + limite à l'infini) — réutilise TEL QUEL le contrat de 5gen22,
   * généré par `genererExerciceLectureGraphiqueLimites()` (Couche A ↔ Couche A). */
  asymptotique: ExerciceLectureGraphiqueLimites;
  bumpsExtremum: BumpExtremumDerivees[];
  bumpsInflexion: BumpInflexionDerivees[];
  /** Vérité terrain — triée par position croissante. */
  extrema: ExtremumLectureGraphiqueDerivees[];
  /** Vérité terrain — triée par position croissante. */
  inflexions: InflexionLectureGraphiqueDerivees[];
}

export type GenerateurExerciceLectureGraphiqueDerivees = () => ExerciceLectureGraphiqueDerivees;
