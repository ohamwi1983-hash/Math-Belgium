import { useState } from "react";
import { Line, Mafs, MovablePoint, Point as MafsPoint } from "mafs";
import "mafs/core.css";
import { EPAISSEUR_TRAIT_STANDARD, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, etendreViewBoxPourEtiquettes } from "../ui/mafsTransformation";
import { calculerViewBoxPolygoneEffectifs } from "../ui/lectureQuartileGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface PointXY {
  x: number;
  y: number;
}

interface Props {
  pointFixe: PointXY;
  points: PointXY[];
  /** Un booléen par point mobile, ou `null` tant qu'aucune tentative n'a encore été soumise —
   * comparaison en DIRECT contre les vraies coordonnées cibles, jamais figée à l'instant de la
   * dernière validation (même principe que `BoiteMoustachesGraph` : un point rouge redevient bleu
   * dès que l'élève le déplace vers la bonne position, avant toute nouvelle validation). */
  erronees: boolean[] | null;
  onDeplacerPoint: (index: number, point: PointXY) => void;
}

const COULEUR_FIXE = "#212529";
const COULEUR_MOBILE = "#1971c2";
const COULEUR_ERRONEE = "#c92a2a";
const COULEUR_SEGMENT = "#868e96";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/** Magnétisme grille entier sur les 2 axes — bornes/effectifs cumulés toujours des entiers par
 * construction, même principe que `EtapeConstructionVectorielle.tsx` (chapitre 4). */
function snapEntier([x, y]: [number, number]): [number, number] {
  return [Math.round(x), Math.round(y)];
}

/**
 * Graphe interactif du "Polygone des effectifs cumulés" (variante "classes", écran "Polygone",
 * `promptgen33modifications.md`, remplace l'ancien écran "Identifie la classe médiane" — voir
 * `core/mediane.types.ts`) — réutilise le patron Mafs + `MovablePoint` + `constrain` déjà établi
 * par "Construction graphique de vecteurs" (chapitre 4) plutôt que d'en recréer un : magnétisme
 * grille entier, viewBox calculé via `calculerViewBoxVecteurs` (module frère déjà partagé, jamais
 * dupliqué), `GrilleAdaptative`/`useLargeurConteneur` déjà communs aux graphes Mafs du projet.
 * Choix délibéré face aux composants SVG natifs 1D "Regroupement en classes"/"Boîte à moustaches"
 * (glissement cranté sur un seul axe) : ce placement est authentiquement 2D (borne supérieure de
 * classe ET effectif cumulé comptent tous deux), le patron Mafs déjà éprouvé pour ce cas précis
 * est donc la vraie réutilisation, pas une redécouverte d'un composant natif à 2 dimensions qui
 * n'existe nulle part ailleurs dans le projet.
 *
 * Le premier point (borne inférieure de la première classe, effectif cumulé 0) est FIXE, rendu en
 * noir, jamais un `MovablePoint`. Chaque classe gagne ensuite un point déplaçable (bleu, rouge si
 * erroné après une tentative), relié au point précédent par un segment (`Line.Segment`).
 *
 * **Légende dynamique du point sélectionné** (`promptgen33modifications2.md`, point 1) — un point
 * mobile est "sélectionné" dès que son `onMove` est appelé au moins une fois (Mafs l'appelle EN
 * CONTINU pendant tout le glissement, jamais seulement au relâchement — c'est déjà ce qui permet à
 * `points`/l'état parent de suivre le doigt en temps réel) : `selectionne` (index) est mis à jour à
 * chaque appel, donc la légende affiche toujours les coordonnées du DERNIER point touché,
 * rafraîchies à chaque tick du glissement en cours — jamais figées au relâchement.
 *
 * **Échelles horizontale/verticale DÉCOUPLÉES** (correction demandée directement en conversation,
 * sans fichier prompt dédié — même technique et même méthode "verify before fixing" que
 * `promptgen38fixechellegraphe.md`) : X (borne de classe, physique) et Y (effectif cumulé, un
 * compte) sont deux grandeurs sans rapport, jamais la même unité malgré la réutilisation du patron
 * Mafs/`MovablePoint` du chapitre "Calcul vectoriel" — `calculerViewBoxPolygoneEffectifs`
 * (`ui/lectureQuartileGraph.ts`, jamais `calculerViewBoxVecteurs`/`vecteurGraph.ts`, réservée aux
 * graphes où X et Y partagent réellement la même unité) ne force plus le ratio x/y, et
 * `preserveAspectRatio={false}` laisse Mafs calculer deux échelles pixel indépendantes. Le
 * glissement (`constrain`, en coordonnées DONNÉES) n'est jamais affecté par ce découplage — seule
 * la conversion donnée→pixel change, jamais la logique de magnétisme elle-même.
 */
export function PolygoneEffectifsGraph({ pointFixe, points, erronees, onDeplacerPoint }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  const [selectionne, setSelectionne] = useState<number | null>(null);

  const viewBox = calculerViewBoxPolygoneEffectifs([pointFixe, ...points]);
  const viewBoxEtendu = etendreViewBoxPourEtiquettes(viewBox);
  const sommets: PointXY[] = [pointFixe, ...points];

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBoxEtendu.x, y: viewBoxEtendu.y, padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        {sommets.slice(0, -1).map((sommet, i) => (
          <Line.Segment key={`segment-${i}`} point1={[sommet.x, sommet.y]} point2={[sommets[i + 1].x, sommets[i + 1].y]} color={COULEUR_SEGMENT} weight={EPAISSEUR_TRAIT_STANDARD} />
        ))}
        <MafsPoint x={pointFixe.x} y={pointFixe.y} color={COULEUR_FIXE} />
        {points.map((p, i) => (
          <MovablePoint
            key={i}
            point={[p.x, p.y]}
            constrain={snapEntier}
            onMove={([x, y]) => {
              onDeplacerPoint(i, { x, y });
              setSelectionne(i);
            }}
            color={erronees?.[i] ? COULEUR_ERRONEE : COULEUR_MOBILE}
          />
        ))}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
      <div className="mafs-graph-legende">
        <span className="mafs-graph-legende-item">
          Point sélectionné : {selectionne !== null ? `(${points[selectionne].x} ; ${points[selectionne].y})` : "—"}
        </span>
      </div>
    </div>
  );
}
