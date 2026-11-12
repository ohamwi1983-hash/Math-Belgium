import { useState } from "react";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { EcranDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";
import { consigneGenerale, formatTermesDonneesLatex, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatDefinitionDerivee";
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
  ecran: Extract<EcranDefinitionDerivee, "quotient" | "limite">;
  labelChamp: string;
  placeholder: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Contrôle de forme AVANT validation (quotient simplifié) : renvoie un message, et la saisie
   * n'est alors PAS soumise — aucune tentative consommée. */
  controlerForme?: (texte: string) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran à UN SEUL champ texte libre, réutilisé par "quotient" et "limite" — même patron que
 * `EtapeChampLibreAsymptote.tsx` (5gen21). `key` obligatoire côté appelant (React réutiliserait
 * sinon la même instance entre 2 écrans, gardant la réponse précédente). Jamais de calculatrice :
 * générateur purement symbolique/exact.
 *
 * Question spécifique rendue en 3 morceaux (`texteAvant`/`latex`/`texteApres`,
 * `questionSpecifiqueEcran`) — le fragment central passe par `<Katex>` (fraction/limite empilée,
 * jamais un texte plat avec crochets). */
export function EtapeChampLibreDerivee({ exercice, ecran, labelChamp, placeholder, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, controlerForme, validation }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  /** Message affiché sans consommer de tentative : saisie illisible, ou forme non simplifiée. */
  const [messageAvantValidation, setMessageAvantValidation] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide2 = texteAideNiveau2(exercice, ecran);
  const question = questionSpecifiqueEcran(exercice, ecran);

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) {
      const statut = diagnostiquer(texte);
      if (statut === "parse_error") {
        setMessageAvantValidation(formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error"));
        return;
      }
      setDernierStatut(statut);
    }
    const message = controlerForme ? controlerForme(texte) : null;
    if (message) {
      setMessageAvantValidation(message);
      return;
    }
    setMessageAvantValidation(null);
    onValider(texte);
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
      <p className="prompt-text">
        {question.texteAvant} {question.latex && <Katex expression={question.latex} />} {question.texteApres}
      </p>
      {/* L'aperçu affiche son libellé en texte brut : on ne lui passe jamais un libellé LaTeX
          (« \dfrac{…} » visible, écran du taux d'accroissement). */}
      <ApercuExpressionLatex texte={texte} label={labelChamp.includes("\\") ? undefined : labelChamp} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelChamp} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value);
            setMessageAvantValidation(null);
          }}
          placeholder={placeholder}
        />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {(() => {
            const aide1 = texteAideNiveau1(exercice, ecran);
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
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
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
