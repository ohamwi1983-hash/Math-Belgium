import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsExponentielles";
import type { FragmentConsigne } from "../ui6e/formatEquationsExponentielles";
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

interface Props extends PropsRetourChamp<boolean> {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (existeUneSolution: boolean) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran unique de la famille D — pure reconnaissance, AUCUN champ numérique (la réponse correcte
 * est toujours "∅", jamais une valeur à calculer). `App6gen9.tsx` doit le rendre avec `key={phase}`. */
export function EtapeReconnaitreImpossibleEquExpo({ consigneEcran, enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, messageIllisible, cible}: Props) {
  const [choix, setChoix] = useState<boolean | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<boolean>();

  function valider() {
    if (choix === null) return;
    retour.tenter(choix, true, onValider);
  }

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
        <button type="button" className={`btn ${choix === false ? "toggle-active" : ""} ${montrerErreurs && choix === false ? "is-erronee" : ""}`} onClick={() => setChoix(false)}>
          Oui : aucune solution, sans calcul
        </button>
        <button type="button" className={`btn ${choix === true ? "toggle-active" : ""} ${montrerErreurs && choix === true ? "is-erronee" : ""}`} onClick={() => setChoix(true)}>
          Non : il faut résoudre pour conclure
        </button>
      </div>

      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
          Valider
        </button>

        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}

    </div>
  );
}
