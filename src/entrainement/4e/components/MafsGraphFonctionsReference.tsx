import { useState } from "react";
import { Line, Mafs, Plot, Point } from "mafs";
import "mafs/core.css";
import type { ExerciceFonctionReference } from "../core/fonctionsReference.types";
import { pivotX, pointUnitaire } from "../moteur/verificationFonctionsReference";
import {
  RATIO_GRAPHE,
  ZOOM_MAX,
  ZOOM_MIN,
  calculerSegmentsVisibles,
  calculerViewBoxFonctionReference,
  evaluerPourGraphe,
} from "../ui/mafsFonctionsReference";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { formatFractionIrreductible } from "../ui/formatFraction";
import { FenetreVisibleXY, GrilleAdaptative, PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  /** Courbe cible — toujours affichée, fixe pour tout l'exercice. */
  cible: ExerciceFonctionReference;
  /** Courbe manipulable en direct par les curseurs — affichée uniquement si le bouton "Aide" est
   * activé (spec section 2) ; absente/`null` sinon. */
  live?: ExerciceFonctionReference | null;
}

const COULEUR_CIBLE = "#d6336c";
const COULEUR_LIVE = "#1971c2";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/**
 * Graphe Mafs (spec section 2 et 5) — affiche par défaut UNIQUEMENT la courbe cible, jamais de
 * courbe de référence séparée. Chaque courbe peut se tracer en 1 ou 2 segments de domaine (voir
 * calculerSegmentsTrace) : 1 pour les familles à domaine illimité ou à demi-domaine
 * (racine_carree), 2 pour "inverse" (encadrant le pôle sans jamais le franchir — laisse un vide
 * visuel, spec section 5, plutôt qu'une valeur aberrante). `evaluerPourGraphe` renvoie NaN hors
 * domaine, ce que Mafs ignore nativement en coupant la ligne (voir node_modules/mafs/build/index.js,
 * le point n'est ajouté au tracé que si Number.isFinite(x) && Number.isFinite(y)).
 *
 * **Asymptotes pour la famille "inverse"** (`prompt-verification-holistique-et-asymptotes.md`,
 * point 2) : verticale en `x=TH` (exactement `pivotX`, le pôle — voir `verificationFonctionsReference.ts`),
 * horizontale en `y=TV` (`g(u)=1/u → 0` quand `x→±∞`, quels que soient SOX/EV/CV/SOY/CH/EH, qui ne
 * font que mettre à l'échelle ce terme qui tend déjà vers 0 — TV reste donc la seule limite, pour
 * n'importe quelle combinaison de paramètres). Rendues via `Line.PointAngle` (droite infinie passant
 * par un point à un angle donné — `π/2` pour la verticale, `0` pour l'horizontale ; `PointSlope`
 * aurait été inutilisable pour la verticale, de pente infinie) plutôt que `Plot.OfX`, qui ne peut
 * tracer une fonction `x↦y` et serait donc impuissant pour une asymptote VERTICALE. Style
 * délibérément distinct de la courbe elle-même (pointillé fin, opacité réduite) pour rester
 * lisible sans se confondre ni avec la courbe (trait plein épais) ni avec les axes/la grille
 * (`--mafs-origin-color`/`--mafs-line-color`, jamais réutilisées ici) — colorées dans la couleur de
 * LEUR courbe (cible et/ou live, si les deux sont affichées et de famille "inverse" — ce qui est
 * toujours le cas ensemble, la famille étant partagée) pour rester associées visuellement à la
 * bonne courbe.
 *
 * **Second point marqué, où l'argument vaut u=1** (`prompt-canal-unique-et-second-point.md`,
 * point 2) : `pointUnitaire` (`verificationFonctionsReference.ts`) calcule ce point EXACTEMENT
 * pour les 6 familles (g(1)=1 pour toutes), contrairement au point caractéristique (`pivotX`, u=0)
 * qui n'a pas de valeur définie pour "inverse" (le pôle) — u=1 reste toujours à distance non nulle
 * du pôle, donc ce second point est le seul des deux à être systématiquement affichable pour les 6
 * familles. Style visuel délibérément distinct du point caractéristique (cercle plein) : une
 * **croix** (`PointCroix`, `prompt-croix-et-elargissement-plage.md`, point 1 — remplace le cercle
 * évidé de la version précédente, jugé pas assez distinctif) plutôt qu'une couleur différente —
 * reste associée visuellement à la bonne courbe (cible et/ou live) sans introduire une 3e couleur
 * sur le graphe. `PointCroix` vit désormais dans `mafsGraphPartage.tsx`
 * (`prompt-report-fonctionnalites-generateur-x2.md`, extrait de ce fichier pour être réutilisé tel
 * quel par `MafsGraphTransformation.tsx`, plutôt qu'un composant local à ce seul fichier comme à
 * l'origine — même mouvement que `GrilleAdaptative`/`useLargeurConteneur`).
 *
 * **Coordonnées affichées pour les deux points** (`prompt-coordonnees-sommet-et-placeholders.md`,
 * point 1) : le point caractéristique (`pivotX`, cercle plein) gagne lui aussi une étiquette de
 * coordonnées, même principe et même format que le second point déjà étiqueté — `formatLabelPoint`
 * (renommée depuis `formatLabelPointUnitaire`, désormais partagée par les deux marqueurs) rend
 * `"(x ; y)"` via `formatFractionIrreductible` (déjà utilisée par "Analyse d'une fonction" pour
 * xS/yS — CH/EH/EV/CV ∈ [1,5] garantissent un dénominateur toujours petit, donc une fraction exacte
 * plutôt qu'un décimal bruité). Seul le marqueur du second point a changé de style (croix) — le
 * point caractéristique garde son cercle plein historique, jamais touché ici.
 *
 * **Coordonnées dans la légende, pas sur le graphe** (`prompt-coordonnees-vers-legende.md`) — les
 * `<Text>` posées juste à côté de chaque marqueur (via `attach="s"`/`attach="n"`) sont retirées : à
 * un zoom où les deux points sont proches, leurs étiquettes se chevauchaient et devenaient
 * illisibles. Déplacées dans `.mafs-graph-legende` (même bloc que les entrées "courbe cible"/"ta
 * courbe" déjà en place), une entrée par point affichable — toujours gardée par le même
 * `Number.isFinite` que le marqueur lui-même. Les marqueurs (`Point`/`PointCroix`) restent
 * inchangés sur le graphe, sans étiquette attenante.
 *
 * **Point de référence à l'intersection des asymptotes, pour "inverse" uniquement**
 * (`prompt-point-intersection-asymptotes.md`) — cette famille n'a pas de point caractéristique au
 * sens des 5 autres : `x=TH` y est le pôle, où la fonction n'est PAS définie (`evaluerFonctionReference`
 * y renvoie `NaN`, d'où l'absence historique de marqueur à cet endroit). Remplacé, pour cette seule
 * famille, par un point de repère à l'intersection des deux asymptotes déjà tracées (verticale
 * `x=TH`, horizontale `y=TV`) — donc exactement `(TH, TV)`, lu directement depuis l'exercice/la
 * réponse curseurs plutôt qu'évalué via `evaluerPourGraphe` (qui y renverrait toujours `NaN`).
 * `PointCaracteristique` (composant local) rend un cercle **ÉVIDÉ** (`fill:"none"`) pour ce cas
 * précis — jamais le cercle plein des 5 autres familles — signalant visuellement que ce point n'est
 * PAS sur la courbe, contrairement au point caractéristique habituel. Sa légende associée bascule de
 * la même façon sur un swatch évidé (`classeSwatchPoint`, `-vide` en plus dans le nom de classe) ;
 * `Number.isFinite((TH,TV))` étant désormais toujours vrai pour cette famille (`TH`/`TV` sont des
 * entiers, jamais `NaN`), le marqueur et son entrée de légende sont donc désormais **toujours**
 * affichés pour "inverse", là où ils étaient auparavant systématiquement absents. Le second point
 * (croix, `u=1`) n'est pas concerné — `1/x` y est bien définie, inchangé pour cette famille.
 */
