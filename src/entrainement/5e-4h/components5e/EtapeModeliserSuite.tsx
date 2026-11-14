import { useState } from "react";
import type { CSSProperties } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionChoix } from "../ui5e/formatModeliserSuite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

/** Ligne du tableau de valeurs (écran `tableau`). */
export interface LigneTableau {
  rang: number;
  annee: number;
  champ: ChampDef;
}

export type ModeEcranModeliserSuite =
  | { type: "champs"; champs: ChampDef[] }
  | { type: "choix"; options: OptionChoix[] }
  | { type: "tableau"; lignes: LigneTableau[]; unite: string };

/** Espaces insécables typographiques avant « ? ! : ; » et après « « » : le signe ne passe jamais seul à la ligne. */
function espacesInsecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
}

/** Rendu d'un `FragmentConsigne[]` (texte brut mêlé à du LaTeX en ligne), sans conteneur. */
export function FragmentsModelisation({ fragments }: { fragments: FragmentConsigne[] }) {
  return <>{fragments.map((f, i) => (f.type === "texte" ? <span key={i}>{espacesInsecables(f.valeur)}</span> : <Katex key={i} expression={f.valeur} />))}</>;
}

interface Props {
  consigneGenerale: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranModeliserSuite;
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
  /** Message ciblé sur une erreur classique (q = 0,05 au lieu de 1,05, rang décalé…). */
  piege: (valeurs: string[]) => string | null;
  messageIllisible: string;
  validation?: ValidationEtapeProps | null;
}

function nombreChamps(mode: ModeEcranModeliserSuite): number {
  if (mode.type === "champs") return mode.champs.length;
  if (mode.type === "tableau") return mode.lignes.length;
  return 1;
}

/**
 * Écran unique de `5gen47` (champs libres, tableau de valeurs OU choix fermé) — même structure que
 * `EtapeDefinirSuite` (5gen44) : consigne générale → consigne de l'écran → bloc de travail → aide →
 * « Valider ». Saisie jamais filtrée (pas d'`inputMode`, pas de `type="number"`), seule
 * transformation : `normaliserSigneMoins`. Une saisie illisible (`parse_error`) n'est PAS soumise :
 * message de lecture, aucune tentative consommée. Choix fermé : une seule tentative.
 * `App5gen47.tsx` change la `key` à chaque écran ET à chaque nouvel exercice.
 */
export function EtapeModeliserSuite({
  consigneGenerale,
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
  messageIllisible,
  validation,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreChamps(mode) }, () => ""));
  const [statutsSoumis, setStatutsSoumis] = useState<StatutVerification[] | null>(null);
  const [messagePiege, setMessagePiege] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && statutsSoumis !== null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const gele = !!validation;

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? normaliserSigneMoins(valeur) : v)));
    setErreurLecture(null);
  }

  function valider() {
    if (!toutRempli || gele) return;
    const statuts = diagnostiquer(valeurs);
    if (statuts.includes("parse_error")) {
      setErreurLecture(messageIllisible);
      return;
    }
    setErreurLecture(null);
    setStatutsSoumis(statuts);
    setMessagePiege(statuts.every((s) => s === "correct") ? null : piege(valeurs));
    onValider(valeurs);
  }

  function classeChamp(i: number): string {
    return `text-input ${montrerErreurs && statutsSoumis[i] !== "correct" ? "is-erronee" : ""}`;
  }

  function saisie(i: number, champ: ChampDef, style?: CSSProperties) {
    return (
      <input
        type="text"
        aria-label={champ.label}
        className={classeChamp(i)}
        style={style}
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
    );
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<FragmentsModelisation fragments={consigneGenerale} />} blocDonnees={null} />
      <p className="prompt-text">
        <FragmentsModelisation fragments={consigneEcran} />
      </p>
      {mode.type === "champs" && (
        <div>
          {mode.champs.map((champ, i) => (
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">
                {champ.labelLatex ? <Katex expression={champ.unite ? champ.labelLatex.replace(/=$/, "") : champ.labelLatex} /> : champ.label}
                {champ.unite && <span> (en {champ.unite})</span>}
              </label>
              {saisie(i, champ)}
            </div>
          ))}
        </div>
      )}
      {mode.type === "tableau" && (
        <div className="summary-table-scroll">
          <table className="summary-table">
            <thead>
              <tr>
                <th style={{ textTransform: "none" }}>
                  <Katex expression="n" />
                </th>
                <th style={{ textTransform: "none" }}>Année</th>
                <th style={{ textTransform: "none" }}>
                  <Katex expression="u_n" /> (en {mode.unite})
                </th>
              </tr>
            </thead>
            <tbody>
              {mode.lignes.map((ligne, i) => (
                <tr key={ligne.rang}>
                  <td>{ligne.rang}</td>
                  <td>{ligne.annee}</td>
                  <td>{saisie(i, ligne.champ, { minHeight: 44, minWidth: 110 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {mode.type === "choix" && (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${montrerErreurs && valeurs[0] === option.id && statutsSoumis[0] !== "correct" ? "is-erronee" : ""}`}
              disabled={gele}
              onClick={() => changer(0, option.id)}
              style={{ whiteSpace: "normal", maxWidth: "100%", textAlign: "left" }}
            >
              <span>
                <FragmentsModelisation fragments={option.fragments} />
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
