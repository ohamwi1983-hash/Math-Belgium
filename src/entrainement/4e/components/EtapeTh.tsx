import { useState } from "react";
import type { ExerciceFormeCanoniqueTransformation, ReponseTh } from "../core/formeCanoniqueTransformations.types";
import { diagnostiquerTh, fonctionCanoniqueReelle } from "../moteur/verificationFormeCanoniqueTransformations";
import { formatFonctionCanoniqueLatex } from "../ui/formatFormeCanoniqueTransformations";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { MafsGraphFormeCanoniqueTransformations } from "./MafsGraphFormeCanoniqueTransformations";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueTransformation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseTh) => void;
}

/**
 * Étape 2 — Translation horizontale (section 2 de la refonte) : le graphe montre x² (curseur TH à
 * sa valeur neutre 0), l'élève règle TH jusqu'à obtenir (x-xS)² puis écrit cette fonction
 * intermédiaire en toutes lettres (vérification structurelle + algébrique, comme l'étape
 * précédente). Aucune courbe déjà confirmée à cette étape (la première à afficher un graphe) — voir
 * section 3 de la spec sur la trace cumulative. La forme canonique complète confirmée à l'étape 1
 * reste affichée en grand au-dessus du graphe, ici et à toutes les étapes suivantes (remplace le
 * rappel textuel xS/yS de l'ancienne version).
 */
export function EtapeTh({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [th, setTh] = useState(0);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const complet = fonctionIntermediaire.trim() !== "";
  const montrerErreur = tentativesUtilisees > 0;
  const statut = montrerErreur ? diagnostiquerTh(exercice, { th, fonctionIntermediaire }) : undefined;
  const fonctionErronee = statut !== undefined && statut !== "correct";

  const formeCanoniqueComplete = formatFonctionCanoniqueLatex(fonctionCanoniqueReelle(exercice, exercice.yS));

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formeCanoniqueComplete} block />
      </div>
      <p className="prompt-text">
        Choisis la translation horizontale (<strong>TH</strong>) à partir de <Katex expression="f(x)=x^2" />.
      </p>
      <MafsGraphFormeCanoniqueTransformations confirmees={[]} live={{ p: th, q: 0, a: 1 }} />
      <div className="curseur-row">
        <label className={montrerErreur && th !== exercice.xS ? "curseur-champ is-erronee" : "curseur-champ"} htmlFor="curseur-th">
          <span>TH : {th}</span>
          <input
            id="curseur-th"
            type="range"
            min={-5}
            max={5}
            step={1}
            value={th}
            onChange={(e) => setTh(Number(e.target.value))}
          />
        </label>
      </div>
      <ApercuExpressionLatex texte={fonctionIntermediaire} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="th-fonction-intermediaire">
          f(x) =
        </label>
        <input
          id="th-fonction-intermediaire"
          className={`text-input${fonctionErronee ? " is-erronee" : ""}`}
          placeholder="ex : (x-3)^2"
          value={fonctionIntermediaire}
          onChange={(e) => setFonctionIntermediaire(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider({ th, fonctionIntermediaire })}
      >
        Valider
      </button>
      {statut !== undefined && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
