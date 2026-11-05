import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { PhaseModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";
import { consignePhase, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Placeholders spécifiques par phase (`prompt5gen13B3extremumInequationSansPhase2.md`, 1.6) —
 * "poserExtremum"/"isolerTExtremum" illustrent la variable libre "k" ; les autres phases gardent
 * le placeholder générique ci-dessous. */
const PLACEHOLDERS: Partial<Record<PhaseModelisationSinusoide, string>> = {
  // Exemples de FORMAT hors de l'espace des réponses (point 2) : jamais u = π/2 + kπ (réponse de
  // « poserExtremum » à chaque tirage), jamais un A/b entier ni un ω = 2π/T possible.
  amplitude: "ex : 2,5",
  decalage: "ex : 7,5",
  pulsation: "ex : 1,3",
  phi: "ex : 3*pi/5",
  fonctionFinale: "ex : 7*sin(0,4*t-0,9)+2",
  poserExtremum: "ex : 1,2 + k*pi/4",
  isolerTExtremum: "ex : 4,7 + k*2,5",
};

/**
 * Écran à UN SEUL champ texte libre — réutilisé par 7 des 15 phases possibles (amplitude,
 * decalage, pulsation, phi, fonctionFinale, poserExtremum, isolerTExtremum) — toutes
 * structurellement identiques (une consigne, un champ, une aide à 2 niveaux).
 * `App5gen13.tsx` doit le rendre avec `key={phase}` (leçon retenue de tout le chantier 5e).
 */
export function EtapeChampSimpleModelisation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  /** Saisie illisible (parse_error) : signalée sans consommer de tentative (audit 5e ch. 2, point 48). */
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const placeholder = PLACEHOLDERS[phase] ?? "ex : 2,5";

  function valider() {
    if (texte.trim() === "") return;
    const statut = diagnostiquer ? diagnostiquer(texte) : null;
    if (statut === "parse_error") {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    if (statut !== null) setDernierStatut(statut);
    onValider(texte);
  }

  return (
    <div>
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
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, phase)} block />}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        {ecritureIllisible && (
          <p className="alert-error" role="alert">
            Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).
          </p>
        )}
        {montrerErreurs && !ecritureIllisible && (
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
