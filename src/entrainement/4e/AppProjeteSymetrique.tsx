import type { ExerciceProjeteSymetrique } from "./core/projeteSymetrique.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceProjeteSymetrique } from "./generateurs/projeteSymetrique";
import { correctionDetailleeProjeteSymetrique } from "./generateurs/projeteSymetrique/corrigeDetaille";
import { CONSIGNE_GENERALE_REFLEXION, CONSIGNE_GENERALE_SYMETRIQUE, ecrans, enonceFragments, figureEnonce } from "./ui/formatProjeteSymetrique";
import { figurePourEcran } from "./ui/figureParaboleGrille";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen96 — « Projeté orthogonal, symétrique et réflexion » (4e, chapitre 7, § 6, processus 3
 * TRANSFÉRER). Symétrique : perpendiculaire (équation libre, toute forme acceptée), projeté H,
 * symétrique A′. Réflexion (billard, miroir, mur) : A′, droite (A′B), point d'impact I, longueur du
 * trajet. Champs à 3 tentatives (illisible : aucune tentative), aides à deux niveaux, corrigé de
 * l'étape quand la réponse est révélée. Coquille commune : `components/AppTransfertSecondDegre.tsx`
 * (`?code=` : première instance tirée avec les MÊMES fonctions que l'adaptateur).
 */
export function AppProjeteSymetrique() {
  return (
    <AppTransfertSecondDegre<ExerciceProjeteSymetrique>
      titre="Projeté orthogonal, symétrique et réflexion"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceProjeteSymetrique}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={(e) => (e.variante === "symetrique" ? CONSIGNE_GENERALE_SYMETRIQUE : CONSIGNE_GENERALE_REFLEXION)}
      blocDonnees={(e) => (
        <>
          <p style={{ margin: "6px 0" }}>
            <RenduFragments fragments={enonceFragments(e)} />
          </p>
          {e.variante === "reflexion" && <div className="figure-projete-symetrique" style={{ margin: "8px auto", maxWidth: 400 }} dangerouslySetInnerHTML={{ __html: figurePourEcran(figureEnonce(e)) }} />}
        </>
      )}
      correction={correctionDetailleeProjeteSymetrique}
      idDebug="__debuggen96"
    />
  );
}
