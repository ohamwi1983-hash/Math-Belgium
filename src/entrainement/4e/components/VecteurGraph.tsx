import { useState } from "react";
import { Line, Mafs, Point as MafsPoint, Text, useTransformContext, vec, Vector } from "mafs";
import "mafs/core.css";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { calculerViewBoxVecteurs } from "../ui/vecteurGraph";
import type { LabelVecteurAvecFleche, PointAffiche, VecteurAffiche } from "../ui/vecteurGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  points?: PointAffiche[];
  vecteurs?: VecteurAffiche[];
  /** Enfants Mafs additionnels (ex. `MovablePoint` pour un générateur interactif) — rendus après
   * les points/vecteurs statiques, à l'intérieur du même `<Mafs>`. Absent par défaut : comportement
   * purement statique inchangé pour tous les appelants qui ne l'utilisent pas. */
  children?: React.ReactNode;
  /** Callback de clic sur le graphe (coordonnées réelles) — absent par défaut, aucun générateur
   * statique n'en a besoin ; utilisé par le générateur de construction graphique interactive. */
  onClic?: (point: { x: number; y: number }) => void;
  /** Masque UNIQUEMENT les 2 lignes d'axe (x=0/y=0) et leurs graduations numériques — jamais le
   * quadrillage lui-même, ni sa légende d'échelle (`mafs-graph-pas`, toujours affichée) — voir
   * `GrilleAdaptative`. Absent/`false` par défaut, comportement historique inchangé pour tous les
   * appelants existants. `true` uniquement pour "Applications physiques"
   * (`promptgen29corrections.md`) : un exercice qui raisonne en norme/angle, jamais en
   * coordonnées cartésiennes — les 2 axes et leurs nombres n'ont aucun sens à y afficher, mais le
   * quadrillage reste utile pour percevoir les proportions relatives des longueurs. */
  masquerAxes?: boolean;
}

const COULEUR_POINT_DEFAUT = "#495057";
const COULEUR_VECTEUR_DEFAUT = "#1971c2";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

const TAILLE_POLICE_BASE = 22;
const TAILLE_POLICE_INDICE = 13;
const LARGEUR_FLECHE_PX = 12;
const TAILLE_TETE_FLECHE_PX = 4;
const ESPACE_FLECHE_LETTRE_PX = 3;
/** Ratio empirique hauteur-de-capitale / taille de police pour une police sans-serif standard —
 * sert uniquement à positionner la flèche juste au-dessus du sommet de la lettre de base, jamais à
 * un calcul exact (pas de mesure DOM réelle `getBBox`, qui exigerait un rendu préalable). */
const RATIO_HAUTEUR_MAJUSCULE = 0.72;
/** Largeur de glyphe approximée (même ratio empirique) — sert uniquement à centrer la flèche sur la
 * lettre de base plutôt que sur le bloc lettre+indice entier (l'indice, plus étroit, tire le centre
 * du texte complet légèrement vers la droite du centre réel de la lettre de base). */
const RATIO_LARGEUR_GLYPHE = 0.62;

/**
 * Label vectoriel "flèche au-dessus + lettre + indice" pour le graphe Mafs — dessiné en géométrie
 * SVG pure, jamais en caractère Unicode (voir `formatApplicationPhysique.ts::labelsGrapheApplicationPhysique`
 * pour l'historique des deux échecs Unicode précédents : U+20D7 combinant, puis U+2192 autonome en
 * PRÉFIXE — ce second essai corrigeait le glyphe cassé mais restait rejeté par l'utilisateur, la
 * flèche devant être AU-DESSUS de la lettre, comme la vraie notation $\vec{F}$, jamais avant elle).
 * La flèche est un segment + un triangle plein (mêmes primitives SVG que `PointCroix`, taille FIXE
 * en pixels, indépendante du zoom), centrée horizontalement sur la lettre de base et positionnée
 * juste au-dessus de son sommet — jamais en préfixe. L'indice est un `<tspan>` à taille de police
 * réduite avec un `dy` positif (décalage vers le bas, un vrai indice SVG, valable pour n'importe
 * quelle lettre — y compris "R", qui n'a aucun glyphe Unicode subscript capital). Le texte
 * (lettre+indice) reste centré horizontalement via `textAnchor="middle"` natif — aucune estimation
 * de largeur nécessaire pour CE positionnement, contrairement à la position de la flèche seule, qui
 * doit être recentrée sur la seule lettre de base. Position pixel calculée via
 * `useTransformContext`/`vec.transform`, exactement comme `PointCroix`
 * (`components/mafsGraphPartage.tsx`) — le même repère composé `viewTransform×userTransform`.
 * `label.indice` est optionnel (ex. "Comparaison visuelle de vecteurs", labels à une seule lettre) —
 * absent/vide, la flèche se recentre directement sur la lettre de base (aucun décalage de largeur
 * d'indice) et aucun `<tspan>` d'indice n'est rendu.
 */
