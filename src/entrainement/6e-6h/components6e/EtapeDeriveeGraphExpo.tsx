import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { CONSIGNE_GENERALE } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, tousLisibles, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";

interface Props extends PropsRetourChamp {
  consigneEcran: string;
  fonctionLatex: string;
  rappelDomaine: string | null;
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

/** Écran "derivee" (`6gen8`, familles B/D uniquement) — un seul champ texte libre pour f'(x),
 * vérifié par équivalence NUMÉRIQUE (`moteur6e/equivalenceExponentielle.ts`). `rappelDomaine`
 * (famille D seule, "x≠0") est TOUJOURS affiché, jamais gagné par une aide. `App6gen8.tsx` doit
 * rendre ce composant avec une `key` qui change entre 2 exercices (même si la phase reste
 * "derivee"), sinon le champ garderait la saisie de l'exercice précédent. */
export function EtapeDeriveeGraphExpo({ consigneEcran, fonctionLatex, rappelDomaine, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
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
            <Katex expression={fonctionLatex} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneEcran}</p>
      {rappelDomaine && <p className="prompt-text">{rappelDomaine}</p>}
      <ApercuExpressionLatex texte={texte} label="f'(x) =" />
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
