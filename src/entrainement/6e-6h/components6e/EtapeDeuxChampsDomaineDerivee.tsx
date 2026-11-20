import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { ReponseDeuxChamps } from "../moteur6e/verificationDomaineDeriveeExponentielles";
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

interface Props extends PropsRetourChamp<{ a: string; b: string }> {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  etatActuel: string[] | null;
  labelA: string;
  labelB: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDeuxChamps) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE à 2 champs texte libre (`6gen7`) — réutilisé par les écrans "cFacteurs"
 * (u'(x)/v'(x)) et "dND" (N'(x)/D'(x)), un seul bouton "Valider" commun aux 2 champs (même patron
 * que `EtapeFacteursC.tsx`, `6gen6`). `App6gen7.tsx` doit le rendre avec `key={phase}`. `etatActuel`
 * reste toujours `null` ici — "cFacteurs"/"dND" sont le 2e écran, immédiatement après le domaine (une
 * tâche indépendante, jamais rappelée) — la prop est acceptée pour uniformité avec les 2 autres
 * écrans génériques du même générateur. */
export function EtapeDeuxChampsDomaineDerivee({ consigneEcran, enonceLatex, etatActuel, labelA, labelB, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<{ a: string; b: string }>();

  function valider() {
    if (a.trim() === "" || b.trim() === "") return;
    retour.tenter({ a, b }, tousLisibles(lire, [a, b]), onValider);
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
      <ApercuExpressionLatex texte={a} label={labelA} />
      <ApercuExpressionLatex texte={b} label={labelB} />
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">{labelA}</label>
          <input type="text" className={`text-input ${montrerErreurs && a === retour.soumise?.a ? "is-erronee" : ""}`} value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">{labelB}</label>
          <input type="text" className={`text-input ${montrerErreurs && b === retour.soumise?.b ? "is-erronee" : ""}`} value={b} onChange={(e) => setB(e.target.value)} />
        </div>
      </div>
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={a.trim() === "" || b.trim() === ""} onClick={valider}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
