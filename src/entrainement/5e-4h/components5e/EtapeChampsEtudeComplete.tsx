import { useState } from "react";
import type { ExerciceEtudeComplete } from "../core5e/etudeComplete.types";
import type { PhaseEtudeComplete } from "../moteur5e/typesEtudeComplete";
import { CONSIGNE_GENERALE_CONSTRUCTION_INVERSE, CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, formatProprietesConstructionInverseTexte, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EtatActuelEtudeComplete } from "./EtatActuelEtudeComplete";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";

interface Props {
  exercice: ExerciceEtudeComplete;
  phase: PhaseEtudeComplete;
  labels: string[];
  placeholders: string[];
  /** Si vrai, chaque `label` est un fragment LaTeX rendu en mode DISPLAY (`<Katex block />`) —
   * réutilise le même composant d'affichage déjà correct ailleurs (bloc état actuel/aides) sur les
   * labels interactifs de type "lim x→... f(x)=" (jamais du texte plat, transversal). */
  labelsLatex?: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer?: (valeurs: string[]) => StatutVerification[];
}

/** Écran générique à N champs texte libres (1 ou 2) — réutilisé par les écrans "point vide"
 * (1 champ), "AH"/"AO" (1 champ), "casSpecial" (2 champs), "constructionInverse" (1 champ).
 * Calculatrice TOUJOURS présente (contextes réalistes, arithmétique non triviale), sauf sur l'écran
 * "domaine"/"classification" (purement symbolique, gérés par `EtapeListeNombresEtudeComplete`). */
export function EtapeChampsEtudeComplete({ exercice, phase, labels, placeholders, labelsLatex, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(labels.map(() => ""));
  const [dernierStatuts, setDernierStatuts] = useState<StatutVerification[] | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer(valeurs) : null;

  function modifier(i: number, v: string) {
    setValeurs((arr) => arr.map((x, j) => (j === i ? v : x)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatuts(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  const estBonus = exercice.mode === "constructionInverse";
  const pipeline = estBonus ? null : (exercice as ExerciceEtudeCompletePipeline);
  const pireStatut = correction?.find((s) => s !== "correct") ?? null;

  return (
    <div>
      <p className="prompt-text">{estBonus ? CONSIGNE_GENERALE_CONSTRUCTION_INVERSE : CONSIGNE_GENERALE_ETUDE_COMPLETE}</p>
      {pipeline && <BlocDonneesEtudeComplete exercice={pipeline} />}
      {pipeline && <EtatActuelEtudeComplete exercice={exercice} phase={phase} />}
      {exercice.mode === "constructionInverse" && (
        <div className="equation-box equation-box-donnees">
          {formatProprietesConstructionInverseTexte(exercice.proprietes).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {labels.map((label, i) => (
        <div key={i} className="field-row">
          {label && labelsLatex && (
            <span className="field-label field-label-minuscule">
              <Katex expression={label} block />
            </span>
          )}
          {label && !labelsLatex && <p className="field-label field-label-minuscule ce-slot-latex">{label}</p>}
          <input
            type="text"
            className={`text-input${correction && correction[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i]}
          />
        </div>
      ))}
      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, pireStatut ?? dernierStatuts?.find((s) => s !== "correct") ?? "not_equivalent")}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, phase)} block />}
        </div>
      )}
    </div>
  );
}
