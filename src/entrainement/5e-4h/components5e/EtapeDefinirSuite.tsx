import { useEffect, useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { normaliserU } from "../moteur5e/verificationDefinirSuite";
import type { TypeChamp } from "../moteur5e/verificationDefinirSuite";
import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionChoix } from "../ui5e/formatDefinirSuite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteInsistance } from "../../components/TexteInsistance";

export type ModeEcranDefinirSuite = { type: "champs"; champs: ChampDef[] } | { type: "choix"; options: OptionChoix[] };

/** Espaces insécables typographiques avant « ? ! : ; » et après « « » : le signe ne passe jamais seul à la ligne. */
function espacesInsecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
}

/** Rendu d'un `FragmentConsigne[]` (texte brut mêlé à du LaTeX inline), sans conteneur. */
export function RenduFragments5e({ fragments }: { fragments: FragmentConsigne[] }) {
  return <>{fragments.map((f, i) => (f.type === "texte" ? <span key={i}><TexteInsistance texte={espacesInsecables(f.valeur)} debutDePhrase={i === 0} /></span> : <Katex key={i} expression={f.valeur} />))}</>;
}

/** LaTeX de l'aperçu : moins typographique accepté, « u » de l'élève affiché uₙ. */
function latexApercu(texte: string, type: TypeChamp): string | null {
  if (texte.trim() === "") return null;
  try {
    const latex = expressionLibreVersLatex(normaliserSigneMoins(type === "un" ? normaliserU(texte) : texte));
    return type === "un" ? latex.replace(/(?<![A-Za-z\\])u(?![A-Za-z_])/g, "u_n") : latex;
  } catch {
    return null;
  }
}

/**
 * Aperçu LaTeX en direct (même comportement que `ApercuExpressionLatex` : le dernier rendu valide
 * reste affiché, assombri, tant que la saisie en cours ne se lit pas) — adapté aux suites : la lettre
 * u tapée pour uₙ s'affiche uₙ. Ne vérifie jamais la réponse.
 */
function ApercuSaisie({ texte, type }: { texte: string; type: TypeChamp }) {
  const [dernier, setDernier] = useState<string | null>(null);
  const courant = latexApercu(texte, type);
  useEffect(() => {
    if (courant !== null) setDernier(courant);
    else if (texte.trim() === "") setDernier(null);
  }, [courant, texte]);
  if (dernier === null) return null;
  return (
    <div className={`apercu-expression-latex contenu-conditionnel${courant === null ? " apercu-expression-latex-perime" : ""}`}>
      <Katex expression={dernier} />
    </div>
  );
}

/** Aperçu utile : toute expression, et un nombre seulement s'il s'écrit en fraction ou puissance. */
function apercuUtile(texte: string, type: TypeChamp): boolean {
  if (type !== "nombre") return /[a-z0-9]/i.test(texte);
  return /[/^]/.test(texte);
}

interface Props {
  consigneGenerale: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranDefinirSuite;
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
  /** Message ciblé sur une erreur classique (uₙ + 1 au lieu de uₙ₊₁, quotient à l'envers…). */
  piege: (valeurs: string[]) => string | null;
  /** Message d'une saisie non lue (aucune tentative décomptée). */
  messageIllisible: (valeurs: string[]) => string;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `5gen44` (champs libres OU choix fermé) — même structure que `EtapeGrandsNombresLog`
 * (6gen92) : consigne générale → consigne de l'écran → bloc de travail → aide → « Valider ». Saisie
 * jamais filtrée (pas d'`inputMode`, pas de `type="number"`) ; une saisie illisible (`parse_error`)
 * n'est PAS soumise : message de lecture, aucune tentative consommée. Choix fermé : une seule
 * tentative. `App5gen44.tsx` change la `key` à chaque écran ET à chaque nouvel exercice.
 */
export function EtapeDefinirSuite({
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
  const nombreChamps = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreChamps }, () => ""));
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
    const statuts = diagnostiquer(valeurs);
    if (statuts.includes("parse_error")) {
      setErreurLecture(messageIllisible(valeurs));
      return;
    }
    setErreurLecture(null);
    setStatutsSoumis(statuts);
    setMessagePiege(statuts.every((s) => s === "correct") ? null : piege(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments5e fragments={consigneGenerale} />} blocDonnees={null} />
      <p className="prompt-text">
        <RenduFragments5e fragments={consigneEcran} />
      </p>
      {mode.type === "champs" ? (
        <div>
          {mode.champs.map((champ, i) => (
            <div key={i}>
              {apercuUtile(valeurs[i], champ.type) && <ApercuSaisie texte={valeurs[i]} type={champ.type} />}
              <div className="field">
                <label className="field-label field-label-minuscule">
                  <Katex expression={champ.labelLatex} />
                </label>
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
      ) : (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${montrerErreurs && valeurs[0] === option.id && statutsSoumis[0] !== "correct" ? "is-erronee" : ""}`}
              disabled={gele}
              onClick={() => changer(0, option.id)}
              style={{ whiteSpace: "normal", overflowX: "auto", maxWidth: "100%" }}
            >
              <span>
                <RenduFragments5e fragments={option.fragments} />
              </span>
            </button>
          ))}
        </div>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p><TexteInsistance texte={aideNiveau1.texte} /></p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && aideNiveau2.texte && (
            <>
              <p><TexteInsistance texte={aideNiveau2.texte} /></p>
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
