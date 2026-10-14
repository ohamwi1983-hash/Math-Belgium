import { useState } from "react";
import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ReponseMediane } from "../moteur/verificationMediane";
import { diagnostiquerMediane } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_MEDIANE } from "../moteur/sessionMediane";
import { LABEL_MEDIANE_Q2, PLACEHOLDER_MEDIANE, PLACEHOLDER_SEUIL, consigneMedianeDiscrete, texteAideMedianeNiveau1, texteAideMedianeNiveau2 } from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceMedianeDiscrete;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseMediane) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "mediane" (variante "discrete", désormais la PREMIÈRE d'une séquence à 4 écrans —
 * `q1 → q3 → minMaxMode`, `promptgen33modifications.md` — plus jamais terminale) — 2 champs
 * séparés (seuil n/2, médiane Q2), pour isoler une erreur de calcul du seuil d'une erreur de
 * lecture/application de la règle dans le tableau (spec). Surlignage du tableau à l'Aide 2 :
 * ligne entière (couleur + gras, `.md-table`) si le seuil tombe strictement entre deux effectifs
 * cumulés, valeur seule (jamais toute la ligne) si le seuil coïncide exactement avec un vi du
 * tableau (cas limite — ce n'est alors pas la ligne réponse). Le tableau lui-même (identique sur
 * les écrans "mediane"/"q1"/"q3") est centralisé dans `blocDonnees` (`EnTeteExercice`, voir
 * `AppMediane`/`AppExerciceSynthese`) — plus rendu ici.
 */
export function EtapeMedianeDiscrete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [seuil, setSeuil] = useState("");
  const [mediane, setMediane] = useState("");

  const complet = seuil.trim() !== "" && mediane.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerMediane(exercice, { seuil, mediane }) : null;
  const statut = evaluation && (evaluation.seuil === "parse_error" || evaluation.mediane === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <p className="prompt-text">{consigneMedianeDiscrete(exercice)}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="mediane-seuil">
          Seuil (n/2) =
        </label>
        <input
          id="mediane-seuil"
          className={`text-input${evaluation && evaluation.seuil !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SEUIL}
          value={seuil}
          onChange={(e) => setSeuil(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="mediane-valeur">
          Médiane <Katex expression={LABEL_MEDIANE_Q2} /> =
        </label>
        <input
          id="mediane-valeur"
          className={`text-input${evaluation && evaluation.mediane !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_MEDIANE}
          value={mediane}
          onChange={(e) => setMediane(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={texteAideMedianeNiveau1()} />
          </p>
          {niveauAide >= 2 && <p>{texteAideMedianeNiveau2(exercice)}</p>}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_MEDIANE} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ seuil, mediane })}>
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
