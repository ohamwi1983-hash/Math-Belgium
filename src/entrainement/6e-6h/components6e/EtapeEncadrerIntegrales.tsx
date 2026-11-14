import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionChoix } from "../ui6e/formatEncadrerIntegrales";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranEncadrer = { type: "champs"; champs: ChampDef[] } | { type: "choix"; options: OptionChoix[] };

const MESSAGE_SAISIE_ILLISIBLE = "Écriture non reconnue — vérifie ta saisie (parenthèses, opérateurs, virgule décimale). Aucune tentative n'est décomptée.";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Figure (chaîne SVG autonome) sous les données, `null` si elle trahirait la réponse. */
  figureSvg: string | null;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranEncadrer;
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
  /** Message ciblé après une réponse fausse (min et max inversés, oubli de b − a…). */
  messageSpecifique: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen79` (champs libres OU choix fermé) — même structure que l'écran de 6gen76
 * (`EtapeParadoxesProbabilites`) : consigne générale → données (+ figure) → consigne de l'écran →
 * bloc de travail → aide → « Valider ». Choix fermé : une seule tentative, boutons
 * `.btn.toggle-active`. Saisie illisible : message de syntaxe, AUCUNE tentative décomptée (modèle
 * `EtapeChampsComplexesAvances`). `App6gen79.tsx` le rend avec une `key` qui change à chaque écran
 * ET à chaque nouvel exercice (saisie remise à vide).
 */
export function EtapeEncadrerIntegrales({
  consigneGenerale,
  blocDonnees,
  figureSvg,
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
  const [valeursSoumises, setValeursSoumises] = useState<string[] | null>(null);
  const [saisieIllisible, setSaisieIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0 && valeursSoumises !== null;
  const statuts = montrerErreurs && valeursSoumises ? diagnostiquer(valeursSoumises) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const message = montrerErreurs && valeursSoumises ? messageSpecifique(valeursSoumises) : null;

  function changer(index: number, valeur: string) {
    setSaisieIllisible(false);
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  function valider() {
    if (!toutRempli) return;
    if (mode.type === "champs" && diagnostiquer(valeurs).includes("parse_error")) {
      setSaisieIllisible(true);
      return;
    }
    setSaisieIllisible(false);
    setValeursSoumises(valeurs);
    onValider(valeurs);
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
      {figureSvg && <div className="figure-encadrer-integrales" style={{ textAlign: "center", margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: figureSvg }} />}
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champs" ? (
        <div>
          {mode.champs.map((champ, i) => (
            <div className="field" key={i}>
              <ApercuExpressionLatex texte={valeurs[i]} label={champ.label} />
              <label className="field-label field-label-minuscule" htmlFor={`champ-6gen79-${i}`}>
                {champ.label}
              </label>
              <input
                id={`champ-6gen79-${i}`}
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
      ) : (
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
