import { useState } from "react";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import { listeAsymptotes } from "../moteur5e/typesLectureGraphiqueLimites";
import { consigneGenerale, consignePhase, labelAsymptoteLatex } from "../ui5e/formatLectureGraphiqueLimites";
import { Katex } from "../components/Katex";
import { EtatActuelLectureGraphiqueLimites } from "./EtatActuelLectureGraphiqueLimites";
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

/** Écran "nommerAsymptotes" — une équation par asymptote RÉELLEMENT présente (jamais un champ pour
 * un type absent du tirage) : x=... par AV, y=... par AH (1 ou 2 champs selon égalité en ±∞), y=...
 * par AO (expression symbolique ax+b). Pas d'aide : pure lecture graphique. */
export function EtapeEquationsAsymptotes({ exercice, tentativesUtilisees, tentativesMax, onValider, diagnostiquer }: Props) {
  const slots = listeAsymptotes(exercice);
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
      <EtatActuelLectureGraphiqueLimites exercice={exercice} phase="nommerAsymptotes" />
      <p className="prompt-text">{consignePhase("nommerAsymptotes")}</p>
      {slots.map((slot, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={labelAsymptoteLatex(slots, slot.id)} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={slot.id.kind === "oblique" ? "ex : 2x-3" : "ex : 2"}
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
