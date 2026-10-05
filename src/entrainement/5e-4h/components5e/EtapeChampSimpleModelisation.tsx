import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { PhaseModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";
import { consignePhase, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  phase: PhaseModelisationSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /**
   * Statut à 3 valeurs (correct/not_equivalent/parse_error) calculé côté PRÉSENTATION uniquement,
   * pour différencier le message affiché après une tentative échouée (même motif que 5gen2, A.1) —
   * jamais consommé par `etapeTentatives.ts`/le score, qui reste piloté par le booléen historique
   * `onValider` déclenche côté moteur. Optionnel : un appelant qui ne le fournit pas garde le
   * message générique historique.
   */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Placeholders spécifiques par phase (`prompt5gen13B3extremumInequationSansPhase2.md`, 1.6) —
 * "poserExtremum"/"isolerTExtremum" illustrent la variable libre "k" ; les autres phases gardent
 * le placeholder générique ci-dessous. */
const PLACEHOLDERS: Partial<Record<PhaseModelisationSinusoide, string>> = {
  fonctionFinale: "ex : 5*sin(0.3*t+1.2)+4",
  poserExtremum: "ex : pi/2 + k*pi",
  isolerTExtremum: "ex : (pi/2-0.7)/0.3 + k*3.14",
};

/**
 * Écran à UN SEUL champ texte libre — réutilisé par 7 des 15 phases possibles (amplitude,
 * decalage, pulsation, phi, fonctionFinale, poserExtremum, isolerTExtremum) — toutes
 * structurellement identiques (une consigne, un champ, une aide à 2 niveaux).
 * `App5gen13.tsx` doit le rendre avec `key={phase}` (leçon retenue de tout le chantier 5e).
 */
export function EtapeChampSimpleModelisation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const placeholder = PLACEHOLDERS[phase] ?? "ex : 3, pi/4, sqrt(2)...";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      <ApercuExpressionLatex texte={texte} label={labelPhase(phase)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelPhase(phase)}</label>
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
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, phase)} block />}
        </div>
      )}
    </div>
  );
}
