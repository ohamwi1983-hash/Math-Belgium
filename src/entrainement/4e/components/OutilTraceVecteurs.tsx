import { useRef, useState } from "react";
import type { Point } from "../core/vecteur.types";
import { calculerGeometrieFigureReduction } from "../ui/figureReductionSketch";
import { toucherPoint } from "../ui/outilTraceVecteurs";
import { FigureReductionSketch } from "./FigureReductionSketch";
import { Katex } from "./Katex";

interface Props {
  points: Record<string, Point>;
  aretes: [string, string][];
}

interface VecteurTrace {
  id: number;
  depart: string;
  arrivee: string;
}

/** Rayon de la zone cliquable/tactile autour de chaque point existant, en multiple de `rayonPoint`
 * — confortable pour un doigt sur mobile, très supérieur au disque visuel du point lui-même
 * (`FigureReductionSketch`). */
const FACTEUR_RAYON_CIBLE = 4.5;
const COULEUR_TRACE = "#1971c2";
const COULEUR_TRACE_SELECTIONNEE = "#f08c00";
const COULEUR_DEPART = "#f08c00";

/**
 * Outil graphique OPTIONNEL de traçage de vecteurs sur la figure fixe — `promptgen27modifications.md`,
 * point 2 : aide à la visualisation du télescopage de Chasles, SANS AUCUN IMPACT sur la
 * vérification de la réponse (toujours le champ de texte libre existant de `EtapeReductionVectorielle.tsx`,
 * jamais lu ni modifié ici).
 *
 * **Interaction tap-tap** (voir `ui/outilTraceVecteurs.ts::toucherPoint` pour l'historique complet
 * du changement de conception) : l'élève touche un premier point EXISTANT de la figure (mis en
 * évidence par un anneau orange), puis un second — le vecteur départ→arrivée est alors créé. Toucher
 * à nouveau le point de départ l'annule sans créer de vecteur. Plusieurs vecteurs peuvent coexister
 * (jamais de remplacement automatique) ; chaque vecteur tracé apparaît comme un bouton à bascule
 * ($\vec{XY}$, sous la figure — jamais un clic directement sur le tracé, voir plus bas) pour être
 * sélectionné/désélectionné (couleur orange, même convention que "Comparaison visuelle de
 * vecteurs", gen28) ; le bouton "Effacer" supprime uniquement les vecteurs sélectionnés (désactivé
 * si aucune sélection).
 *
 * Recalcule sa PROPRE géométrie (`calculerGeometrieFigureReduction`, fonction pure) plutôt que de
 * la recevoir en prop de `FigureReductionSketch` (qui fait de même sur les mêmes `points`/`aretes`)
 * : les deux appels produisent EXACTEMENT le même résultat (déterministe), donc les deux couches
 * restent parfaitement alignées dans le même repère SVG sans avoir à faire remonter la géométrie à
 * un parent commun — ses éléments interactifs sont passés en `children` à `FigureReductionSketch`
 * (prop additive, comportement historique inchangé pour tout autre appelant).
 *
 * **Sélection via une LISTE de boutons, jamais un clic sur le tracé lui-même** (retour utilisateur) :
 * une première version rendait chaque vecteur tracé cliquable directement sur la figure (ligne de
 * capture invisible élargie sous le tracé) — mais les cibles tactiles généreuses des POINTS
 * (`rayonCible`, ~4,5× le disque visuel, nécessaires pour un tap confortable sur mobile) sont
 * rendues APRÈS les vecteurs, donc AU-DESSUS pour la détection de clic ; dès que deux points sont
 * proches sur l'écran, leurs cibles tactiles recouvrent ENTIÈREMENT le segment qui les relie,
 * rendant le vecteur correspondant impossible à sélectionner — signalé par l'utilisateur avec des
 * figures à points rapprochés (`etoile`/`hexagone`). Corrigé en découplant totalement la sélection
 * de la géométrie de la figure : chaque vecteur tracé apparaît comme un bouton à bascule dans une
 * liste sous la figure, structurellement immunisée contre tout chevauchement de cible à l'écran.
 */
