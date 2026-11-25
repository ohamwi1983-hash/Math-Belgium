import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionNature } from "../ui6e/formatImpedances";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteInsistance } from "../../components/TexteInsistance";

export type ModeEcranImpedances = { type: "champs"; champs: ChampDef[] } | { type: "choix"; options: OptionNature[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Schéma du circuit (SVG autonome, données seulement). */
  schemaSvg: string;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranImpedances;
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
  /** Message qui arrête la soumission (illisible, radians, arrondi trop grossier…) — aucune tentative consommée. */
  controle: (valeurs: string[]) => string | null;
  /** Message ciblé sur une erreur classique (signe de 1/j, mH non converti, inverses oubliés…). */
  piege: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen96` — consigne générale + schéma du circuit → consigne de l'écran → champs
 * libres (jamais filtrés : ni `inputMode`, ni `type="number"`) OU choix fermé (une seule tentative,
 * décidé par la session) → aide → « Valider ». Un refus de `controle` n'est PAS soumis : message,
 * aucune tentative consommée. `App6gen96.tsx` change la `key` à chaque écran ET à chaque nouvel
 * exercice (saisie remise à vide).
 */
export function EtapeImpedances({
  consigneGenerale,
  schemaSvg,
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
  controle,
  piege,
  validation,
}: Props) {
  const nombre = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombre }, () => ""));
  const [statutsSoumis, setStatutsSoumis] = useState<StatutVerification[] | null>(null);
  const [messagePiege, setMessagePiege] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && statutsSoumis !== null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const gele = !!validation;

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
    setErreurLecture(null);
  }

  function valider() {
    if (!toutRempli || gele) return;
    const refus = controle(valeurs);
    if (refus) {
      setErreurLecture(refus);
      return;
    }
    const statuts = mode.type === "champs" ? diagnostiquer(valeurs) : [];
    setErreurLecture(null);
    setStatutsSoumis(statuts);
    setMessagePiege(statuts.every((s) => s === "correct") ? null : piege(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={<div className="schema-circuit" style={{ margin: "10px 0 4px", color: "var(--ink, currentColor)" }} dangerouslySetInnerHTML={{ __html: schemaSvg }} />}
      />
      <p className="prompt-text" style={{ overflowX: "auto", maxWidth: "100%" }}>
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champs" && (
        <div>
          {mode.champs.map((champ, i) => (
            <div key={i}>
              {/[^\d\s,.−-]/.test(valeurs[i]) && <ApercuExpressionLatex texte={valeurs[i]} />}
              <div className="field">
                <label className="field-label field-label-minuscule">{champ.labelLatex ? <Katex expression={champ.labelLatex} /> : champ.label}</label>
                <input
                  type="text"
                  aria-label={champ.label}
                  className={`text-input ${montrerErreurs && statutsSoumis[i] !== "correct" ? "is-erronee" : ""}`}
                  value={valeurs[i]}
                  placeholder={champ.placeholder}
                  disabled={gele}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onChange={(e) => changer(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") valider();
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {mode.type === "choix" && (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr", marginBottom: 14 }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={valeurs[0] === option.id}
              data-nature={option.id}
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""}`}
              style={{ maxWidth: "100%", whiteSpace: "normal", textAlign: "left", justifyContent: "flex-start" }}
              disabled={gele}
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
          <p><TexteInsistance texte={aideNiveau1.texte} /></p>
          {aideNiveau1.latex && (
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <Katex expression={aideNiveau1.latex} block />
            </div>
          )}
          {niveauAide >= 2 && aideNiveau2.texte && (
            <>
              <p><TexteInsistance texte={aideNiveau2.texte} /></p>
              {aideNiveau2.latex && (
                <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                  <Katex expression={aideNiveau2.latex} block />
                </div>
              )}
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
              {erreurLecture}
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
