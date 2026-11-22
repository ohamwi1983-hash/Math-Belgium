import type { ExerciceLectureSolide } from "./core/lectureSolide.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureSolide } from "./generateurs/lectureSolide";
import { correctionEcranLectureSolide } from "./generateurs/lectureSolide/corrigeDetaille";
import { CONSIGNE_POSITIONS, enonceTexte, ecrans, figureEcran, nomDroite } from "./ui/formatLectureSolide";
import { COULEUR_ACCENT, COULEUR_PLAN_1 } from "./ui/figureEspaceLotH";
import { AppEspaceLotH } from "./components/AppEspaceLotH";

/**
 * gen133 — « Lire un solide en perspective : vocabulaire et positions » (4e, chapitre 8, § 1 à § 4,
 * processus 1 CONNAÎTRE). Sur un cube, un pavé, un prisme couché ou un tétraèdre en perspective
 * cavalière, des écrans de pure lecture : « dessin » (faces en vraie grandeur ou déformées, arêtes
 * cachées, vraie longueur d'une arête), « appartenance » (points nommés d'un plan, trois plans),
 * « positions » (quatre paires de droites : sécantes, parallèles ou gauches). Choix fermés et
 * sélections à UNE tentative, jugés ✗ / ✓. Coquille `components/AppEspaceLotH.tsx`.
 */
export function AppLireSolidePerspective() {
  return (
    <AppEspaceLotH<ExerciceLectureSolide>
      titre="Lire un solide en perspective : vocabulaire et positions"
      sousTitre="Chapitre 8 — Géométrie dans l'espace"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceLectureSolide}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={(e) => [{ type: "texte", valeur: e.variante === "positions" ? `${enonceTexte(e)} ${CONSIGNE_POSITIONS}` : enonceTexte(e) }]}
      figure={figureEcran}
      legende={(e, ctx) => {
        if (e.variante !== "positions") return null;
        const p = e.paires[ctx.ligneActive ?? 0]!;
        return (
          <p style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", justifyContent: "center", margin: "4px 0 0", fontWeight: 600 }}>
            <span style={{ color: COULEUR_ACCENT }}>{nomDroite(p.d1)}</span>
            <span style={{ color: COULEUR_PLAN_1 }}>{nomDroite(p.d2)}</span>
          </p>
        );
      }}
      correction={correctionEcranLectureSolide}
      idDebug="__debuggen133"
    />
  );
}
