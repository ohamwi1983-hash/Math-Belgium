import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui5e/formatSommeInfinieSituation";
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
export function FragmentsSommeInfinie({ fragments }: { fragments: FragmentConsigne[] }) {
  return (
    <>
      {fragments.map((f, i) => (f.type === "texte" ? <span key={i}>{espacesInsecables(f.valeur)}</span> : <Katex key={i} expression={f.valeur} />))}
    </>
  );
}

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Figure SVG de l'énoncé (rebonds, figures emboîtées), chaîne construite par
   * `export5e/svgSommeInfinieSituation.ts` — jamais une saisie de l'élève. */
  figureSvg: string | null;
  consigneEcran: FragmentConsigne[];
  champs: ChampDef[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  piege: (valeurs: string[]) => string | null;
  /** Écriture refusée sans consommer de tentative (valeur approchée, fraction non simplifiée). */
  refusFormat: (valeurs: string[]) => string | null;
  messageIllisible: string;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `5gen48` (un champ libre) — même structure que `EtapeSommesTermes` (5gen45) :
 * consigne générale (+ figure) → consigne de l'écran → champ → aide → « Valider ». Saisie jamais
 * filtrée (pas d'`inputMode`, pas de `type="number"`), seule transformation : `normaliserSigneMoins`.
 * Une saisie illisible ou refusée pour sa forme n'est PAS soumise : message, aucune tentative
 * consommée. `App5gen48.tsx` change la `key` à chaque écran ET à chaque nouvel exercice.
 */
export function EtapeSommeInfinieSituation({
  consigneGenerale,
  figureSvg,
  consigneEcran,
  champs,
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
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
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
    const refus = refusFormat(valeurs);
    if (refus) {
      setErreurLecture(refus);
      return;
    }
    setErreurLecture(null);
    setStatutsSoumis(statuts);
    setMessagePiege(statuts.every((s) => s === "correct") ? null : piege(valeurs));
    onValider(valeurs);
  }

  const figure = figureSvg ? <div className="figure-somme-infinie" style={{ margin: "12px auto 0", maxWidth: 320 }} dangerouslySetInnerHTML={{ __html: figureSvg }} /> : null;

  return (
    <div>
      <EnTeteExercice consigneGenerale={<FragmentsSommeInfinie fragments={consigneGenerale} />} blocDonnees={figure} />
      <p className="prompt-text">
        <FragmentsSommeInfinie fragments={consigneEcran} />
      </p>
      <div>
        {champs.map((champ, i) => (
          <div key={i}>
            {/* Aperçu seulement pour une écriture à mettre en forme (fraction, calcul), pas pour un nombre. */}
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
                onChange={(e) => changer(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") valider();
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{espacesInsecables(aideNiveau1.texte)}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && aideNiveau2.texte && (
            <>
              <p>{espacesInsecables(aideNiveau2.texte)}</p>
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
