import type { ExerciceRealiteIllusion } from "./core/realiteIllusion.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceRealiteIllusion } from "./generateurs/realiteIllusion";
import { correctionDetailleeRealiteIllusion } from "./generateurs/realiteIllusion/corrigeDetaille";
import { CONSIGNE_PAPIER, ecransRI, figureEcranRI } from "./ui/formatRealiteIllusion";
import { AppEspaceLotH } from "./components/AppEspaceLotH";

/**
 * gen135 — « Réalité ou illusion ? » (4e, chapitre 8, § 6, processus 3 TRANSFÉRER ; exercice 1 du
 * manuel). Un solide ABCDEF dessiné en perspective cavalière, faces supposées planes : peut-il
 * exister ? Trois choix fermés à UNE tentative (coquille `components/AppEspaceLotH.tsx`) : les trois
 * plans en jeu (faces latérales), la position des arêtes latérales prolongées sur le dessin
 * (concourantes, parallèles, ni l'un ni l'autre — les prolongements n'apparaissent qu'APRÈS cet
 * écran), puis le verdict justifié par le théorème des trois plans.
 */
export function AppRealiteIllusion() {
  return (
    <AppEspaceLotH<ExerciceRealiteIllusion>
      titre="Réalité ou illusion ?"
      sousTitre="Chapitre 8 — Géométrie dans l'espace"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceRealiteIllusion}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecransRI}
      consigneGenerale={() => [{ type: "texte", valeur: `On a dessiné en perspective cavalière le solide ABCDEF (base ABC, dessus DEF). ${CONSIGNE_PAPIER.replace(" Justifie.", "")}` }]}
      figure={figureEcranRI}
      correction={correctionDetailleeRealiteIllusion}
      idDebug="__debuggen135"
    />
  );
}
