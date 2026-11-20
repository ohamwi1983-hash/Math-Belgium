import { useState } from "react";
import type { ReactNode } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { StatutVerificationFormuleSimplifiee } from "../moteur5e/verificationComposerFonctions";
import { CONSIGNE_GENERALE_COMPOSER_FONCTIONS } from "../ui5e/formatComposerFonctions";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { MESSAGES_ILLISIBLE_FONCTIONS, t } from "../ui5e/retoursFonctions1";
import { EnTeteExercice } from "./EnTeteExercice";
import { PiedEcranFonctions } from "./PiedEcranFonctions";

/** Message dédié pour `correct_non_simplifie` (2e palier, `verificationComposerFonctions.ts`) —
 * jamais confondu avec le message générique "Incorrect" (`formatMessageErreur`, `ui/messageErreur.ts`,
 * qui ne connaît que le statut à 3 valeurs partagé par toute la plateforme) : la réponse est
 * mathématiquement juste, il ne manque qu'une simplification, piste concrète sans jamais révéler la
 * forme attendue. */
const MESSAGE_CORRECT_NON_SIMPLIFIE =
  "Ta réponse est correcte, mais pas encore simplifiée au maximum : écris une seule fraction (pas de fraction dans une fraction), développe et regroupe les termes semblables. Cette tentative ne compte pas.";

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
  /** Message ciblé sur la dernière réponse fausse (composition dans l'autre sens…). */
  cible?: (texte: string) => FragmentConsigne[] | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
export function EtapeFormuleComposerFonctions({ consigne, donnees, placeholder, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, texteAideNiveau1, latexAideNiveau2, termesEtatActuel, onValider, diagnostiquer, cible, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerificationFormuleSimplifiee | null>(null);
  const [soumis, setSoumis] = useState<string | null>(null);
  /** Une réponse équivalente mais pas simplifiée ne consomme pas de tentative (décision E) : son
   * message s'affiche donc aussi quand `tentativesUtilisees` vaut encore 0. */
  const montrerErreurs = tentativesUtilisees > 0 || dernierStatut === "correct_non_simplifie";
  /** Recalculé à CHAQUE rendu depuis la saisie actuelle (jamais depuis `dernierStatut`, figé à la
   * dernière soumission) — même convention que le pattern de référence 4e (A.2). */
  const texteErronee = montrerErreurs && diagnostiquer !== undefined && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    const statut = diagnostiquer ? diagnostiquer(texte) : null;
    setDernierStatut(statut);
    // Illisible : message, rien n'est transmis (aucune tentative consommée — audit 5e ch. 1, lot B).
    if (statut === "parse_error") return;
    setSoumis(texte);
    onValider(texte);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE_COMPOSER_FONCTIONS} blocDonnees={donnees} />
      {termesEtatActuel !== undefined && <EtatActuelComposerFonctions termes={termesEtatActuel} />}
      <p className="prompt-text">{consigne}</p>
      <ApercuExpressionLatex texte={texte} />
      <input
        type="text"
        className={`text-input${texteErronee ? " is-erronee" : ""}`}
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value);
          if (dernierStatut === "parse_error") setDernierStatut(null);
        }}
        placeholder={placeholder}
      />
      <PiedEcranFonctions
        aides={[{ texte: [t(texteAideNiveau1)] }, { texte: [t("La substitution, encore à simplifier :")], formules: latexAideNiveau2 ? [latexAideNiveau2] : [] }]}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={texte.trim() === ""}
        illisible={dernierStatut === "parse_error"}
        texteIllisible={MESSAGES_ILLISIBLE_FONCTIONS.expression}
        messageSansTentative={dernierStatut === "correct_non_simplifie" ? MESSAGE_CORRECT_NON_SIMPLIFIE : undefined}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumis && cible ? cible(soumis) : null}
        validation={validation}
      />
    </div>
  );
}
