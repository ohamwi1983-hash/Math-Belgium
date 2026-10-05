import { useState } from "react";
import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ReponseMediane } from "../moteur/verificationMediane";
import { diagnostiquerMediane } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_MEDIANE } from "../moteur/sessionMediane";
import {
  LABEL_EFFECTIF_CUMULE_VI,
  LABEL_EFFECTIF_NI,
  LABEL_MEDIANE_Q2,
  LABEL_VALEUR_XI,
  PLACEHOLDER_MEDIANE,
  PLACEHOLDER_SEUIL,
  consigneMedianeDiscrete,
  libelleBoutonAide,
  surlignageSeuilTable,
  texteAideMedianeNiveau1,
  texteAideMedianeNiveau2,
} from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMediane } from "./EnonceMediane";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceMedianeDiscrete;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseMediane) => void;
}

/**
 * Écran "mediane" (variante "discrete", désormais la PREMIÈRE d'une séquence à 4 écrans —
 * `q1 → q3 → minMaxMode`, `promptgen33modifications.md` — plus jamais terminale) — 2 champs
 * séparés (seuil n/2, médiane Q2), pour isoler une erreur de calcul du seuil d'une erreur de
 * lecture/application de la règle dans le tableau (spec). Surlignage du tableau à l'Aide 2 :
 * ligne entière (couleur + gras, `.md-table`) si le seuil tombe strictement entre deux effectifs
 * cumulés, valeur seule (jamais toute la ligne) si le seuil coïncide exactement avec un vi du
 * tableau (cas limite — ce n'est alors pas la ligne réponse).
 */
export function EtapeMedianeDiscrete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [seuil, setSeuil] = useState("");
  const [mediane, setMediane] = useState("");

  const complet = seuil.trim() !== "" && mediane.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerMediane(exercice, { seuil, mediane }) : null;
  const statut = evaluation && (evaluation.seuil === "parse_error" || evaluation.mediane === "parse_error") ? "parse_error" : undefined;
  const surlignage = niveauAide >= 2 ? surlignageSeuilTable(exercice, exercice.seuil, exercice.indexMediane) : null;

  return (
    <div>
      <EnonceMediane exercice={exercice} />
      <p className="prompt-text">{consigneMedianeDiscrete(exercice)}</p>

      <div className="tf-table-scroll">
        <table className="tf-table md-table">
          <thead>
            <tr>
              <th>
                Valeur <Katex expression={LABEL_VALEUR_XI} />
              </th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th>
                Effectif cumulé <Katex expression={LABEL_EFFECTIF_CUMULE_VI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.lignes.map((ligne, index) => (
              <tr key={index} className={surlignage?.type === "ligne" && surlignage.index === index ? "is-surlignee" : undefined}>
                <td>{ligne.valeur}</td>
                <td>{ligne.effectif}</td>
                <td className={surlignage?.type === "valeur" && surlignage.index === index ? "is-surlignee" : undefined}>{ligne.effectifCumule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_MEDIANE} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_MEDIANE)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ seuil, mediane })}>
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
