import { useState } from "react";
import { Line, Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";
import { CIBLE_NOMBRE_LIGNES_QCM, evaluerCandidat, type ViewBoxGraphiqueCyclo } from "../ui6e/formatGraphiquesCyclometriques";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";

const COULEUR_COURBE = "#1971c2";

interface Props {
  exercice: ExerciceGraphiquesCyclometriques;
  index: number;
  viewBox: ViewBoxGraphiqueCyclo;
  /** Mesurées par l'appelant (`EtapeSelectionGraphiqueQCM`, `useLargeurConteneur`) — les 4/6
   * graphiques d'un même écran partagent toujours la même taille. */
  largeur: number;
  hauteur: number;
}

/**
 * Un des graphiques d'un écran QCM `6gen5` (empilés pleine largeur, lettrés A→F par l'appelant —
 * ce composant ne connaît PAS sa lettre, seulement son `index`) — même `viewBox` INITIAL pour les
 * candidates d'une instance (contrainte impérative de la spec : la seule échelle de DÉPART ne doit
 * jamais trahir la bonne réponse). Rendu via `Plot.OfX` — les discontinuités (famille D, `NaN`
 * retourné hors domaine) créent naturellement une coupure du tracé, exactement le comportement
 * voulu pour distinguer une vraie asymptote verticale d'une courbe continue.
 *
 * **Zoom/pan réactivés** (retour utilisateur "tes graphes sont pourris [...] avec les mêmes
 * options (graduation, échelle, possibilité de span, zoom, etc) comme ceux des générateurs de 4e et
 * 5e") — `pan={true}`/`zoom={{min: ZOOM_MIN, max: ZOOM_MAX}}` (constantes PARTAGÉES, `ui/
 * mafsTransformation.ts`, transversal 3 chantiers, jamais dupliquées ici), à la place de l'ancien
 * `pan={false}`/`zoom={false}` ("cadre FIXE"). Ne casse PAS la contrainte d'équité entre les 4/6
 * candidats : celle-ci ne porte que sur le `viewBox` de DÉPART (identique pour tous, inchangé par
 * ce correctif) — chaque graphique reste ensuite manipulable INDÉPENDAMMENT des autres (4 instances
 * `<Mafs>` distinctes), exactement comme un élève zoomerait indépendamment sur chacun des 4
 * schémas d'un exercice papier ; aucune interaction sur l'un ne révèle ni ne modifie les 3 autres.
 * `DomaineTraceX` (`components/mafsGraphPartage.tsx`, déjà utilisé par `MafsGraphTransformation.tsx`
 * en 4e) fait suivre le tracé à la fenêtre visible courante plutôt que de le figer au `viewBox`
 * initial — sans quoi un dézoom au-delà du cadre de départ laisserait un vide (piège déjà
 * documenté, `promptauditcourbesmafszoom.md`). `formatIndicateurPasGrille`/`onPasChange`
 * (`GrilleAdaptative`) affiche l'échelle courante sous le graphique, même convention que les
 * graphes 4e/5e (`.mafs-graph-pas`) — utile dès que l'élève zoome un candidat à une échelle
 * différente des 3 autres.
 *
 * `preserveAspectRatio={false}` EXPLICITE — même correctif que `GrapheOptionDeriveeExpo.tsx`
 * (`6gen8`, bug trouvé par Playwright) : `xMin`/`xMax` est calculé PAR FAMILLE (`fenetreX`, ex.
 * famille B : fenêtre fixe `[-10;10]`) indépendamment de l'étendue verticale réelle (souvent
 * beaucoup plus étroite, `arctan` bornant f à quelques unités) — sans ce réglage, Mafs applique
 * par défaut `preserveAspectRatio="contain"` et étire silencieusement l'axe Y pour égaliser le pas
 * pixel/unité des deux axes, aplatissant visuellement la courbe (voir CLAUDE.md, "Graphes Mafs
 * génériques" : obligatoire dès que les 2 axes représentent des grandeurs de nature différente).
 *
 * **Densité de graduation augmentée / axes garantis visibles** (retour utilisateur "augmente la
 * densité des graduation, mets les axes X et Y", suite au correctif zoom/pan ci-dessus) :
 * `cibleNombreLignes` passé à `GrilleAdaptative` (`components/mafsGraphPartage.tsx`) remonté de `3`
 * à `6` — `3` (valeur héritée de la toute première version "cadre fixe" du graphe, jamais revue
 * depuis) ne ciblait qu'1 à 2 lignes de grille labellisées sur la largeur réelle du graphe une fois
 * empilé (confirmé par capture Playwright), bien en-deçà de la densité par défaut
 * (`CIBLE_NOMBRE_LIGNES=10`, `ui/mafsTransformation.ts`) utilisée par les graphes 4e/5e de
 * référence. `6` (plutôt que le défaut `10`) reste malgré tout délibérément réduit par rapport à ce
 * défaut : ces 4 graphes sont carrés et nettement plus petits (200-360px, `EtapeSelectionGraphique
 * QCM.tsx`) que les graphes 4e/5e usuels — un `10` y ferait chevaucher les étiquettes numériques,
 * même précédent déjà établi ailleurs sur la plateforme pour un espace restreint
 * (`CIBLE_NOMBRE_LIGNES_BOITE=6`, `BoiteMoustachesGraph.tsx`). Les axes eux-mêmes (lignes x=0/y=0,
 * `Coordinates.Cartesian` via l'option `axis` de `GrilleAdaptative`, déjà active par défaut ici,
 * jamais masquée) sont désormais TOUJOURS dans le cadre visible grâce à `assurerAxesVisibles`
 * (nouvelle fonction additive, `ui/mafsTransformation.ts`) appliquée en bout de chaîne par
 * `calculerViewBoxGraphique` (`ui6e/formatGraphiquesCyclometriques.ts`) — sans elle, Mafs ne
 * dessine tout simplement pas la ligne d'axe hors de l'intervalle de données couvert par le
 * viewBox, ce qui pouvait laisser un axe totalement absent pour une fenêtre décalée loin de 0 (voir
 * la doc de cette fonction pour le détail).
 */
export function GrapheOptionCyclo({ exercice, index, viewBox, largeur, hauteur }: Props) {
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  // Famille D, candidate NON continue (le vrai `arctan(k/(x-p))`, ou un distracteur qui garde la
  // singularité) : `x=p` est un SAUT (limites gauche/droite finies, `c∓π/2`, jamais ±∞ — arctan est
  // bornée) — jamais une vraie asymptote infinie. Un unique `Plot.OfX` sur tout le domaine laisserait
  // Mafs échantillonner de part et d'autre de `p` sans jamais tomber exactement dessus (branches
  // finies, jamais `NaN`), reliant les deux branches par un faux segment plein — bug rapporté par un
  // utilisateur. Corrigé en traçant les 2 branches séparément (chacune bornée à `p` via `DomaineTraceX`
  // — seule la restriction MATHÉMATIQUE réelle, jamais les bornes du viewBox initial, pour rester
  // correct après un pan/zoom) et en matérialisant le saut par un `Line.Segment` en pointillé entre
  // les 2 limites `c-π/2`/`c+π/2`, même convention que les asymptotes de `MafsGraphFonctionsReference.tsx`
  // (`style="dashed"`, `EPAISSEUR_TRAIT_DISCRETE`, opacité réduite — jamais l'élément principal du regard).
  const discontinuite = exercice.famille === "D" && !exercice.candidats[index].continu ? exercice.candidats[index] : null;
  const courbe = (domaine: [number, number]) => (
    <Plot.OfX
      y={(x) => {
        const v = evaluerCandidat(exercice, index, x);
        return v === null ? NaN : v;
      }}
      domain={domaine}
      color={COULEUR_COURBE}
      weight={EPAISSEUR_TRAIT_ACCENTUE}
    />
  );
  return (
    <div className="mafs-graph">
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: [viewBox.xMin, viewBox.xMax], y: [viewBox.yMin, viewBox.yMax], padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
        preserveAspectRatio={false}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} cibleNombreLignes={CIBLE_NOMBRE_LIGNES_QCM} onPasChange={(x, y) => setPas({ x, y })} />
        {discontinuite ? (
          <>
            <DomaineTraceX largeur={largeur} borne={[-Infinity, discontinuite.p]}>
              {courbe}
            </DomaineTraceX>
            <DomaineTraceX largeur={largeur} borne={[discontinuite.p, Infinity]}>
              {courbe}
            </DomaineTraceX>
            <Line.Segment
              point1={[discontinuite.p, discontinuite.c - Math.PI / 2]}
              point2={[discontinuite.p, discontinuite.c + Math.PI / 2]}
              color={COULEUR_COURBE}
              style="dashed"
              weight={EPAISSEUR_TRAIT_DISCRETE}
              opacity={0.5}
            />
          </>
        ) : (
          <DomaineTraceX largeur={largeur}>{courbe}</DomaineTraceX>
        )}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
