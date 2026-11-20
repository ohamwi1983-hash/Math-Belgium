import { useState } from "react";
import { Katex } from "../components/Katex";
import type { ReponseFacteursC, ReponseLimite } from "../moteur6e/verificationLimitesExponentielles";
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

type OptionCategorielle = "plus_infini" | "moins_infini" | "zero";
const OPTIONS: OptionCategorielle[] = ["plus_infini", "moins_infini", "zero"];
const LABELS: Record<OptionCategorielle, string> = { plus_infini: "+\\infty", moins_infini: "-\\infty", zero: "0" };

interface Props extends PropsRetourChamp<ReponseFacteursC> {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFacteursC) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Les deux facteurs (ou numérateur et dénominateur), en LaTeX, tels qu'écrits dans l'énoncé. */
  labelsFacteurs: [string, string];
}

function GroupeBoutons({ label, valeur, erreur, onChange }: { label: string; valeur: OptionCategorielle | null; erreur: boolean; onChange: (v: OptionCategorielle) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">
        <Katex expression={`${label}\\to`} />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((option) => (
          <button key={option} type="button" className={`btn ${valeur === option ? "toggle-active" : ""} ${erreur && valeur === option ? "is-erronee" : ""}`} onClick={() => onChange(option)}>
            <Katex expression={LABELS[option]} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Écran "cFacteurs" (`6gen6`, famille C) — 2 sous-réponses catégorielles indépendantes (limite de
 * chaque facteur), combinées derrière UN SEUL bouton "Valider" (spec : "Champ : 2 valeurs").
 * `App6gen6.tsx` doit le rendre avec `key={phase}`. */
export function EtapeFacteursC({ consigneEcran, enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, messageIllisible, cible, labelsFacteurs}: Props) {
  const [facteur1, setFacteur1] = useState<OptionCategorielle | null>(null);
  const [facteur2, setFacteur2] = useState<OptionCategorielle | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<ReponseFacteursC>();

  function valider() {
    if (facteur1 === null || facteur2 === null) return;
    const r1: ReponseLimite = { type: facteur1 };
    const r2: ReponseLimite = { type: facteur2 };
    retour.tenter({ facteur1: r1, facteur2: r2 }, true, onValider);
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
      <GroupeBoutons label={labelsFacteurs[0]} valeur={facteur1} erreur={montrerErreurs && retour.soumise !== null} onChange={setFacteur1} />
      <GroupeBoutons label={labelsFacteurs[1]} valeur={facteur2} erreur={montrerErreurs && retour.soumise !== null} onChange={setFacteur2} />
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={facteur1 === null || facteur2 === null} onClick={valider}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
