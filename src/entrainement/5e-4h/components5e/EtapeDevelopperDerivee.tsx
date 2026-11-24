import { useState } from "react";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { ReponseDevelopper } from "../moteur5e/sessionDefinitionDerivee";
import { consigneGenerale, formatTermesDonneesLatex, labelFA, labelFAH, questionSpecifiqueEcran } from "../ui5e/formatDefinitionDerivee";
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
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDevelopper) => void;
  diagnostiquer?: (reponse: ReponseDevelopper) => { fA: StatutVerification; fAH: StatutVerification };
  /** Lot B : saisie refusée SANS tentative (illisible, approchée, forme non développée) — même
   * fonction que le moteur ; renvoie le message, ou null. */
  refus: (reponse: ReponseDevelopper) => string | null;
  cible: (reponse: ReponseDevelopper) => FragmentConsigne[] | null;
  aides: AideTrig[];
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "developper" — 2 champs (f(a) numérique, f(a+h) symbolique en h), vérifiés
 * INDÉPENDAMMENT pour l'affichage mais notés comme UNE SEULE tentative combinée (1 bouton
 * Valider) — même patron que `EtapeDiviserEuclidienne.tsx` (5gen21). Jamais de calculatrice :
 * générateur purement symbolique/exact. */
export function EtapeDevelopperDerivee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, refus, cible, aides, validation }: Props) {
  const [fA, setFA] = useState("");
  const [fAH, setFAH] = useState("");
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [soumise, setSoumise] = useState<ReponseDevelopper | null>(null);
  const complet = fA.trim() !== "" && fAH.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ fA, fAH }) : null;
  const question = questionSpecifiqueEcran(exercice, "developper");
  const a = exercice.a;

  function valider() {
    if (!complet) return;
    const reponse: ReponseDevelopper = { fA, fAH };
    const message = refus(reponse);
    setRefusAffiche(message);
    if (message) return;
    setSoumise(reponse);
    onValider(reponse);
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
      <p className="prompt-text">{question.texteAvant}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFA(a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fA !== "correct" ? " is-erronee" : ""}`}
          value={fA}
          onChange={(e) => {
            setFA(e.target.value);
            setRefusAffiche(null);
          }}
          placeholder="ex : −0,2"
        />
      </div>
      <ApercuExpressionLatex texte={fAH} label={labelFAH(a)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFAH(a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fAH !== "correct" ? " is-erronee" : ""}`}
          value={fAH}
          onChange={(e) => {
            setFAH(e.target.value);
            setRefusAffiche(null);
          }}
          placeholder="ex : 0,5h² + 3h − 1"
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
        cible={soumise !== null && tentativesUtilisees > 0 ? cible(soumise) : null}
        validation={validation}
      />
    </div>
  );
}
