import { useMemo, useState } from "react";
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import { Katex } from "./Katex";
import { FigureComparaison } from "./FigureComparaison";
import { aideEgaliteComparaison } from "../ui/formatComparaisonVecteurs";
import { diagnostiquerEgalitePour, egalitesDemandees, lireEgalite } from "../moteur/verificationComparaisonVecteurs";
import { aidesParNiveau, ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { texte as tx, latex as lx } from "../../export/corrigeTableau";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceComparaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

/** Message ciblé sur la première égalité fausse : signe de k (sens), autre vecteur, cible absente. */
function messageEgalites(exercice: ExerciceComparaisonVecteurs, textes: string[]): FragmentConsigne[] | null {
  const ref = exercice.labelReference;
  const attendues = egalitesDemandees(exercice);
  for (let i = 0; i < attendues.length; i++) {
    const { label, k } = attendues[i];
    const total = lireEgalite(textes[i] ?? "");
    if (total === null || diagnostiquerEgalitePour(label, ref, k, textes[i]) === "correct") continue;
    const autre = Object.entries(total).some(([nom, v]) => nom !== label.toLowerCase() && nom !== ref.toLowerCase() && Math.abs(v) > 1e-9);
    if (autre) return [tx("Chaque égalité ne relie que deux vecteurs : "), lx(`\\vec{${label}}`), tx(" et "), lx(`\\vec{${ref}}`), tx(".")];
    if (diagnostiquerEgalitePour(label, ref, -k, textes[i]) === "correct") {
      return [tx("Relis le sens de "), lx(`\\vec{${label}}`), tx(" : le signe de k dit si les deux vecteurs sont orientés du même côté (k positif) ou en sens contraires (k négatif).")];
    }
    return [tx("Pour "), lx(`\\vec{${label}}`), tx(" : compare ses composantes à celles de "), lx(`\\vec{${ref}}`), tx(" — chacune est multipliée par le même nombre k.")];
  }
  return null;
}

/**
 * Dernière étape : une égalité par vecteur trouvé parallèle à la référence (`egalitesDemandees`),
 * comme l'étape b du corrigé et la question b) du papier (audit 4e ch. 6, lot C : l'écran n'en
 * demandait qu'une). Règles communes (lot B) : une égalité illisible n'est jamais transmise (aucune
 * tentative), message ciblé (signe de k), aides à deux niveaux.
 */
export function EtapeEgaliteComparaison({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const attendues = egalitesDemandees(exercice);
  const [textes, setTextes] = useState<string[]>(() => attendues.map(() => ""));
  const saisie = useTentativeLisible<string[]>();
  const surlignes = useMemo(() => egalitesDemandees(exercice).map((e) => e.label), [exercice]);
  const complet = textes.every((t) => t.trim() !== "");
  const montrerErreurs = saisie.soumise !== null && tentativesUtilisees > 0;
  const plusieurs = attendues.length > 1;

  return (
    <div>
      <FigureComparaison exercice={exercice} selection={surlignes} />
      <p className="prompt-text">
        {plusieurs ? "Pour chacun des vecteurs en orange, écris l'égalité qui le relie à " : "Écris l'égalité qui relie le vecteur en orange à "}
        <Katex expression={`\\vec{${exercice.labelReference}}`} />.
      </p>

      {attendues.map((e, i) => {
        const erronee = montrerErreurs && diagnostiquerEgalitePour(e.label, exercice.labelReference, e.k, saisie.soumise![i] ?? "") !== "correct";
        return (
          <div className="field field-inline" key={e.label}>
            <label className="field-label field-label-minuscule" htmlFor={`comparaison-egalite-${e.label}`}>
              <Katex expression={`\\vec{${e.label}}\\;:`} />
            </label>
            <input
              id={`comparaison-egalite-${e.label}`}
              className={`text-input${erronee ? " is-erronee" : ""}`}
              placeholder="ex : u = 3v"
              readOnly={Boolean(validation)}
              value={textes[i]}
              onChange={(ev) => {
                const valeur = normaliserSigneMoins(ev.target.value);
                setTextes((t) => t.map((x, j) => (j === i ? valeur : x)));
              }}
            />
          </div>
        );
      })}

      {!validation && (
        <PiedVecteurs<string[]>
          aides={aidesParNiveau((n) => aideEgaliteComparaison(exercice, n))}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={() => textes}
          lisible={() => textes.every((t) => lireEgalite(t) !== null)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.egaliteVecteurs}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(t) => messageEgalites(exercice, t)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
