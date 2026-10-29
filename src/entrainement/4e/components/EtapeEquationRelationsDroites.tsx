import { useState } from "react";
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { NIVEAU_AIDE_MAX_EQUATION } from "../moteur/sessionRelationsDroites";
import type { ReponseEquation } from "../moteur/typesRelationsDroites";
import { diagnostiquerEquationCartesienne, diagnostiquerEquationParametrique } from "../moteur/verificationRelationsDroites";
import type { StatutVerification } from "../moteur/statutVerification";
import { filtrerSaisieNumeriqueFraction, gererKeyDownNumeriqueFraction } from "../ui/bloquerSaisieNonNumerique";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE, PLACEHOLDER_EQUATION, consigneEquation, formatAideEquationNiveau2Latex, formatDonneesRechercheeLatex, formatEnonceLatex, segmentsAideEquationNiveau1 } from "../ui/formatRelationsDroites";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleRelationsDroites } from "./ConsigneGeneraleRelationsDroites";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

/** Signes moins typographiques (« − », « – », « — », clavier mobile ou copier-coller) convertis en
 * « - » dans le champ texte libre — sinon « Expression non reconnue » (audit chapitre 7, point 4). */
const SIGNES_MOINS = /[\u2212\u2013\u2014]/g;

/** Entier, décimal (virgule ou point) ou fraction « p/q » — NaN si illisible (`parse_error`). */
function lire(texte: string): number {
  return parserNombreOuFraction(texte) ?? Number.NaN;
}

interface Props {
  exercice: ExerciceRelationsDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEquation) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 3 (dernier de la famille `construction`) — l'équation de la droite CHERCHÉE d′ (point A
 * de l'énoncé + vecteur confirmé à l'écran 2), dans la forme demandée
 * par `exercice.formeSortie` : champ texte libre pour "cartesienne" (même style qu'"Lecture
 * graphique — équation d'une droite"), 4 champs numériques bloqués pour "parametrique".
 */
export function EtapeEquationRelationsDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const cartesienne = exercice.formeSortie === "cartesienne";

  const [texte, setTexte] = useState("");
  const [x0, setX0] = useState("");
  const [y0, setY0] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const complet = cartesienne ? texte.trim() !== "" : [x0, y0, a, b].every((v) => v.trim() !== "");

  function construireReponse(): ReponseEquation {
    if (cartesienne) return texte;
    return {
      x0: lire(x0),
      y0: lire(y0),
      a: lire(a),
      b: lire(b),
    };
  }

  function diagnostiquer(): StatutVerification {
    return cartesienne
      ? diagnostiquerEquationCartesienne(exercice, construireReponse() as string)
      : diagnostiquerEquationParametrique(exercice, construireReponse() as { x0: number; y0: number; a: number; b: number });
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquer() : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleRelationsDroites exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} block />
            <Katex expression={formatDonneesRechercheeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneEquation(exercice)}</p>

      {cartesienne ? (
        <div className="field field-inline">
          <label className="field-label" htmlFor="relations-droites-equation-texte">
            Équation :
          </label>
          <input
            id="relations-droites-equation-texte"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_EQUATION}
            value={texte}
            onChange={(e) => setTexte(e.target.value.replace(SIGNES_MOINS, "-"))}
          />
        </div>
      ) : (
        <>
          <div className="field-row">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor="relations-droites-equation-x0">
                <Katex expression="x_A=" />
              </label>
              <input
                id="relations-droites-equation-x0"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={x0}
                onChange={(e) => setX0(filtrerSaisieNumeriqueFraction(e.target.value))}
                onKeyDown={gererKeyDownNumeriqueFraction}
              />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor="relations-droites-equation-y0">
                <Katex expression="y_A=" />
              </label>
              <input
                id="relations-droites-equation-y0"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={y0}
                onChange={(e) => setY0(filtrerSaisieNumeriqueFraction(e.target.value))}
                onKeyDown={gererKeyDownNumeriqueFraction}
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor="relations-droites-equation-a">
                <Katex expression="x_{\vec{v}}=" />
              </label>
              <input
                id="relations-droites-equation-a"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_COMPOSANTE}
                value={a}
                onChange={(e) => setA(filtrerSaisieNumeriqueFraction(e.target.value))}
                onKeyDown={gererKeyDownNumeriqueFraction}
              />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor="relations-droites-equation-b">
                <Katex expression="y_{\vec{v}}=" />
              </label>
              <input
                id="relations-droites-equation-b"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_COMPOSANTE}
                value={b}
                onChange={(e) => setB(filtrerSaisieNumeriqueFraction(e.target.value))}
                onKeyDown={gererKeyDownNumeriqueFraction}
              />
            </div>
          </div>
        </>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideEquationNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideEquationNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_EQUATION} onActiverAide={onActiverAide} />

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
