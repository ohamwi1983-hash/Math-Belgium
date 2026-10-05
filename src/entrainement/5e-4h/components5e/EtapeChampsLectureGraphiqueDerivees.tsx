import { useEffect, useState } from "react";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelLectureGraphiqueDerivees } from "./EtatActuelLectureGraphiqueDerivees";
import { LectureGraphiqueDeriveesGraph } from "./LectureGraphiqueDeriveesGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { consigneEcran, consigneGenerale, questionFinale } from "../ui5e/formatLectureGraphiqueDerivees";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  phase: "extremums" | "inflexions";
  labels: string[];
  placeholders: string[];
  /** Une position par champ — pour le surlignage visuel (niveau 1) du point concerné. */
  positions: number[];
  precisionAnnoncee: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran générique "N champs numériques" pour "extremums" (ordonnée de chaque extremum retenu) et
 * "inflexions" (abscisse de chaque PI) — jamais de calculatrice (lecture graphique pure). Aide
 * PUREMENT visuelle (surlignage du point concerné, niveau 1 seul, même esprit que 5gen22).
 *
 * **`useEffect` de resynchronisation** — piège déjà rencontré cette semaine sur
 * `EtapeChampsNumeriquesEtudeLocale.tsx` (5gen29) : un `useState(() => new Array(nb).fill(""))`
 * SEUL ne réinitialise PAS le tableau si le nombre de champs change alors que la même instance de
 * composant survit (React ne réexécute l'initialiseur `useState` qu'au tout premier rendu) —
 * tronque silencieusement la réponse soumise. Appliqué ici dès le départ (`nb` change bien d'un
 * exercice à l'autre, ex. 1 extremum puis 3 au tirage suivant).
 */
export function EtapeChampsLectureGraphiqueDerivees({
  exercice,
  phase,
  labels,
  placeholders,
  positions,
  precisionAnnoncee,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const nb = labels.length;
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(nb).fill(""));
  useEffect(() => {
    setValeurs(new Array(nb).fill(""));
  }, [nb]);
  const [champActif, setChampActif] = useState(0);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? valeurs.map((v) => diagnostiquer(v)) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(valeurs.map((v) => diagnostiquer(v)).find((s) => s !== "correct") ?? "correct");
    onValider(valeurs);
  }

  const consigne = `${consigneEcran(phase)} ${precisionAnnoncee}`;
  const surlignage = niveauAide >= 1 && positions.length > 0 ? ({ type: "point" as const, position: positions[champActif] }) : null;

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <LectureGraphiqueDeriveesGraph exercice={exercice} surlignage={surlignage} />
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelLectureGraphiqueDerivees exercice={exercice} phase={phase} />
      <p className="prompt-text">{consigne}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onFocus={() => setChampActif(i)}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i] ?? ""}
          />
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
    </div>
  );
}
