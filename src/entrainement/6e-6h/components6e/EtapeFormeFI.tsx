import { useState } from "react";
import type { CategorieFI } from "../core6e/limitesExponentielles.types";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { CONSIGNE_GENERALE } from "../ui6e/formatLimitesExponentielles";
import type { FragmentConsigne } from "../ui6e/formatLimitesExponentielles";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props extends PropsRetourChamp<CategorieFI> {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: CategorieFI) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const OPTIONS: { id: CategorieFI; label: string }[] = [
  { id: "zero_sur_zero", label: "0/0" },
  { id: "infini_sur_infini", label: "∞/∞" },
  { id: "pas_une_fi", label: "Pas une FI" },
];

/** Écran de diagnostic AVANT toute dérivation, partagé par les familles L'Hôpital (H/I/J/K,
 * `6gen6`) — classer la forme (0/0, ∞/∞, ou aucune FI) avant d'appliquer la règle, pour éviter le
 * piège classique "appliquer L'Hôpital sans vérifier la forme". `App6gen6.tsx` doit le rendre avec
 * `key={phase}`. */
export function EtapeFormeFI({ consigneEcran, enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, messageIllisible, cible}: Props) {
  const [choix, setChoix] = useState<CategorieFI | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<CategorieFI>();

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={enonceLatex} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`btn ${choix === o.id ? "toggle-active" : ""} ${montrerErreurs && choix === o.id ? "is-erronee" : ""}`}
            onClick={() => setChoix(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && retour.tenter(choix, true, onValider)}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
