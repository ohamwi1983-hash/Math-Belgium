import { useState } from "react";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { EcranDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";
import { consigneGenerale, formatTermesDonneesLatex, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatDefinitionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelDefinitionDerivee } from "./EtatActuelDefinitionDerivee";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

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
}

/** Écran à UN SEUL champ texte libre, réutilisé par "quotient" et "limite" — même patron que
 * `EtapeChampLibreAsymptote.tsx` (5gen21). `key` obligatoire côté appelant (React réutiliserait
 * sinon la même instance entre 2 écrans, gardant la réponse précédente). Jamais de calculatrice :
 * générateur purement symbolique/exact.
 *
 * Question spécifique rendue en 3 morceaux (`texteAvant`/`latex`/`texteApres`,
 * `questionSpecifiqueEcran`) — le fragment central passe par `<Katex>` (fraction/limite empilée,
 * jamais un texte plat avec crochets). */
export function EtapeChampLibreDerivee({ exercice, ecran, labelChamp, placeholder, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide2 = texteAideNiveau2(exercice, ecran);
  const question = questionSpecifiqueEcran(exercice, ecran);

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelDefinitionDerivee exercice={exercice} ecran={ecran} />
      <p className="prompt-text">
        {question.texteAvant} {question.latex && <Katex expression={question.latex} />} {question.texteApres}
      </p>
      <ApercuExpressionLatex texte={texte} label={labelChamp} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelChamp} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, ecran)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
