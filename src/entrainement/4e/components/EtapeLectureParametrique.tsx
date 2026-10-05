import { useState } from "react";
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import { NIVEAU_AIDE_MAX } from "../moteur/sessionLectureGraphiqueDroite";
import { diagnostiquerParametriqueLecture } from "../moteur/verificationLectureGraphiqueDroite";
import type { ReponseParametriqueLecture } from "../moteur/verificationLectureGraphiqueDroite";
import { consigneGeneraleLecture, consigneLecture, libelleBoutonAide, texteAideNiveau1 } from "../ui/formatLectureGraphiqueDroite";
import { pointsAideExemple } from "../ui/lectureGraphiqueDroiteGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { LectureGraphiqueDroiteGraph } from "./LectureGraphiqueDroiteGraph";

interface Props {
  exercice: ExerciceLectureGraphiqueDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseParametriqueLecture) => void;
}

const PLACEHOLDER_TEXTE_X = "ex : x=2+t×3";
const PLACEHOLDER_TEXTE_Y = "ex : y=1-t×2";

/**
 * Variante "parametrique" — 2 champs de texte libre (`promptgen43gen44etcorrectionschapitre6.md`,
 * partie A.1 — remplace les 4 champs numériques x0/y0/a/b), vérifiés par
 * `diagnostiquerParametriqueLecture` (extraction affine en t puis point sur la droite + vecteur
 * colinéaire à la référence, jamais un couple exact imposé — même mécanisme que "Équation d'une
 * droite", réutilisé tel quel).
 */
export function EtapeLectureParametrique({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");

  const complet = texteX.trim() !== "" && texteY.trim() !== "";

  function construireReponse(): ReponseParametriqueLecture {
    return { texteX, texteY };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerParametriqueLecture(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{consigneGeneraleLecture(exercice)}</p>
      <LectureGraphiqueDroiteGraph exercice={exercice} pointsSurlignes={niveauAide >= 2 ? pointsAideExemple(exercice) : []} />
      <p className="prompt-text">{consigneLecture(exercice)}</p>

      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="lecture-droite-texte-x">
          Équation en <Katex expression="x" /> (<Katex expression="t" /> est le paramètre)
        </label>
        <input
          id="lecture-droite-texte-x"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_TEXTE_X}
          value={texteX}
          onChange={(e) => setTexteX(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="lecture-droite-texte-y">
          Équation en <Katex expression="y" /> (<Katex expression="t" /> est le paramètre)
        </label>
        <input
          id="lecture-droite-texte-y"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_TEXTE_Y}
          value={texteY}
          onChange={(e) => setTexteY(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>Deux points de la droite sont désormais surlignés en orange sur le graphe.</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
