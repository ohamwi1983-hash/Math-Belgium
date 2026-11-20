import { useState } from "react";
import type { ExerciceTransformationGraphique, ReponseCurseurs, ReponseTransformationGraphique } from "../core/transformationsGraphiques.types";
import { diagnostiquerEquationTransformation } from "../moteur/verificationTransformationsGraphiques";
import { parametresDepuisCurseurs, parametresDepuisExercice } from "../ui/mafsTransformation";
import { formatApercuEquation } from "../ui/formatTransformationsGraphiques";
import { MafsGraphTransformation } from "./MafsGraphTransformation";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { RenduFragments } from "./RenduFragments";
import { aidesTransformation, messageCurseurs, messageEquationTransformation, MESSAGE_FONCTION_ILLISIBLE } from "../ui/aidesParabole";

interface Props {
  exercice: ExerciceTransformationGraphique;
  tentativesEquation: number;
  tentativesCurseurs: number;
  tentativesMax: number;
  equationFermee: boolean;
  curseursFermee: boolean;
  /** Choix fermé SOX déjà joué (une seule tentative) et son verdict. */
  soxFerme: boolean;
  soxRevele: boolean;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTransformationGraphique) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const TERMINOLOGIE: { abbr: string; texte: string }[] = [
  { abbr: "TH", texte: "translation horizontale" },
  { abbr: "TV", texte: "translation verticale" },
  { abbr: "SOX", texte: "symétrie orthogonale d'axe Ox" },
  { abbr: "EV", texte: "étirement vertical" },
  { abbr: "CV", texte: "compression verticale" },
];

/**
 * Écran unique de l'exercice : graphique, curseurs TH, TV, EV, CV, choix fermé « symétrie d'axe
 * Ox ? », puis l'équation. Trois notes indépendantes côté moteur (`sessionTransformationsGraphiques`) :
 * curseurs (3 tentatives), SOX (1 tentative, audit 4e ch. 1, R6) et équation (3 tentatives). Règles
 * communes (lot B) : aucune correction case par case avant la clôture (un message ciblé dit où
 * regarder), une équation illisible n'est jamais transmise (aucune tentative consommée), « − »
 * accepté, aides à deux niveaux (le niveau 2 affiche la courbe pilotée par les curseurs).
 */
