import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { FonctionVarieeAssociation } from "../core5e/association.types";
import { cadrageVariee, deriveeVariee, domaineVariee, evaluerVariee, exclusionVariee, X_MAX_VARIEE, X_MIN_VARIEE } from "../generateurs5e/association/fonctionsVariees";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { FenetreVisibleXY5e, GrilleAdaptative5e } from "./mafsGraphPartage5e";

const LARGEUR = 280;
const HAUTEUR = LARGEUR / RATIO_GRAPHE;
const COULEUR_COURBE = "#1971c2";
/** Écart laissé de part et d'autre d'une asymptote verticale (la courbe y part à l'infini). */
const ECART_ASYMPTOTE = 0.02;

/**
 * Mini-graphique Mafs d'une fonction « variée » de 5gen25 (rationnelle, racine, sinus — lot C, G18) :
 * f elle-même, ou sa dérivée f′ (`derivee`, candidats de la famille A). Même taille, même grille et
 * même légende d'échelle que `PolynomeAssociationGraph` ; la courbe est coupée à l'asymptote
 * verticale d'une rationnelle et commence en x = p pour une racine. Cadrage vertical : `cadrageVariee`
 * (le même que le papier).
 */
export function FonctionVarieeAssociationGraph({ fonction, derivee = false }: { fonction: FonctionVarieeAssociation; derivee?: boolean }) {
  const evaluer = (x: number) => {
    const y = derivee ? deriveeVariee(fonction, x) : evaluerVariee(fonction, x);
    return y === null ? NaN : y;
  };
  const { yMin, yMax } = cadrageVariee(fonction, derivee);
  const [d0, d1] = domaineVariee(fonction);
  const excl = exclusionVariee(fonction);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  const morceaux = (v0: number, v1: number): [number, number][] => {
    const a = Math.max(v0, derivee && fonction.type === "racine" ? d0 + 0.004 : d0);
    const b = Math.min(v1, d1);
    if (b <= a) return [];
    if (excl === null || excl <= a || excl >= b) return [[a, b]];
    return [
      [a, excl - ECART_ASYMPTOTE],
      [excl + ECART_ASYMPTOTE, b],
    ];
  };
  return (
    <div className="courbe-graph-conteneur mafs-graph">
      <Mafs width={LARGEUR} height={HAUTEUR} viewBox={{ x: [X_MIN_VARIEE, X_MAX_VARIEE], y: [yMin, yMax], padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative5e largeur={LARGEUR} hauteur={HAUTEUR} onPasChange={(x, y) => setPas({ x, y })} courbes={[{ evaluer, domaine: [d0, d1] }]} verticales={excl === null ? [] : [excl]} />
        <FenetreVisibleXY5e largeur={LARGEUR} hauteur={HAUTEUR}>
          {(visibleX) => morceaux(visibleX[0], visibleX[1]).map(([a, b]) => <Plot.OfX key={a} y={evaluer} domain={[a, b]} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />)}
        </FenetreVisibleXY5e>
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
