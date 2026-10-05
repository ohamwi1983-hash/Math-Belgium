import { useState } from "react";
import type { ExerciceLimite } from "../core5e/limites.types";
import { consigneGenerale, consignePhase, formatBlocDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimites";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelLimite } from "./EtatActuelLimite";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

/** Écran "factoriserDenominateur" (Branche B, famille "limiteInfiniePoint" uniquement) — UN champ
 * libre unique (le dénominateur, donné sous forme non factorisée quel que soit le sous-cas — l'élève
 * le factorise lui-même), vérifié par ÉQUIVALENCE ALGÉBRIQUE (même composant que côté 4e), jamais
 * add-as-needed. `diagnostiquerFacteurs` (moteur, inchangée) reste appelée avec un tableau à 1
 * élément. */
export function EtapeFactoriserDenominateurLimite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec && diagnostiquer && complet ? diagnostiquer([texte]) : null;
  const aide2 = texteAideNiveau2(exercice, "factoriserDenominateur");

  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer([texte]));
    onValider([texte]);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        <Katex expression={formatBlocDonneesLatex(exercice)} block />
      </div>
      <EtatActuelLimite exercice={exercice} phase="factoriserDenominateur" />
      <p className="prompt-text">{consignePhase(exercice, "factoriserDenominateur")}</p>

      <ApercuExpressionLatex texte={texte} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Dénominateur factorisé</label>
        <input
          type="text"
          className={`text-input${statut !== null && statut !== "correct" ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : (x-3)*(x+5)"
        />
      </div>

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
          <p>{texteAideNiveau1(exercice, "factoriserDenominateur")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
