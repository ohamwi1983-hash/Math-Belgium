import type { ReactNode } from "react";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import { Katex } from "../components/Katex";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { BoutonAide } from "./BoutonAide";
import { CONSIGNE_GENERALE_COMPOSER_FONCTIONS } from "../ui5e/formatComposerFonctions";

interface Props {
  /** Consigne SPÉCIFIQUE à cet écran — rendue APRÈS le bloc "état actuel" (A.9). */
  consigne: string;
  /** Bloc "données" persistant (`DonneesComposerFonctions`, f(x)/g(x)) — rendu juste APRÈS la
   * consigne GÉNÉRALE (`CONSIGNE_GENERALE_COMPOSER_FONCTIONS`, désormais fixe pour cet écran —
   * D.5), jamais avant. */
  donnees: ReactNode;
  prefixApercu: string;
  /** Cible attendue de cet écran (c1 : `dir.interieure.domaine` ; c2 : `dir.domaineApresCarre`,
   * `undefined` si `null` — cas structurellement jamais gagnable, jamais atteint en pratique ;
   * domaine final : `dir.domaine` — voir les 3 sites d'appel dans `App5gen3.tsx`) — pour le
   * highlight rouge (A.2) des points exclus saisis dans `EnsembleReelGuideBuilder`. */
  attendu?: EnsembleReelGuide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  texteAideNiveau1: string;
  latexAideNiveau2: string | null;
  /** Bloc "état actuel" (voir `ui5e/formatComposerFonctions.ts::formatTermesEtatActuelComposerFonctions`)
   * — non vide pour "domFRondG" (f∘g déjà confirmé) et "domGRondF" (f∘g, dom(f∘g), g∘f déjà confirmés). */
  termesEtatActuel?: string[];
  onValider: (reponse: EnsembleReelGuide) => void;
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

/** Écran guidé, réutilisé pour "domFRondG" ET "domGRondF" — même builder que 5gen1
 * (`EnsembleReelGuideBuilder`), seuls consigne/aides diffèrent selon l'appelant. */
export function EtapeDomaineComposerFonctions({ consigne, donnees, prefixApercu, attendu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, texteAideNiveau1, latexAideNiveau2, termesEtatActuel, onValider }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;
  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_COMPOSER_FONCTIONS}</p>
      {donnees}
      {termesEtatActuel !== undefined && <EtatActuelComposerFonctions termes={termesEtatActuel} />}
      <p className="prompt-text">{consigne}</p>
      <EnsembleReelGuideBuilder
        onValider={onValider}
        prefixApercu={prefixApercu}
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
        attendu={attendu}
        apresEchec={montrerErreurs}
      />
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
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
