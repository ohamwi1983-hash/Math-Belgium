import type { ExerciceDroitesRemarquables } from "./core/droitesRemarquables.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDroitesRemarquables } from "./generateurs/droitesRemarquables";
import { correctionDetailleeDroitesRemarquables } from "./generateurs/droitesRemarquables/corrigeDetaille";
import { consigneGlobale, ecrans, enonceFragments } from "./ui/formatDroitesRemarquables";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen94 — « Droites remarquables d'un triangle » (4e, chapitre 7 « Géométrie analytique plane », § 6,
 * processus 3 TRANSFÉRER). Médiatrices et centre du cercle circonscrit, hauteurs et orthocentre,
 * médianes et centre de gravité, aire par base et distance à une droite. Coquille commune
 * `components/AppTransfertSecondDegre.tsx` (champs à trois tentatives, saisie illisible ou sans « = »
 * non comptée, aides à deux niveaux, corrigé de l'étape, `SelecteurVarianteDev`, `?code=`).
 */
export function AppDroitesRemarquables() {
  return (
    <AppTransfertSecondDegre<ExerciceDroitesRemarquables>
      titre="Droites remarquables d'un triangle"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceDroitesRemarquables}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={consigneGlobale}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", overflowX: "auto" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      // La figure du corrigé papier est déjà montrée sous l'écran (`figureApres`) : pas deux fois.
      correction={(e) => correctionDetailleeDroitesRemarquables(e).map(({ figureHtml: _f, ...etape }) => etape)}
      idDebug="__debuggen94"
    />
  );
}
