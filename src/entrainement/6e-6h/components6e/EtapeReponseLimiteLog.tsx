import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseLimiteLog } from "../moteur6e/verificationLimitesLogarithmiques";
import { CONSIGNE_GENERALE } from "../ui6e/formatLimitesLogarithmiques";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

type OptionCategorielle = "plus_infini" | "moins_infini" | "zero";

const LABELS: Record<OptionCategorielle, string> = { plus_infini: "+\\infty", moins_infini: "-\\infty", zero: "0" };

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  /** `null` sur le tout premier écran de chaque famille (rien à rappeler) — voir
   * `ui6e/formatLimitesLogarithmiques.ts::etatActuel`. Toujours non-`null` ici (cet écran n'est
   * jamais le premier écran de sa famille — A/C ont toutes deux un écran de diagnostic avant). */
  etatActuel: string[] | null;
  /** Sous-ensemble des 3 boutons catégoriels pertinents pour CET écran — un seul composant
   * réutilisé pour tous les écrans catégoriels, seule la LISTE d'options varie (même principe que
   * `EtapeReponseLimite.tsx`, 6gen6). */
  optionsCategorielles: OptionCategorielle[];
  /** Bouton "Valeur finie" additionnel, révélant un champ texte libre — absent pour les écrans où
   * la réponse est TOUJOURS infinie/nulle par construction. */
  autoriserValeurLibre: boolean;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLimiteLog) => void;
}

/**
 * Écran GÉNÉRIQUE "cible catégorielle ±∞/0/valeur" (`6gen17`) — réutilisé par les écrans A-conclure
 * et C-conclure. `App6gen17.tsx` doit le rendre avec `key={phase}`. Même patron que
 * `EtapeReponseLimite.tsx` (6gen6).
 */
export function EtapeReponseLimiteLog({ consigneEcran, enonceLatex, etatActuel, optionsCategorielles, autoriserValeurLibre, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [statut, setStatut] = useState<ReponseLimiteLog["type"] | null>(null);
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (statut === null) return;
    if (statut === "valeur" && texte.trim() === "") return;
    onValider(statut === "valeur" ? { type: "valeur", texte } : { type: statut });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <div className="options-grid-compact">
        {optionsCategorielles.map((option) => (
          <button key={option} type="button" className={`btn ${statut === option ? "toggle-active" : ""} ${montrerErreurs && statut === option ? "is-erronee" : ""}`} onClick={() => setStatut(option)}>
            <Katex expression={LABELS[option]} />
          </button>
        ))}
        {autoriserValeurLibre && (
          <button type="button" className={`btn ${statut === "valeur" ? "toggle-active" : ""} ${montrerErreurs && statut === "valeur" ? "is-erronee" : ""}`} onClick={() => setStatut("valeur")}>
            Valeur finie
          </button>
        )}
      </div>
      {statut === "valeur" && (
        <>
          <ApercuExpressionLatex texte={texte} />
          <div className="field contenu-conditionnel">
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={texte} placeholder="ex : 0, 1/2, ln(3)..." onChange={(e) => setTexte(e.target.value)} />
          </div>
        </>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={statut === null || (statut === "valeur" && texte.trim() === "")} onClick={valider}>
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
