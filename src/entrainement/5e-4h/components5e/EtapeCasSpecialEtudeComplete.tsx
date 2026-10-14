import { useState } from "react";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
import { formatMessageErreur } from "../ui/messageErreur";
import type { ReponseCasSpecial } from "../moteur5e/verificationEtudeComplete";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCasSpecial) => void;
  diagnostiquer?: (reponse: ReponseCasSpecial) => { x: StatutVerification; y: StatutVerification };
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "casSpecial" (recoupement) — consigne substituant la VRAIE équation de l'asymptote (rendue
 * en KaTeX, `consignePhase` renvoie un fragment LaTeX complet prose+math pour cette phase
 * spécifiquement, jamais un placeholder générique "asymptote(x)" — `prompt5gen24correctionrefonte2.md`,
 * point 6), et champs x/y CÔTE À CÔTE sur une même ligne (`.field-row` unique + 2 `.field-inline`,
 * même convention 4e que les coordonnées d'un point — `EtapeCoordonneesRelationVectorielle.tsx`),
 * jamais empilés verticalement comme le rendait `EtapeChampsEtudeComplete` générique.
 */
export function EtapeCasSpecialEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer({ x: texteX, y: texteY }) : null;
  const pireStatut: StatutVerification | null = correction ? (correction.x !== "correct" ? correction.x : correction.y !== "correct" ? correction.y : null) : null;

  function valider() {
    if (!complet) return;
    onValider({ x: texteX, y: texteY });
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDE_COMPLETE}
        blocDonnees={<BlocDonneesEtudeComplete exercice={exercice} />}
      />
      <Katex expression={consignePhase(exercice, "casSpecial")} block />
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="etude-complete-cas-special-x">
            x
          </label>
          <input
            id="etude-complete-cas-special-x"
            type="text"
            className={`text-input${correction && correction.x !== "correct" ? " is-erronee" : ""}`}
            value={texteX}
            onChange={(e) => setTexteX(e.target.value)}
            placeholder="ex : 3"
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="etude-complete-cas-special-y">
            y
          </label>
          <input
            id="etude-complete-cas-special-y"
            type="text"
            className={`text-input${correction && correction.y !== "correct" ? " is-erronee" : ""}`}
            value={texteY}
            onChange={(e) => setTexteY(e.target.value)}
            placeholder="ex : 2"
          />
        </div>
      </div>
      <CalculatriceScientifique />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, pireStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "casSpecial")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "casSpecial")} block />}
        </div>
      )}
    </div>
  );
}
