import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseAsymptoteDirection } from "../moteur6e/verificationEtudeFonctionLogarithme";
import type { DirectionLabel } from "../ui6e/formatEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionLogarithme";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

function GroupeAsymptote({
  label,
  etat,
  erreur,
  forcerPresence,
  onChange,
}: {
  label: string;
  etat: ReponseAsymptoteDirection;
  erreur: boolean;
  forcerPresence: boolean;
  onChange: (e: ReponseAsymptoteDirection) => void;
}) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">
        <Katex expression={label} />
      </p>
      {!forcerPresence && (
        <div className="options-grid-compact">
          <button type="button" className={`btn ${etat.existe === false ? "toggle-active" : ""} ${erreur && etat.existe === false ? "is-erronee" : ""}`} onClick={() => onChange({ existe: false, texte: etat.texte })}>
            Aucune asymptote
          </button>
          <button type="button" className={`btn ${etat.existe === true ? "toggle-active" : ""} ${erreur && etat.existe === true ? "is-erronee" : ""}`} onClick={() => onChange({ existe: true, texte: etat.texte })}>
            Il y a une asymptote
          </button>
        </div>
      )}
      {(forcerPresence || etat.existe === true) && (
        <>
          <ApercuExpressionLatex texte={etat.texte} />
          <input
            type="text"
            className={`text-input ${forcerPresence ? "" : "contenu-conditionnel"} ${erreur ? "is-erronee" : ""}`}
            value={etat.texte}
            placeholder="ex : y=0, x=3, y=-2x+1..."
            onChange={(e) => onChange({ existe: true, texte: e.target.value })}
          />
        </>
      )}
    </div>
  );
}

interface Props {
  enonceLatex: string;
  consigneEcran: string;
  /** Rappel des limites confirmées à l'écran précédent (consigne explicite : "à partir des limites
   * CORRECTES précédentes") — voir `ui6e/formatEtudeFonctionLogarithme.ts::etatActuel`. */
  etatActuel: string[];
  labels: DirectionLabel[];
  /** longueur = `labels.length` — `true` pour une direction où l'asymptote est TOUJOURS présente
   * (famille B, famille C), auquel cas aucun toggle "Aucune/Il y a" n'est affiché, juste le champ
   * texte directement. */
  forcerPresence: boolean[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAsymptoteDirection[]) => void;
}

/** Écran "asymptotes" — arité VARIABLE (1 direction pour B, 2 pour A/C/D) — UN SEUL composant
 * générique. Réponse GUIDÉE "existe/n'existe pas" + équation texte libre conditionnelle (sauf
 * `forcerPresence`, où l'existence est déjà acquise), vérifiée par ÉQUIVALENCE NUMÉRIQUE de
 * l'équation soumise (même décision de conception que `6gen11`). `App6gen21.tsx` doit le rendre
 * avec `key={indexExercice}`. */
export function EtapeAsymptotesMultiLog({ enonceLatex, consigneEcran, etatActuel, labels, forcerPresence, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [etats, setEtats] = useState<ReponseAsymptoteDirection[]>(() => labels.map((_, i) => ({ existe: forcerPresence[i], texte: "" })));
  const [touches, setTouches] = useState<boolean[]>(() => labels.map(() => false));
  const montrerErreurs = tentativesUtilisees > 0;

  function complet(i: number): boolean {
    const e = etats[i];
    if (forcerPresence[i]) return e.texte.trim() !== "";
    return touches[i] && (!e.existe || e.texte.trim() !== "");
  }
  const tousComplets = labels.every((_, i) => complet(i));

  function majEtat(index: number, nouvel: ReponseAsymptoteDirection) {
    setEtats(etats.map((e, i) => (i === index ? nouvel : e)));
    setTouches(touches.map((t, i) => (i === index ? true : t)));
  }

  function valider() {
    if (!tousComplets) return;
    onValider(etats);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      <div className="etat-actuel-box">
        <div className="etat-actuel-box-termes">
          {etatActuel.map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </div>
      </div>
      <p className="prompt-text">{consigneEcran}</p>
      {labels.map((l, i) => (
        <GroupeAsymptote key={l.id} label={l.latex} etat={etats[i]} erreur={montrerErreurs} forcerPresence={forcerPresence[i]} onChange={(e) => majEtat(i, e)} />
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!tousComplets} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
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
    </div>
  );
}
