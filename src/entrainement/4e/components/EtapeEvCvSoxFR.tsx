import { useState } from "react";
import type { ExerciceFormeCanoniqueFonctionReference, ReponseEvCvSoxFR } from "../core/formeCanoniqueFonctionsReference.types";
import { cibleEtape4, diagnostiquerEvCvSoxFR, diagnostiquerFonctionFamille, evaluerEvCvSoxFR } from "../moteur/verificationFormeCanoniqueFonctionsReference";
import { formatGabaritEtape2Latex, formatGabaritEtape3Latex, formatGabaritLatex } from "../ui/formatFormeCanoniqueFonctionsReference";
import { placeholderEquation } from "../ui/formatFonctionsReference";
import { formatMessageErreur } from "../ui/messageErreur";
import { courbeEtape2, courbeEtape3 } from "../ui/mafsFormeCanoniqueFonctionsReference";
import { MafsGraphFormeCanoniqueFonctionsReference } from "./MafsGraphFormeCanoniqueFonctionsReference";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueFonctionReference;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseEvCvSoxFR) => void;
}

const COULEUR_BLEU = "#1971c2";
const COULEUR_ORANGE = "#f08c00";

/** Étape 4 (section 2 de la spec) : le graphe affiche les traces confirmées des étapes 2 (bleu) et
 * 3 (orange), curseurs EV/CV (exclusivité mutuelle) et toggle SOX, champ "fonction intermédiaire". */
export function EtapeEvCvSoxFR({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [ev, setEv] = useState(1);
  const [cv, setCv] = useState(1);
  const [sox, setSox] = useState(false);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const evaluation = evaluerEvCvSoxFR(exercice, { ev, cv, sox });
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fonctionIntermediaire.trim() !== "";
  // Statut PROPRE au champ texte (jamais mêlé à la correction des curseurs ev/cv/sox, déjà
  // reflétée indépendamment par `evaluation`/`classeCurseur`).
  const statutChamp = montrerErreurs
    ? diagnostiquerFonctionFamille(exercice.famille, fonctionIntermediaire, cibleEtape4(exercice))
    : undefined;

  function classeCurseur(correct: boolean): string {
    return montrerErreurs && !correct ? "curseur-champ is-erronee" : "curseur-champ";
  }

  const formeCanoniqueComplete = formatGabaritLatex(exercice);
  const fonctionEtape2 = courbeEtape2(exercice);
  const enonceEtape2 = formatGabaritEtape2Latex(exercice);
  const fonctionEtape3 = courbeEtape3(exercice);
  const enonceEtape3 = formatGabaritEtape3Latex(exercice);
  const live = { ...fonctionEtape3, ev, cv, sox };

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formeCanoniqueComplete} block />
      </div>
      <p className="prompt-text">
        Choisis les transformations étirement vertical (<strong>EV</strong>), compression verticale
        (<strong>CV</strong>) et symétrie orthogonale d'axe Ox (<strong>SOX</strong>) à partir de{" "}
        <Katex expression={enonceEtape3} />.
      </p>
      <MafsGraphFormeCanoniqueFonctionsReference
        confirmees={[
          { parametres: fonctionEtape2, couleur: COULEUR_BLEU, labelLatex: enonceEtape2 },
          { parametres: fonctionEtape3, couleur: COULEUR_ORANGE, labelLatex: enonceEtape3 },
        ]}
        live={live}
      />
      <div className="curseur-row">
        <label className={classeCurseur(evaluation.ev)} htmlFor="curseur-ev-fr">
          <span>EV : {ev}</span>
          <input id="curseur-ev-fr" type="range" min={1} max={5} step={1} value={ev} onChange={(e) => setEv(Number(e.target.value))} />
        </label>
        <label className={classeCurseur(evaluation.cv)} htmlFor="curseur-cv-fr">
          <span>CV : {cv}</span>
          <input id="curseur-cv-fr" type="range" min={1} max={5} step={1} value={cv} onChange={(e) => setCv(Number(e.target.value))} />
        </label>
      </div>
      <button type="button" className={classeCurseur(evaluation.sox) + " btn"} onClick={() => setSox((v) => !v)}>
        {sox ? "SOX : Oui" : "SOX : Non"}
      </button>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="evcvsox-fr-fonction-intermediaire">
          f(x) =
        </label>
        <input
          id="evcvsox-fr-fonction-intermediaire"
          className={`text-input${statutChamp !== undefined && statutChamp !== "correct" ? " is-erronee" : ""}`}
          placeholder={placeholderEquation(exercice.famille)}
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
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {diagnostiquerEvCvSoxFR(exercice, { ev, cv, sox, fonctionIntermediaire }) === "parse_error"
            ? formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")
            : `Incorrect (curseurs en rouge si fautifs) — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}
        </p>
      )}
    </div>
  );
}
