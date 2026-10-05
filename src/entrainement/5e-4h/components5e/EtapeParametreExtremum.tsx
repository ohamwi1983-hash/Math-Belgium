import { useState } from "react";
import type { ExerciceExtremumsSinusoide } from "../core5e/extremumsSinusoide.types";
import {
  CONSIGNE_GENERALE_EXTREMUMS,
  PLACEHOLDER_ISOLER_X_EXTREMUMS,
  PLACEHOLDER_POSER_EQUATION_EXTREMUMS,
  consignePhaseExtremums,
  formatFonctionSourceLatex,
  formatTermesEtatActuelExtremums,
  texteAideNiveau1Extremums,
} from "../ui5e/formatExtremumsSinusoide";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

/** Bloc "état actuel" — ne rend rien tant qu'aucune valeur n'est encore confirmée (écran
 * "poserEquation"), même convention que `EtatActuelCE`/`EtatActuelPanel` ailleurs sur la
 * plateforme. */
function EtatActuelExtremums({ exercice, phase }: { exercice: ExerciceExtremumsSinusoide; phase: "poserEquation" | "isolerX" }) {
  const termes = formatTermesEtatActuelExtremums(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

interface Props {
  exercice: ExerciceExtremumsSinusoide;
  phase: "poserEquation" | "isolerX";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`
   * (5gen10). `App5gen11.tsx` fournit la bonne fonction `diagnostiquerPoserEquationExtremum`/
   * `diagnostiquerIsolerXExtremum` selon `phase`. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/**
 * Écrans 1-2 ("poser l'équation", "isoler x") — UN SEUL champ texte libre, jamais add-as-needed
 * (la formule n'a par nature qu'une seule branche, contrairement à 5gen10). `App5gen11.tsx` doit le
 * rendre avec `key={phase}` (leçon retenue de 5gen6/5gen7/5gen8/5gen10 — sans cette clé, React
 * réutilise la même instance entre deux phases et le champ `texte` local garde la réponse de
 * l'écran précédent).
 *
 * B.1 : écran "poserEquation" seul a un layout dédié (label "Équation :" empilé au-dessus du champ,
 * jamais inline comme "x =") — c'est aussi le SEUL écran des deux à conserver une aide (niveau 1
 * uniquement, `BoutonAide` rend `null` de lui-même sur "isolerX" via `niveauAideMax=0`, voir
 * `moteur5e/sessionExtremumsSinusoide.ts::niveauAideMaxExtremums`). A.2 : `is-erronee` recalculé à
 * chaque frappe après un premier échec, réutilisant `diagnostiquer` (déjà un statut à 3 valeurs).
 */
export function EtapeParametreExtremum({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const statutActuel = apresEchec && diagnostiquer ? diagnostiquer(texte) : undefined;
  const texteErronee = statutActuel !== undefined && statutActuel !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EXTREMUMS}</p>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatFonctionSourceLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <EtatActuelExtremums exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhaseExtremums(phase)}</p>
      {phase === "poserEquation" ? (
        <>
          <ApercuExpressionLatex texte={texte} />
          <div className="field">
            <label className="field-label">Équation : </label>
            <input
              type="text"
              className={`text-input${texteErronee ? " is-erronee" : ""}`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={PLACEHOLDER_POSER_EQUATION_EXTREMUMS}
            />
          </div>
        </>
      ) : (
        <>
          <ApercuExpressionLatex texte={texte} label="x =" />
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">x =</label>
            <input
              type="text"
              className={`text-input${texteErronee ? " is-erronee" : ""}`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={PLACEHOLDER_ISOLER_X_EXTREMUMS}
            />
          </div>
        </>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1Extremums(exercice.fonction)}</p>
        </div>
      )}
    </div>
  );
}
