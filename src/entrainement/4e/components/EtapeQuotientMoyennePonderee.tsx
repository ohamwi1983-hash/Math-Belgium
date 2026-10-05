import { useState } from "react";
import type { ExerciceMoyennePonderee } from "../core/moyennePonderee.types";
import type { ReponseQuotient } from "../moteur/verificationMoyennePonderee";
import { diagnostiquerQuotient } from "../moteur/verificationMoyennePonderee";
import { NIVEAU_AIDE_MAX_QUOTIENT } from "../moteur/sessionMoyennePonderee";
import {
  LABEL_MOYENNE_BARRE,
  PLACEHOLDER_QUOTIENT,
  consigneQuotient,
  formatEtatActuelSommesLatex,
  libelleBoutonAide,
  texteAideQuotientNiveau1,
} from "../ui/formatMoyennePonderee";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMoyennePonderee } from "./EnonceMoyennePonderee";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceMoyennePonderee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseQuotient) => void;
}

/**
 * Écran "quotient" (commun aux 2 variantes) — toujours la phase terminale, pour les 2 variantes
 * (depuis le retrait de l'écran "conceptuel", `promptgen32modifications.md`, point 5). Les deux
 * sommes CONFIRMÉES à l'écran "sommes" sont rappelées via `EtatActuelPanel`, sur 2 lignes séparées
 * (jamais resaisies ici, toujours la vraie valeur) ; un seul champ pour la moyenne $\bar{x}$
 * elle-même.
 */
export function EtapeQuotientMoyennePonderee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerQuotient(exercice, texte) : undefined;
  const aide1 = texteAideQuotientNiveau1();
  const consigne = consigneQuotient(exercice);

  return (
    <div>
      <EnonceMoyennePonderee exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelSommesLatex(exercice)} label="Sommes confirmées" />
      <p className="prompt-text">
        {consigne.avant}
        <Katex expression={consigne.latex} />
        {consigne.apres}
      </p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="moyenne-quotient">
          Moyenne <Katex expression={`${LABEL_MOYENNE_BARRE} =`} />
        </label>
        <input
          id="moyenne-quotient"
          className={`text-input${apresEchec && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_QUOTIENT}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{aide1.texte}</p>
          <Katex expression={aide1.latex} block />
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_QUOTIENT} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_QUOTIENT)}
      </button>

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
