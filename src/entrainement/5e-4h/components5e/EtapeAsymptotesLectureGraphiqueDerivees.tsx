import { useEffect, useState } from "react";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import { listeAsymptotes } from "../moteur5e/typesLectureGraphiqueLimites";
import { consigneGenerale, consigneEcran, questionFinale } from "../ui5e/formatLectureGraphiqueDerivees";
import { labelAsymptoteLatex } from "../ui5e/formatLectureGraphiqueLimites";
import { zoneDepuisIdAsymptote } from "../ui5e/lectureGraphiqueDeriveesCourbe";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { LectureGraphiqueDeriveesGraph } from "./LectureGraphiqueDeriveesGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  diagnostiquer?: (textes: string[]) => StatutVerification[];
}

/** Écran "asymptotes" — adapte le PATRON de `EtapeEquationsAsymptotes.tsx` (5gen22 : mêmes slots
 * `listeAsymptotes`, même vérification `diagnostiquerCibleAsymptote`, câblés depuis l'appelant)
 * mais rend `LectureGraphiqueDeriveesGraph` (la courbe COMPLÈTE avec extrema/PI) au lieu de l'ancien
 * graphe 5gen22 — la donnée affichée doit rester la MÊME sur tous les écrans de ce générateur.
 * Jamais un composant importé tel quel : `EtapeEquationsAsymptotes` est câblé en dur sur l'ancien
 * graphe et sur `ExerciceLectureGraphiqueLimites`, incompatible avec ce besoin. */
export function EtapeAsymptotesLectureGraphiqueDerivees({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const slots = listeAsymptotes(exercice.asymptotique);
  const [valeurs, setValeurs] = useState<string[]>(() => Array(slots.length).fill(""));
  useEffect(() => {
    setValeurs(Array(slots.length).fill(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.length]);
  const [champActif, setChampActif] = useState(0);
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

  const surlignage = niveauAide >= 1 && slots.length > 0 ? zoneDepuisIdAsymptote(slots[champActif].id) : null;

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <LectureGraphiqueDeriveesGraph exercice={exercice} surlignage={surlignage} />
      <QuestionFinale question={questionFinale(exercice)} />
      <p className="prompt-text">{consigneEcran("asymptotes")}</p>
      {slots.map((slot, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={labelAsymptoteLatex(slots, slot.id)} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onFocus={() => setChampActif(i)}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={slot.id.kind === "oblique" ? "ex : 2x-3" : "ex : 2"}
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
