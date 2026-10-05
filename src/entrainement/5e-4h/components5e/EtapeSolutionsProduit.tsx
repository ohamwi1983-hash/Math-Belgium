import { useState } from "react";
import type { ExerciceProduitFacteurs } from "../core5e/equationsTrigonometriques.types";
import { ANNONCE_PRECISION_PRODUIT_SOLUTIONS, CONSIGNE_SOLUTIONS_PRODUIT, formatEnonceProduitLatex, formatTermesEtatActuelProduit, regimeProduit } from "../ui5e/formatEquationTrigonometrique";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { CONSIGNE_GENERALE_EQUATION_TRIG, TEXTE_AIDE_SOLUTIONS_NIVEAU1, TEXTE_AIDE_SOLUTIONS_NIVEAU2 } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceProduitFacteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

/** Bloc "état actuel" — rappelle prefacteur (si présent) + facteurs séparés + argument (u1/u2) +
 * x isolé, tout ce qui a déjà été confirmé aux 3 écrans précédents. */
function EtatActuelProduit({
  exercice,
  phase,
}: {
  exercice: ExerciceProduitFacteurs;
  phase: "separerFacteurs" | "argumentProduit" | "isolerXProduit" | "solutionsProduit";
}) {
  const termes = formatTermesEtatActuelProduit(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Écran final (famille "produit") — l'union des solutions des 2 facteurs, add-as-needed, même
 * patron que `EtapeSolutionsEquationTrig`. */
export function EtapeSolutionsProduit({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  const pointsAffiches = niveauAide >= 2 && exercice.solutionsUnion.length > 0 ? [exercice.solutionsUnion[0]] : [];
  /** L'union peut mélanger des solutions d'un facteur en régime "exact" et d'un facteur en régime
   * "decimal" (possible seulement pour le sous-cas "factoree", où les 2 facteurs sont tirés
   * indépendamment — voir `produitFacteurs.ts`). Formulation générique qui reste correcte dans les
   * 2 cas (mélange OU tout-décimal) plutôt que d'affirmer à tort que TOUTES les valeurs listées sont
   * décimales quand certaines sont en réalité des angles remarquables exacts. */
  const auMoinsUnFacteurDecimal = exercice.facteur1.regime === "decimal" || exercice.facteur2.regime === "decimal";

  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatEnonceProduitLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <EtatActuelProduit exercice={exercice} phase="solutionsProduit" />
      <p className="prompt-text">
        {CONSIGNE_SOLUTIONS_PRODUIT}
        {auMoinsUnFacteurDecimal && ANNONCE_PRECISION_PRODUIT_SOLUTIONS}
      </p>
      {niveauAide >= 2 && <CercleTrigEquationSketch points={pointsAffiches} regime={regimeProduit(exercice)} />}
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => setLignes((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder="ex : pi/6"
            />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes((arr) => arr.filter((_, j) => j !== i))}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => setLignes((arr) => [...arr, ""])}>
        + Ajouter une solution
      </button>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU2}</p>}
        </div>
      )}
    </div>
  );
}