function LabelVecteurFleche({ x, y, label, couleur }: { x: number; y: number; label: LabelVecteurAvecFleche; couleur: string }) {
  const { viewTransform: pixelMatrix, userTransform } = useTransformContext();
  const [cx, cy] = vec.transform([x, y], vec.matrixMult(pixelMatrix, userTransform));

  const aUnIndice = Boolean(label.indice);
  const largeurIndiceEstimee = aUnIndice ? TAILLE_POLICE_INDICE * RATIO_LARGEUR_GLYPHE : 0;
  const xCentreLettreBase = cx - largeurIndiceEstimee / 2;
  const yFleche = cy - TAILLE_POLICE_BASE * RATIO_HAUTEUR_MAJUSCULE - ESPACE_FLECHE_LETTRE_PX;
  const xDebutFleche = xCentreLettreBase - LARGEUR_FLECHE_PX / 2;
  const xPointeFleche = xCentreLettreBase + LARGEUR_FLECHE_PX / 2;

  return (
    <g style={{ fill: couleur, stroke: couleur }}>
      <line x1={xDebutFleche} y1={yFleche} x2={xPointeFleche} y2={yFleche} strokeWidth={1.5} />
      <polygon
        points={`${xPointeFleche + TAILLE_TETE_FLECHE_PX},${yFleche} ${xPointeFleche - TAILLE_TETE_FLECHE_PX * 0.4},${yFleche - TAILLE_TETE_FLECHE_PX} ${xPointeFleche - TAILLE_TETE_FLECHE_PX * 0.4},${yFleche + TAILLE_TETE_FLECHE_PX}`}
        stroke="none"
      />
      <text x={cx} y={cy} fontSize={TAILLE_POLICE_BASE} textAnchor="middle" dominantBaseline="alphabetic" className="mafs-shadow" stroke="none">
        <tspan>{label.base}</tspan>
        {aUnIndice && (
          <tspan dy={TAILLE_POLICE_BASE * 0.32} fontSize={TAILLE_POLICE_INDICE}>
            {label.indice}
          </tspan>
        )}
      </text>
    </g>
  );
}

/**
 * Graphe Mafs partagé par (presque) tous les générateurs du chapitre "Calcul vectoriel" — affiche
 * des points et des vecteurs étiquetés à l'échelle réelle. Contrairement aux 4 graphes Mafs déjà
 * présents dans le projet (fonctions/transformations), celui-ci ne trace aucune courbe : seulement
 * des points (`Point`) et des flèches (`Vector`), chacun avec une étiquette KaTeX-libre (`Text`).
 * `children` permet à un générateur interactif (construction graphique, comparaison visuelle) de
 * superposer ses propres éléments Mafs (`MovablePoint`...) sans dupliquer le calcul de viewBox/
 * grille/largeur — voir leurs sections dédiées.
 */
export function VecteurGraph({ points = [], vecteurs = [], children, onClic, masquerAxes = false }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const viewBox = calculerViewBoxVecteurs(points, vecteurs);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
        onClick={onClic ? (p) => onClic({ x: p[0], y: p[1] }) : undefined}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} masquerAxes={masquerAxes} />
        {vecteurs.map((v, i) => {
          const couleur = v.couleur ?? COULEUR_VECTEUR_DEFAUT;
          const tip: [number, number] = [v.origine.x + v.vecteur.x, v.origine.y + v.vecteur.y];
          const milieuX = v.labelPosition?.x ?? (v.origine.x + tip[0]) / 2;
          const milieuY = v.labelPosition?.y ?? (v.origine.y + tip[1]) / 2;
          return (
            <g key={`vecteur-${i}`}>
              {v.sansFleche ? (
                <Line.Segment point1={[v.origine.x, v.origine.y]} point2={tip} color={couleur} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              ) : (
                <Vector tail={[v.origine.x, v.origine.y]} tip={tip} color={couleur} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              )}
              {v.labelFleche ? (
                <LabelVecteurFleche x={milieuX} y={milieuY} label={v.labelFleche} couleur={couleur} />
              ) : (
                v.label && (
                  <Text x={milieuX} y={milieuY} attach="n" color={couleur}>
                    {v.label}
                  </Text>
                )
              )}
            </g>
          );
        })}
        {points.map((p, i) => {
          const labelX = p.labelPosition?.x ?? p.point.x;
          const labelY = p.labelPosition?.y ?? p.point.y;
          return (
            <g key={`point-${i}`}>
              <MafsPoint x={p.point.x} y={p.point.y} color={p.couleur ?? COULEUR_POINT_DEFAUT} />
              <Text x={labelX} y={labelY} attach="s" color={p.couleur ?? COULEUR_POINT_DEFAUT}>
                {p.label}
              </Text>
            </g>
          );
        })}
        {children}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
