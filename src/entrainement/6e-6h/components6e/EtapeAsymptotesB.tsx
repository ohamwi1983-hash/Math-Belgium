import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { ReponseAsymptotes } from "../moteur6e/verificationEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE, consigneAsymptotesB } from "../ui6e/formatEtudeFonctionExponentielle";
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

interface Props extends PropsRetourChamp<ReponseAsymptotes> {
  enonceLatex: string;
  p: number;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAsymptotes) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 3/6, "asymptotes" — famille B UNIQUEMENT : l'asymptote verticale x=p est TOUJOURS
 * présente (jamais un toggle "aucune", contrairement aux 3 autres familles), seul le CÔTÉ est à
 * déterminer — piège central de cet écran (spec explicite). Suivi de l'équation de l'asymptote
 * horizontale (texte libre, commune aux deux infinis). `App6gen11.tsx` doit le rendre avec
 * `key={indexExercice}`. Le domaine et les limites confirmés aux 2 écrans précédents sont listés
 * dans le récapitulatif "Ce qu'on sait déjà" (`ui6e/recapitulatifEtudeFonctionExponentielle.ts`). */
export function EtapeAsymptotesB({ enonceLatex, p, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
  const [cote, setCote] = useState<"plus" | "moins" | null>(null);
  const [texteHorizontale, setTexteHorizontale] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<ReponseAsymptotes>();

  const complet = cote !== null && texteHorizontale.trim() !== "";

  function valider() {
    if (!complet || cote === null) return;
    retour.tenter({ type: "b", cote, texteHorizontale }, tousLisibles(lire, [texteHorizontale]), onValider);
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
        <RenduFragments fragments={consigneAsymptotesB(p)} />
      </p>

      <div className="field">
        <p className="field-label field-label-minuscule">
          <Katex expression={`\\text{Côté de l'asymptote verticale } x=${p}`} />
        </p>
        <div className="options-grid-compact">
          <button type="button" className={`btn ${cote === "plus" ? "toggle-active" : ""} ${montrerErreurs && cote === "plus" ? "is-erronee" : ""}`} onClick={() => setCote("plus")}>
            <Katex expression={`x \\to ${p}^+`} />
          </button>
          <button type="button" className={`btn ${cote === "moins" ? "toggle-active" : ""} ${montrerErreurs && cote === "moins" ? "is-erronee" : ""}`} onClick={() => setCote("moins")}>
            <Katex expression={`x \\to ${p}^-`} />
          </button>
        </div>
      </div>

      <ApercuExpressionLatex texte={texteHorizontale} />
      <div className="field">
        <label className="field-label field-label-minuscule">Équation de l'asymptote horizontale</label>
        <input type="text" className={`text-input ${montrerErreurs && retour.soumise?.type === "b" && texteHorizontale === retour.soumise.texteHorizontale ? "is-erronee" : ""}`} value={texteHorizontale} placeholder="ex : y = 3" onChange={(e) => setTexteHorizontale(e.target.value)} />
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
