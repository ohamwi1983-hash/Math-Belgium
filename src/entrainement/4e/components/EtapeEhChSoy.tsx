import { useState } from "react";
import type { ExerciceFormeCanoniqueFonctionReference, ReponseEhChSoy } from "../core/formeCanoniqueFonctionsReference.types";
import { cibleEtape2, diagnostiquerEhChSoy, diagnostiquerFonctionFamille, evaluerEhChSoy } from "../moteur/verificationFormeCanoniqueFonctionsReference";
import { formatGabaritLatex } from "../ui/formatFormeCanoniqueFonctionsReference";
import { placeholderEquation } from "../ui/formatFonctionsReference";
import { formatMessageErreur } from "../ui/messageErreur";
import { MafsGraphFormeCanoniqueFonctionsReference } from "./MafsGraphFormeCanoniqueFonctionsReference";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueFonctionReference;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseEhChSoy) => void;
}

const NOM_G: Record<ExerciceFormeCanoniqueFonctionReference["famille"], string> = {
  carre: "f(x)=x^2",
  cube: "f(x)=x^3",
  racine_carree: "f(x)=\\sqrt{x}",
  racine_cubique: "f(x)=\\sqrt[3]{x}",
  inverse: "f(x)=\\frac{1}{x}",
  valeur_absolue: "f(x)=\\left|x\\right|",
};

/** Étape 2 (section 2 de la spec) : graphe partant de la fonction de référence pure (sans aucune
 * transformation), curseurs EH/CH (exclusivité mutuelle) et toggle SOY, champ "fonction
 * intermédiaire" — première étape à afficher un graphe, aucune trace confirmée encore. */
export function EtapeEhChSoy({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [eh, setEh] = useState(1);
  const [ch, setCh] = useState(1);
  const [soy, setSoy] = useState(false);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const evaluation = evaluerEhChSoy(exercice, { eh, ch, soy });
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fonctionIntermediaire.trim() !== "";
  const statut = montrerErreurs ? diagnostiquerEhChSoy(exercice, { eh, ch, soy, fonctionIntermediaire }) : undefined;
  // Statut PROPRE au champ texte (jamais mêlé à la correction des curseurs eh/ch/soy, déjà
  // reflétée indépendamment par `evaluation`/`classeCurseur`) — sinon un champ texte correct
  // serait mis en rouge à tort par la seule faute des curseurs (`statut` ci-dessus est un ET
  // logique des deux).
  const statutChamp = montrerErreurs
    ? diagnostiquerFonctionFamille(exercice.famille, fonctionIntermediaire, cibleEtape2(exercice))
    : undefined;

  function classeCurseur(correct: boolean): string {
    return montrerErreurs && !correct ? "curseur-champ is-erronee" : "curseur-champ";
  }

  const formeCanoniqueComplete = formatGabaritLatex(exercice);
  const live = { famille: exercice.famille, th: 0, tv: 0, ch, eh, ev: 1, cv: 1, sox: false, soy };

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formeCanoniqueComplete} block />
      </div>
      <p className="prompt-text">
        Choisis les transformations étirement horizontal (<strong>EH</strong>), compression horizontale
        (<strong>CH</strong>) et symétrie orthogonale d'axe Oy (<strong>SOY</strong>) à partir de{" "}
        <Katex expression={NOM_G[exercice.famille]} />.
      </p>
      <MafsGraphFormeCanoniqueFonctionsReference confirmees={[]} live={live} />
      <div className="curseur-row">
        <label className={classeCurseur(evaluation.eh)} htmlFor="curseur-eh-fr">
          <span>EH : {eh}</span>
          <input id="curseur-eh-fr" type="range" min={1} max={5} step={1} value={eh} onChange={(e) => setEh(Number(e.target.value))} />
        </label>
        <label className={classeCurseur(evaluation.ch)} htmlFor="curseur-ch-fr">
          <span>CH : {ch}</span>
          <input id="curseur-ch-fr" type="range" min={1} max={5} step={1} value={ch} onChange={(e) => setCh(Number(e.target.value))} />
        </label>
      </div>
      <button type="button" className={classeCurseur(evaluation.soy) + " btn"} onClick={() => setSoy((v) => !v)}>
        {soy ? "SOY : Oui" : "SOY : Non"}
      </button>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="ehchsoy-fonction-intermediaire">
          f(x) =
        </label>
        <input
          id="ehchsoy-fonction-intermediaire"
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
        onClick={() => onValider({ eh, ch, soy, fonctionIntermediaire })}
      >
        Valider
      </button>
      {statut !== undefined && statut !== "correct" && (
        <p className="alert-error" role="alert">
          {statut === "parse_error"
            ? formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")
            : `Incorrect (curseurs en rouge si fautifs) — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}
        </p>
      )}
    </div>
  );
}
