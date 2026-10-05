import { useState } from "react";
import type { CinqNombres, ExerciceBoiteMoustachesConstruction } from "../core/boiteMoustaches.types";
import { evaluerConstruction } from "../moteur/verificationBoiteMoustaches";
import { niveauAideMaxPourPhase } from "../moteur/sessionBoiteMoustaches";
import {
  formatTermesCinqNombresLatex,
  libelleBoutonAide,
  segmentsAideConstructionNiveau1,
  segmentsAideConstructionNiveau2,
  segmentsConsigneConstruction,
} from "../ui/formatBoiteMoustaches";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoiteMoustachesGraph } from "./BoiteMoustachesGraph";
import { EnonceBoiteMoustaches } from "./EnonceBoiteMoustaches";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceBoiteMoustachesConstruction;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: CinqNombres) => void;
  /** Pas de crantage du glissement des 5 marqueurs — additif et optionnel, défaut `1` (comportement
   * historique INCHANGÉ pour cet écran lui-même, qui ne fournit jamais cette prop). Introduit pour
   * qu'"Exercice de synthèse" (chapitre 5) puisse réutiliser ce composant tel quel sur sa variante
   * `classes`, où médiane/Q1/Q3 sont arrondis à 1 décimale — voir `BoiteMoustachesGraph.tsx`. */
  pas?: number;
}

/** Position de départ des 5 marqueurs — répartis uniformément sur la plage, jamais superposés au
 * démarrage (l'élève doit toujours pouvoir attraper chacun indépendamment dès l'affichage). */
function positionsDepart(bornePlage: { min: number; max: number }): CinqNombres {
  const span = bornePlage.max - bornePlage.min;
  const pas = span / 6;
  return {
    min: Math.round(bornePlage.min + pas),
    q1: Math.round(bornePlage.min + 2 * pas),
    mediane: Math.round(bornePlage.min + 3 * pas),
    q3: Math.round(bornePlage.min + 4 * pas),
    max: Math.round(bornePlage.min + 5 * pas),
  };
}

/**
 * Écran "construction" — les 5 marqueurs sont déplacés par glissement horizontal cranté sur le
 * graphe Mafs (`BoiteMoustachesGraph`, interactif) plutôt que saisis en texte : aucune saisie libre,
 * donc aucun statut à 3 valeurs ici (même principe que l'écran "trace" de "Regroupement en classes
 * et histogramme"). Toujours terminal.
 */
export function EtapeConstruction({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, pas }: Props) {
  const [valeurs, setValeurs] = useState<CinqNombres>(() => positionsDepart(exercice.bornePlage));
  const maxAide = niveauAideMaxPourPhase("construction");

  const apresEchec = tentativesUtilisees > 0;
  const erronees = apresEchec ? evaluerConstruction(exercice, valeurs) : null;
  const erroneesInversees = erronees
    ? {
        min: !erronees.min,
        q1: !erronees.q1,
        mediane: !erronees.mediane,
        q3: !erronees.q3,
        max: !erronees.max,
      }
    : undefined;

  return (
    <div>
      <EnonceBoiteMoustaches exercice={exercice} />
      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneConstruction(exercice)} />
      </p>
      <div className="equation-box">
        <p>
          Série donnée :{" "}
          <span className="equation-box-termes">
            {formatTermesCinqNombresLatex(exercice.valeurs).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </p>
      </div>

      <BoiteMoustachesGraph
        bornePlage={exercice.bornePlage}
        lignes={[{ valeurs, interactif: { erronees: erroneesInversees, onChangerValeur: (cle, v) => setValeurs((prec) => ({ ...prec, [cle]: v })), pas } }]}
      />

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideConstructionNiveau1()} />
          </p>
        </div>
      )}
      {niveauAide >= 2 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideConstructionNiveau2(exercice)} />
          </p>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= maxAide} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, maxAide)}
      </button>

      <button type="button" className="btn btn-primary" onClick={() => onValider(valeurs)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
