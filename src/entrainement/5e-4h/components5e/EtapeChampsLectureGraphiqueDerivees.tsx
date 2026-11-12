import { useState } from "react";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurExtremum } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { LectureGraphiqueDeriveesGraph } from "./LectureGraphiqueDeriveesGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { consigneEcran, consigneGenerale, labelsChampsExtremums, precisionAnnonceeExtremum, questionFinale, texteAideNiveau1 } from "../ui5e/formatLectureGraphiqueDerivees";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran « valeur des extremums » de 5gen30 : un champ par extremum, libellé « f(x₀) ≈ » (la position
 * et la nature sont connues depuis le tableau de f'). Aide : texte + surlignage du point du champ actif.
 * La clé d'écran (compteur de génération) recrée le composant à chaque exercice : les champs
 * repartent vides et restent toujours contrôlés. */
export function EtapeChampsLectureGraphiqueDerivees({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const labels = labelsChampsExtremums(exercice);
  const [valeurs, setValeurs] = useState<string[]>(() => labels.map(() => ""));
  const [champActif, setChampActif] = useState(0);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const complet = labels.every((_, i) => (valeurs[i] ?? "").trim() !== "");
  const statuts = tentativesUtilisees > 0 && complet ? labels.map((_, i) => diagnostiquerValeurExtremum(valeurs[i] ?? "", exercice.extrema[i].valeur)) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => labels.map((_, j) => (j === i ? valeur : (arr[j] ?? ""))));
  }
  function valider() {
    if (!complet) return;
    const s = labels.map((_, i) => diagnostiquerValeurExtremum(valeurs[i] ?? "", exercice.extrema[i].valeur));
    setDernierStatut(s.find((v) => v !== "correct") ?? "correct");
    if (s.includes("parse_error")) return; // écriture illisible : pas de tentative consommée
    onValider(labels.map((_, i) => valeurs[i] ?? ""));
  }

  const surlignage = niveauAide >= 1 && exercice.extrema.length > 0 ? { type: "point" as const, position: exercice.extrema[champActif]?.position ?? exercice.extrema[0].position } : null;

  return (
    <div>
      <EnTeteExercice consigneGenerale={consigneGenerale()} blocDonnees={<LectureGraphiqueDeriveesGraph exercice={exercice} surlignage={surlignage} />} />
      <QuestionFinale question={questionFinale(exercice)} />
      <p className="prompt-text">
        {consigneEcran("extremums")} {precisionAnnonceeExtremum()}
      </p>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("extremums")}</p>
        </div>
      )}
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor={`valeur-extremum-${i}`}>
            <Katex expression={label} />
          </label>
          <input
            id={`valeur-extremum-${i}`}
            type="text"
            inputMode="decimal"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i] ?? ""}
            onFocus={() => setChampActif(i)}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder="ex : 12,5"
            disabled={!!validation}
            autoComplete="off"
          />
        </div>
      ))}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {dernierStatut === "parse_error" ? (
            <p className="alert-error" role="alert">
              Écriture non reconnue : tape un nombre, par exemple 2,5 ou −1.
            </p>
          ) : (
            tentativesUtilisees > 0 && (
              <p className="alert-error" role="alert">
                {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
              </p>
            )
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
