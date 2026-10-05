import { useState } from "react";
import type { ExerciceFormeCanoniqueFonctionReference, ReponseThFR } from "../core/formeCanoniqueFonctionsReference.types";
import { cibleEtape3, diagnostiquerFonctionFamille, diagnostiquerThFR } from "../moteur/verificationFormeCanoniqueFonctionsReference";
import { formatGabaritEtape2Latex, formatGabaritLatex } from "../ui/formatFormeCanoniqueFonctionsReference";
import { placeholderEquation } from "../ui/formatFonctionsReference";
import { formatMessageErreur } from "../ui/messageErreur";
import { courbeEtape2 } from "../ui/mafsFormeCanoniqueFonctionsReference";
import { MafsGraphFormeCanoniqueFonctionsReference } from "./MafsGraphFormeCanoniqueFonctionsReference";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueFonctionReference;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseThFR) => void;
}

const COULEUR_BLEU = "#1971c2";

/** Étape 3 (section 2 de la spec) : le graphe affiche la trace confirmée de l'étape 2 en bleu
 * (légendée avec son expression réelle), curseur TH, champ "fonction intermédiaire". */
export function EtapeThFR({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [th, setTh] = useState(0);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const curseurErrone = tentativesUtilisees > 0 && th !== exercice.th;
  // Statut PROPRE au champ texte — jamais dérivé du seul curseur TH : un champ juste avec un
  // curseur TH faux (ou l'inverse) doit rester détecté et signalé, cas jusque-là manqué (ni
  // message ni highlight rouge affichés quand seul le champ était fautif).
  const statutChamp = tentativesUtilisees > 0
    ? diagnostiquerFonctionFamille(exercice.famille, fonctionIntermediaire, cibleEtape3(exercice))
    : undefined;
  const champErrone = statutChamp !== undefined && statutChamp !== "correct";
  const montrerErreur = curseurErrone || champErrone;
  const complet = fonctionIntermediaire.trim() !== "";

  const formeCanoniqueComplete = formatGabaritLatex(exercice);
  const fonctionEtape2 = courbeEtape2(exercice);
  const enonceEtape2 = formatGabaritEtape2Latex(exercice);
  const live = { ...fonctionEtape2, th };

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formeCanoniqueComplete} block />
      </div>
      <p className="prompt-text">
        Choisis la translation horizontale (<strong>TH</strong>) à partir de <Katex expression={enonceEtape2} />.
      </p>
      <MafsGraphFormeCanoniqueFonctionsReference
        confirmees={[{ parametres: fonctionEtape2, couleur: COULEUR_BLEU, labelLatex: enonceEtape2 }]}
        live={live}
      />
      <div className="curseur-row">
        <label className={curseurErrone ? "curseur-champ is-erronee" : "curseur-champ"} htmlFor="curseur-th-fr">
          <span>TH : {th}</span>
          <input id="curseur-th-fr" type="range" min={-5} max={5} step={1} value={th} onChange={(e) => setTh(Number(e.target.value))} />
        </label>
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="th-fr-fonction-intermediaire">
          f(x) =
        </label>
        <input
          id="th-fr-fonction-intermediaire"
          className={`text-input${champErrone ? " is-erronee" : ""}`}
          placeholder={placeholderEquation(exercice.famille)}
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
      {montrerErreur && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquerThFR(exercice, { th, fonctionIntermediaire }))}
        </p>
      )}
    </div>
  );
}
