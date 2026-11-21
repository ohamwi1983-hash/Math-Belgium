import type { ExerciceDroiteCercle } from "./core/droiteCercle.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDroiteCercle } from "./generateurs/droiteCercle";
import { correctionDetailleeDroiteCercle } from "./generateurs/droiteCercle/corrigeDetaille";
import { consigneGlobale, ecrans, enonceFragments } from "./ui/formatDroiteCercle";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen92 — « Tangente et position relative d'une droite et d'un cercle » (4e, chapitre 7 « Géométrie
 * analytique plane », § 8, processus 2 APPLIQUER). Trois variantes : tangente en un point P du cercle
 * (CP vecteur normal), position relative par la distance du centre à la droite comparée au rayon
 * (verdict tiré à parts égales), cercle de centre donné tangent à une droite. Coquille commune :
 * `components/AppTransfertSecondDegre.tsx` (puces, choix fermé à une tentative, champs à trois
 * tentatives — saisie illisible ou sans « = » non comptée —, aides à deux niveaux, corrigé de l'étape,
 * `SelecteurVarianteDev`, `?code=` avec les MÊMES fonctions que l'adaptateur).
 */
export function AppDroiteCercle() {
  return (
    <AppTransfertSecondDegre<ExerciceDroiteCercle>
      titre="Tangente et position relative d'une droite et d'un cercle"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceDroiteCercle}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={consigneGlobale}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", overflowX: "auto" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      // La figure du corrigé papier est déjà montrée sous l'écran (`figureApres`) : pas deux fois.
      correction={(e) => correctionDetailleeDroiteCercle(e).map(({ figureHtml: _f, ...etape }) => etape)}
      idDebug="__debuggen92"
    />
  );
}
