import { useState } from "react";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import { listeComportements } from "../moteur5e/typesLectureGraphiqueLimites";
import { consigneGenerale, consignePhase, labelComportementLatex } from "../ui5e/formatLectureGraphiqueLimites";
import { Katex } from "../components/Katex";
import { LectureGraphiqueLimitesGraph } from "./LectureGraphiqueLimitesGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceLectureGraphiqueLimites;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (textes: string[]) => void;
  diagnostiquer?: (textes: string[]) => StatutVerification[];
}

/** Écran "completerLimites" — un champ par comportement RÉELLEMENT visible sur le graphique (2 à 6
 * selon le tirage), chaque champ accepte une valeur finie OU ±∞. Pas d'aide : pure lecture
 * graphique, rien à expliquer ou rappeler. */
export function EtapeComportementsLimites({ exercice, tentativesUtilisees, tentativesMax, onValider, diagnostiquer }: Props) {
  const slots = listeComportements(exercice);
  const [valeurs, setValeurs] = useState<string[]>(() => Array(slots.length).fill(""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer(valeurs) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) {
      const s = diagnostiquer(valeurs);
      setDernierStatut(s.find((v) => v !== "correct") ?? "correct");
    }
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <LectureGraphiqueLimitesGraph exercice={exercice} />
      <p className="prompt-text">{consignePhase("completerLimites")}</p>
      {slots.map((slot, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={labelComportementLatex(exercice, slot.id)} block />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder="ex : 2, -3/2, +inf, -inf"
          />
        </div>
      ))}
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
