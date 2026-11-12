import { useState } from "react";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { consigneEcranRiche, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatVitessePosition";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { TexteRiche5e } from "./TexteRiche5e";

interface Props {
  exercice: ExerciceVitessePosition;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran "rejet" — QCM « pourquoi rejette-t-on l'autre solution », UNE seule tentative (choix fermé,
 * décision D de l'audit) : l'écran se clôt dès la première validation. 4 options de longueur
 * comparable, ordre mélangé à la construction (`exercice.optionsRejetRacine`). */
export function EtapeRejetVitessePosition({ exercice, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const aides = niveauAide >= 2 ? [texteAideNiveau1("rejet"), texteAideNiveau2("rejet")] : niveauAide >= 1 ? [texteAideNiveau1("rejet")] : [];

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, "rejet")} />
      </p>
      <div className="options-grid">
        {exercice.optionsRejetRacine.map((option, i) => (
          <button key={i} type="button" className={`btn${index === i ? " toggle-active" : ""}${index === i && validation?.revele ? " is-erronee" : ""}`} disabled={!!validation} onClick={() => setIndex(i)}>
            {option.texte}
          </button>
        ))}
      </div>
      {aides.length > 0 && (
        <div className="aide-5e">
          {aides.map((aide, i) => (
            <div key={i}>
              <p>
                <TexteRiche5e texte={aide.texte} />
              </p>
              {aide.latex && <Katex expression={aide.latex} block />}
            </div>
          ))}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={index === null} onClick={() => index !== null && onValider(index)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
