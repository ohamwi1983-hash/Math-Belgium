import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { REPONSE_AUCUNE } from "../moteur5e/typesTroisTermes";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui5e/formatTroisTermes";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

/** Espaces insécables typographiques avant « ? ! : ; » (le signe ne passe jamais seul à la ligne). */
function espacesInsecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
}

/** Rendu d'un `FragmentConsigne[]` (texte mêlé à du LaTeX en ligne), sans conteneur. */
export function FragmentsTroisTermes({ fragments }: { fragments: FragmentConsigne[] }) {
  return (
    <>
      {fragments.map((f, i) => (f.type === "texte" ? <span key={i}>{espacesInsecables(f.valeur)}</span> : <Katex key={i} expression={f.valeur} />))}
    </>
  );
}

export type ModeEcranTroisTermes = "choix" | "champs" | "solutions";

interface Props {
  mode: ModeEcranTroisTermes;
  consigneGenerale: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  /** `champs` : un champ par définition ; `solutions` : gabarit du champ répété. */
  champs: ChampDef[];
  /** `choix` : options (id, LaTeX). */
  options?: { id: string; latex: string }[];
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
  /** Message ciblé sur une erreur classique (double produit oublié, terme nul gardé…). */
  piege: (valeurs: string[]) => string | null;
  /** Écriture refusée sans consommer de tentative (équation pas réduite, « x = … »…). */
  refusFormat: (valeurs: string[]) => string | null;
  messageIllisible: string;
  validation?: ValidationEtapeProps | null;
}

const MAX_SOLUTIONS = 3;

/**
 * Écran de `5gen46` — trois formes, même structure que `EtapeSommesTermes` (5gen45) : consigne
 * générale → consigne de l'écran → réponse → aide → « Valider ».
 * - `choix` : une option à choisir (une seule tentative, gérée par le moteur) ;
 * - `champs` : champs libres (équation réduite avec « = 0 » affiché après le champ, ou a, b, c et la
 *   raison groupés par valeur de x) ;
 * - `solutions` : « Aucune valeur ne convient » / « Au moins une valeur convient », puis une liste
 *   de valeurs à compléter (patron « add-as-needed » de `4e/components/EtapeZeros.tsx`).
 * Saisie jamais filtrée (pas d'`inputMode`, pas de `type="number"`), seule transformation :
 * `normaliserSigneMoins`. Une saisie illisible ou refusée pour sa forme n'est PAS soumise : message,
 * aucune tentative consommée. `App5gen46.tsx` change la `key` à chaque écran ET à chaque exercice.
 */
