import { useState } from "react";
import type { ExerciceOptimisationModelisation } from "../core/optimisation.types";
import type { ReponseContrainteEtGrandeur } from "../moteur/verificationOptimisation";
import { diagnostiquerContrainteEtGrandeur } from "../moteur/verificationOptimisation";
import { consigneContrainteEtGrandeur, segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesContrainteEtGrandeur, MESSAGE_EXPRESSION_OPTIMISATION_ILLISIBLE } from "../ui/aidesOptimisation";
import { CroquisOptimisation } from "./CroquisOptimisation";
import { EnTeteExercice } from "./EnTeteExercice";
import { QuestionFinale } from "./QuestionFinale";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";

interface Props {
  exercice: ExerciceOptimisationModelisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseContrainteEtGrandeur) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 (`prompt-restructuration-architecture-modelisation.md`) — FUSIONNE les anciens écrans
 * "contrainte" (poser la relation NON isolée) et "exprimer la grandeur en x et y" en un seul écran à
 * 2 champs/2 statuts, comme un système à 2 équations en cours de pose (résolu ensuite à l'écran
 * "systeme"). Le croquis SVG (`prompt-implementation-3-diagrammes-svg.md`) est rendu ICI
 * spécifiquement — c'est l'écran où la relation géométrique est établie, jamais persistant sur
 * toute la séquence comme dans une version antérieure de cette fonctionnalité.
 */
export function EtapeContrainteEtGrandeurOptimisation({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [texteEquation, setTexteEquation] = useState("");
  const [texteGrandeur, setTexteGrandeur] = useState("");
  const saisie = useTentativeLisible<ReponseContrainteEtGrandeur>();

  const complet = texteEquation.trim() !== "" && texteGrandeur.trim() !== "";
  const reponse: ReponseContrainteEtGrandeur = { texteEquation, texteGrandeur };
  const statut = complet ? diagnostiquerContrainteEtGrandeur(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const statutGlobal = statut
    ? statut.equation === "parse_error" || statut.grandeur === "parse_error"
      ? "parse_error"
      : statut.equation === "correct" && statut.grandeur === "correct"
        ? "correct"
        : "not_equivalent"
    : undefined;
  const lisible = statutGlobal !== "parse_error";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.contexte.questionFinale} />}
      />
      {exercice.contexte.croquis && <CroquisOptimisation croquis={exercice.contexte.croquis} />}
      <p className="prompt-text">{consigneContrainteEtGrandeur(exercice)}</p>

      <ApercuExpressionLatex texte={texteEquation} />
      <div className="field">
        <label className="field-label" htmlFor="optimisation-contrainte">
          Relation entre {exercice.contexte.labelVariable} et {exercice.contrainte.lettreCherchee}
        </label>
        <input
          id="optimisation-contrainte"
          className={`text-input${apresEchec && statut && statut.equation !== "correct" ? " is-erronee" : ""}`}
          placeholder={`ex : 3${exercice.contexte.labelVariable}+5${exercice.contrainte.lettreCherchee}=17`}
          value={texteEquation}
          onChange={(e) => setTexteEquation(normaliserSigneMoins(e.target.value))}
        />
      </div>

      <ApercuExpressionLatex texte={texteGrandeur} label={`${exercice.contexte.nomGrandeur} =`} />
      <div className="field">
        <label className="field-label" htmlFor="optimisation-grandeur">
          {exercice.contexte.nomGrandeur} =
        </label>
        <input
          id="optimisation-grandeur"
          className={`text-input${apresEchec && statut && statut.grandeur !== "correct" ? " is-erronee" : ""}`}
          placeholder={`ex : 3*${exercice.contexte.labelVariable}*${exercice.contrainte.lettreCherchee}`}
          value={texteGrandeur}
          onChange={(e) => setTexteGrandeur(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <>
        <AidesNiveaux aides={aidesContrainteEtGrandeur(exercice)} onPremiereAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(reponse, lisible, onValider)}>
          Valider
        </button>
        <MessageRetour illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} texteIllisible={MESSAGE_EXPRESSION_OPTIMISATION_ILLISIBLE} cible={null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
