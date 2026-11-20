import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { FragmentConsigne } from "../ui6e/formatExponentiellesProblemes";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, tousLisibles, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props extends PropsRetourChamp<[string, string]> {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  /** Libellés LaTeX des 2 champs (ex. "f(1)=", "f(3)=") — ORDONNÉS, jamais interchangeables
   * (contrairement à la famille C écran 3, add-as-needed) : chaque champ est étiqueté par son
   * propre temps. */
  labelChamp1: string;
  labelChamp2: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte1: string, texte2: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE à 2 champs numériques FIXES, un par temps demandé — famille G écran 1
 * uniquement (2 valeurs déjà `f(tEval1)`/`f(tEval2)`, jamais une taille variable — pas de pattern
 * add-as-needed ici, contrairement à `EtapeListeExpoProblemes.tsx`). */
export function EtapeDeuxValeursExpoProblemes({ consigneGenerale, blocDonnees, consigneEcran, labelChamp1, labelChamp2, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
  const [texte1, setTexte1] = useState("");
  const [texte2, setTexte2] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<[string, string]>();
  const complet = texte1.trim() !== "" && texte2.trim() !== "";

  function valider() {
    if (!complet) return;
    retour.tenter([texte1, texte2], tousLisibles(lire, [texte1, texte2]), ([a, b]) => onValider(a, b));
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
      <ApercuExpressionLatex texte={texte1} label={labelChamp1} />
      <div className="field-row">
        <p className="field-label field-label-minuscule">
          <Katex expression={labelChamp1} />
        </p>
        <input type="text" className={`text-input ${montrerErreurs && texte1 === retour.soumise?.[0] ? "is-erronee" : ""}`} value={texte1} placeholder="valeur" onChange={(e) => setTexte1(e.target.value)} />
      </div>
      <ApercuExpressionLatex texte={texte2} label={labelChamp2} />
      <div className="field-row">
        <p className="field-label field-label-minuscule">
          <Katex expression={labelChamp2} />
        </p>
        <input type="text" className={`text-input ${montrerErreurs && texte2 === retour.soumise?.[1] ? "is-erronee" : ""}`} value={texte2} placeholder="valeur" onChange={(e) => setTexte2(e.target.value)} />
      </div>
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
