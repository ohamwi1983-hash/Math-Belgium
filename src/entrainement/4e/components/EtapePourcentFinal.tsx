import { useState } from "react";
import type { ExerciceBienaymeTchebychevIntervalleVersNombre, ExerciceBienaymeTchebychevIntervalleVersPourcent } from "../core/bienaymeTchebychev.types";
import { diagnostiquerPourcent } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatEtatActuelCombineLatex, kEtatActuel, precisionPourcentFinal, texteAidePourcentNiveau1, texteAidePourcentNiveau2 } from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

type Exercice = ExerciceBienaymeTchebychevIntervalleVersPourcent | ExerciceBienaymeTchebychevIntervalleVersNombre;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

const MAX = 2;

/** Rôle "pourcentage minimal, écran final (V1) ou intermédiaire (V3)" — la différence entre les deux
 * (arrondi vers le bas pour V1, arrondi standard pour V3) est déjà capturée par la valeur de
 * `pourcentAttendu` elle-même (Couche A), jamais par ce composant. Rappelle le k déjà confirmé à
 * l'écran précédent. */
export function EtapePourcentFinal({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerPourcent(exercice, texte) : undefined;

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelCombineLatex(null, kEtatActuel(exercice))} />
      <p className="prompt-text">Quel est le pourcentage minimal garanti ? ({precisionPourcentFinal(exercice.variante)})</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="bienayme-pourcent-final">
          % minimal =
        </label>
        <input
          id="bienayme-pourcent-final"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 75"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePourcentNiveau1().texte}</p>
          <Katex expression={texteAidePourcentNiveau1().latex} block />
          {niveauAide >= 2 && (
            <>
              <p>{texteAidePourcentNiveau2(exercice.kAttendu).texte}</p>
              <Katex expression={texteAidePourcentNiveau2(exercice.kAttendu).latex} block />
            </>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={MAX} onActiverAide={onActiverAide} />

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
