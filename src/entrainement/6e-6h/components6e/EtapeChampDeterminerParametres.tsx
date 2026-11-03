import { useId, useState } from "react";
import type { ReactNode } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, FragmentConsigne } from "../ui6e/formatDeterminerParametresLogarithme";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Graphique de l'exercice (toujours visible, bloc de données). */
  figure: ReactNode;
  /** Ce que montre le graphique, en une phrase (sous la figure). */
  descriptionFigure: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  /** Libellé du champ (ex. « a = », « Équation : », « f(x) = »). */
  libelleChamp: string;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer: (texte: string) => StatutVerification;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran à un champ libre de `6gen18` (valeur de a, équation en b, expression de f). Structure :
 * consigne générale → graphique (bloc de données) → consigne de l'écran → champ. Le champ n'est
 * rouge que tant qu'il contient encore la saisie refusée (jamais pendant une nouvelle frappe), et le
 * message distingue une erreur de syntaxe d'une réponse fausse. `App6gen18.tsx` le rend avec une
 * `key` qui change à chaque exercice et à chaque écran.
 */
export function EtapeChampDeterminerParametres({
  consigneGenerale,
  figure,
  descriptionFigure,
  consigneEcran,
  libelleChamp,
  placeholder,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation,
}: Props) {
  const idChamp = useId();
  const [texte, setTexte] = useState("");
  const [soumis, setSoumis] = useState<string | null>(null);
  const montrerErreurs = (tentativesUtilisees > 0 || Boolean(validation?.revele)) && soumis !== null;
  const statut = montrerErreurs ? diagnostiquer(soumis as string) : null;

  function valider() {
    if (texte.trim() === "") return;
    setSoumis(texte);
    onValider(texte);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            {figure}
            <p className="prompt-text">
              <RenduFragments fragments={descriptionFigure} />
            </p>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <ApercuExpressionLatex texte={texte} label={libelleChamp} />
      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor={idChamp}>
          {libelleChamp}
        </label>
        <input
            id={idChamp}
            type="text"
            className={`text-input ${montrerErreurs && texte === soumis ? "is-erronee" : ""}`}
            value={texte}
            placeholder={placeholder}
            disabled={Boolean(validation)}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !validation) valider();
            }}
          />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
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
          {montrerErreurs && (
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
