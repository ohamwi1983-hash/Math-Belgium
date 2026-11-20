import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { FragmentConsigne } from "../ui6e/formatExponentiellesProblemes";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props extends PropsRetourChamp<boolean> {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (oui: boolean) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE "statut oui/non" — famille G écran 3 uniquement (décision atteignable/non
 * atteignable). Choix véritable présenté à l'élève ⟹ boutons `.btn.toggle-active`, JAMAIS
 * `.btn-primary` (réservé à "Valider", convention CLAUDE.md). */
export function EtapeChoixOuiNonExpoProblemes({ consigneGenerale, blocDonnees, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, messageIllisible, cible}: Props) {
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
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </div>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        <button type="button" className={`btn ${choix === true ? "toggle-active" : ""} ${montrerErreurs && choix === true ? "is-erronee" : ""}`} onClick={() => setChoix(true)}>
          Oui
        </button>
        <button type="button" className={`btn ${choix === false ? "toggle-active" : ""} ${montrerErreurs && choix === false ? "is-erronee" : ""}`} onClick={() => setChoix(false)}>
          Non
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
