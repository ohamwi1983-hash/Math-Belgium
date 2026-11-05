import { useState } from "react";
import type { ExerciceGeometrieCercle } from "../core5e/geometrieCercle.types";
import type { PhaseGeometrieCercle } from "../moteur5e/typesGeometrieCercle";
import { blocDonneesLatex, consigneGenerale, consignePhase, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatGeometrieCercle";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { GeometrieCercleSketch } from "./GeometrieCercleSketch";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran UNIQUE, paramétré par la phase courante — les 25 écrans possibles (5 scénarios) réutilisent
 * tous ce composant, chaque écran ayant EXACTEMENT la même forme (un champ texte libre, une cible
 * numérique). `App5gen12.tsx` doit le rendre avec `key={phase}` (leçon retenue de 5gen6/5gen7/5gen8/
 * 5gen10/5gen11 — sans cette clé, React réutilise la même instance entre deux phases et le champ
 * `texte` local garde la réponse de l'écran précédent). Consigne générale + bloc de données
 * redondants sur chaque écran (convention transversale de la plateforme).
 */
export function EtapeChampGeometrieCercle({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  // A.2 : retour visuel rouge sur le champ après une tentative incorrecte (convention
  // transversale, `.is-erronee`) — `dernierStatut` n'est mis à jour qu'au moment de valider() ; une
  // fois `!== null && !== "correct"`, le champ reste rouge jusqu'à la tentative suivante (ou le
  // remontage du composant via `key={phase}` au changement d'écran, qui réinitialise l'état local).
  const champErronee = dernierStatut !== null && dernierStatut !== "correct";

  /** Saisie illisible (parse_error) : signalée sans consommer de tentative (audit 5e ch. 2,
   * point 48) — l'élève corrige son écriture, rien n'est décompté. */
  const [ecritureIllisible, setEcritureIllisible] = useState(false);

  function valider() {
    if (texte.trim() === "") return;
    const statut = diagnostiquer ? diagnostiquer(texte) : null;
    if (statut === "parse_error") {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    if (statut !== null) setDernierStatut(statut);
    onValider(texte);
  }
  /** Exemple de format HORS de l'espace des réponses possibles : un angle de 0,05 rad est
   * inférieur au plus petit angle tiré (10°), une aire de 2345,6 dépasse la plus grande aire tirée. */
  const placeholder = /^(conversionRad|angleTheta|angle1|angle2)$/.test(phase) ? "ex : 0,05" : "ex : 2345,6";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {blocDonneesLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <GeometrieCercleSketch exercice={exercice} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelPhase(phase)}</label>
        <input
          type="text"
          className={`text-input${champErronee || ecritureIllisible ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value);
            setEcritureIllisible(false);
          }}
          placeholder={placeholder}
        />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(phase)}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, phase)} block />}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        {ecritureIllisible && (
          <p className="alert-error" role="alert">
            Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).
          </p>
        )}
        {montrerErreurs && !ecritureIllisible && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
