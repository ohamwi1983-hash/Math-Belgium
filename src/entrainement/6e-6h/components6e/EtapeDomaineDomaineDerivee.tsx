import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { CONSIGNE_GENERALE } from "../ui6e/formatDomaineDeriveeExponentielles";
import type { FragmentConsigne } from "../ui6e/formatDomaineDeriveeExponentielles";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { evaluerValeurExponentielle } from "../moteur6e/expressionExponentielle";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props extends PropsRetourChamp<EnsembleReelGuide> {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE "domaine" (`6gen7`) — construction guidée via `EnsembleReelGuideBuilder`
 * (module partagé avec 6gen1/6gen3), réutilisé par les 6 écrans "domaine" (un par famille).
 * `App6gen7.tsx` doit le rendre avec `key={phase}`. `etatActuel` reste toujours `null` ici — le
 * domaine est TOUJOURS le premier écran de sa famille (voir `ui6e/formatDomaineDeriveeExponentielles.ts::etatActuel`)
 * — la prop est acceptée pour uniformité avec les 2 autres écrans génériques du même générateur. */
export function EtapeDomaineDomaineDerivee({ consigneEcran, enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, messageIllisible, cible}: Props) {
  const [reponse, setReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<EnsembleReelGuide>();

  function valider() {
    if (reponse === null) return;
    retour.tenter(reponse, true, onValider);
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
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <EnsembleReelGuideBuilder onChange={setReponse} label="\\text{dom}\\,f=" erronee={montrerErreurs && reponse === retour.soumise} parseurNombre={evaluerValeurExponentielle} />
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={valider}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
