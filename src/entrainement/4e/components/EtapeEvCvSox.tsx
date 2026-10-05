import { useState } from "react";
import type { ExerciceFormeCanoniqueTransformation, ReponseEvCvSox } from "../core/formeCanoniqueTransformations.types";
import { calculerA } from "../moteur/verificationTransformationsGraphiques";
import { diagnostiquerEvCvSox, evaluerEvCvSox, fonctionCanoniqueReelle } from "../moteur/verificationFormeCanoniqueTransformations";
import { fonctionCanoniqueVersParametresCourbe, formatFonctionCanoniqueLatex } from "../ui/formatFormeCanoniqueTransformations";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { MafsGraphFormeCanoniqueTransformations } from "./MafsGraphFormeCanoniqueTransformations";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueTransformation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseEvCvSox) => void;
}

const COULEUR_ORANGE = "#f08c00";

/**
 * Étape 3 — Étirement / compression / symétrie (renommée, "réflexion" retirée du libellé — section
 * 3 de la refonte) : le graphe part de (x-xS)² (fonction intermédiaire confirmée à l'étape
 * précédente, affichée en orange, légendée avec son expression réelle plutôt qu'un texte générique)
 * vers a(x-xS)². Curseurs EV, CV, SOX inchangés, vérification par rapport EV/CV déjà en place,
 * complétée par la fonction intermédiaire de cette étape (structurelle + algébrique).
 */
export function EtapeEvCvSox({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [ev, setEv] = useState(1);
  const [cv, setCv] = useState(1);
  const [sox, setSox] = useState(false);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const evaluation = evaluerEvCvSox(exercice, { ev, cv, sox, fonctionIntermediaire });
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fonctionIntermediaire.trim() !== "";
  const statut = montrerErreurs ? diagnostiquerEvCvSox(exercice, { ev, cv, sox, fonctionIntermediaire }) : undefined;
  const fonctionErronee = statut !== undefined && statut !== "correct";

  function classeCurseur(correct: boolean): string {
    return montrerErreurs && !correct ? "curseur-champ is-erronee" : "curseur-champ";
  }

  const formeCanoniqueComplete = formatFonctionCanoniqueLatex(fonctionCanoniqueReelle(exercice, exercice.yS));
  const fonctionThConfirmee = { numA: 1, denA: 1, p: exercice.xS, q: 0 };
  const fonctionThLatex = formatFonctionCanoniqueLatex(fonctionThConfirmee);

  const confirmee = { parametres: fonctionCanoniqueVersParametresCourbe(fonctionThConfirmee), couleur: COULEUR_ORANGE, labelLatex: fonctionThLatex };
  const live = { p: exercice.xS, q: 0, a: calculerA({ ev, cv, sox }) };

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formeCanoniqueComplete} block />
      </div>
      <p className="prompt-text">
        Choisis les transformations étirement vertical (<strong>EV</strong>), compression verticale
        (<strong>CV</strong>) et symétrie orthogonale (<strong>SOX</strong>) à partir de{" "}
        <Katex expression={fonctionThLatex} />.
      </p>
      <MafsGraphFormeCanoniqueTransformations confirmees={[confirmee]} live={live} />
      <div className="curseur-row">
        <label className={classeCurseur(evaluation.ev)} htmlFor="curseur-ev">
          <span>EV : {ev}</span>
          <input
            id="curseur-ev"
            type="range"
            min={1}
            max={5}
            step={1}
            value={ev}
            onChange={(e) => setEv(Number(e.target.value))}
          />
        </label>
        <label className={classeCurseur(evaluation.cv)} htmlFor="curseur-cv">
          <span>CV : {cv}</span>
          <input
            id="curseur-cv"
            type="range"
            min={1}
            max={5}
            step={1}
            value={cv}
            onChange={(e) => setCv(Number(e.target.value))}
          />
        </label>
      </div>
      <button type="button" className={classeCurseur(evaluation.sox) + " btn"} onClick={() => setSox((v) => !v)}>
        {sox ? "SOX : Oui" : "SOX : Non"}
      </button>
      <ApercuExpressionLatex texte={fonctionIntermediaire} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="evcvsox-fonction-intermediaire">
          f(x) =
        </label>
        <input
          id="evcvsox-fonction-intermediaire"
          className={`text-input${fonctionErronee ? " is-erronee" : ""}`}
          placeholder="ex : -3/2(x+4)^2"
          value={fonctionIntermediaire}
          onChange={(e) => setFonctionIntermediaire(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider({ ev, cv, sox, fonctionIntermediaire })}
      >
        Valider
      </button>
      {statut !== undefined && (
        <p className="alert-error" role="alert">
          {statut === "parse_error"
            ? formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")
            : `Incorrect (curseurs en rouge si fautifs) — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}
        </p>
      )}
    </div>
  );
}
