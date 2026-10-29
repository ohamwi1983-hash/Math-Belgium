import { useState } from "react";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import { NIVEAU_AIDE_MAX_COEFFICIENTS } from "../moteur/sessionEquationDroite";
import {
  diagnostiquerExpliciteX,
  diagnostiquerExpliciteY,
  diagnostiquerImplicite,
  diagnostiquerParametrique,
} from "../moteur/verificationEquationDroite";
import type { ReponseCoefficients } from "../moteur/typesEquationDroite";
import { filtrerSaisieNumeriqueFraction, gererKeyDownNumeriqueFraction } from "../ui/bloquerSaisieNonNumerique";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { LATEX_GABARIT_FORME, consigneCoefficients, formatAideCoefficientsNiveau2Latex, formatEnonceLatex } from "../ui/formatEquationDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCoefficients) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Exemples hors de l'espace des tirages (vecteur (7 ; −9), jamais colinéaire à un vecteur tiré
 * — composantes ≤ 5) : un placeholder ne doit jamais pouvoir être la réponse (audit chapitre 7,
 * point 10). */
const PLACEHOLDER_TEXTE_X = "ex : x=1,5+t×7";
const PLACEHOLDER_TEXTE_Y = "ex : y=-0,5-t×9";

/**
 * Écran 3 (dernière phase, atteinte ssi `exercice.possible`) — le nombre et le nom des champs
 * dépendent de `exercice.formeCible` : 2 champs de TEXTE LIBRE (paramétrique — expression complète
 * "x=x0+a*t"/"y=y0+b*t", `promptgen42modifications.md` point 2, jamais 4 champs numériques
 * séparés), 3 champs numériques (implicite), 2 champs numériques (explicite Y/X, inchangés).
 * Vérifiée par proportionnalité (paramétrique — extraction textuelle puis même critère que la
 * saisie numérique/implicite) ou égalité exacte (explicite) — voir `verificationEquationDroite.ts`,
 * jamais recalculée ici.
 */
export function EtapeCoefficientsEquationDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const [champ1, setChamp1] = useState("");
  const [champ2, setChamp2] = useState("");
  const [champ3, setChamp3] = useState("");

  const forme = exercice.formeCible;
  const estParametrique = forme === "parametrique";
  const nombreChampsNumeriques = forme === "implicite" ? 3 : forme === "explicite_y" || forme === "explicite_x" ? 2 : 0;
  const champsNumeriques = [champ1, champ2, champ3].slice(0, nombreChampsNumeriques);
  const complet = estParametrique ? texteX.trim() !== "" && texteY.trim() !== "" : champsNumeriques.every((v) => v.trim() !== "");

  /** Fraction « p/q » acceptée (tout triplet proportionnel est juste, ex. a = 1, b = −1/2). */
  function nombre(texte: string): number {
    return parserNombreOuFraction(texte) ?? Number.NaN;
  }

  function construireReponse(): ReponseCoefficients {
    if (estParametrique) return { texteX, texteY };
    if (forme === "implicite") return { a: nombre(champ1), b: nombre(champ2), c: nombre(champ3) };
    if (forme === "explicite_y") return { m: nombre(champ1), p: nombre(champ2) };
    return { n: nombre(champ1), q: nombre(champ2) };
  }

  function diagnostiquer(): StatutVerification {
    const reponse = construireReponse();
    if (estParametrique) return diagnostiquerParametrique(exercice, reponse as { texteX: string; texteY: string });
    if (forme === "implicite") return diagnostiquerImplicite(exercice, reponse as { a: number; b: number; c: number });
    if (forme === "explicite_y") return diagnostiquerExpliciteY(exercice, reponse as { m: number; p: number });
    return diagnostiquerExpliciteX(exercice, reponse as { n: number; q: number });
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquer() : undefined;
  const erronee = apresEchec && statut !== "correct";

  const labelsNumeriques: [string, string, string?] = forme === "implicite" ? ["a =", "b =", "c ="] : forme === "explicite_y" ? ["m =", "p ="] : ["n =", "q ="];
  const settersNumeriques = [setChamp1, setChamp2, setChamp3];
  const valeursNumeriques = [champ1, champ2, champ3];

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleEquationDroite exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{consigneCoefficients(exercice)}</p>

      {estParametrique ? (
        <>
          <div className="field">
            <label className="field-label field-label-minuscule" htmlFor="equation-droite-coefficients-texte-x">
              Équation en <Katex expression="x" /> (<Katex expression="t" /> est le paramètre)
            </label>
            <input
              id="equation-droite-coefficients-texte-x"
              className={`text-input${erronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_TEXTE_X}
              value={texteX}
              onChange={(e) => setTexteX(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label field-label-minuscule" htmlFor="equation-droite-coefficients-texte-y">
              Équation en <Katex expression="y" /> (<Katex expression="t" /> est le paramètre)
            </label>
            <input
              id="equation-droite-coefficients-texte-y"
              className={`text-input${erronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_TEXTE_Y}
              value={texteY}
              onChange={(e) => setTexteY(e.target.value)}
            />
          </div>
        </>
      ) : (
        labelsNumeriques.slice(0, nombreChampsNumeriques).map((label, index) => (
          <div className="field field-inline" key={label}>
            <label className="field-label field-label-minuscule" htmlFor={`equation-droite-coefficients-${index}`}>
              {label}
            </label>
            <input
              id={`equation-droite-coefficients-${index}`}
              className={`text-input${erronee ? " is-erronee" : ""}`}
              placeholder="ex : 1,5"
              value={valeursNumeriques[index]}
              onChange={(e) => settersNumeriques[index](filtrerSaisieNumeriqueFraction(e.target.value))}
              onKeyDown={gererKeyDownNumeriqueFraction}
            />
          </div>
        ))
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={LATEX_GABARIT_FORME[forme]} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideCoefficientsNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_COEFFICIENTS} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
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
