import { useState } from "react";
import type { ExerciceFormeCanoniqueTransformation, ReponseTv } from "../core/formeCanoniqueTransformations.types";
import { calculerA } from "../moteur/verificationTransformationsGraphiques";
import { diagnostiquerTv, fonctionCanoniqueReelle } from "../moteur/verificationFormeCanoniqueTransformations";
import { fonctionCanoniqueVersParametresCourbe, formatFonctionCanoniqueLatex } from "../ui/formatFormeCanoniqueTransformations";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { MafsGraphFormeCanoniqueTransformations } from "./MafsGraphFormeCanoniqueTransformations";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueTransformation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseTv) => void;
}

const COULEUR_ORANGE = "#f08c00";
const COULEUR_VERT = "#2f9e44";

/**
 * Étape 4 — Translation verticale (section 4 de la refonte), dernière étape : le graphe part de
 * a(x-xS)² (fonction confirmée à l'étape précédente) vers la fonction finale a(x-xS)²+yS. Les DEUX
 * courbes déjà confirmées restent affichées simultanément pendant toute la durée de cet écran, pour
 * que l'élève voie la construction complète (les 3 transformations successives) superposée au
 * graphe : translation seule (écran 2, orange) et translation+étirement/compression/symétrie (écran
 * 3, vert), chacune légendée avec son expression réelle en forme canonique.
 */
export function EtapeTv({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [tv, setTv] = useState(0);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const montrerErreur = tentativesUtilisees > 0 && tv !== exercice.yS;
  const complet = fonctionIntermediaire.trim() !== "";
  const aReel = calculerA(exercice);
  const statut = tentativesUtilisees > 0 ? diagnostiquerTv(exercice, { tv, fonctionIntermediaire }) : undefined;
  const fonctionErronee = statut !== undefined && statut !== "correct";

  const formeCanoniqueComplete = formatFonctionCanoniqueLatex(fonctionCanoniqueReelle(exercice, exercice.yS));
  const fonctionTh = { numA: 1, denA: 1, p: exercice.xS, q: 0 };
  const fonctionEvCvSox = fonctionCanoniqueReelle(exercice, 0);
  const fonctionEvCvSoxLatex = formatFonctionCanoniqueLatex(fonctionEvCvSox);

  const confirmeeTh = { parametres: fonctionCanoniqueVersParametresCourbe(fonctionTh), couleur: COULEUR_ORANGE, labelLatex: formatFonctionCanoniqueLatex(fonctionTh) };
  const confirmeeEvCvSox = { parametres: fonctionCanoniqueVersParametresCourbe(fonctionEvCvSox), couleur: COULEUR_VERT, labelLatex: fonctionEvCvSoxLatex };
  const live = { p: exercice.xS, q: tv, a: aReel };

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formeCanoniqueComplete} block />
      </div>
      <p className="prompt-text">
        Choisis la translation verticale (<strong>TV</strong>) à partir de <Katex expression={fonctionEvCvSoxLatex} />.
      </p>
      <MafsGraphFormeCanoniqueTransformations confirmees={[confirmeeTh, confirmeeEvCvSox]} live={live} />
      <div className="curseur-row">
        <label className={montrerErreur ? "curseur-champ is-erronee" : "curseur-champ"} htmlFor="curseur-tv">
          <span>TV : {tv}</span>
          <input
            id="curseur-tv"
            type="range"
            min={-5}
            max={5}
            step={1}
            value={tv}
            onChange={(e) => setTv(Number(e.target.value))}
          />
        </label>
      </div>
      <ApercuExpressionLatex texte={fonctionIntermediaire} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="tv-fonction-intermediaire">
          f(x) =
        </label>
        <input
          id="tv-fonction-intermediaire"
          className={`text-input${fonctionErronee ? " is-erronee" : ""}`}
          placeholder="ex : -3/2(x+4)^2+2"
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
      {statut !== undefined && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
