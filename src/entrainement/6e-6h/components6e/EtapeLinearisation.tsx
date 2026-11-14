import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionChoix } from "../ui6e/formatLinearisation";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranLinearisation = { type: "champs"; champs: ChampDef[] } | { type: "choix"; options: OptionChoix[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Tableau des mesures (HTML autonome, KaTeX pré-rendu). */
  tableauHtml: string;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranLinearisation;
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
  /** Message ciblé sur une erreur classique (log décimal, pente inversée, k = p…). */
  piege: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen89` (champs libres OU choix fermé) — même structure que `EtapeLorenzGini`
 * (6gen82) : consigne générale et tableau des mesures (bandeau « Énoncé ») → consigne de l'écran →
 * bloc de travail → aide → « Valider ». Une saisie illisible (`parse_error`) n'est PAS soumise :
 * message de lecture, aucune tentative consommée. Choix fermé : une seule tentative. Aucun filtre de
 * frappe (`type="text"`, pas d'`inputMode`). `App6gen89.tsx` le rend avec une `key` qui change à
 * chaque écran ET à chaque nouvel exercice (champs vides).
 */
export function EtapeLinearisation({
  consigneGenerale,
  tableauHtml,
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
  const nombreChamps = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreChamps }, () => ""));
  const [statutsSoumis, setStatutsSoumis] = useState<StatutVerification[] | null>(null);
  const [messagePiege, setMessagePiege] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0 && statutsSoumis !== null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const gele = !!validation;

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
    setErreurLecture(false);
  }

  function valider() {
    if (!toutRempli) return;
    const statuts = diagnostiquer(valeurs);
    if (statuts.includes("parse_error")) {
      setErreurLecture(true);
      return;
    }
    setErreurLecture(false);
    setStatutsSoumis(statuts);
    setMessagePiege(statuts.every((s) => s === "correct") ? null : piege(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale} />} blocDonnees={<div dangerouslySetInnerHTML={{ __html: tableauHtml }} />} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champs" ? (
        <div>
          {mode.champs.map((champ, i) => (
            <div key={i}>
              {/* Aperçu seulement pour une expression à mettre en forme (ln, fraction, e…), pas pour un décimal. */}
              {/[^\d\s,.−-]/.test(valeurs[i]) && <ApercuExpressionLatex texte={valeurs[i]} />}
              <div className="field">
                <label className="field-label field-label-minuscule">{champ.labelLatex ? <Katex expression={champ.labelLatex} /> : champ.label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="text"
                    aria-label={champ.label}
                    className={`text-input ${montrerErreurs && statutsSoumis[i] !== "correct" ? "is-erronee" : ""}`}
                    style={{ flex: 1, minWidth: 0 }}
                    value={valeurs[i]}
                    placeholder={champ.placeholder}
                    disabled={gele}
                    onChange={(e) => changer(i, e.target.value)}
                  />
                  {champ.unite && <span style={{ whiteSpace: "nowrap" }}>{champ.unite}</span>}
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
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${montrerErreurs && valeurs[0] === option.id && statutsSoumis[0] !== "correct" ? "is-erronee" : ""}`}
              disabled={gele}
              onClick={() => changer(0, option.id)}
              style={{ textAlign: "left", whiteSpace: "normal" }}
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
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")} Aucune tentative n'a été comptée.
            </p>
          )}
          {!erreurLecture && montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent")}
              {messagePiege ? ` ${messagePiege}` : ""}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
