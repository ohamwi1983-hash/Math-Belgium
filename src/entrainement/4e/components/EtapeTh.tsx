import { useState } from "react";
import type { ExerciceFormeCanoniqueTransformation, ReponseTh } from "../core/formeCanoniqueTransformations.types";
import { diagnostiquerTh, fonctionCanoniqueReelle } from "../moteur/verificationFormeCanoniqueTransformations";
import { formatFonctionCanoniqueLatex } from "../ui/formatFormeCanoniqueTransformations";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesTh, messageTranslation, MESSAGE_FONCTION_ILLISIBLE } from "../ui/aidesParabole";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { MafsGraphFormeCanoniqueTransformations } from "./MafsGraphFormeCanoniqueTransformations";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceFormeCanoniqueTransformation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseTh) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
export function EtapeTh({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [th, setTh] = useState(0);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const saisie = useTentativeLisible<ReponseTh>();
  const complet = fonctionIntermediaire.trim() !== "";
  const lisible = diagnostiquerTh(exercice, { th, fonctionIntermediaire }) !== "parse_error";
  const fonctionErronee = tentativesUtilisees > 0 && !validation;

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
        <label className="curseur-champ" htmlFor="curseur-th">
          <span>TH : {String(th).replace("-", "−")}</span>
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
          placeholder="ex : (x-8)^2"
          value={fonctionIntermediaire}
          onChange={(e) => setFonctionIntermediaire(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!validation && (
        <>
        <AidesNiveaux aides={aidesTh()} />
        <button
          type="button"
          className="btn btn-primary"
          disabled={!complet}
          onClick={() => saisie.tenter({ th, fonctionIntermediaire }, lisible, onValider)}
        >
          Valider
        </button>
        <MessageRetour
          illisible={saisie.illisible}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          texteIllisible={MESSAGE_FONCTION_ILLISIBLE}
          cible={saisie.soumise ? messageTranslation(exercice.xS, saisie.soumise.th, "horizontale") : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
