import { useState } from "react";
import type { ExerciceOrthogonaliteParametre } from "../core/orthogonalite.types";
import { diagnostiquerReductionParametre } from "../moteur/verificationOrthogonalite";
import { NIVEAU_AIDE_MAX } from "../moteur/typesOrthogonalite";
import { CONSIGNE_REDUCTION_PARAMETRE_ORTHOGONALITE, LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE, LATEX_VEC_U, LATEX_VEC_V, PLACEHOLDER_EQUATION_REDUITE, RAPPEL_VECTORIEL_ORTHOGONALITE_APRES, RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT, RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE, RAPPEL_VECTORIEL_ORTHOGONALITE_FIN, consigneGlobaleOrthogonalite, formatEnonceLatex, formuleSubstitueeParametreLatex } from "../ui/formatOrthogonalite";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOrthogonaliteParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran "réduction" — variante 2, écran 1. Depuis `promptcorrectionsgenerateur25lot3.md`, point 1
 * (transposition du lot3 du générateur 24) : réécrit pour rejoindre exactement le patron déjà en
 * place pour "réduction du sommet [X]" (V4, `EtapeReductionSommetOrthogonalite.tsx`) — consigne
 * globale persistante, bloc énoncé fixe (déjà présent via l'`equation-box`), aide nettoyée
 * (formulation vectorielle u/v seule, jamais la version générique (a;b)/(c;d) redondante), et un
 * seul champ de saisie libre "Équation" attendant l'équation réduite complète, vérifiée
 * symboliquement (`diagnostiquerReductionParametre`) — remplace les 2 anciens champs séparés
 * (coefficient de x / terme constant).
 *
 * Pas de bloc "État actuel" ici : "réduction" est toujours la première étape de cette variante.
 */
export function EtapeReductionParametreOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX.reductionParametre;

  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerReductionParametre(exercice, texte) : undefined;
  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <p className="prompt-text">{CONSIGNE_REDUCTION_PARAMETRE_ORTHOGONALITE}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="orthogonalite-reductionparametre-equation">
          Équation =
        </label>
        <input
          id="orthogonalite-reductionparametre-equation"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION_REDUITE}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            {RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT} <Katex expression={LATEX_VEC_U} /> {RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE}{" "}
            <Katex expression={LATEX_VEC_V} /> {RAPPEL_VECTORIEL_ORTHOGONALITE_APRES} <Katex expression={LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE} />{" "}
            {RAPPEL_VECTORIEL_ORTHOGONALITE_FIN}
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeParametreLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

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
