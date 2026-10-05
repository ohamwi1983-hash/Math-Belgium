import { useState } from "react";
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import type { PhasePolygonesArcsSecteurs } from "../moteur5e/typesPolygonesArcsSecteurs";
import { consigneGenerale, consignePhase, latexAideNiveau2, segmentsEtatActuelPolygone, surlignagePourPhase, texteAideNiveau1, texteAideNiveau3 } from "../ui5e/formatPolygonesArcsSecteurs";
import { PolygoneCercleSketch } from "./PolygoneCercleSketch";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExercicePolygonesArcsSecteurs;
  phase: Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs calculé côté présentation (promptcorrectionsregroupees.md, A.1), jamais
   * consommé par le score — optionnel, comportement générique inchangé sans lui. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Réutilisé pour les 4 écrans à un seul champ (arcElementaire/arcMultiPas/secteurElementaire/
 * secteurMultiPas) — seuls consigne de phase/surlignage/aides changent selon `phase`. Ordre des
 * blocs : consigne générale (intègre r/n, pas de bloc de données séparé) → état actuel (jamais vide
 * ici, jamais atteint pour "cercleEntier") → consigne de phase + diagramme + champ. */
export function EtapeEcranUnChampPolygone({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aideNiveau3 = texteAideNiveau3(exercice, phase);
  const segmentsEtatActuel = segmentsEtatActuelPolygone(exercice, phase);

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      {segmentsEtatActuel.length > 0 && (
        <div className="etat-actuel-box etat-actuel-box-termes">
          {segmentsEtatActuel.map((s, i) => (
            <Katex key={i} expression={s} />
          ))}
        </div>
      )}
      <p className="prompt-text">{consignePhase(phase)}</p>
      <PolygoneCercleSketch r={exercice.r} n={exercice.n} surlignage={surlignagePourPhase(exercice, phase)} />
      <ApercuExpressionLatex texte={texte} />
      <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 3*pi/4" />
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
          <Katex expression={texteAideNiveau1(phase)} block />
          {niveauAide >= 2 && <Katex expression={latexAideNiveau2(exercice, phase)} block />}
          {niveauAide >= 3 && aideNiveau3 !== null && <p>{aideNiveau3}</p>}
        </div>
      )}
    </div>
  );
}
