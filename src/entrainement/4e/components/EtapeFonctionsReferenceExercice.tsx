import { useState } from "react";
import type {
  ExerciceFonctionReference,
  ReponseCurseursFonctionReference,
  ReponseFonctionReference,
} from "../core/fonctionsReference.types";
import { diagnostiquerEquationFonctionReference, evaluerCurseursFonctionReference } from "../moteur/verificationFonctionsReference";
import { formatApercuEquation, placeholderEquation } from "../ui/formatFonctionsReference";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { MafsGraphFonctionsReference } from "./MafsGraphFonctionsReference";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFonctionReference;
  recapitulatif: EntreeRecapitulatif[];
  tentativesEquation: number;
  tentativesCurseurs: number;
  tentativesMax: number;
  equationFermee: boolean;
  curseursFermee: boolean;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFonctionReference) => void;
}

const TERMINOLOGIE: { abbr: string; texte: string }[] = [
  { abbr: "TH", texte: "translation horizontale" },
  { abbr: "TV", texte: "translation verticale" },
  { abbr: "SOX", texte: "symétrie orthogonale d'axe Ox" },
  { abbr: "SOY", texte: "symétrie orthogonale d'axe Oy" },
  { abbr: "EV", texte: "étirement vertical" },
  { abbr: "CV", texte: "compression verticale" },
  { abbr: "EH", texte: "étirement horizontal" },
  { abbr: "CH", texte: "compression horizontale" },
];

/**
 * Étape 1 (spec section 2-3) : énoncé, graphe Mafs (courbe cible seule, ou avec la courbe
 * manipulable si l'aide est activée), bouton "?", les 6 curseurs — TH/TV signés [-5,5], comme p/q
 * du chapitre 1, valeur par défaut 0 (prompt-restructuration-formule-th-ch.md, point 2) ;
 * CH/EH/EV/CV entiers positifs [1,5], valeur par défaut 1 (`prompt-croix-et-elargissement-plage.md`,
 * point 2, remis à [1,5] après une réduction temporaire à [1,3] par
 * `prompt-reduction-plage-ch-eh-cv-ev.md`) + 2 toggles (SOX/SOY), l'aperçu en temps réel de l'équation puis le champ
 * libre, un seul bouton "Valider" qui soumet les deux à la fois. Les deux notes
 * ("équation"/"curseurs") évoluent indépendamment côté moteur (voir sessionFonctionsReference.ts)
 * — même patron que EtapeTransformationExercice.tsx
 * (chapitre 1), étendu à 2 curseurs et 1 toggle supplémentaires.
 */
