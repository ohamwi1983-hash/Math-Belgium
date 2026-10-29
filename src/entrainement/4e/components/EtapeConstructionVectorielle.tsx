import { useMemo, useState } from "react";
import { MovablePoint } from "mafs";
import type { ExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { Point } from "../core/vecteur.types";
import { Katex } from "./Katex";
import { VecteurGraph } from "./VecteurGraph";
import {
  consigneConstructionVectorielle,
  contraindreAuNoeudDeFenetre,
  fenetreConstructionVectorielle,
  fenetreRevelationConstruction,
  formatTermesDonneesConnuesConstructionLatex,
  traceInitialConstruction,
} from "../ui/formatConstructionVectorielle";
import { diagnostiquerConstruction } from "../moteur/verificationConstructionVectorielle";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceConstructionVectorielle;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: { depart: Point; arrivee: Point }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Magnétisme grille : chaque point s'accroche à la coordonnée entière la plus proche pendant le
 * glisser-déposer — jamais de position flottante non alignée sur la grille. */
const COULEUR_TRACE_ELEVE = "#e8590c";
/** Vecteur attendu, tracé depuis l'ancre de l'élève à la révélation (signalement chapitre 6, point 26). */
const COULEUR_VECTEUR_ATTENDU = "#2f9e44";

/**
 * Unique écran de l'exercice : bloc énoncé fixe (A, B et le vecteur \vec{AB} connu, en texte et
 * sur le graphe), consigne, puis une zone de dessin interactive — deux `MovablePoint` (départ,
 * arrivée) avec magnétisme grille. Le vecteur tracé est transmis à `VecteurGraph` via son propre
 * prop `vecteurs` (pas un `<Vector>` enfant séparé) : ça garantit à la fois l'aperçu temps réel
 * ET que le viewBox calculé par le graphe couvre toujours la position courante du tracé, même
 * loin des points A/B — sans ça, le tracé initial (loin de A/B) resterait invisible hors du cadre
 * tant que l'élève n'a pas zoomé/déplacé la vue. Simplification délibérée par rapport au geste
 * "clic pour fixer le départ, puis glisser vers l'arrivée" littéral de la spec : deux points
 * indépendamment déplaçables offrent la même flèche à aperçu temps réel et le même magnétisme, en
 * étant nettement plus robustes à manipuler/tester qu'un unique geste de clic-maintien-glisser-
 * relâcher (voir CLAUDE.md, section dédiée). Aucun point d'ancrage n'est imposé : la vérification
 * (voir `verificationConstructionVectorielle.ts`) ne compare que le vecteur tracé (arrivée-départ)
 * à la cible, jamais la position absolue du départ.
 */
export function EtapeConstructionVectorielle({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  // Monté avec une `key` propre à chaque exercice (`AppConstructionVectorielle`) : le tracé repart
  // de la position initiale du nouvel exercice, jamais de celle laissée par le précédent.
  const fenetre = useMemo(() => fenetreConstructionVectorielle(exercice), [exercice]);
  const [depart, setDepart] = useState<[number, number]>(() => {
    const { depart: d } = traceInitialConstruction(exercice);
    return [d.x, d.y];
  });
  const [arrivee, setArrivee] = useState<[number, number]>(() => {
    const { arrivee: a } = traceInitialConstruction(exercice);
    return [a.x, a.y];
  });
  const contraindre = (p: [number, number]) => contraindreAuNoeudDeFenetre(p, fenetre);

  const departPoint: Point = { x: depart[0], y: depart[1] };
  const arriveePoint: Point = { x: arrivee[0], y: arrivee[1] };
  const statut = tentativesUtilisees > 0 ? diagnostiquerConstruction(exercice, departPoint, arriveePoint) : undefined;
  const consigne = consigneConstructionVectorielle(exercice);
  const revele = validation?.revele === true;

  return (
    <div>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesConnuesConstructionLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <p className="prompt-text">
        {consigne.avant}
        <Katex expression={consigne.latex} />
        {consigne.apres}
      </p>

      <VecteurGraph
        points={[
          { point: exercice.pointA, label: exercice.labelA },
          { point: exercice.pointB, label: exercice.labelB },
        ]}
        vecteurs={[
          {
            origine: exercice.pointA,
            vecteur: { x: exercice.pointB.x - exercice.pointA.x, y: exercice.pointB.y - exercice.pointA.y },
            label: `${exercice.labelA}${exercice.labelB}`,
          },
          {
            origine: departPoint,
            vecteur: { x: arriveePoint.x - departPoint.x, y: arriveePoint.y - departPoint.y },
            couleur: COULEUR_TRACE_ELEVE,
          },
          ...(revele ? [{ origine: departPoint, vecteur: exercice.cibleComposantes, couleur: COULEUR_VECTEUR_ATTENDU }] : []),
        ]}
        viewBoxFixe={revele ? fenetreRevelationConstruction(fenetre, departPoint, exercice.cibleComposantes) : fenetre}
        pan={false}
      >
        {!validation && (
          <>
            <MovablePoint point={depart} onMove={(p) => setDepart(contraindre(p))} constrain={contraindre} color={COULEUR_TRACE_ELEVE} />
            <MovablePoint point={arrivee} onMove={(p) => setArrivee(contraindre(p))} constrain={contraindre} color={COULEUR_TRACE_ELEVE} />
          </>
        )}
      </VecteurGraph>
      {revele && (
        <p className="prompt-text">
          En vert : le vecteur attendu, tracé depuis ton point de départ.
        </p>
      )}

      {statut === "parse_error" && <p className="alert-error">{formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}</p>}

      {!validation && (
        <>
        <button type="button" className="btn btn-primary" onClick={() => onValider({ depart: departPoint, arrivee: arriveePoint })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && statut !== "parse_error" && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