export function OutilTraceVecteurs({ points, aretes }: Props) {
  const geom = calculerGeometrieFigureReduction(points, aretes);
  const rayonCible = geom.rayonPoint * FACTEUR_RAYON_CIBLE;

  const [pointDepart, setPointDepart] = useState<string | null>(null);
  const [vecteurs, setVecteurs] = useState<VecteurTrace[]>([]);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const idSuivantRef = useRef(1);

  function pointParNom(nom: string) {
    return geom.points.find((p) => p.nom === nom)!;
  }

  function gererTapPoint(nom: string) {
    const resultat = toucherPoint(pointDepart, nom);
    setPointDepart(resultat.nouveauDepart);
    if (resultat.vecteurCree) {
      setVecteurs((v) => [...v, { id: idSuivantRef.current++, ...resultat.vecteurCree! }]);
    }
  }

  function basculerSelection(id: number) {
    setSelection((s) => {
      const copie = new Set(s);
      if (copie.has(id)) copie.delete(id);
      else copie.add(id);
      return copie;
    });
  }

  function effacer() {
    setVecteurs((v) => v.filter((vec) => !selection.has(vec.id)));
    setSelection(new Set());
  }

  return (
    <div className="outil-trace-vecteurs">
      <p className="info-banner">
        {pointDepart
          ? `Touche un second point pour tracer le vecteur depuis ${pointDepart} (ou retouche ${pointDepart} pour annuler).`
          : "Astuce facultative : touche un point puis un second pour tracer un vecteur d'aide (jamais évalué)."}
      </p>
      <FigureReductionSketch points={points} aretes={aretes}>
        <defs>
          <marker id="fleche-outil-trace" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L6,3 L0,6 Z" fill={COULEUR_TRACE} />
          </marker>
          <marker
            id="fleche-outil-trace-selectionnee"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={COULEUR_TRACE_SELECTIONNEE} />
          </marker>
        </defs>
        {vecteurs.map((v) => {
          const a = pointParNom(v.depart);
          const b = pointParNom(v.arrivee);
          const selectionne = selection.has(v.id);
          const couleur = selectionne ? COULEUR_TRACE_SELECTIONNEE : COULEUR_TRACE;
          return (
            <line
              key={v.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={couleur}
              strokeWidth={geom.rayonPoint * 0.4}
              markerEnd={`url(#${selectionne ? "fleche-outil-trace-selectionnee" : "fleche-outil-trace"})`}
              pointerEvents="none"
            />
          );
        })}
        {pointDepart &&
          (() => {
            const p = pointParNom(pointDepart);
            return (
              <circle
                cx={p.x}
                cy={p.y}
                r={geom.rayonPoint * 2}
                fill="none"
                stroke={COULEUR_DEPART}
                strokeWidth={geom.rayonPoint * 0.35}
                pointerEvents="none"
              />
            );
          })()}
        {geom.points.map((p) => (
          <circle key={p.nom} cx={p.x} cy={p.y} r={rayonCible} className="outil-trace-vecteurs-cible" onClick={() => gererTapPoint(p.nom)} />
        ))}
      </FigureReductionSketch>
      {vecteurs.length > 0 && (
        <div className="options-grid-compact outil-trace-vecteurs-liste">
          {vecteurs.map((v) => (
            <button
              key={v.id}
              type="button"
              className={selection.has(v.id) ? "btn toggle-active" : "btn"}
              onClick={() => basculerSelection(v.id)}
            >
              <Katex expression={`\\vec{${v.depart}${v.arrivee}}`} />
            </button>
          ))}
        </div>
      )}
      <button type="button" className="btn" disabled={selection.size === 0} onClick={effacer}>
        Effacer
      </button>
    </div>
  );
}
