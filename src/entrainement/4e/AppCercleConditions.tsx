import type { ExerciceCercleConditions } from "./core/cercleConditions.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCercleConditions } from "./generateurs/cercleConditions";
import { correctionDetailleeCercleConditions } from "./generateurs/cercleConditions/corrigeDetaille";
import { consigneGlobale, ecrans, enonceFragments } from "./ui/formatCercleConditions";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen93 — « Déterminer un cercle par des conditions » (4e, chapitre 7 « Géométrie analytique plane »,
 * § 8, processus 3 TRANSFÉRER). Cercle de diamètre [AB], cercle passant par trois points (médiatrices),
 * cercle passant par deux points de centre sur une droite. Coquille commune
 * `components/AppTransfertSecondDegre.tsx` (champs à trois tentatives, saisie illisible ou sans « = »
 * non comptée, aides à deux niveaux, corrigé de l'étape, `SelecteurVarianteDev`, `?code=`).
 */
export function AppCercleConditions() {
  return (
    <AppTransfertSecondDegre<ExerciceCercleConditions>
      titre="Déterminer un cercle par des conditions"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceCercleConditions}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={consigneGlobale}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", overflowX: "auto" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      // La figure du corrigé papier est déjà montrée sous l'écran (`figureApres`) : pas deux fois.
      correction={(e) => correctionDetailleeCercleConditions(e).map(({ figureHtml: _f, ...etape }) => etape)}
      idDebug="__debuggen93"
    />
  );
}
