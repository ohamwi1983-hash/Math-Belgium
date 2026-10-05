import { useState } from "react";
import type { ExerciceGeometrieCercle } from "../core5e/geometrieCercle.types";
import type { PhaseGeometrieCercle } from "../moteur5e/typesGeometrieCercle";
import { blocDonneesLatex, consigneGenerale, consignePhase, formatTermesEtatActuelGeometrieCercle, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatGeometrieCercle";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { GeometrieCercleSketch } from "./GeometrieCercleSketch";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

function EtatActuelGeometrieCercle({ exercice, phase }: { exercice: ExerciceGeometrieCercle; phase: PhaseGeometrieCercle }) {
  const termes = formatTermesEtatActuelGeometrieCercle(exercice, phase);
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
  exercice: ExerciceGeometrieCercle;
  phase: PhaseGeometrieCercle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /**
   * Statut à 3 valeurs (correct/not_equivalent/parse_error) calculé côté PRÉSENTATION uniquement,
   * pour différencier le message affiché après une tentative échouée (même motif que 5gen2, A.1) —
   * jamais consommé par `etapeTentatives.ts`/le score, qui reste piloté par le booléen historique
   * `onValider` déclenche côté moteur. Optionnel : un appelant qui ne le fournit pas garde le
   * message générique historique.
   */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/**
 * Écran UNIQUE, paramétré par la phase courante — les 25 écrans possibles (5 scénarios) réutilisent
 * tous ce composant, chaque écran ayant EXACTEMENT la même forme (un champ texte libre, une cible
 * numérique). `App5gen12.tsx` doit le rendre avec `key={phase}` (leçon retenue de 5gen6/5gen7/5gen8/
 * 5gen10/5gen11 — sans cette clé, React réutilise la même instance entre deux phases et le champ
 * `texte` local garde la réponse de l'écran précédent). Consigne générale + bloc de données
 * redondants sur chaque écran (convention transversale de la plateforme).
 */
export function EtapeChampGeometrieCercle({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  // A.2 : retour visuel rouge sur le champ après une tentative incorrecte (convention
  // transversale, `.is-erronee`) — `dernierStatut` n'est mis à jour qu'au moment de valider() ; une
  // fois `!== null && !== "correct"`, le champ reste rouge jusqu'à la tentative suivante (ou le
  // remontage du composant via `key={phase}` au changement d'écran, qui réinitialise l'état local).
  const champErronee = dernierStatut !== null && dernierStatut !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {blocDonneesLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <GeometrieCercleSketch exercice={exercice} />
      <EtatActuelGeometrieCercle exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      <div className="field field-inline">
        <label className="field-label">{labelPhase(phase)}</label>
        <input type="text" className={`text-input${champErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 3,14" />
      </div>
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
          <p>{texteAideNiveau1(phase)}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, phase)} block />}
        </div>
      )}
    </div>
  );
}
