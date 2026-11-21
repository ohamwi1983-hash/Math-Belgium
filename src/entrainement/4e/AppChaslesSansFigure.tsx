import type { ExerciceChaslesSansFigure } from "./core/chaslesSansFigure.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChasles } from "./generateurs/chaslesSansFigure";
import { correctionDetailleeChasles } from "./generateurs/chaslesSansFigure/corrigeDetaille";
import { consigneGenerale, donneesEcran, ecrans } from "./ui/formatChaslesSansFigure";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen130 — « Chasles sans figure : réduire et démontrer une égalité vectorielle » (4e, chapitre 6,
 * § 6, processus 2 APPLIQUER). Calcul littéral sur des vecteurs nommés par deux points : réduire
 * (retourner, réordonner, télescoper), simplifier avec des coefficients, démontrer une égalité
 * (première ligne en choix fermé, puis le vecteur obtenu), insérer un point (milieu, point défini par
 * une égalité). Saisie lue comme une combinaison de vecteurs (`moteur/expressionChasles.ts`).
 * Coquille commune `components/AppTransfertSecondDegre.tsx`.
 */
export function AppChaslesSansFigure() {
  return (
    <AppTransfertSecondDegre<ExerciceChaslesSansFigure>
      titre="Chasles sans figure"
      sousTitre="Chapitre 6 — Calcul vectoriel"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceChasles}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={consigneGenerale}
      blocDonnees={(e) => (
        <p style={{ margin: "6px 0" }}>
          <RenduFragments fragments={donneesEcran(e)} />
        </p>
      )}
      correction={correctionDetailleeChasles}
      idDebug="__debuggen130"
    />
  );
}
