import { useState } from "react";
import type { ExerciceTransformationGraphique, ReponseCurseurs, ReponseTransformationGraphique } from "../core/transformationsGraphiques.types";
import { evaluerCurseurs } from "../moteur/verificationTransformationsGraphiques";
import { parametresDepuisCurseurs, parametresDepuisExercice } from "../ui/mafsTransformation";
import { formatApercuEquation } from "../ui/formatTransformationsGraphiques";
import { MafsGraphTransformation } from "./MafsGraphTransformation";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceTransformationGraphique;
  tentativesEquation: number;
  tentativesCurseurs: number;
  tentativesMax: number;
  equationFermee: boolean;
  curseursFermee: boolean;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTransformationGraphique) => void;
}

const TERMINOLOGIE: { abbr: string; texte: string }[] = [
  { abbr: "TH", texte: "translation horizontale" },
  { abbr: "TV", texte: "translation verticale" },
  { abbr: "SOX", texte: "symétrie orthogonale d'axe Ox" },
  { abbr: "EV", texte: "étirement vertical" },
  { abbr: "CV", texte: "compression verticale" },
];

/**
 * Écran unique de l'exercice (section 2 de la spec) : énoncé, graphe Mafs (courbe cible seule, ou
 * avec la courbe manipulable si l'aide est activée), bouton "?", les 4 curseurs + le toggle SOX,
 * l'aperçu en temps réel de l'équation puis le champ équation libre, un seul bouton "Valider" qui
 * soumet les deux à la fois — ordre imposé par la correction 3 du prompt (énoncé → graphe → "?" →
 * curseurs). Les deux notes ("équation"/"curseurs") évoluent indépendamment côté moteur (voir
 * sessionTransformationsGraphiques.ts) : une fois l'une des deux closes, ses champs sont désactivés
 * ici mais restent affichés (l'élève continue de travailler l'autre note jusqu'à ce qu'elle se
 * résolve aussi).
 */
export function EtapeTransformationExercice({
  exercice,
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
  const [ev, setEv] = useState(1);
  const [cv, setCv] = useState(1);
  const [sox, setSox] = useState(false);
  const [equation, setEquation] = useState("");
  const [terminologieOuverte, setTerminologieOuverte] = useState(false);

  const curseurs: ReponseCurseurs = { th, tv, ev, cv, sox };
  const evaluation = evaluerCurseurs(exercice, curseurs);
  const montrerErreursCurseurs = !curseursFermee && tentativesCurseurs > 0;

  const cible = parametresDepuisExercice(exercice);
  const live = aideActivee ? parametresDepuisCurseurs(curseurs) : null;

  const boutonValiderDesactive = !equationFermee && equation.trim() === "";
  const equationErronee = tentativesEquation > 0 && !equationFermee;

  function classeCurseur(correct: boolean): string {
    return montrerErreursCurseurs && !correct ? "curseur-champ is-erronee" : "curseur-champ";
  }

  return (
    <div>
      <p className="prompt-text">
        Retrouve, par lecture graphique, les paramètres de la transformation, puis écris l'équation complète.
      </p>

      <MafsGraphTransformation cible={cible} live={live} />

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

      <button
        type="button"
        className={classeCurseur(evaluation.sox) + " btn"}
        disabled={curseursFermee}
        onClick={() => setSox((v) => !v)}
      >
        {sox ? "SOX : Oui" : "SOX : Non"}
      </button>

      <div className="template-box">
        <Katex expression={formatApercuEquation(equation)} block />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="transfo-equation">
          f(x) =
        </label>
        <input
          id="transfo-equation"
          className={`text-input${equationErronee ? " is-erronee" : ""}`}
          placeholder="ex : 2(x-3)^2+1"
          value={equation}
          disabled={equationFermee}
          onChange={(e) => setEquation(e.target.value)}
        />
      </div>
      {tentativesEquation > 0 && !equationFermee && (
        <p className="alert-error" role="alert">
          Équation incorrecte — tentative {tentativesEquation}/{tentativesMax}, réessaie.
        </p>
      )}
      {montrerErreursCurseurs && (
        <p className="alert-error" role="alert">
          Curseurs incorrects (en rouge) — tentative {tentativesCurseurs}/{tentativesMax}, réessaie.
        </p>
      )}

      <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
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
