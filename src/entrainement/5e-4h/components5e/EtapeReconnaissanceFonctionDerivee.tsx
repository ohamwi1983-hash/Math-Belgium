import { useState } from "react";
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, LIBELLE_TYPE_FRAGMENTS, OPTIONS_RECONNAISSANCE, questionFinale } from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import { RenduFragments } from "../../4e/components/RenduFragments";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../../4e/ui/choixFige";

interface Props {
  exercice: ExerciceFonctionDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: TypeDerivee) => void;
  aides: AideTrig[];
  /** Présent une fois l'écran terminé : options figées et jugées (✗ / ✓). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "reconnaissance" — choix fermé, UNE tentative (lot B) : une fois jugé, l'option choisie
 * fausse est rouge ✗ et la bonne verte ✓ (`4e/ui/choixFige.ts`) ; libellés « u·v », « u/v » en
 * KaTeX. L'item ambigu accepte deux réponses (`typesAcceptes`). */
export function EtapeReconnaissanceFonctionDerivee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, aides, validation }: Props) {
  const [choix, setChoix] = useState<TypeDerivee | null>(null);
  const juge = !!validation && choix !== null;
  const bonne = choix !== null && exercice.typesAcceptes.includes(choix) ? choix : exercice.typesAcceptes[0];
  const etat = { selection: choix, choisie: juge ? choix : null, bonne };

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale()}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">
        Objectif : calculer <Katex expression={questionFinale()} />.
      </p>
      <p className="prompt-text">{consigneEcran("reconnaissance", null)}</p>
      <div className="options-grid">
        {OPTIONS_RECONNAISSANCE.map((option) => (
          <button
            key={option.type}
            type="button"
            className={classeOptionChoixFerme(option.type, etat)}
            aria-pressed={choix === option.type}
            aria-label={ariaOptionChoixFerme(option.type, etat)}
            disabled={!!validation}
            onClick={() => setChoix(option.type)}
          >
            <RenduFragments fragments={LIBELLE_TYPE_FRAGMENTS[option.type]} />
          </button>
        ))}
      </div>
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={() => choix !== null && onValider(choix)}
        vide={choix === null}
        illisible={false}
        texteIllisible=""
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        validation={validation}
      />
    </div>
  );
}
