import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionChoix } from "../ui6e/formatContenanceObjets";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranContenance = { type: "champs"; champs: ChampDef[] } | { type: "choix"; options: OptionChoix[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Figure de l'énoncé (silhouette cotée + profil), HTML autonome. */
  figureHtml: string;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranContenance;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Statut champ par champ. */
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  /** Message ciblé (erreur classique reconnue) pour une saisie jugée fausse. */
  piege: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen83` (champs libres OU choix fermé) — structure du chapitre : énoncé (+ figure)
 * → consigne d'écran → bloc de travail → aide → « Valider ». Une saisie ILLISIBLE (`parse_error`)
 * est refusée ici, avant toute soumission : elle ne consomme aucune tentative. Champs jamais
 * filtrés (`type="text"`, sans `inputMode`) ; seule `normaliserSigneMoins` est appliquée. Rendu par
 * `App6gen83.tsx` avec une `key` qui change à chaque écran et à chaque nouvel exercice.
 */
export function EtapeContenanceObjets({
  consigneGenerale,
  blocDonnees,
  figureHtml,
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
  piege,
  validation,
}: Props) {
  const nombre = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombre }, () => ""));
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);
  const statuts = soumises && tentativesUtilisees > 0 ? diagnostiquer(soumises) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

  function changer(i: number, v: string) {
    setValeurs((prev) => prev.map((x, j) => (j === i ? v : x)));
    setErreurLecture(false);
  }

  function valider() {
    if (!toutRempli) return;
    const normalisees = valeurs.map((v) => normaliserSigneMoins(v));
    if (diagnostiquer(normalisees).includes("parse_error")) {
      setErreurLecture(true);
      return;
    }
    setSoumises(normalisees);
    onValider(normalisees);
  }

  const message = !validation && statuts && !statuts.every((s) => s === "correct") ? formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent") : null;
  const messagePiege = message && soumises ? piege(soumises) : null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          blocDonnees.length > 0 ? (
            <div className="equation-box">
              <div className="equation-box-donnees">
                {blocDonnees.map((frag, i) => (
                  <Katex key={i} expression={frag} block />
                ))}
              </div>
            </div>
          ) : null
        }
      />
      <div style={{ margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: figureHtml }} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champs" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          {mode.champs.map((champ, i) => (
            <div key={i} style={{ flex: champ.expression ? "1 1 100%" : "1 1 120px", minWidth: 0 }}>
              {champ.expression && <ApercuExpressionLatex texte={valeurs[i]} label={champ.label} />}
              <div className="field">
                <label className="field-label field-label-minuscule">{champ.labelLatex ? <Katex expression={champ.labelLatex} /> : champ.label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="text"
                    className={`text-input ${statuts && statuts[i] !== "correct" ? "is-erronee" : ""}`}
                    style={{ flex: 1, minWidth: 0 }}
                    value={valeurs[i]}
                    placeholder={champ.placeholder}
                    disabled={!!validation}
                    onChange={(ev) => changer(i, ev.target.value)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && !validation) valider();
                    }}
                  />
                  {champ.unite && <span>{champ.unite}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${validation?.revele && valeurs[0] === option.id ? "is-erronee" : ""}`}
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
          {erreurLecture && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")} Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && message && (
            <p className="alert-error" role="alert">
              {message}
              {messagePiege ? ` ${messagePiege}` : ""}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
