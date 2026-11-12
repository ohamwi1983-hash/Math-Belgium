import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "../components/Katex";

/**
 * Composant RÉUTILISABLE (pas hardcodé sur 5gen31) — placement de points par TAP DIRECT sur un
 * graphique (jamais de glisser-déposer, choix explicite de la consigne source, cohérent avec le
 * patron d'interaction de `ComposantAssociation`/5gen25 : un `<select>` natif plutôt qu'un drag pour
 * la même raison de fragilité tactile). Le graphique lui-même n'est JAMAIS possédé par ce composant
 * (`renderGraphe`, render-prop) — celui-ci gère uniquement la séquence de sous-questions/tentatives/
 * score, pour rester réutilisable par un futur générateur avec un rendu graphique différent.
 *
 * Une SEULE sous-question à la fois (`indexActif`) : l'élève tape sur le graphique, `onTap` reçoit
 * les coordonnées EN ESPACE DE DONNÉES (jamais des pixels écran — fournies nativement par Mafs via
 * son prop `onClick`, voir `EtudierFonctionGraph.tsx`). Un tap dans la tolérance confirme le point
 * (vert) et avance ; un tap hors tolérance déclenche un retour visuel rouge immédiat (jamais de
 * notation par tentative combinée façon `TableauEtudeLocaleBuilder` — chaque point a son propre
 * compteur de tentatives, jusqu'à `tentativesMax`, après quoi il est révélé et le point suivant
 * commence).
 *
 * Aide : 1 SEUL niveau — une bande verticale à l'abscisse du point (connue depuis les tableaux) :
 * elle aide à se repérer sans dessiner la réponse (audit 5e ch. 5 : l'ancienne aide traçait un
 * disque centré sur le point cherché).
 *
 * Tolérance exprimée en PIXELS (`TOLERANCE_PIXELS`) : `onTap` reçoit l'échelle (pixels par unité)
 * du graphe, dont la fenêtre et le repère (non isotrope) changent d'un exercice à l'autre.
 */
export interface PointCiblePlacement {
  id: string;
  label: string;
  /** Libellé KaTeX optionnel affiché après `label` (ex. coordonnées du point). */
  labelLatex?: string;
  x: number;
  y: number;
}

export interface EchellePixels {
  x: number;
  y: number;
}

export interface PointConfirmePlacement {
  id: string;
  x: number;
  y: number;
  correct: boolean;
}

export interface ResumePlacementPointsGraphique {
  pointsReussis: number;
  pointsTotal: number;
  revele: boolean;
}

interface RenderGrapheOptions {
  onTap: (x: number, y: number, echelle: EchellePixels) => void;
  pointActif: PointCiblePlacement | null;
  propositionsConfirmees: PointConfirmePlacement[];
  dernierTapRate: { x: number; y: number } | null;
  zoneAideActive: boolean;
}

interface Props {
  points: PointCiblePlacement[];
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (resume: ResumePlacementPointsGraphique) => void;
  renderGraphe: (opts: RenderGrapheOptions) => ReactNode;
}

export function PlacementPointsGraphique({ points, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, renderGraphe }: Props) {
  const [indexActif, setIndexActif] = useState(0);
  const [confirmes, setConfirmes] = useState<PointConfirmePlacement[]>([]);
  const [tentativesPointActif, setTentativesPointActif] = useState(0);
  const [dernierTapRate, setDernierTapRate] = useState<{ x: number; y: number } | null>(null);

  // Resynchronisation si `points` change de taille sous le même composant (même piège que
  // `TableauEtudeLocaleBuilder`/`EtapeChampsNumeriquesEtudeLocale`, corrigé préventivement ici).
  useEffect(() => {
    setIndexActif(0);
    setConfirmes([]);
    setTentativesPointActif(0);
    setDernierTapRate(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);

  const pointActif = indexActif < points.length ? points[indexActif] : null;
  const termine = pointActif === null;

  function onTap(x: number, y: number, echelle: EchellePixels) {
    if (!pointActif) return;
    const distPixels = Math.hypot((x - pointActif.x) * echelle.x, (y - pointActif.y) * echelle.y);
    if (distPixels <= TOLERANCE_PIXELS) {
      setConfirmes((c) => [...c, { id: pointActif.id, x: pointActif.x, y: pointActif.y, correct: true }]);
      setIndexActif((i) => i + 1);
      setTentativesPointActif(0);
      setDernierTapRate(null);
      return;
    }
    const nouvellesTentatives = tentativesPointActif + 1;
    setDernierTapRate({ x, y });
    if (nouvellesTentatives >= tentativesMax) {
      setConfirmes((c) => [...c, { id: pointActif.id, x: pointActif.x, y: pointActif.y, correct: false }]);
      setIndexActif((i) => i + 1);
      setTentativesPointActif(0);
    } else {
      setTentativesPointActif(nouvellesTentatives);
    }
  }

  function valider() {
    const pointsReussis = confirmes.filter((c) => c.correct).length;
    onValider({ pointsReussis, pointsTotal: points.length, revele: confirmes.some((c) => !c.correct) });
  }

  return (
    <div>
      {!termine && (
        <p className="prompt-text">
          Point {indexActif + 1}/{points.length} — {pointActif!.label}
          {pointActif!.labelLatex && (
            <>
              {" "}
              <Katex expression={pointActif!.labelLatex} />
            </>
          )}
        </p>
      )}
      {renderGraphe({
        onTap,
        pointActif,
        propositionsConfirmees: confirmes,
        dernierTapRate,
        zoneAideActive: niveauAide >= 1,
      })}
      {dernierTapRate && !termine && (
        <p className="alert-error" role="alert">
          Pas tout à fait — retente (tentative {tentativesPointActif}/{tentativesMax}).
        </p>
      )}
      {!termine && <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
      {niveauAide >= 1 && !termine && (
        <div className="aide-5e">
          <p>La bande verte marque l'abscisse du point : vise la hauteur que tu as calculée.</p>
        </div>
      )}
      {termine && (
        <button type="button" className="btn btn-primary" onClick={valider}>
          Continuer
        </button>
      )}
    </div>
  );
}

/** Tolérance de proximité en PIXELS (≈ 11 px, au doigt comme à la souris) — identique à
 * `TOLERANCE_PLACEMENT_PIXELS` (`moteur5e/verificationEtudierFonction.ts`), dupliquée pour garder ce
 * composant réutilisable sans dépendance à 5gen31. */
export const TOLERANCE_PIXELS = 11;
