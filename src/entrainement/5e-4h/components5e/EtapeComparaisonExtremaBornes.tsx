import { useEffect, useState } from "react";
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ReponseComparaisonBorne } from "../moteur5e/verificationExtremaBornes";
import { candidatsComparaisonBorne, indexMaxAbsoluBorne, indexMinAbsoluBorne } from "../moteur5e/verificationExtremaBornes";
import { consigneEcranExtremaBornes, formatCandidatLatex, texteAideNiveau1ExtremaBornes, texteAideNiveau2ExtremaBornes } from "../ui5e/formatExtremaBornes";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EnonceExtremaBornes } from "./EnonceExtremaBornes";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceExtremaBornes;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseComparaisonBorne) => void;
}

/** Écran "comparaison" — LE piège central du générateur : une VRAIE identification parmi TOUTES
 * les valeurs candidates (extrema locaux + les 2 bornes), jamais une confirmation binaire.
 * Interaction : 2 groupes de boutons `.btn.toggle-active` (convention transversale, jamais
 * `.btn-primary` réservé à "Valider") — un groupe "maximum absolu", un groupe "minimum absolu" —
 * chaque bouton porte à la fois la VALEUR et le `t` correspondant (`f(t)=valeur`), donc le choix
 * capture les 2 informations demandées ("quelle valeur ET à quel t") en un seul clic. `useEffect`
 * de resynchronisation si le nombre de candidats change (même patron défensif que
 * `EtapeChampsNumeriquesExtremaBornes.tsx`, bien qu'aucun scénario normal ne le déclenche ici —
 * l'état sélectionné n'est pas un tableau indexé par position). */
export function EtapeComparaisonExtremaBornes({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const candidats = candidatsComparaisonBorne(exercice);
  const [indexMax, setIndexMax] = useState<number | null>(null);
  const [indexMin, setIndexMin] = useState<number | null>(null);
  useEffect(() => {
    setIndexMax(null);
    setIndexMin(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidats.length]);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = indexMax !== null && indexMin !== null;

  function classeBouton(groupe: "max" | "min", i: number): string {
    const selectionne = groupe === "max" ? indexMax === i : indexMin === i;
    if (!selectionne) return "btn";
    const cibleReelle = groupe === "max" ? indexMaxAbsoluBorne(exercice) : indexMinAbsoluBorne(exercice);
    const erronee = montrerErreurs && i !== cibleReelle;
    return erronee ? "btn toggle-active is-erronee" : "btn toggle-active";
  }

  function valider() {
    if (indexMax === null || indexMin === null) return;
    onValider({ indexMax, indexMin });
  }

  return (
    <div>
      <EnonceExtremaBornes exercice={exercice} phase="comparaison" />
      <p className="prompt-text">{consigneEcranExtremaBornes("comparaison")}</p>

      <p className="prompt-text">Quelle valeur est le MAXIMUM absolu de f sur [0;T] ?</p>
      <div className="options-grid">
        {candidats.map((c, i) => (
          <button type="button" key={`max-${i}`} className={classeBouton("max", i)} onClick={() => setIndexMax(i)}>
            <Katex expression={formatCandidatLatex(c)} />
          </button>
        ))}
      </div>

      <p className="prompt-text">Quelle valeur est le MINIMUM absolu de f sur [0;T] ?</p>
      <div className="options-grid">
        {candidats.map((c, i) => (
          <button type="button" key={`min-${i}`} className={classeBouton("min", i)} onClick={() => setIndexMin(i)}>
            <Katex expression={formatCandidatLatex(c)} />
          </button>
        ))}
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1ExtremaBornes("comparaison")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2ExtremaBornes("comparaison")}</p>}
        </div>
      )}
    </div>
  );
}
