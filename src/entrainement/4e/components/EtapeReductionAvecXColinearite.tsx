import { useState } from "react";
import type { ExerciceColinearPointsParametre } from "../core/colinearite.types";
import { diagnostiquerReductionAvecX } from "../moteur/verificationColinearite";
import { NIVEAU_AIDE_MAX_REDUCTION_AVEC_X } from "../moteur/sessionColinearite";
import { CONSIGNE_REDUCTION_AVEC_X, LATEX_FORMULE_COLINEARITE_VECTORIELLE, LATEX_VEC_U, LATEX_VEC_V, PLACEHOLDER_EQUATION_REDUITE, RAPPEL_VECTORIEL_COLINEARITE_APRES, RAPPEL_VECTORIEL_COLINEARITE_AVANT, RAPPEL_VECTORIEL_COLINEARITE_ENTRE, RAPPEL_VECTORIEL_COLINEARITE_FIN, consigneGlobaleColinearite, formatTermesEnoncePointsParametreLatex, formuleSubstitueeReductionLatex } from "../ui/formatColinearite";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "reductionAvecX" — V4-écran2 (variante "pointsParametre") UNIQUEMENT,
 * `promptcorrectionsgenerateur24complet.md` (points 5-8) : un seul champ de saisie libre attendant
 * l'équation réduite complète (`αx+β=0`, ou toute forme équivalente), vérification symbolique
 * (`diagnostiquerReductionAvecX`, réutilise `diagnostiquerFormeCanonique`).
 *
 * Consigne globale persistante + aide progressive à 2 niveaux : niveau 1, rappel VECTORIEL
 * générique (u/v, jamais lié aux vrais noms AB/AC de l'exercice) ; niveau 2, la formule substituée
 * avec les valeurs réelles (non développée).
 *
 * `promptgen24modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnoncePointsParametreLatex`).
 *
 * Ancien bloc "état actuel" (AB/AC déjà confirmés à l'écran précédent, `etatActuelReductionAvecX`)
 * retiré — son contenu alimente maintenant le récapitulatif "Ce qu'on sait déjà"
 * (`ui/recapitulatifColinearite.ts`), affiché en haut de `AppColinearite.tsx`.
 */
export function EtapeReductionAvecXColinearite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerReductionAvecX(exercice, texte) : undefined;
  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobale}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesEnoncePointsParametreLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_REDUCTION_AVEC_X} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
