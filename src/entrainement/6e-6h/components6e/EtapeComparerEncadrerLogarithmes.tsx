import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionChoix } from "../ui6e/formatComparerEncadrerLogarithmes";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranComparerLog =
  | { type: "champs"; champs: ChampDef[] }
  | { type: "choix"; options: OptionChoix[] }
  /** Ranger : l'élève touche les nombres du plus petit au plus grand ; valeur « 2,0,3,1 ». */
  | { type: "ordre"; options: OptionChoix[] };

const MESSAGE_SAISIE_ILLISIBLE =
  "Écriture non reconnue — écris un nombre (entier, décimal avec une virgule, fraction ou puissance), sans logarithme. Aucune tentative n'est décomptée.";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranComparerLog;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Statut champ par champ : seuls les champs faux sont marqués. */
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  /** Message ciblé après une réponse fausse (exposants au lieu des puissances, sens inversé…). */
  messageSpecifique: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen86` — même structure que `EtapeEncadrerIntegrales` (6gen79) : consigne
 * générale → données → consigne de l'écran → bloc de travail → aide → « Valider ». Trois blocs de
 * travail : champs libres (libellés en LaTeX, aperçu de la saisie, aucune restriction de frappe),
 * choix fermé (une tentative), ou ORDRE (ranger) : l'élève touche les quatre nombres du plus petit au
 * plus grand, chaque bouton touché reçoit son rang, « Effacer » recommence ; « Valider » quand les
 * quatre sont rangés (une seule tentative, comme un choix fermé). `App6gen86.tsx` le rend avec une
 * `key` qui change à chaque écran ET à chaque nouvel exercice (saisie remise à vide).
 */
export function EtapeComparerEncadrerLogarithmes({
  consigneGenerale,
  blocDonnees,
  consigneEcran,
  mode,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  messageSpecifique,
  validation,
}: Props) {
  const nombreChamps = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreChamps }, () => ""));
  const [ordre, setOrdre] = useState<string[]>([]);
  const [valeursSoumises, setValeursSoumises] = useState<string[] | null>(null);
  const [saisieIllisible, setSaisieIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0 && valeursSoumises !== null;
  const statuts = montrerErreurs && valeursSoumises ? diagnostiquer(valeursSoumises) : null;
  const valeursCourantes = mode.type === "ordre" ? [ordre.join(",")] : valeurs;
  const toutRempli = mode.type === "ordre" ? ordre.length === mode.options.length : valeurs.every((v) => v.trim() !== "");
  const message = montrerErreurs && valeursSoumises ? messageSpecifique(valeursSoumises) : null;

  function changer(index: number, valeur: string) {
    setSaisieIllisible(false);
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  function toucher(id: string) {
    setOrdre((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function valider() {
    if (!toutRempli) return;
    if (mode.type === "champs" && diagnostiquer(valeurs).includes("parse_error")) {
      setSaisieIllisible(true);
      return;
    }
    setSaisieIllisible(false);
    setValeursSoumises(valeursCourantes);
    onValider(valeursCourantes);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} block />
              ))}
            </div>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champs" && (
        <div>
          {mode.champs.map((champ, i) => (
            <div className="field" key={i}>
              <ApercuExpressionLatex texte={valeurs[i]} />
              <label className="field-label field-label-minuscule" htmlFor={`champ-6gen86-${i}`}>
                <Katex expression={champ.labelLatex} />
              </label>
              <input
                id={`champ-6gen86-${i}`}
                type="text"
                className={`text-input ${statuts && statuts[i] !== "correct" ? "is-erronee" : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={!!validation}
                onChange={(e) => changer(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
      {mode.type === "choix" && (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${statuts && valeurs[0] === option.id && statuts[0] !== "correct" ? "is-erronee" : ""}`}
              disabled={!!validation}
              onClick={() => changer(0, option.id)}
            >
              <span>
                <RenduFragments fragments={option.fragments} />
              </span>
            </button>
          ))}
        </div>
      )}
      {mode.type === "ordre" && (
        <div>
          <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {mode.options.map((option) => {
              const rang = ordre.indexOf(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`btn ${rang >= 0 ? "toggle-active" : ""} ${statuts && statuts[0] !== "correct" && rang >= 0 ? "is-erronee" : ""}`}
                  disabled={!!validation || rang >= 0}
                  onClick={() => toucher(option.id)}
                  aria-label={rang >= 0 ? `rang ${rang + 1}` : undefined}
                >
                  <span>
                    {rang >= 0 && <strong>{rang + 1}. </strong>}
                    <RenduFragments fragments={option.fragments} />
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ minHeight: "2.6em", margin: "12px 0", textAlign: "center", overflowX: "auto" }}>
            {ordre.length > 0 ? (
              <Katex expression={ordre.map((id) => mode.options.find((o) => o.id === id)?.fragments.map((f) => f.valeur).join("") ?? "").join("<") + (ordre.length < mode.options.length ? "<\\ldots" : "")} />
            ) : (
              "Ton ordre s'affichera ici."
            )}
          </div>
          {!validation && (
            <button type="button" className="btn" disabled={ordre.length === 0} onClick={() => setOrdre([])}>
              Effacer
            </button>
          )}
        </div>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
            Valider
          </button>
          {saisieIllisible ? (
            <p className="alert-error" role="alert">
              {MESSAGE_SAISIE_ILLISIBLE}
            </p>
          ) : (
            montrerErreurs && (
              <p className="alert-error" role="alert">
                {formatMessageErreur(tentativesUtilisees, tentativesMax)}
                {message ? ` ${message}` : ""}
              </p>
            )
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