export function EtapeFonctionsReferenceExercice({
  exercice,
  recapitulatif,
  tentativesEquation,
  tentativesCurseurs,
  tentativesMax,
  equationFermee,
  curseursFermee,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [th, setTh] = useState(0);
  const [tv, setTv] = useState(0);
  const [ch, setCh] = useState(1);
  const [eh, setEh] = useState(1);
  const [ev, setEv] = useState(1);
  const [cv, setCv] = useState(1);
  const [sox, setSox] = useState(false);
  const [soy, setSoy] = useState(false);
  const [equation, setEquation] = useState("");
  const [terminologieOuverte, setTerminologieOuverte] = useState(false);

  const curseurs: ReponseCurseursFonctionReference = { th, tv, ch, eh, ev, cv, sox, soy };
  const evaluation = evaluerCurseursFonctionReference(exercice, curseurs);
  const montrerErreursCurseurs = !curseursFermee && tentativesCurseurs > 0;

  const live = aideActivee ? { ...exercice, ...curseurs } : null;

  const boutonValiderDesactive = !equationFermee && equation.trim() === "";
  const statutEquation =
    tentativesEquation > 0 && !equationFermee ? diagnostiquerEquationFonctionReference(exercice, equation) : undefined;

  function classeCurseur(correct: boolean): string {
    return montrerErreursCurseurs && !correct ? "curseur-champ is-erronee" : "curseur-champ";
  }

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">
        Retrouve, par lecture graphique, les paramètres de la transformation, puis écris l'équation complète.
      </p>

      <MafsGraphFonctionsReference cible={exercice} live={live} />

      <div className="transformation-entete">
        <button
          type="button"
          className="btn btn-terminologie"
          onClick={() => setTerminologieOuverte((v) => !v)}
          aria-label="Rappel de la terminologie"
        >
          ?
        </button>
      </div>
      {terminologieOuverte && (
        <ul className="terminologie-liste contenu-conditionnel">
          {TERMINOLOGIE.map((t) => (
            <li key={t.abbr}>
              <strong>{t.abbr}</strong> : {t.texte}
            </li>
          ))}
        </ul>
      )}

      <div className="curseur-row">
        <label className={classeCurseur(evaluation.th)} htmlFor="curseur-th">
          <span>TH : {th}</span>
          <input
            id="curseur-th"
            type="range"
            min={-5}
            max={5}
            step={1}
            value={th}
            disabled={curseursFermee}
            onChange={(e) => setTh(Number(e.target.value))}
          />
        </label>
        <label className={classeCurseur(evaluation.tv)} htmlFor="curseur-tv">
          <span>TV : {tv}</span>
          <input
            id="curseur-tv"
            type="range"
            min={-5}
            max={5}
            step={1}
            value={tv}
            disabled={curseursFermee}
            onChange={(e) => setTv(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="curseur-row">
        <label className={classeCurseur(evaluation.ch)} htmlFor="curseur-ch">
          <span>CH : {ch}</span>
          <input
            id="curseur-ch"
            type="range"
            min={1}
            max={5}
            step={1}
            value={ch}
            disabled={curseursFermee}
            onChange={(e) => setCh(Number(e.target.value))}
          />
        </label>
        <label className={classeCurseur(evaluation.eh)} htmlFor="curseur-eh">
          <span>EH : {eh}</span>
          <input
            id="curseur-eh"
            type="range"
            min={1}
            max={5}
            step={1}
            value={eh}
            disabled={curseursFermee}
            onChange={(e) => setEh(Number(e.target.value))}
          />
        </label>
      </div>
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
            disabled={curseursFermee}
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
            disabled={curseursFermee}
            onChange={(e) => setCv(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="curseur-row">
        <button type="button" className={classeCurseur(evaluation.sox) + " btn"} disabled={curseursFermee} onClick={() => setSox((v) => !v)}>
          {sox ? "SOX : Oui" : "SOX : Non"}
        </button>
        <button type="button" className={classeCurseur(evaluation.soy) + " btn"} disabled={curseursFermee} onClick={() => setSoy((v) => !v)}>
          {soy ? "SOY : Oui" : "SOY : Non"}
        </button>
      </div>

      <div className="template-box">
        <Katex expression={formatApercuEquation(equation)} block />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="fonction-equation">
          f(x) =
        </label>
        <input
          id="fonction-equation"
          className={`text-input${statutEquation !== undefined && statutEquation !== "correct" ? " is-erronee" : ""}`}
          placeholder={placeholderEquation(exercice.famille)}
          value={equation}
          disabled={equationFermee}
          onChange={(e) => setEquation(e.target.value)}
        />
      </div>
      {statutEquation !== undefined && statutEquation !== "correct" && (
        <p className="alert-error" role="alert">
          {statutEquation === "parse_error"
            ? formatMessageErreur(tentativesEquation, tentativesMax, "parse_error")
            : `Équation incorrecte — tentative ${tentativesEquation}/${tentativesMax}, réessaie.`}
        </p>
      )}
      {montrerErreursCurseurs && (
        <p className="alert-error" role="alert">
          Curseurs incorrects (en rouge) — tentative {tentativesCurseurs}/{tentativesMax}, réessaie.
        </p>
      )}

      <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
        {aideActivee ? "Aide utilisée" : "Aide"}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        disabled={boutonValiderDesactive}
        onClick={() => onValider({ equation, curseurs })}
      >
        Valider
      </button>
    </div>
  );
}
