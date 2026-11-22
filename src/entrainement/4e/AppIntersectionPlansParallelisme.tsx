import type { ExerciceIntersectionParallele } from "./core/intersectionParallele.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceIntersectionParallele } from "./generateurs/intersectionParallele";
import { correctionDetailleeIntersectionParallele } from "./generateurs/intersectionParallele/corrigeDetaille";
import { consigneGlobaleIP, ecransIP, enonceTexteIP, figureEcranIP, legendeIP } from "./ui/formatIntersectionParallele";
import { AppEspaceLotH } from "./components/AppEspaceLotH";

/**
 * gen134 — « Intersection de deux plans par parallélisme » (4e, chapitre 8, § 5 et § 8, processus 2
 * APPLIQUER). Variante « plans parallèles coupés par un troisième » : le point connu R de la face
 * opposée, la parallèle à (PQ) menée par R (propriété 1 du § 5), puis le point S où elle rencontre une
 * arête. Variante « un point commun et une direction » : le point K (rencontre de deux traces dans une
 * même face), la direction (théorème du toit, § 8), puis le point K′ de la face opposée. Choix fermés à
 * UNE tentative ; point touché sur la figure à TROIS tentatives (leurres : croisements du dessin, points
 * hors de la face). Coquille `components/AppEspaceLotH.tsx`.
 */
export function AppIntersectionPlansParallelisme() {
  return (
    <AppEspaceLotH<ExerciceIntersectionParallele>
      titre="Intersection de deux plans par parallélisme"
      sousTitre="Chapitre 8 — Géométrie dans l'espace"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceIntersectionParallele}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecransIP}
      consigneGenerale={(e) => [{ type: "texte", valeur: `${enonceTexteIP(e)} ${consigneGlobaleIP(e)}` }]}
      figure={figureEcranIP}
      legende={(e) => (
        <p style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", justifyContent: "center", margin: "4px 0 0", fontWeight: 600 }}>
          {legendeIP(e).map((l) => (
            <span key={l.texte} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: l.couleur, opacity: 0.75 }} />
              {l.texte}
            </span>
          ))}
        </p>
      )}
      correction={correctionDetailleeIntersectionParallele}
      idDebug="__debuggen134"
    />
  );
}
