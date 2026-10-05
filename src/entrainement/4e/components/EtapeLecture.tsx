import { useState } from "react";
import type { ExerciceBoiteMoustachesLecture } from "../core/boiteMoustaches.types";
import type { ReponseLecture } from "../moteur/verificationBoiteMoustaches";
import { diagnostiquerLecture } from "../moteur/verificationBoiteMoustaches";
import { niveauAideMaxPourPhase } from "../moteur/sessionBoiteMoustaches";
import {
  LABEL_Q1,
  LABEL_Q2,
  LABEL_Q3,
  LABEL_X_MAX,
  LABEL_X_MIN,
  libelleBoutonAide,
  segmentsAideLectureNiveau1,
  segmentsAideLectureNiveau2,
  segmentsConsigneLecture,
} from "../ui/formatBoiteMoustaches";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoiteMoustachesGraph } from "./BoiteMoustachesGraph";
import { EnonceBoiteMoustaches } from "./EnonceBoiteMoustaches";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceBoiteMoustachesLecture;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLecture) => void;
}

const CHAMPS: { cle: keyof ReponseLecture; label: string }[] = [
  { cle: "min", label: LABEL_X_MIN },
  { cle: "q1", label: LABEL_Q1 },
  { cle: "mediane", label: LABEL_Q2 },
  { cle: "q3", label: LABEL_Q3 },
  { cle: "max", label: LABEL_X_MAX },
];

/** Écran "lecture" — boîte à moustaches déjà tracée (statique, aucune interaction), 5 champs libres
 * indépendants. Toujours terminal. */
export function EtapeLecture({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [reponse, setReponse] = useState<ReponseLecture>({ min: "", q1: "", mediane: "", q3: "", max: "" });
  const maxAide = niveauAideMaxPourPhase("lecture");

  const complet = CHAMPS.every(({ cle }) => reponse[cle].trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerLecture(exercice, reponse) : null;
  const statutGlobal = statut && CHAMPS.some(({ cle }) => statut[cle] === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <EnonceBoiteMoustaches exercice={exercice} />
      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneLecture(exercice)} />
      </p>

      <BoiteMoustachesGraph bornePlage={exercice.bornePlage} lignes={[{ valeurs: exercice.valeurs }]} />

      {CHAMPS.map(({ cle, label }) => (
        <div className="field field-inline" key={cle}>
          <label className="field-label field-label-minuscule" htmlFor={`lecture-${cle}`}>
            <Katex expression={label} /> =
          </label>
          <input
            id={`lecture-${cle}`}
            className={`text-input${statut && statut[cle] !== "correct" ? " is-erronee" : ""}`}
            value={reponse[cle]}
            onChange={(e) => setReponse((prec) => ({ ...prec, [cle]: filtrerSaisieNumerique(e.target.value) }))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      ))}

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideLectureNiveau1()} />
          </p>
        </div>
      )}
      {niveauAide >= 2 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideLectureNiveau2(exercice)} />
          </p>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= maxAide} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, maxAide)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}
