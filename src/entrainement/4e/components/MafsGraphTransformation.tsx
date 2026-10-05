import { useState } from "react";
import { Mafs, Plot, Point } from "mafs";
import "mafs/core.css";
import {
  EPAISSEUR_TRAIT_ACCENTUE,
  RATIO_GRAPHE,
  ZOOM_MAX,
  ZOOM_MIN,
  calculerViewBoxTransformation,
  evaluerCourbe,
  pointUnitaire,
} from "../ui/mafsTransformation";
import type { ParametresCourbe } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { formatFractionIrreductible } from "../ui/formatFraction";
import { DomaineTraceX, GrilleAdaptative, PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  /** Courbe cible — toujours affichée, fixe pour tout l'exercice. */
  cible: ParametresCourbe;
  /** Courbe manipulable en direct par les curseurs — affichée uniquement si le bouton "Aide" est
   * activé (section 2 de la spec) ; absente/`null` sinon. */
  live?: ParametresCourbe | null;
}

const COULEUR_CIBLE = "#d6336c";
const COULEUR_LIVE = "#1971c2";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/** "(x ; y)", coordonnées d'un point marqué — même format que le générateur "fonctions de
 * référence" (`MafsGraphFonctionsReference.tsx::formatLabelPoint`), petite fonction pure dupliquée
 * plutôt que partagée (`prompt-report-fonctionnalites-generateur-x2.md` : trop petite pour
 * justifier une extraction, même principe que d'autres petits helpers dupliqués du projet). */
function formatLabelPoint(x: number, y: number): string {
  return `(${formatFractionIrreductible(x)} ; ${formatFractionIrreductible(y)})`;
}

/**
 * Graphe Mafs (section 2 de la spec) — affiche par défaut UNIQUEMENT la courbe cible (`cible`),
 * jamais de `x²` de référence séparé. Si `live` est fourni (bouton "Aide" activé), une seconde
 * courbe apparaît, pilotée en temps réel par les curseurs — elle démarre comme `x²` (curseurs à
 * leurs valeurs neutres) et se déforme à mesure que l'élève les ajuste. Chaque courbe porte un
 * point marquant son sommet S. Largeur ET hauteur explicites (jamais width="auto" seul) pour
 * garder RATIO_GRAPHE constant à n'importe quelle taille d'écran — voir useLargeurConteneur.
 * `zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}` (prompt-zoom-et-cadrage.md, point 1) remplace l'ancien
 * `zoom={true}` (limité par défaut à ×0,5/×5 chez Mafs) par des bornes bien plus généreuses.
 *
 * **Second point marqué (croix)** (`prompt-report-fonctionnalites-generateur-x2.md`, points 2-3) —
 * reprise du même principe déjà en place sur "Transformations graphiques — fonctions de référence"
 * (`MafsGraphFonctionsReference.tsx`), adaptée aux paramètres plus simples de ce générateur (pas de
 * `EH`/`CH`/`SOY`) : en plus du sommet S (`Point`, cercle plein, déjà existant), un second point est
 * marqué en croix (`PointCroix`, partagé avec l'autre générateur — voir `mafsGraphPartage.tsx`) à
 * `pointUnitaire({p,q,a})` = `(p+1, a+q)` — le point où l'argument de x² vaut exactement 1.
 *
 * **Coordonnées dans la légende, pas sur le graphe** (`prompt-coordonnees-vers-legende.md`) — les
 * coordonnées des deux points étaient à l'origine affichées directement sur le graphe via `<Text>`,
 * juste à côté de chaque marqueur ; retiré, les deux points étant souvent trop proches l'un de
 * l'autre pour que leurs étiquettes restent lisibles sans se chevaucher. Déplacées dans
 * `.mafs-graph-legende` (même bloc, même emplacement que les entrées "courbe cible"/"ta courbe" déjà
 * en place), une entrée par point (et par courbe si `live` est fourni) — `formatLabelPoint` reste
 * identique, seul son lieu d'affichage change. Les marqueurs eux-mêmes (`Point`/`PointCroix`) restent
 * inchangés sur le graphe, sans étiquette attenante.
 */
export function MafsGraphTransformation({ cible, live }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = calculerViewBoxTransformation(cible, live);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  const unitaireCible = pointUnitaire(cible);
  const unitaireLive = live ? pointUnitaire(live) : null;

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-transformation">
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <DomaineTraceX largeur={largeur}>
          {(domaine) => <Plot.OfX y={(x) => evaluerCourbe(cible, x)} domain={domaine} color={COULEUR_CIBLE} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
        </DomaineTraceX>
        <Point x={cible.p} y={cible.q} color={COULEUR_CIBLE} />
        <PointCroix x={unitaireCible.x} y={unitaireCible.y} color={COULEUR_CIBLE} />
        {live && (
          <>
            <DomaineTraceX largeur={largeur}>
              {(domaine) => (
                <Plot.OfX y={(x) => evaluerCourbe(live, x)} domain={domaine} color={COULEUR_LIVE} style="dashed" weight={EPAISSEUR_TRAIT_ACCENTUE} />
              )}
            </DomaineTraceX>
            <Point x={live.p} y={live.q} color={COULEUR_LIVE} />
            {unitaireLive && <PointCroix x={unitaireLive.x} y={unitaireLive.y} color={COULEUR_LIVE} />}
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
        <span className="mafs-graph-legende-item">
          <span className="mafs-graph-swatch-point-cible" /> Point sommet : {formatLabelPoint(cible.p, cible.q)}
        </span>
        <span className="mafs-graph-legende-item">
          <span className="mafs-graph-swatch-croix-cible">×</span> Point croix : {formatLabelPoint(unitaireCible.x, unitaireCible.y)}
        </span>
        {live && (
          <span className="mafs-graph-legende-item">
            <span className="mafs-graph-swatch-point-live" /> Point sommet (curseurs) : {formatLabelPoint(live.p, live.q)}
          </span>
        )}
        {live && unitaireLive && (
          <span className="mafs-graph-legende-item">
            <span className="mafs-graph-swatch-croix-live">×</span> Point croix (curseurs) :{" "}
            {formatLabelPoint(unitaireLive.x, unitaireLive.y)}
          </span>
        )}
      </div>
    </div>
  );
}