function formatLabelPoint(x: number, y: number): string {
  return `(${formatFractionIrreductible(x)} ; ${formatFractionIrreductible(y)})`;
}

/** Point caractéristique — cercle plein pour les 5 familles où il appartient réellement à la
 * courbe, cercle ÉVIDÉ (`vide=true`) pour "inverse" où il ne s'agit que d'un repère à
 * l'intersection des asymptotes (voir le docstring du composant ci-dessus). */
function PointCaracteristique({ x, y, color, vide }: { x: number; y: number; color: string; vide: boolean }) {
  if (vide) {
    return <Point x={x} y={y} color={color} svgCircleProps={{ style: { fill: "none", stroke: color, strokeWidth: 2 } }} />;
  }
  return <Point x={x} y={y} color={color} />;
}

/** Classe CSS du swatch de légende pour le point caractéristique — même bascule plein/évidé que le
 * marqueur lui-même (`PointCaracteristique`). */
function classeSwatchPoint(courbe: "cible" | "live", vide: boolean): string {
  return vide ? `mafs-graph-swatch-point-${courbe}-vide` : `mafs-graph-swatch-point-${courbe}`;
}

export function MafsGraphFonctionsReference({ cible, live }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = calculerViewBoxFonctionReference(cible, live);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  const pivotCible = pivotX(cible);
  const cibleEstInverse = cible.famille === "inverse";
  const yPivotCible = cibleEstInverse ? cible.tv : evaluerPourGraphe(cible, pivotCible);
  const pivotLive = live ? pivotX(live) : 0;
  const liveEstInverse = live ? live.famille === "inverse" : false;
  const yPivotLive = live ? (liveEstInverse ? live.tv : evaluerPourGraphe(live, pivotLive)) : NaN;

  const xUnitaireCible = pointUnitaire(cible).x;
  const yUnitaireCible = evaluerPourGraphe(cible, xUnitaireCible);
  const xUnitaireLive = live ? pointUnitaire(live).x : 0;
  const yUnitaireLive = live ? evaluerPourGraphe(live, xUnitaireLive) : NaN;

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-fonctions-reference">
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <FenetreVisibleXY largeur={largeur} hauteur={hauteur}>
          {(visible, visibleY) =>
            calculerSegmentsVisibles(cible, visible, visibleY).map((segment, index) => (
              <Plot.OfX key={index} y={(x) => evaluerPourGraphe(cible, x)} domain={segment.domaine} color={COULEUR_CIBLE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            ))
          }
        </FenetreVisibleXY>
        {Number.isFinite(yPivotCible) && (
          <PointCaracteristique x={pivotCible} y={yPivotCible} color={COULEUR_CIBLE} vide={cibleEstInverse} />
        )}
        {Number.isFinite(yUnitaireCible) && <PointCroix x={xUnitaireCible} y={yUnitaireCible} color={COULEUR_CIBLE} />}
        {cible.famille === "inverse" && (
          <>
            <Line.PointAngle point={[pivotCible, 0]} angle={Math.PI / 2} color={COULEUR_CIBLE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
            <Line.PointAngle point={[0, cible.tv]} angle={0} color={COULEUR_CIBLE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
          </>
        )}
        {live && (
          <>
            <FenetreVisibleXY largeur={largeur} hauteur={hauteur}>
              {(visible, visibleY) =>
                calculerSegmentsVisibles(live, visible, visibleY).map((segment, index) => (
                  <Plot.OfX
                    key={index}
                    y={(x) => evaluerPourGraphe(live, x)}
                    domain={segment.domaine}
                    color={COULEUR_LIVE}
                    style="dashed"
                    weight={EPAISSEUR_TRAIT_ACCENTUE}
                  />
                ))
              }
            </FenetreVisibleXY>
            {Number.isFinite(yPivotLive) && (
              <PointCaracteristique x={pivotLive} y={yPivotLive} color={COULEUR_LIVE} vide={liveEstInverse} />
            )}
            {Number.isFinite(yUnitaireLive) && <PointCroix x={xUnitaireLive} y={yUnitaireLive} color={COULEUR_LIVE} />}
            {live.famille === "inverse" && (
              <>
                <Line.PointAngle point={[pivotLive, 0]} angle={Math.PI / 2} color={COULEUR_LIVE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
                <Line.PointAngle point={[0, live.tv]} angle={0} color={COULEUR_LIVE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
              </>
            )}
          </>
        )}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
      <div className="mafs-graph-legende">
        <span className="mafs-graph-legende-item">
          <span className="mafs-graph-swatch mafs-graph-swatch-cible" /> courbe cible
        </span>
        {live && (
          <span className="mafs-graph-legende-item">
            <span className="mafs-graph-swatch mafs-graph-swatch-live" /> ta courbe (curseurs)
          </span>
        )}
        {Number.isFinite(yPivotCible) && (
          <span className="mafs-graph-legende-item">
            <span className={classeSwatchPoint("cible", cibleEstInverse)} /> Point caractéristique :{" "}
            {formatLabelPoint(pivotCible, yPivotCible)}
          </span>
        )}
        {Number.isFinite(yUnitaireCible) && (
          <span className="mafs-graph-legende-item">
            <span className="mafs-graph-swatch-croix-cible">×</span> Point croix :{" "}
            {formatLabelPoint(xUnitaireCible, yUnitaireCible)}
          </span>
        )}
        {live && Number.isFinite(yPivotLive) && (
          <span className="mafs-graph-legende-item">
            <span className={classeSwatchPoint("live", liveEstInverse)} /> Point caractéristique (curseurs) :{" "}
            {formatLabelPoint(pivotLive, yPivotLive)}
          </span>
        )}
        {live && Number.isFinite(yUnitaireLive) && (
          <span className="mafs-graph-legende-item">
            <span className="mafs-graph-swatch-croix-live">×</span> Point croix (curseurs) :{" "}
            {formatLabelPoint(xUnitaireLive, yUnitaireLive)}
          </span>
        )}
      </div>
    </div>
  );
}