export function EtapeTroisTermes({
  mode,
  consigneGenerale,
  consigneEcran,
  champs,
  options = [],
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
  refusFormat,
  messageIllisible,
  validation,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => (mode === "champs" ? champs.map(() => "") : [""]));
  const [choix, setChoix] = useState<string | null>(null);
  const [aucune, setAucune] = useState<boolean | null>(null);
  const [statutsSoumis, setStatutsSoumis] = useState<StatutVerification[] | null>(null);
  const [messagePiege, setMessagePiege] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState<string | null>(null);
  const gele = !!validation;
  const montrerErreurs = tentativesUtilisees > 0 && statutsSoumis !== null;

  function reponse(): string[] | null {
    if (mode === "choix") return choix === null ? null : [choix];
    if (mode === "solutions") {
      if (aucune === null) return null;
      if (aucune) return [REPONSE_AUCUNE];
    }
    return valeurs.every((v) => v.trim() !== "") ? valeurs : null;
  }
  const r = reponse();

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? normaliserSigneMoins(valeur) : v)));
    setErreurLecture(null);
  }

  function valider() {
    if (r === null || gele) return;
    const statuts = diagnostiquer(r);
    if (statuts.includes("parse_error")) {
      setErreurLecture(messageIllisible);
      return;
    }
    const refus = refusFormat(r);
    if (refus) {
      setErreurLecture(refus);
      return;
    }
    setErreurLecture(null);
    setStatutsSoumis(statuts);
    // Toujours consulté : à l'écran `solutions`, des valeurs toutes justes peuvent être incomplètes.
    setMessagePiege(piege(r));
    onValider(r);
  }

  function champSaisie(champ: ChampDef, i: number, retirable: boolean) {
    const erronee = montrerErreurs && aucune !== true && statutsSoumis[i] !== undefined && statutsSoumis[i] !== "correct";
    return (
      <div key={i}>
        {champ.groupeLatex && (
          <p className="prompt-text" style={{ marginBottom: 4 }}>
            <strong>
              Pour <Katex expression={champ.groupeLatex} /> :
            </strong>
          </p>
        )}
        {/* Aperçu seulement pour une écriture à mettre en forme (expression en x, fraction), pas pour un nombre. */}
        {/[^\d\s,.−-]/.test(valeurs[i] ?? "") && <ApercuExpressionLatex texte={valeurs[i]} />}
        <div className="field field-inline">
          {champ.labelLatex && (
            <label className="field-label field-label-minuscule">
              <Katex expression={champ.labelLatex} />
            </label>
          )}
          <input
            type="text"
            aria-label={champ.label}
            className={`text-input ${erronee ? "is-erronee" : ""}`}
            value={valeurs[i] ?? ""}
            placeholder={champ.placeholder}
            disabled={gele}
            autoComplete="off"
            onChange={(e) => changer(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") valider();
            }}
          />
          {champ.suffixeLatex && (
            <span className="field-label field-label-minuscule" style={{ whiteSpace: "nowrap" }}>
              <Katex expression={champ.suffixeLatex} />
            </span>
          )}
          {retirable && !gele && (
            <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la valeur ${i + 1}`} onClick={() => setValeurs((arr) => arr.filter((_, j) => j !== i))}>
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<FragmentsTroisTermes fragments={consigneGenerale} />} blocDonnees={null} />
      <p className="prompt-text">
        <FragmentsTroisTermes fragments={consigneEcran} />
      </p>

      {mode === "choix" && (
        <div className="options-grid" style={{ gridTemplateColumns: "1fr" }}>
          {options.map((o) => (
            <button key={o.id} type="button" className={`btn ${choix === o.id ? "toggle-active" : ""}`} disabled={gele} onClick={() => setChoix(o.id)}>
              <Katex expression={o.latex} />
            </button>
          ))}
        </div>
      )}

      {mode === "champs" && champs.map((champ, i) => champSaisie(champ, i, false))}

      {mode === "solutions" && (
        <>
          <div className="options-grid">
            <button
              type="button"
              className={`btn ${aucune === true ? "toggle-active" : ""}`}
              disabled={gele}
              onClick={() => {
                setAucune(true);
                setErreurLecture(null);
              }}
            >
              Aucune valeur ne convient
            </button>
            <button
              type="button"
              className={`btn ${aucune === false ? "toggle-active" : ""}`}
              disabled={gele}
              onClick={() => {
                setAucune(false);
                setErreurLecture(null);
              }}
            >
              Au moins une valeur convient
            </button>
          </div>
          {aucune === false && (
            <div className="liste-morceaux contenu-conditionnel">
              {valeurs.map((_, i) => champSaisie({ ...champs[0], label: `Valeur ${i + 1} de x` }, i, valeurs.length > 1))}
              {valeurs.length < MAX_SOLUTIONS && !gele && (
                <button type="button" className="btn liste-morceaux-ajouter" onClick={() => setValeurs((arr) => [...arr, ""])}>
                  + Ajouter une valeur
                </button>
              )}
            </div>
          )}
        </>
      )}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && (
            <div style={{ overflowX: "auto" }}>
              <Katex expression={aideNiveau1.latex} block />
            </div>
          )}
          {niveauAide >= 2 && aideNiveau2.texte && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && (
                <div style={{ overflowX: "auto" }}>
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
          <button type="button" className="btn btn-primary" disabled={r === null} onClick={valider}>
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
