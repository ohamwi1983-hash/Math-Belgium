import { useState } from "react";
import type { ExerciceFormeCanoniqueTransformation, ReponseTv } from "../core/formeCanoniqueTransformations.types";
import { calculerA } from "../moteur/verificationTransformationsGraphiques";
import { diagnostiquerTv, fonctionCanoniqueReelle } from "../moteur/verificationFormeCanoniqueTransformations";
import { fonctionCanoniqueVersParametresCourbe, formatFonctionCanoniqueLatex } from "../ui/formatFormeCanoniqueTransformations";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesTv, messageTranslation, MESSAGE_FONCTION_ILLISIBLE } from "../ui/aidesParabole";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { MafsGraphFormeCanoniqueTransformations } from "./MafsGraphFormeCanoniqueTransformations";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceFormeCanoniqueTransformation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseTv) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
export function EtapeTv({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [tv, setTv] = useState(0);
  const [fonctionIntermediaire, setFonctionIntermediaire] = useState("");

  const saisie = useTentativeLisible<ReponseTv>();
  const complet = fonctionIntermediaire.trim() !== "";
  const lisible = diagnostiquerTv(exercice, { tv, fonctionIntermediaire }) !== "parse_error";
  const aReel = calculerA(exercice);
  const fonctionErronee = tentativesUtilisees > 0 && !validation;

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
        <label className="curseur-champ" htmlFor="curseur-tv">
          <span>TV : {String(tv).replace("-", "−")}</span>
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
          placeholder="ex : -7/6(x+8)^2+9"
          value={fonctionIntermediaire}
          onChange={(e) => setFonctionIntermediaire(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!validation && (
        <>
        <AidesNiveaux aides={aidesTv()} />
        <button
          type="button"
          className="btn btn-primary"
          disabled={!complet}
          onClick={() => saisie.tenter({ tv, fonctionIntermediaire }, lisible, onValider)}
        >
          Valider
        </button>
        <MessageRetour
          illisible={saisie.illisible}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          texteIllisible={MESSAGE_FONCTION_ILLISIBLE}
          cible={saisie.soumise ? messageTranslation(exercice.yS, saisie.soumise.tv, "verticale") : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
