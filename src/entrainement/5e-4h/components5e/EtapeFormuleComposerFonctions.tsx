import { useState } from "react";
import type { ReactNode } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerificationFormuleSimplifiee } from "../moteur5e/verificationComposerFonctions";
import { CONSIGNE_GENERALE_COMPOSER_FONCTIONS } from "../ui5e/formatComposerFonctions";

/** Message dédié pour `correct_non_simplifie` (2e palier, `verificationComposerFonctions.ts`) —
 * jamais confondu avec le message générique "Incorrect" (`formatMessageErreur`, `ui/messageErreur.ts`,
 * qui ne connaît que le statut à 3 valeurs partagé par toute la plateforme) : la réponse est
 * mathématiquement juste, il ne manque qu'une simplification, piste concrète sans jamais révéler la
 * forme attendue. */
const MESSAGE_CORRECT_NON_SIMPLIFIE = "Ta réponse est mathématiquement correcte, mais elle n'est pas encore simplifiée au maximum — développe/réduis l'expression avant de valider.";

interface Props {
  /** Consigne SPÉCIFIQUE à cet écran (ex. "Écris l'expression de (f∘g)(x)...") — rendue APRÈS le
   * bloc "état actuel" (A.9, ordre standard : consigne générale → données → état actuel → question
   * spécifique), jamais avant. */
  consigne: string;
  /** Bloc "données" persistant (`DonneesComposerFonctions`, f(x)/g(x)) — rendu juste APRÈS la
   * consigne GÉNÉRALE (`CONSIGNE_GENERALE_COMPOSER_FONCTIONS`, désormais fixe pour cet écran —
   * D.5), jamais avant. */
  donnees: ReactNode;
  placeholder: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  texteAideNiveau1: string;
  latexAideNiveau2: string | null;
  /** Bloc "état actuel" (voir `ui5e/formatComposerFonctions.ts::formatTermesEtatActuelComposerFonctions`)
   * — absent/vide pour l'écran "fRondG" (rien encore confirmé), non vide pour "gRondF". */
  termesEtatActuel?: string[];
  onValider: (texte: string) => void;
  /**
   * Statut à 4 valeurs (correct/correct_non_simplifie/not_equivalent/parse_error,
   * `verificationComposerFonctions.ts`) calculé côté PRÉSENTATION uniquement, pour différencier le
   * message affiché après une tentative échouée (promptcorrectionsregroupees.md, A.1 ; 4e valeur —
   * "correct mais pas simplifié" — jamais consommée par `etapeTentatives.ts`/le score, qui reste
   * piloté par le booléen `verifierFormuleDirectionSimplifiee`, où ce cas compte comme incorrect).
   * Optionnel : un appelant qui ne le fournit pas garde le message générique historique.
   */
  diagnostiquer?: (texte: string) => StatutVerificationFormuleSimplifiee;
}

function EtatActuelComposerFonctions({ termes }: { termes: string[] }) {
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Écran à champ de texte libre, réutilisé pour "fRondG" ET "gRondF" (même structure, seuls le
 * texte de consigne/placeholder/aide diffèrent selon l'appelant). */
export function EtapeFormuleComposerFonctions({ consigne, donnees, placeholder, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, texteAideNiveau1, latexAideNiveau2, termesEtatActuel, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerificationFormuleSimplifiee | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  /** Recalculé à CHAQUE rendu depuis la saisie actuelle (jamais depuis `dernierStatut`, figé à la
   * dernière soumission) — même convention que le pattern de référence 4e (A.2). */
  const texteErronee = montrerErreurs && diagnostiquer !== undefined && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  /** `correct_non_simplifie` a son propre message (piste : pas encore simplifiée) — jamais confondu
   * avec le message générique "Incorrect" de `formatMessageErreur`, qui ne connaît que le statut à 3
   * valeurs partagé par toute la plateforme (voir la note d'architecture, `verificationComposerFonctions.ts`). */
  function messageErreurAffiche(): string {
    if (dernierStatut === "correct_non_simplifie") return MESSAGE_CORRECT_NON_SIMPLIFIE;
    return formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_COMPOSER_FONCTIONS}</p>
      {donnees}
      {termesEtatActuel !== undefined && <EtatActuelComposerFonctions termes={termesEtatActuel} />}
      <p className="prompt-text">{consigne}</p>
      <ApercuExpressionLatex texte={texte} />
      <input
        type="text"
        className={`text-input${texteErronee ? " is-erronee" : ""}`}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder={placeholder}
      />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {messageErreurAffiche()}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1}</p>
          {niveauAide >= 2 && latexAideNiveau2 !== null && <Katex expression={latexAideNiveau2} block />}
        </div>
      )}
    </div>
  );
}
