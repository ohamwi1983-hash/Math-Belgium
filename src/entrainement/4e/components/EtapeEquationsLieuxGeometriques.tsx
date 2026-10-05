import { useState } from "react";
import type { ExerciceLieuxGeometriques, Lieu } from "../core/lieuxGeometriques.types";
import { diagnostiquerEquationLieu } from "../moteur/verificationLieuxGeometriques";
import type { ReponseEquations } from "../moteur/verificationLieuxGeometriques";
import { PLACEHOLDER_EQUATION } from "../ui/formatEquationCercle";
import {
  CONSIGNE_GENERALE_EQUATIONS,
  formatEquationLieuLatex,
  latexGabaritGenerique,
  libelleBoutonAide,
  libelleChampEquation,
  segmentsDescriptionLieu,
  segmentsEnonce,
} from "../ui/formatLieuxGeometriques";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceLieuxGeometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEquations) => void;
}

interface BlocEquationLieuProps {
  lieu: Lieu;
  id: string;
  texte: string;
  onChange: (valeur: string) => void;
  statut: StatutVerification | undefined;
}

/** Un bloc PAR LIEU — caractéristiques, immédiatement suivies de son propre champ de texte libre,
 * labellisé par le TYPE réel du lieu (`promptgen53gen54corrections.md`, B.5 : remplace l'ancien bloc
 * "état actuel" unique combinant les 2 lieux). */
function BlocEquationLieu({ lieu, id, texte, onChange, statut }: BlocEquationLieuProps) {
  return (
    <div className="equation-box">
      <p>
        <RenduFragments fragments={segmentsDescriptionLieu(lieu)} />
      </p>
      <div className="field">
        <label className="field-label" htmlFor={id}>
          {libelleChampEquation(lieu)}
        </label>
        <input
          id={id}
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION}
          value={texte}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/** Écran 2 — Équations. 2 blocs DISTINCTS, un par lieu, vérifiés par équivalence algébrique en
 * réutilisant les moteurs déjà en place pour chaque type de lieu. */
export function EtapeEquationsLieuxGeometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texteLieu1, setTexteLieu1] = useState("");
  const [texteLieu2, setTexteLieu2] = useState("");
  const apresEchec = tentativesUtilisees > 0;
  const complet = texteLieu1.trim() !== "" && texteLieu2.trim() !== "";

  const statutLieu1 = apresEchec ? diagnostiquerEquationLieu(exercice.lieu1, texteLieu1) : undefined;
  const statutLieu2 = apresEchec ? diagnostiquerEquationLieu(exercice.lieu2, texteLieu2) : undefined;
  const statutGlobal =
    statutLieu1 === "parse_error" || statutLieu2 === "parse_error"
      ? "parse_error"
      : statutLieu1 === "correct" && statutLieu2 === "correct"
        ? "correct"
        : apresEchec
          ? "not_equivalent"
          : undefined;

  return (
    <div>
      <div className="equation-box">
        <p>
          <RenduFragments fragments={segmentsEnonce(exercice)} />
        </p>
      </div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATIONS}</p>

      <BlocEquationLieu lieu={exercice.lieu1} id="lieux-geometriques-equation-lieu1" texte={texteLieu1} onChange={setTexteLieu1} statut={statutLieu1} />
      <BlocEquationLieu lieu={exercice.lieu2} id="lieux-geometriques-equation-lieu2" texte={texteLieu2} onChange={setTexteLieu2} statut={statutLieu2} />

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Formule générale — premier lieu : <Katex expression={latexGabaritGenerique(exercice.lieu1.type, exercice.lieu1.type === "parabole" ? exercice.lieu1.orientation : undefined)} />
            {" "}; second lieu : <Katex expression={latexGabaritGenerique(exercice.lieu2.type, exercice.lieu2.type === "parabole" ? exercice.lieu2.orientation : undefined)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée (non résolue) — premier lieu : <Katex expression={formatEquationLieuLatex(exercice.lieu1)} />
              {" "}; second lieu : <Katex expression={formatEquationLieuLatex(exercice.lieu2)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= 2} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, 2)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ texteLieu1, texteLieu2 })}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}
