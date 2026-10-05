import { useState } from "react";
import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { EcranTangente } from "../moteur5e/typesTangentes";
import { consigneGenerale, formatTermesDonneesLatex, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelTangente } from "./EtatActuelTangente";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceTangente;
  phase: EcranTangente;
  labelChamp: string;
  placeholder: string;
  /** Calculatrice affichée UNIQUEMENT sur les champs numériques (substitution) — jamais sur un
   * champ purement symbolique ("y=..."). */
  avecCalculatrice: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran à UN SEUL champ texte libre — réutilisé par "tangente" (variante A, symbolique, sans
 * calculatrice), "trouverQ" et "verifierPente" (variante C, numériques, avec calculatrice). `key`
 * obligatoire côté appelant (React réutiliserait sinon la même instance entre 2 écrans/exercices,
 * gardant la réponse précédente) — même patron que `EtapeChampLibreDerivee.tsx` (5gen26). */
export function EtapeChampUniqueTangente({
  exercice,
  phase,
  labelChamp,
  placeholder,
  avecCalculatrice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide2 = texteAideNiveau2(phase);
  const question = questionSpecifiqueEcran(exercice, phase);

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
      <EtatActuelTangente exercice={exercice} phase={phase} />
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
      {avecCalculatrice && <CalculatriceScientifique />}
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
          <p>{texteAideNiveau1(phase)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
