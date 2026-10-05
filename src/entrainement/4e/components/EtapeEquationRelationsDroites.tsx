import { useState } from "react";
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { NIVEAU_AIDE_MAX_EQUATION } from "../moteur/sessionRelationsDroites";
import type { ReponseEquation } from "../moteur/typesRelationsDroites";
import { diagnostiquerEquationCartesienne, diagnostiquerEquationParametrique } from "../moteur/verificationRelationsDroites";
import type { StatutVerification } from "../moteur/statutVerification";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  PLACEHOLDER_COMPOSANTE,
  PLACEHOLDER_COORDONNEE,
  PLACEHOLDER_EQUATION,
  consigneEquation,
  formatAideEquationNiveau2Latex,
  formatDonneesRechercheeLatex,
  formatEnonceLatex,
  formatEtatActuelVecteurChercheLatex,
  libelleBoutonAide,
  segmentsAideEquationNiveau1,
} from "../ui/formatRelationsDroites";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleRelationsDroites } from "./ConsigneGeneraleRelationsDroites";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceRelationsDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEquation) => void;
}

/**
 * Écran 3 (dernier, toujours atteint — ce générateur n'a structurellement aucun cas "impossible") —
 * l'équation de la droite CHERCHÉE (point + vecteur confirmés à l'écran 2), dans la forme demandée
 * par `exercice.formeSortie` : champ texte libre pour "cartesienne" (même style qu'"Lecture
 * graphique — équation d'une droite"), 4 champs numériques bloqués pour "parametrique".
 */
export function EtapeEquationRelationsDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
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
      x0: Number(x0.replace(",", ".")),
      y0: Number(y0.replace(",", ".")),
      a: Number(a.replace(",", ".")),
      b: Number(b.replace(",", ".")),
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
      <ConsigneGeneraleRelationsDroites exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} block />
        <Katex expression={formatDonneesRechercheeLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={formatEtatActuelVecteurChercheLatex(exercice)} />
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
            onChange={(e) => setTexte(e.target.value)}
          />
        </div>
      ) : (
        <>
          <div className="field-row">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor="relations-droites-equation-x0">
                x₀ =
              </label>
              <input
                id="relations-droites-equation-x0"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={x0}
                onChange={(e) => setX0(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
              />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor="relations-droites-equation-y0">
                y₀ =
              </label>
              <input
                id="relations-droites-equation-y0"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={y0}
                onChange={(e) => setY0(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
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
                onChange={(e) => setA(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
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
                onChange={(e) => setB(filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
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
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_EQUATION} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_EQUATION)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
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
