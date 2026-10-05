import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BoutonAide } from "./BoutonAide";

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
 * Aide : 1 SEUL niveau (déviation DOCUMENTÉE par rapport au standard 2 niveaux de la plateforme —
 * un niveau suffit ici : la seule aide utile est "voici la zone approximative", il n'y a pas de
 * second niveau d'indication plus poussé pour un point à placer visuellement, contrairement à un
 * champ symbolique où un exemple complet peut s'ajouter à une piste méthodologique). Surlignage de
 * zone (jamais de texte à 2 niveaux classique) — cohérent avec 5gen22/5gen30, repli JUSTIFIÉ par la
 * consigne source elle-même ("PAS de texte à 2 niveaux classique").
 */
export interface PointCiblePlacement {
  id: string;
  label: string;
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
  onTap: (x: number, y: number) => void;
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

  function onTap(x: number, y: number) {
    if (!pointActif) return;
    const dist = Math.hypot(x - pointActif.x, y - pointActif.y);
    if (dist <= TOLERANCE_AFFICHEE) {
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
          <p>La zone surlignée sur le graphique indique où se trouve approximativement le point demandé.</p>
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

/** Tolérance de proximité (unités du graphique) — IDENTIQUE à `TOLERANCE_PLACEMENT_POINT`
 * (`moteur5e/verificationEtudierFonction.ts`, vérité terrain) : dupliquée en constante LOCALE plutôt
 * qu'importée pour garder ce composant RÉUTILISABLE par un futur générateur sans dépendance à
 * 5gen31 — voir CLAUDE.md, "Annonce de précision = tolérance réellement vérifiée" : la valeur reste
 * cohérente avec les tolérances "lecture visuelle" déjà établies (5gen30 : ~0.3-0.5). Un futur
 * appelant qui a besoin d'une tolérance différente n'a qu'à comparer lui-même dans `onValider` — ce
 * composant reste la référence VISUELLE (retour immédiat au tap), la notation finale appartient
 * toujours à l'appelant.
 */
export const TOLERANCE_AFFICHEE = 0.4;
