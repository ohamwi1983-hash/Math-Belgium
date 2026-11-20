import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { CONSIGNE_GENERALE } from "../ui6e/formatDomaineDeriveeExponentielles";
import type { FragmentConsigne } from "../ui6e/formatDomaineDeriveeExponentielles";

import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, tousLisibles, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props extends PropsRetourChamp {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  etatActuel: string[] | null;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE à un seul champ texte libre (`6gen7`) — réutilisé par les 7 écrans à réponse en
 * expression libre (aDerivee, bDerivee, cAssemblage, dAssemblage, eSimplifier, eDerivee, fDerivee).
 * `App6gen7.tsx` doit le rendre avec `key={phase}`. `etatActuel` (non-`null` pour cAssemblage/
 * dAssemblage/eDerivee UNIQUEMENT, voir `ui6e/formatDomaineDeriveeExponentielles.ts::etatActuel`)
 * rappelle les réponses de dérivée CONFIRMÉES d'un écran précédent de la même famille. */
export function EtapeChampDomaineDerivee({ consigneEcran, enonceLatex, etatActuel, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<string>();

  function valider() {
    if (texte.trim() === "") return;
    retour.tenter(texte, tousLisibles(lire, [texte]), onValider);
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
      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <input type="text" className={`text-input ${montrerErreurs && texte === retour.soumise ? "is-erronee" : ""}`} value={texte} placeholder={placeholder} onChange={(e) => setTexte(e.target.value)} />
      </div>
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
