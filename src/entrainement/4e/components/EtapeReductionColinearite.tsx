import { useState } from "react";
import type { ExerciceColinearParametre } from "../core/colinearite.types";
import { diagnostiquerReductionAvecX } from "../moteur/verificationColinearite";
import { NIVEAU_AIDE_MAX_REDUCTION } from "../moteur/sessionColinearite";
import {
  CONSIGNE_REDUCTION_AVEC_X,
  LATEX_FORMULE_COLINEARITE_VECTORIELLE,
  LATEX_VEC_U,
  LATEX_VEC_V,
  PLACEHOLDER_EQUATION_REDUITE,
  RAPPEL_VECTORIEL_COLINEARITE_APRES,
  RAPPEL_VECTORIEL_COLINEARITE_AVANT,
  RAPPEL_VECTORIEL_COLINEARITE_ENTRE,
  RAPPEL_VECTORIEL_COLINEARITE_FIN,
  consigneGlobaleColinearite,
  formatEnonceLatex,
  formuleSubstitueeReductionLatex,
  libelleBoutonAide,
} from "../ui/formatColinearite";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceColinearParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran "reduction" — V2-écran1 (variante "parametre") UNIQUEMENT. Depuis
 * `promptcorrectionsgenerateur24lot3.md`, point 2 : réécrit pour rejoindre exactement le patron déjà
 * en place pour "reductionAvecX" (V4, `EtapeReductionAvecXColinearite.tsx`) — consigne globale
 * persistante, bloc énoncé fixe (déjà présent via l'`equation-box`), aide nettoyée (formulation
 * vectorielle u/v seule, jamais la version générique (a;b)/(c;d) redondante), et surtout un seul
 * champ de saisie libre "Équation" attendant l'équation réduite complète, vérifiée symboliquement
 * (`diagnostiquerReductionAvecX`, réutilisée telle quelle — cette variante garantit désormais elle
 * aussi `typeSolution="unique"`, voir `generateurs/colinearite/index.ts`) — remplace les 2 anciens
 * champs séparés (coefficient de x / terme constant).
 *
 * Pas de bloc "État actuel" ici : "reduction" est toujours la première étape de cette variante, rien
 * n'a encore été confirmé (contrairement à "reductionAvecX", qui suit "constructionAvecX").
 */
export function EtapeReductionColinearite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerReductionAvecX(exercice, texte) : undefined;
  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <p className="prompt-text">{CONSIGNE_REDUCTION_AVEC_X}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-reduction-equation">
          Équation =
        </label>
        <input
          id="colinearite-reduction-equation"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION_REDUITE}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            {RAPPEL_VECTORIEL_COLINEARITE_AVANT} <Katex expression={LATEX_VEC_U} /> {RAPPEL_VECTORIEL_COLINEARITE_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
            {RAPPEL_VECTORIEL_COLINEARITE_APRES} <Katex expression={LATEX_FORMULE_COLINEARITE_VECTORIELLE} /> {RAPPEL_VECTORIEL_COLINEARITE_FIN}
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeReductionLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_REDUCTION} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_REDUCTION)}
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
