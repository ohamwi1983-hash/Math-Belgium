import { useState } from "react";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { ReponseDevelopper } from "../moteur5e/sessionDefinitionDerivee";
import { consigneGenerale, formatTermesDonneesLatex, labelFA, labelFAH, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatDefinitionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDefinitionDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDevelopper) => void;
  diagnostiquer?: (reponse: ReponseDevelopper) => { fA: StatutVerification; fAH: StatutVerification };
  /** Contrôle de forme AVANT validation (f(a+h) développé) : renvoie un message, et la saisie
   * n'est alors PAS soumise — aucune tentative consommée. */
  controlerForme?: (reponse: ReponseDevelopper) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "developper" — 2 champs (f(a) numérique, f(a+h) symbolique en h), vérifiés
 * INDÉPENDAMMENT pour l'affichage mais notés comme UNE SEULE tentative combinée (1 bouton
 * Valider) — même patron que `EtapeDiviserEuclidienne.tsx` (5gen21). Jamais de calculatrice :
 * générateur purement symbolique/exact. */
export function EtapeDevelopperDerivee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, controlerForme, validation }: Props) {
  const [fA, setFA] = useState("");
  const [fAH, setFAH] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  /** Message affiché sans consommer de tentative : saisie illisible, ou forme non développée. */
  const [messageAvantValidation, setMessageAvantValidation] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fA.trim() !== "" && fAH.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ fA, fAH }) : null;
  const aide2 = texteAideNiveau2(exercice, "developper");
  const question = questionSpecifiqueEcran(exercice, "developper");
  const a = exercice.a;

  function valider() {
    if (!complet) return;
    const reponse: ReponseDevelopper = { fA, fAH };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      if (s.fA === "parse_error" || s.fAH === "parse_error") {
        setMessageAvantValidation(formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error"));
        return;
      }
      setDernierStatut(s.fA !== "correct" ? s.fA : s.fAH);
    }
    const message = controlerForme ? controlerForme(reponse) : null;
    if (message) {
      setMessageAvantValidation(message);
      return;
    }
    setMessageAvantValidation(null);
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{question.texteAvant}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFA(a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fA !== "correct" ? " is-erronee" : ""}`}
          value={fA}
          onChange={(e) => {
            setFA(e.target.value);
            setMessageAvantValidation(null);
          }}
          placeholder="ex : −0,2"
        />
      </div>
      <ApercuExpressionLatex texte={fAH} label={labelFAH(a)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFAH(a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fAH !== "correct" ? " is-erronee" : ""}`}
          value={fAH}
          onChange={(e) => {
            setFAH(e.target.value);
            setMessageAvantValidation(null);
          }}
          placeholder="ex : 0,5h² + 3h − 1"
        />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {(() => {
            const aide1 = texteAideNiveau1(exercice, "developper");
            return (
              <>
                <p>{aide1.texte}</p>
                {aide1.latex && <Katex expression={aide1.latex} block />}
              </>
            );
          })()}
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              {aide2.latex && <Katex expression={aide2.latex} block />}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {messageAvantValidation && (
          <p className="alert-error" role="alert">
            {messageAvantValidation}
          </p>
        )}
        {montrerErreurs && !messageAvantValidation && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
