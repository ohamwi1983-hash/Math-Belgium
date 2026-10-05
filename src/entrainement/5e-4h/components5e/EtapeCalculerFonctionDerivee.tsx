import { useState } from "react";
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelFonctionDerivee } from "./EtatActuelFonctionDerivee";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceFonctionDerivee;
  typeRetenu: TypeDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran "calculer" — champ unique f'(x), mêmes idiomes que `EtapeChampLibreDerivee.tsx`
 * (5gen26) mais réécrit localement : le type `ExerciceDefinitionDerivee`/`PhaseDefinitionDerivee`
 * de ce composant est propre à 5gen26, jamais élargi pour un autre générateur. Jamais de
 * calculatrice : générateur purement symbolique/exact. */
export function EtapeCalculerFonctionDerivee({ exercice, typeRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide2 = texteAideNiveau2("calculer", typeRetenu);

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <p className="prompt-text">
        Objectif : calculer <Katex expression={questionFinale()} />.
      </p>
      <EtatActuelFonctionDerivee exercice={exercice} ecran="calculer" typeRetenu={typeRetenu} />
      <p className="prompt-text">{consigneEcran("calculer", typeRetenu)}</p>
      <ApercuExpressionLatex texte={texte} label="f'(x)=" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="f'(x)=" />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : 2*x+cos(x)"
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
          <p>{texteAideNiveau1("calculer", typeRetenu)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
