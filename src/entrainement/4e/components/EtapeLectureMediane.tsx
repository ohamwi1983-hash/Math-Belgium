import { useState } from "react";
import type { ExerciceMedianeClasses } from "../core/mediane.types";
import type { ParametreLecture } from "../moteur/verificationMediane";
import { diagnostiquerLecture } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_LECTURE_MEDIANE, NIVEAU_AIDE_MAX_LECTURE_Q1, NIVEAU_AIDE_MAX_LECTURE_Q3 } from "../moteur/sessionMediane";
import {
  PLACEHOLDER_LECTURE,
  consigneLecture,
  formatFormuleInterpolationLatex,
  labelChampLecture,
  libelleBoutonAide,
  pointsEncadresLecture,
  polygonePoints,
  texteAideLectureNiveau1,
  texteAideLectureNiveau2,
  texteAideLectureNiveau3,
} from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMediane } from "./EnonceMediane";
import { LectureQuartileGraph } from "./LectureQuartileGraph";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceMedianeClasses;
  parametre: ParametreLecture;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

const NIVEAU_AIDE_MAX: Record<ParametreLecture, number> = {
  q1: NIVEAU_AIDE_MAX_LECTURE_Q1,
  mediane: NIVEAU_AIDE_MAX_LECTURE_MEDIANE,
  q3: NIVEAU_AIDE_MAX_LECTURE_Q3,
};

/**
 * Écrans "lectureQ1"/"lectureMediane"/"lectureQ3" (variante "classes" uniquement,
 * `promptgen33modifications2.md`, remplacent "composantsFormule"/"calculFinal") — UN SEUL
 * composant générique paramétré par `parametre` (même principe que les composants génériques déjà
 * établis ailleurs dans le projet, ex. `EtapeTestSommetOrthogonalite.tsx`), plutôt que 3 fichiers
 * quasi identiques. Le polygone affiché est toujours le VRAI polygone confirmé de l'exercice
 * (`polygonePoints`), jamais une saisie résiduelle de l'écran "Polygone" précédent. Tolérance de
 * lecture graphique (interpolation continue) TIERÉE selon l'amplitude du caractère de l'instance
 * — jamais fixée à ±0,1 (`promptgen33gen35precisionlecture.md`) — voir
 * `verificationMediane.ts::precisionLecture`/`toleranceLecture`.
 *
 * Aides 3/4 (`promptgen33gen35aidesinterpolation.md`, `NIVEAU_AIDE_MAX_LECTURE_*` passé de 2 à 4,
 * aides 1/2 inchangées) — aide 3 fait repérer visuellement l'INTERVALLE d'interpolation : les 2
 * sommets du polygone qui encadrent le seuil sont surlignés en orange sur le graphe
 * (`LectureQuartileGraph`, prop `pointsEncadres`) pendant qu'un texte nomme $x_{inf}$/$x_{sup}$
 * (`texteAideLectureNiveau3`, rendu via `SegmentsInline`) ; aide 4 affiche la formule d'interpolation
 * linéaire elle-même, avec $v_{inf}$/$v_{sup}$ (`formatFormuleInterpolationLatex`, notation $v_i$ —
 * jamais $y_i$ — cohérente avec la colonne des effectifs cumulés du tableau affiché à un écran
 * précédent). `pointsEncadresLecture` (`ui/formatMediane.ts`) est la SEULE source de vérité pour ces
 * 2 points, consommée à la fois par le texte de l'aide 3 et par le surlignage du graphe.
 */
export function EtapeLectureMediane({ exercice, parametre, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX[parametre];

  const complet = texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerLecture(exercice, parametre, texte) : null;

  return (
    <div>
      <EnonceMediane exercice={exercice} />
      <p className="prompt-text">{consigneLecture(exercice, parametre)}</p>

      <LectureQuartileGraph points={polygonePoints(exercice)} pointsEncadres={niveauAide >= 3 ? pointsEncadresLecture(exercice, parametre) : undefined} />

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="lecture-valeur">
          <Katex expression={labelChampLecture(parametre)} /> =
        </label>
        <input
          id="lecture-valeur"
          className={`text-input${statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LECTURE}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideLectureNiveau1(parametre)}</p>
          {niveauAide >= 2 && <p>{texteAideLectureNiveau2(exercice, parametre)}</p>}
          {niveauAide >= 3 && (
            <p>
              <SegmentsInline segments={texteAideLectureNiveau3(exercice, parametre)} />
            </p>
          )}
          {niveauAide >= 4 && <Katex expression={formatFormuleInterpolationLatex(parametre)} block />}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut === "parse_error" ? "parse_error" : undefined)}
        </p>
      )}
    </div>
  );
}
