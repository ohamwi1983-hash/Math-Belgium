import { useState } from "react";
import type { ExerciceOptimisation } from "../core/optimisation.types";
import { diagnostiquerSommet } from "../moteur/verificationOptimisation";
import type { ReponseSommet } from "../moteur/verificationOptimisation";
import { consigneSommet, contexteLabelX, contexteLabelY, segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { aidesSommet, messageSommet, MESSAGE_VALEUR_OPTIMISATION_ILLISIBLE } from "../ui/aidesOptimisation";
import { EnTeteExercice } from "./EnTeteExercice";
import { QuestionFinale } from "./QuestionFinale";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOptimisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSommet) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran commun aux 2 variantes — calcule le sommet de la parabole. Première étape de la variante
 * `fonctionDonnee` (fonction ET domaine déjà fournis) ; pour `modelisation`, fonction/domaine
 * viennent d'être confirmés aux écrans précédents (récapitulés par `RecapitulatifPanel`, voir
 * `AppOptimisation.tsx`, plutôt que par un bloc "état actuel" isolé ici).
 *
 * **Labels de champs = nom concret de la grandeur/variable, REMPLACEMENT COMPLET** (`prompt-
 * restructuration-architecture-modelisation.md`, point 1 — jamais $x_S$/$y_S$ nus, jamais un ajout
 * entre parenthèses À CÔTÉ du label mathématique comme dans une version antérieure de cette
 * fonctionnalité) : `contexteLabelX`/`contexteLabelY` (`nomVariable`/`nomGrandeur` sans article)
 * REMPLACENT directement `x_S =`/`y_S =`. Repli sur la notation mathématique nue UNIQUEMENT si
 * `genreGrandeur` est absent (8 familles exclusives au 57e exercice, qui n'utilisent jamais cet
 * écran en pratique — voir `core/optimisation.types.ts` — repli défensif, jamais atteint). Les
 * textes d'aide contiennent leur propre notation à underscore ($x_S$...) rendue via
 * `<SegmentsInline>`, jamais en texte brut (point 2 du même prompt).
 */
export function EtapeSommetOptimisation({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation}: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const saisie = useTentativeLisible<ReponseSommet>();
  const lisible = parserNombreOuFraction(x) !== null && parserNombreOuFraction(y) !== null;
  const complet = x.trim() !== "" && y.trim() !== "";
  const reponse: ReponseSommet = { x, y };
  const statut = complet ? diagnostiquerSommet(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;

  const labelX = contexteLabelX(exercice) || "x_S";
  const labelY = contexteLabelY(exercice) || "y_S";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.contexte.questionFinale} />}
      />
      <p className="prompt-text">{consigneSommet(exercice)}</p>
      <div className="field">
        <label className="field-label" htmlFor="optimisation-sommet-x">
          {labelX} =
        </label>
        <input
          id="optimisation-sommet-x"
          className={`text-input${apresEchec && statut && statut.x !== "correct" ? " is-erronee" : ""}`}
          value={x}
          onChange={(e) => setX(normaliserSigneMoins(e.target.value))}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="optimisation-sommet-y">
          {labelY} =
        </label>
        <input
          id="optimisation-sommet-y"
          className={`text-input${apresEchec && statut && statut.y !== "correct" ? " is-erronee" : ""}`}
          value={y}
          onChange={(e) => setY(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <>
        <AidesNiveaux aides={aidesSommet(exercice)} onPremiereAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(reponse, lisible, onValider)}>
          Valider
        </button>
        <MessageRetour illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} texteIllisible={MESSAGE_VALEUR_OPTIMISATION_ILLISIBLE} cible={saisie.soumise ? messageSommet(exercice, saisie.soumise.x, saisie.soumise.y) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
