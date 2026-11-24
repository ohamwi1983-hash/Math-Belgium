import { useState } from "react";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { EcranDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";
import { consigneGenerale, formatTermesDonneesLatex, questionSpecifiqueEcran } from "../ui5e/formatDefinitionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDefinitionDerivee;
  ecran: Extract<EcranDefinitionDerivee, "quotient" | "limite">;
  labelChamp: string;
  placeholder: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Lot B : saisie refusée SANS tentative (illisible, approchée, forme à reprendre) — même
   * fonction que le moteur ; renvoie le message, ou null. */
  refus: (texte: string) => string | null;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse. */
  cible: (texte: string) => FragmentConsigne[] | null;
  aides: AideTrig[];
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran à UN SEUL champ texte libre, réutilisé par "quotient" et "limite" — même patron que
 * `EtapeChampLibreAsymptote.tsx` (5gen21). `key` obligatoire côté appelant (React réutiliserait
 * sinon la même instance entre 2 écrans, gardant la réponse précédente). Jamais de calculatrice :
 * générateur purement symbolique/exact.
 *
 * Question spécifique rendue en 3 morceaux (`texteAvant`/`latex`/`texteApres`,
 * `questionSpecifiqueEcran`) — le fragment central passe par `<Katex>` (fraction/limite empilée,
 * jamais un texte plat avec crochets). */
export function EtapeChampLibreDerivee({ exercice, ecran, labelChamp, placeholder, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, refus, cible, aides, validation }: Props) {
  const [texte, setTexte] = useState("");
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [soumis, setSoumis] = useState<string | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const question = questionSpecifiqueEcran(exercice, ecran);

  function valider() {
    if (texte.trim() === "") return;
    const message = refus(texte);
    setRefusAffiche(message);
    if (message) return;
    setSoumis(texte);
    onValider(texte);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">
        {question.texteAvant} {question.latex && <Katex expression={question.latex} />} {question.texteApres}
      </p>
      {/* L'aperçu affiche son libellé en texte brut : on ne lui passe jamais un libellé LaTeX
          (« \dfrac{…} » visible, écran du taux d'accroissement). */}
      <ApercuExpressionLatex texte={texte} label={labelChamp.includes("\\") ? undefined : labelChamp} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelChamp} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value);
            setRefusAffiche(null);
          }}
          placeholder={placeholder}
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
        cible={soumis !== null && tentativesUtilisees > 0 ? cible(soumis) : null}
        validation={validation}
      />
    </div>
  );
}
