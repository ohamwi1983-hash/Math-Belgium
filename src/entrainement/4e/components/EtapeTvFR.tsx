import { useState } from "react";
import type { ExerciceFormeCanoniqueFonctionReference, ReponseTvFR } from "../core/formeCanoniqueFonctionsReference.types";
import {
  formatGabaritEtape2Latex,
  formatGabaritEtape3Latex,
  formatGabaritEtape4Latex,
  formatGabaritLatex,
} from "../ui/formatFormeCanoniqueFonctionsReference";
import { cibleFinale, diagnostiquerFonctionFamille, diagnostiquerTvFR } from "../moteur/verificationFormeCanoniqueFonctionsReference";
import { placeholderEquation } from "../ui/formatFonctionsReference";
import { formatMessageErreur } from "../ui/messageErreur";
import { courbeEtape2, courbeEtape3, courbeEtape4 } from "../ui/mafsFormeCanoniqueFonctionsReference";
import { MafsGraphFormeCanoniqueFonctionsReference } from "./MafsGraphFormeCanoniqueFonctionsReference";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueFonctionReference;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseTvFR) => void;
}

const COULEUR_BLEU = "#1971c2";
const COULEUR_ORANGE = "#f08c00";
const COULEUR_VERT = "#2f9e44";

/** Étape 5 (section 2 de la spec), dernière étape : le graphe affiche les 3 traces confirmées
 * (bleu = étape 2, orange = étape 3, vert = étape 4), curseur TV, champ "fonction intermédiaire"
 * final — la fonction complète. */
export function EtapeTvFR({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [tv, setTv] = useState(0);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const curseurErrone = tentativesUtilisees > 0 && tv !== exercice.tv;
  // Statut PROPRE au champ texte — jamais dérivé du seul curseur TV (même correctif que
  // EtapeThFR.tsx : un champ juste avec un curseur TV faux, ou l'inverse, doit rester détecté).
  const statutChamp = tentativesUtilisees > 0
    ? diagnostiquerFonctionFamille(exercice.famille, fonctionIntermediaire, cibleFinale(exercice))
    : undefined;
  const champErrone = statutChamp !== undefined && statutChamp !== "correct";
  const montrerErreur = curseurErrone || champErrone;
  const complet = fonctionIntermediaire.trim() !== "";

  const formeCanoniqueComplete = formatGabaritLatex(exercice);
  const fonctionEtape2 = courbeEtape2(exercice);
  const enonceEtape2 = formatGabaritEtape2Latex(exercice);
  const fonctionEtape3 = courbeEtape3(exercice);
  const enonceEtape3 = formatGabaritEtape3Latex(exercice);
  const fonctionEtape4 = courbeEtape4(exercice);
  const enonceEtape4 = formatGabaritEtape4Latex(exercice);
  const live = { ...fonctionEtape4, tv };

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formeCanoniqueComplete} block />
      </div>
      <p className="prompt-text">
        Choisis la translation verticale (<strong>TV</strong>) à partir de <Katex expression={enonceEtape4} />.
      </p>
      <MafsGraphFormeCanoniqueFonctionsReference
        confirmees={[
          { parametres: fonctionEtape2, couleur: COULEUR_BLEU, labelLatex: enonceEtape2 },
          { parametres: fonctionEtape3, couleur: COULEUR_ORANGE, labelLatex: enonceEtape3 },
          { parametres: fonctionEtape4, couleur: COULEUR_VERT, labelLatex: enonceEtape4 },
        ]}
        live={live}
      />
      <div className="curseur-row">
        <label className={curseurErrone ? "curseur-champ is-erronee" : "curseur-champ"} htmlFor="curseur-tv-fr">
          <span>TV : {tv}</span>
          <input id="curseur-tv-fr" type="range" min={-5} max={5} step={1} value={tv} onChange={(e) => setTv(Number(e.target.value))} />
        </label>
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="tv-fr-fonction-intermediaire">
          f(x) =
        </label>
        <input
          id="tv-fr-fonction-intermediaire"
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
        onClick={() => onValider({ tv, fonctionIntermediaire })}
      >
        Valider
      </button>
      {montrerErreur && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquerTvFR(exercice, { tv, fonctionIntermediaire }))}
        </p>
      )}
    </div>
  );
}
