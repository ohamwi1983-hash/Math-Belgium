import type { ExerciceIntersectionCercles } from "./core/intersectionCercles.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceIntersectionCercles } from "./generateurs/intersectionCercles";
import { correctionDetailleeIntersectionCercles } from "./generateurs/intersectionCercles/corrigeDetaille";
import { CONSIGNE_CERCLES, CONSIGNE_PARABOLE, ecrans, enonceFragments } from "./ui/formatIntersectionCercles";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen98 — « Intersection de deux cercles » (4e, chapitre 7, § 10, processus 2 APPLIQUER).
 * Cercle-cercle : droite obtenue par soustraction (équation libre), solutions de l'équation après
 * substitution (liste, « aucune » permis), points communs (liste de points, « aucun » permis).
 * Cercle-parabole : substitution du carré commun (choix, une tentative), solutions, points communs
 * (solution rejetée : message ciblé). Coquille commune `components/AppTransfertSecondDegre.tsx`.
 */
export function AppIntersectionCercles() {
  return (
    <AppTransfertSecondDegre<ExerciceIntersectionCercles>
      titre="Intersection de deux cercles"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceIntersectionCercles}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={(e) => (e.variante === "cercle-cercle" ? CONSIGNE_CERCLES : CONSIGNE_PARABOLE)}
      blocDonnees={(e) => (
        <p style={{ margin: "6px 0" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      correction={correctionDetailleeIntersectionCercles}
      idDebug="__debuggen98"
    />
  );
}
