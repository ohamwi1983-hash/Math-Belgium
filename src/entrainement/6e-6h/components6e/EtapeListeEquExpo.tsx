import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsExponentielles";
import type { FragmentConsigne } from "../ui6e/formatEquationsExponentielles";
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

interface Props extends PropsRetourChamp<string[]> {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  placeholder: string;
  labelAjout: string;
  labelAucune: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE add-as-needed (0 à 2 valeurs numériques) — réutilisé par aEcran2 (A3), cEcran2,
 * cEcran3 — même patron que `EtapeListeSolutionsCyclo.tsx` (6gen3). `App6gen9.tsx` doit le rendre
 * avec `key={phase}`. */
export function EtapeListeEquExpo({ consigneEcran, enonceLatex, aideNiveau1, aideNiveau2, placeholder, labelAjout, labelAucune, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
  const [aucune, setAucune] = useState(false);
  const [lignes, setLignes] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<string[]>();
  const complet = aucune || (lignes.length > 0 && lignes.every((l) => l.trim() !== ""));

  function ajouterLigne() {
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    retour.tenter(aucune ? [] : lignes, aucune || tousLisibles(lire, lignes), onValider);
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
      <button type="button" className={`btn ${aucune ? "toggle-active" : ""} ${montrerErreurs && aucune ? "is-erronee" : ""}`} onClick={() => setAucune((v) => !v)}>
        {labelAucune}
      </button>
      {!aucune && (
        <div className="contenu-conditionnel">
          {lignes.map((ligne, i) => (
            <div key={i} className="field-row">
              <input type="text" className={`text-input ${montrerErreurs && retour.soumise !== null && retour.soumise.join("\u0000") === lignes.join("\u0000") ? "is-erronee" : ""}`} value={ligne} placeholder={placeholder} onChange={(e) => modifierLigne(i, e.target.value)} />
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn" onClick={ajouterLigne}>
            {labelAjout}
          </button>
        </div>
      )}
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
