import { useState } from "react";
import type { ExerciceProduitFacteurs } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_PREFACTEUR, formatEnonceProduitLatex } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG, formatArgumentLatex } from "../ui5e/formatEquationTrig";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { aidesPrefacteur, messageCiblePrefacteur } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceProduitFacteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "pré-1" (famille "produit", sous-cas "nonFactoree" uniquement) — factoriser T²-k₂T=0 par
 * mise en évidence, champ de texte libre. */
export function EtapePrefacteurProduit({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const complet = texte.trim() !== "";

  function valider() {
    if (!complet) return;
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(texte, estLisible(diagnostiquer?.(texte)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_TRIG}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {decouperEquationLongueLatex(formatEnonceProduitLatex(exercice)).map((morceau, i) => (
              <Katex key={i} expression={morceau} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_PREFACTEUR}</p>
      <ApercuExpressionLatex texte={texte} />
      <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : sin(5x)*(sin(5x)-3/7)" />
      <AidesTrig niveauAide={niveauAide} aides={aidesPrefacteur(`\\${exercice.facteur2.fonction}\\left(${formatArgumentLatex(exercice.facteur2.a, exercice.facteur2.b)}\\right)`, exercice.facteur2.k.latex)} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="equation"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCiblePrefacteur(saisie.soumise) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
