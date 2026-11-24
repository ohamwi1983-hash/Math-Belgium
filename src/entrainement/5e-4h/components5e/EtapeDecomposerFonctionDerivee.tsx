import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import {
  consigneEcran,
  consigneGenerale,
  formatTermesDonneesLatex,
  labelsChampsDecomposition,
  placeholdersChampsDecomposition,
  questionFinale,
} from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceFonctionDerivee;
  /** Jamais "reglebase" ici — cet écran est sauté pour ce type (voir `sessionFonctionDerivee.ts`). */
  typeRetenu: Exclude<TypeDerivee, "reglebase">;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: { champ1: string; champ2: string }) => void;
  diagnostiquer?: (reponse: { champ1: string; champ2: string }) => { champ1: StatutVerification; champ2: StatutVerification };
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

/** Écran "decomposer" — 2 champs texte libres, labellisés dynamiquement selon `typeRetenu`
 * ("u(x)="/"v(x)=" pour produit/quotient, "u(x)="/"g(u)=" pour composée) — même patron 2-champs/
 * 1-tentative-combinée que `EtapeDevelopperDerivee.tsx` (5gen26). Le champ1/champ2 générique est
 * mappé côté `App5gen27.tsx` vers `ReponseDecomposerUV`/`ReponseDecomposerComposee` selon
 * `typeRetenu`. */
export function EtapeDecomposerFonctionDerivee({ exercice, typeRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, refus, cible, aides, validation}: Props) {
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const [champ1, setChamp1] = useState("");
  const [champ2, setChamp2] = useState("");
  const complet = champ1.trim() !== "" && champ2.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ champ1, champ2 }) : null;
  const [label1, label2] = labelsChampsDecomposition(typeRetenu);
  const [placeholder1, placeholder2] = placeholdersChampsDecomposition(typeRetenu);

  function valider() {
    if (!complet) return;
    const reponse = { champ1, champ2 };
    const valeursSoumises = [champ1, champ2];
    const message = refus(valeursSoumises);
    setRefusAffiche(message);
    if (message) return;
    setSoumises(valeursSoumises);
    onValider(reponse);
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
      <p className="prompt-text">{consigneEcran("decomposer", typeRetenu)}</p>
      <ApercuExpressionLatex texte={champ1} label={label1} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={label1} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.champ1 !== "correct" ? " is-erronee" : ""}`}
          value={champ1}
          onChange={(e) => {
            setChamp1(e.target.value);
            setRefusAffiche(null);
          }}
          placeholder={placeholder1}
        />
      </div>
      <ApercuExpressionLatex texte={champ2} label={label2} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={label2} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.champ2 !== "correct" ? " is-erronee" : ""}`}
          value={champ2}
          onChange={(e) => {
            setChamp2(e.target.value);
            setRefusAffiche(null);
          }}
          placeholder={placeholder2}
        />
      </div>
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
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