export function EtapeTransformationExercice({
  exercice,
  tentativesEquation,
  tentativesCurseurs,
  tentativesMax,
  equationFermee,
  curseursFermee,
  soxFerme,
  soxRevele,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [th, setTh] = useState(0);
  const [tv, setTv] = useState(0);
  const [ev, setEv] = useState(1);
  const [cv, setCv] = useState(1);
  const [sox, setSox] = useState<boolean | null>(null);
  const [equation, setEquation] = useState("");
  const [terminologieOuverte, setTerminologieOuverte] = useState(false);
  const [niveauAide, setNiveauAide] = useState(0);
  const saisie = useTentativeLisible<ReponseTransformationGraphique>();

  const curseurs: ReponseCurseurs = { th, tv, ev, cv, sox: sox ?? false };
  const cible = parametresDepuisExercice(exercice);
  const live = niveauAide >= 2 ? parametresDepuisCurseurs(curseurs) : null;

  const pret = (equationFermee || equation.trim() !== "") && (soxFerme || sox !== null);
  const lisible = equationFermee || diagnostiquerEquationTransformation(exercice, equation) !== "parse_error";
  const bloque = !!validation;

  const curseur = (id: string, nom: string, valeur: number, min: number, max: number, maj: (v: number) => void) => (
    <label className="curseur-champ" htmlFor={id}>
      <span>
        {nom} : {String(valeur).replace("-", "−")}
      </span>
      <input id={id} type="range" min={min} max={max} step={1} value={valeur} disabled={curseursFermee || bloque} onChange={(e) => maj(Number(e.target.value))} />
    </label>
  );

  const soumise = saisie.soumise;
  const cibleCurseurs = soumise && !curseursFermee && tentativesCurseurs > 0 ? messageCurseurs(exercice, soumise.curseurs) : null;
  const cibleEquation = soumise && !equationFermee && tentativesEquation > 0 ? messageEquationTransformation(exercice, soumise.equation) : null;

  return (
    <div>
      <p className="prompt-text">Retrouve, par lecture graphique, les paramètres de la transformation, puis écris l'équation complète.</p>

      <MafsGraphTransformation cible={cible} live={live} />

      <div className="transformation-entete">
        <button type="button" className="btn btn-terminologie" onClick={() => setTerminologieOuverte((v) => !v)} aria-label="Rappel de la terminologie">
          ?
        </button>
      </div>
      {terminologieOuverte && (
        <div className="contenu-conditionnel">
          <ul className="terminologie-liste">
            {TERMINOLOGIE.map((t) => (
              <li key={t.abbr}>
                <strong>{t.abbr}</strong> : {t.texte}
              </li>
            ))}
          </ul>
          <p className="prompt-fact">
            EV et CV se combinent : seul leur rapport EV / CV compte, il représente <Katex expression="|a|" />. Plusieurs réglages peuvent donc être corrects (EV = 2 et CV = 4
            équivaut à EV = 1 et CV = 2).
          </p>
        </div>
      )}

      <div className="curseur-row">
        {curseur("curseur-th", "TH", th, -5, 5, setTh)}
        {curseur("curseur-tv", "TV", tv, -5, 5, setTv)}
      </div>
      <div className="curseur-row">
        {curseur("curseur-ev", "EV", ev, 1, 5, setEv)}
        {curseur("curseur-cv", "CV", cv, 1, 5, setCv)}
      </div>

      <p className="prompt-text prompt-text--question-multiple">La parabole a-t-elle subi une symétrie d'axe Ox (SOX) ?</p>
      <div className="options-grid-compact">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            className={`btn${sox === v ? " toggle-active" : ""}${soxFerme && soxRevele && sox === v ? " is-erronee" : ""}`}
            disabled={soxFerme || bloque}
            onClick={() => setSox(v)}
          >
            {v ? "Oui, symétrie d'axe Ox" : "Non, pas de symétrie"}
          </button>
        ))}
      </div>
      {soxFerme && !bloque && (
        <p className={soxRevele ? "alert-error" : "alert-success"} role="status">
          {soxRevele ? `Symétrie : ce n'était pas le bon choix — la parabole ${exercice.sox ? "a" : "n'a pas"} subi de symétrie d'axe Ox.` : "Symétrie : bonne réponse."}
        </p>
      )}

      <div className="template-box">
        <Katex expression={formatApercuEquation(equation)} block />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="transfo-equation">
          f(x) =
        </label>
        <input
          id="transfo-equation"
          className={`text-input${tentativesEquation > 0 && !equationFermee ? " is-erronee" : ""}`}
          placeholder="ex : 7/6(x-8)^2+9"
          value={equation}
          disabled={equationFermee || bloque}
          onChange={(e) => setEquation(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <>
          <AidesNiveaux aides={aidesTransformation()} onPremiereAide={onActiverAide} onNiveau={setNiveauAide} />
          <button type="button" className="btn btn-primary" disabled={!pret} onClick={() => saisie.tenter({ equation, curseurs }, lisible, onValider)}>
            Valider
          </button>
          {saisie.illisible ? (
            <MessageRetour illisible tentativesUtilisees={0} tentativesMax={tentativesMax} texteIllisible={MESSAGE_FONCTION_ILLISIBLE} />
          ) : (
            <>
              {tentativesEquation > 0 && !equationFermee && (
                <p className="alert-error" role="alert">
                  <span>
                    {cibleEquation && (
                      <>
                        <RenduFragments fragments={cibleEquation} />{" "}
                      </>
                    )}
                    Équation incorrecte — tentative {tentativesEquation}/{tentativesMax}, réessaie.
                  </span>
                </p>
              )}
              {tentativesCurseurs > 0 && !curseursFermee && (
                <p className="alert-error" role="alert">
                  <span>
                    {cibleCurseurs && (
                      <>
                        <RenduFragments fragments={cibleCurseurs} />{" "}
                      </>
                    )}
                    Curseurs incorrects (TH, TV ou rapport EV/CV) — tentative {tentativesCurseurs}/{tentativesMax}, réessaie.
                  </span>
                </p>
              )}
            </>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
