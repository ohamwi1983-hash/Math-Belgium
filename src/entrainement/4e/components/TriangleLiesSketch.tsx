import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { calculerCroquisTriangleLies, HAUTEUR_CROQUIS, LARGEUR_CROQUIS, segmentPartage } from "../ui/triangleLiesSketch";

interface Props {
  exercice: ExerciceTriangleLies;
}

function segmentsEgaux(s1: readonly [string, string], s2: readonly [string, string]): boolean {
  return (s1[0] === s2[0] && s1[1] === s2[1]) || (s1[0] === s2[1] && s1[1] === s2[0]);
}

/**
 * Croquis SVG SUR MESURE (retrofit `promptretrofitsvggen58.md`, remplace l'ancien rendu Mafs) des 2
 * triangles liés — fond uni, sans grille ni axes numérotés : aucune coordonnée cartésienne n'est
 * jamais lue/écrite par l'élève dans ce générateur (seule la géométrie relative compte), donc Mafs
 * n'apportait rien d'utile ici et exposait un défaut de positionnement de label (voir CLAUDE.md,
 * "Choix du rendu graphique — Mafs vs SVG sur mesure"). Géométrie PROPORTIONNELLEMENT FIDÈLE aux
 * valeurs réellement générées (`ui/triangleLiesSketch.ts::calculerCroquisTriangleLies`, similitude à
 * échelle uniforme — jamais un croquis schématique à sommets fixes comme `TriangleSketch`) ; style
 * visuel aligné sur les cercles trigonométriques (gen14-19) et `TriangleSketch`
 * (`.triangle-lies-sketch`, même patron que `.cercle-trig-trajet`/`.triangle-sketch`). Le côté
 * TRANSFÉRÉ (segment littéralement partagé entre `segmentsPont`/`segmentsCible`) est surligné dans
 * une 3e couleur, rendu par-dessus les 2 triangles. TOUS les points ont un label garanti dans le
 * cadre (clampage dur, voir `calculerCroquisTriangleLies`) — corrige le point T sans label du
 * rendu Mafs précédent.
 */
export function TriangleLiesSketch({ exercice }: Props) {
  const croquis = calculerCroquisTriangleLies(exercice);
  const partage = segmentPartage(exercice);

  function point(nom: string) {
    return croquis.find((p) => p.nom === nom)!;
  }

  function estPartage(segment: readonly [string, string]): boolean {
    return partage != null && segmentsEgaux(segment, partage);
  }

  return (
    <svg className="triangle-lies-sketch" viewBox={`0 0 ${LARGEUR_CROQUIS} ${HAUTEUR_CROQUIS}`} role="img" aria-label="Croquis des deux triangles liés">
      {exercice.segmentsPont
        .filter((s) => !estPartage(s))
        .map(([n1, n2]) => (
          <line
            key={`pont-${n1}-${n2}`}
            x1={point(n1).point.x}
            y1={point(n1).point.y}
            x2={point(n2).point.x}
            y2={point(n2).point.y}
            className="triangle-lies-sketch-pont"
          />
        ))}
      {exercice.segmentsCible
        .filter((s) => !estPartage(s))
        .map(([n1, n2]) => (
          <line
            key={`cible-${n1}-${n2}`}
            x1={point(n1).point.x}
            y1={point(n1).point.y}
            x2={point(n2).point.x}
            y2={point(n2).point.y}
            className="triangle-lies-sketch-cible"
          />
        ))}
      {partage && (
        <line
          x1={point(partage[0]).point.x}
          y1={point(partage[0]).point.y}
          x2={point(partage[1]).point.x}
          y2={point(partage[1]).point.y}
          className="triangle-lies-sketch-partage"
        />
      )}
      {croquis.map((p) => (
        <circle key={p.nom} cx={p.point.x} cy={p.point.y} r={3} className="triangle-lies-sketch-point" />
      ))}
      {croquis.map((p) => (
        <text key={`label-${p.nom}`} x={p.label.x} y={p.label.y} className="triangle-lies-sketch-label">
          {p.nom}
        </text>
      ))}
    </svg>
  );
}
