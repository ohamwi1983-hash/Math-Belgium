import { useState } from "react";
import type { ExerciceColinearPointsParametre } from "../core/colinearite.types";
import { diagnostiquerReductionAvecX } from "../moteur/verificationColinearite";
import { NIVEAU_AIDE_MAX_REDUCTION_AVEC_X } from "../moteur/sessionColinearite";
import { CONSIGNE_REDUCTION_AVEC_X, LATEX_FORMULE_COLINEARITE_VECTORIELLE, LATEX_VEC_U, LATEX_VEC_V, PLACEHOLDER_EQUATION_REDUITE, RAPPEL_VECTORIEL_COLINEARITE_APRES, RAPPEL_VECTORIEL_COLINEARITE_AVANT, RAPPEL_VECTORIEL_COLINEARITE_ENTRE, RAPPEL_VECTORIEL_COLINEARITE_FIN, consigneGlobaleColinearite, etatActuelReductionAvecX, formatTermesEnoncePointsParametreLatex, formuleSubstitueeReductionLatex } from "../ui/formatColinearite";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran "reductionAvecX" — V4-écran2 (variante "pointsParametre") UNIQUEMENT,
 * `promptcorrectionsgenerateur24complet.md` (points 5-8) : un seul champ de saisie libre attendant
 * l'équation réduite complète (`αx+β=0`, ou toute forme équivalente), vérification symbolique
 * (`diagnostiquerReductionAvecX`, réutilise `diagnostiquerFormeCanonique`).
 *
 * Bloc "État actuel" (AB/AC déjà confirmés à l'écran précédent, notation matricielle) + consigne
 * globale persistante + aide progressive à 2 niveaux : niveau 1, rappel VECTORIEL générique (u/v,
 * jamais lié aux vrais noms AB/AC de l'exercice) ; niveau 2, la formule substituée avec les valeurs
 * réelles (non développée).
 *
 * `promptgen24modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnoncePointsParametreLatex`) — l'état actuel (`etatActuelReductionAvecX`) reçoit le
 * même correctif directement dans `formatColinearite.ts` (`\begin{gathered}`, jamais `\qquad`).
 */
export function EtapeReductionAvecXColinearite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerReductionAvecX(exercice, texte) : undefined;
  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnoncePointsParametreLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <EtatActuelPanel latex={etatActuelReductionAvecX(exercice)} />
      <p className="prompt-text">{CONSIGNE_REDUCTION_AVEC_X}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-reductionavecx-equation">
          Équation =
        </label>
        <input
          id="colinearite-reductionavecx-equation"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION_REDUITE}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            {RAPPEL_VECTORIEL_COLINEARITE_AVANT} <Katex expression={LATEX_VEC_U} /> {RAPPEL_VECTORIEL_COLINEARITE_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
            {RAPPEL_VECTORIEL_COLINEARITE_APRES} <Katex expression={LATEX_FORMULE_COLINEARITE_VECTORIELLE} /> {RAPPEL_VECTORIEL_COLINEARITE_FIN}
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeReductionLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_REDUCTION_AVEC_X} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
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
