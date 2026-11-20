import { useState } from "react";
import type { ReactNode } from "react";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import { Katex } from "../components/Katex";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CONSIGNE_GENERALE_COMPOSER_FONCTIONS } from "../ui5e/formatComposerFonctions";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { t } from "../ui5e/retoursFonctions1";
import { MessageRetour } from "../../4e/components/RetourSaisie";
import { AidesTrig } from "./RetourSaisieTrig";
import { EnTeteExercice } from "./EnTeteExercice";

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
  validation?: ValidationEtapeProps | null;
  /** Message ciblé sur le dernier ensemble faux (condition 2 oubliée, crochet…). */
  cible?: (saisi: EnsembleReelGuide) => FragmentConsigne[] | null;
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
export function EtapeDomaineComposerFonctions({ consigne, donnees, prefixApercu, attendu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, texteAideNiveau1, latexAideNiveau2, termesEtatActuel, onValider, validation, cible }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;
  const [soumis, setSoumis] = useState<EnsembleReelGuide | null>(null);
  return (
    <div>
      <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE_COMPOSER_FONCTIONS} blocDonnees={donnees} />
      {termesEtatActuel !== undefined && <EtatActuelComposerFonctions termes={termesEtatActuel} />}
      <p className="prompt-text">{consigne}</p>
      <EnsembleReelGuideBuilder
        onValider={(e) => {
          setSoumis(e);
          onValider(e);
        }}
        prefixApercu={prefixApercu}
        avecVide
        contenuAvantValider={
          <>
            <AidesTrig niveauAide={niveauAide} aides={[{ texte: [t(texteAideNiveau1)] }, { texte: [t("Ici :")], formules: latexAideNiveau2 ? [latexAideNiveau2] : [] }]} />
            <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          </>
        }
        attendu={attendu}
        apresEchec={montrerErreurs}
        validation={validation}
      />
      {!validation && montrerErreurs && <MessageRetour illisible={false} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={soumis && cible ? cible(soumis) : null} />}
    </div>
  );
}
