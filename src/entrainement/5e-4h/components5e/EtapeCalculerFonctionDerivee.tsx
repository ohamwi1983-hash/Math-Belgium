import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, questionFinale } from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceFonctionDerivee;
  typeRetenu: TypeDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Lot B : saisie refusée SANS tentative (illisible, approchée…) — même fonction que le moteur. */
  refus: (valeurs: string[]) => string | null;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse. */
  cible: (valeurs: string[]) => FragmentConsigne[] | null;
  aides: AideTrig[];
}

/** Écran "calculer" — champ unique f'(x), mêmes idiomes que `EtapeChampLibreDerivee.tsx`
 * (5gen26) mais réécrit localement : le type `ExerciceDefinitionDerivee`/`PhaseDefinitionDerivee`
 * de ce composant est propre à 5gen26, jamais élargi pour un autre générateur. Jamais de
 * calculatrice : générateur purement symbolique/exact. */
export function EtapeCalculerFonctionDerivee({ exercice, typeRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, refus, cible, aides, validation}: Props) {
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const [texte, setTexte] = useState("");
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    const valeursSoumises = [texte];
    const message = refus(valeursSoumises);
    setRefusAffiche(message);
    if (message) return;
    setSoumises(valeursSoumises);
    onValider(texte);
  }

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
      <p className="prompt-text">{consigneEcran("calculer", typeRetenu)}</p>
      <ApercuExpressionLatex texte={texte} label="f'(x)=" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="f'(x)=" />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value);
            setRefusAffiche(null);
          }}
          placeholder="ex : 6x^5 − sin(x)"
        />
      </div>
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={texte.trim() === ""}
        illisible={refusAffiche !== null}
        texteIllisible={refusAffiche ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumises !== null && tentativesUtilisees > 0 ? cible(soumises) : null}
        validation={validation}
      />
    </div>
  );
}
