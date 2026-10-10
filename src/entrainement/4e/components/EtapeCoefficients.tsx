import { useState } from "react";
import type { ExerciceAnalyseFonction } from "../core/analyseFonction.types";
import { Katex } from "./Katex";
import { formatFonctionColoreeLatex, formatFonctionOrdreLatex } from "../ui/formatAnalyseFonction";
import { diagnostiquerCoefficients } from "../moteur/verificationAnalyseFonction";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: { a: number; b: number; c: number }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Étape 1 : f(x) affiché avec les termes non nuls dans l'ordre mélangé, 3 champs a/b/c, bouton "Aide" coloré. */
export function EtapeCoefficients({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  aideActivee,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");

  const complet = a.trim() !== "" && b.trim() !== "" && c.trim() !== "";
  const reponse = {
    a: Number(a.replace(",", ".")),
    b: Number(b.replace(",", ".")),
    c: Number(c.replace(",", ".")),
  };
  const statut = complet ? diagnostiquerCoefficients(exercice, reponse) : undefined;
  const erronee = tentativesUtilisees > 0 && statut !== undefined && statut !== "correct";

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatFonctionOrdreLatex(exercice.exercice.enonce, exercice.ordreTermes)} block />
      </div>
      {aideActivee && (
        <div className="template-box">
          <Katex expression={formatFonctionColoreeLatex(exercice.exercice.enonce)} block />
        </div>
      )}
      <p className="prompt-text">Identifie les coefficients a, b et c.</p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="coeff-a">
            a =
          </label>
          <input
            id="coeff-a"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={a}
            onChange={(e) => setA(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="coeff-b">
            b =
          </label>
          <input
            id="coeff-b"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={b}
            onChange={(e) => setB(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="coeff-c">
            c =
          </label>
          <input
            id="coeff-c"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={c}
            onChange={(e) => setC(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      {!validation && (
        <>
        <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
        <button
          type="button"
          className="btn btn-primary"
          disabled={!complet}
          onClick={() => onValider(reponse)}
        >
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
