import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampOptimiser, FragmentConsigne, OptionNature } from "../ui6e/formatOptimiserModeleLog";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranOptimiser =
  | { type: "domaine"; nom: string }
  | { type: "champ"; champ: ChampOptimiser }
  | { type: "deuxChamps"; champs: [ChampOptimiser, ChampOptimiser] }
  | { type: "choix"; options: OptionNature[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranOptimiser;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Message d'une saisie qui NE consomme PAS de tentative (illisible, ou approchée quand la valeur
   * exacte est demandée) ; `null` si la saisie peut être soumise. */
  messageSaisie: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

function nombreChamps(mode: ModeEcranOptimiser): number {
  return mode.type === "domaine" ? 4 : mode.type === "deuxChamps" ? 2 : 1;
}

/**
 * Écran unique de `6gen91` — structure du chantier : consigne générale → données → consigne de
 * l'écran → bloc de travail → aide → « Valider ». Quatre formes de bloc de travail : intervalle
 * (deux crochets à choisir + deux bornes libres), un champ, deux champs (optimum et valeur en
 * contexte), choix fermé (une seule tentative). Saisie libre jamais filtrée (pas d'`inputMode`,
 * pas de `type="number"`) ; une saisie illisible ou approchée (valeur exacte demandée) affiche un
 * message SANS appeler `onValider`. `App6gen91.tsx` change la `key` à chaque écran ET à chaque
 * nouvel exercice (saisie remise à vide).
 */
export function EtapeOptimiserModeleLog({
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
  messageSaisie,
  validation,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreChamps(mode) }, () => ""));
  const [message, setMessage] = useState<string | null>(null);
  const rempli = valeurs.every((v) => v.trim() !== "");
  const montrerErreur = tentativesUtilisees > 0 || message !== null;
  const erronee = tentativesUtilisees > 0 && !validation;

  function changer(i: number, v: string) {
    setValeurs((anciennes) => anciennes.map((a, j) => (j === i ? v : a)));
    setMessage(null);
  }

  function valider() {
    if (!rempli) return;
    const m = messageSaisie(valeurs);
    if (m !== null) {
      setMessage(m);
      return;
    }
    onValider(valeurs);
  }

  function champTexte(i: number, champ: ChampOptimiser) {
    return (
      <>
        {champ.expression && <ApercuExpressionLatex texte={valeurs[i]} />}
        <div className="field">
          <label className="field-label field-label-minuscule">
            <RenduFragments fragments={champ.label} />
          </label>
          <input
            type="text"
            className={`text-input ${erronee ? "is-erronee" : ""}`}
            value={valeurs[i]}
            placeholder={champ.placeholder}
            disabled={!!validation}
            onChange={(e) => changer(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") valider();
            }}
          />
        </div>
      </>
    );
  }

  function crochet(i: number, libelle: string) {
    return (
      <span className="select-souligne-wrap">
        <select className={`ce-select${erronee ? " is-erronee" : ""}`} aria-label={libelle} value={valeurs[i]} disabled={!!validation} onChange={(e) => changer(i, e.target.value)}>
          <option value="" disabled>
            …
          </option>
          <option value="[">[</option>
          <option value="]">]</option>
        </select>
      </span>
    );
  }

  function borne(i: number, libelle: string) {
    return (
      <input
        type="text"
        aria-label={libelle}
        className={`text-input ${erronee ? "is-erronee" : ""}`}
        style={{ width: "5.5rem", minWidth: 0, textAlign: "center" }}
        value={valeurs[i]}
        placeholder="borne"
        disabled={!!validation}
        onChange={(e) => changer(i, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") valider();
        }}
      />
    );
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
      {mode.type === "domaine" && (
        <div className="field">
          <span className="field-label field-label-minuscule">
            Domaine de <Katex expression={mode.nom} /> :
          </span>
          <div className="ce-ligne-champs" style={{ flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
            {crochet(0, "Crochet gauche")}
            {borne(1, "Borne gauche")}
            <span aria-hidden="true">;</span>
            {borne(2, "Borne droite")}
            {crochet(3, "Crochet droit")}
          </div>
        </div>
      )}
      {mode.type === "champ" && champTexte(0, mode.champ)}
      {mode.type === "deuxChamps" && (
        <>
          {champTexte(0, mode.champs[0])}
          {champTexte(1, mode.champs[1])}
        </>
      )}
      {mode.type === "choix" && (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${tentativesUtilisees > 0 && valeurs[0] === option.id ? "is-erronee" : ""}`}
              style={{ maxWidth: "100%", whiteSpace: "normal", textAlign: "left" }}
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
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && aideNiveau2.texte && (
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
          <button type="button" className="btn btn-primary" disabled={!rempli} onClick={valider}>
            Valider
          </button>
          {montrerErreur && (
            <p className="alert-error" role="alert">
              {message ?? formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent")}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
