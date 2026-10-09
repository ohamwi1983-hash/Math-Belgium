import { useState } from "react";
import { Katex } from "../components/Katex";
import type { ReponseLimite } from "../moteur6e/verificationLimitesExponentielles";
import type { DirectionLabel } from "../ui6e/formatEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionLogarithme";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

type Statut = "plus_infini" | "moins_infini" | "zero" | "valeur";
const OPTIONS: { id: Statut; latex: string }[] = [
  { id: "plus_infini", latex: "+\\infty" },
  { id: "moins_infini", latex: "-\\infty" },
  { id: "zero", latex: "0" },
];

interface EtatLocal {
  statut: Statut | null;
  texte: string;
}

function GroupeLimite({ label, etat, erreur, onChange }: { label: string; etat: EtatLocal; erreur: boolean; onChange: (e: EtatLocal) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">
        <Katex expression={label} />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${etat.statut === o.id ? "toggle-active" : ""} ${erreur && etat.statut === o.id ? "is-erronee" : ""}`} onClick={() => onChange({ statut: o.id, texte: etat.texte })}>
            <Katex expression={o.latex} />
          </button>
        ))}
        <button type="button" className={`btn ${etat.statut === "valeur" ? "toggle-active" : ""} ${erreur && etat.statut === "valeur" ? "is-erronee" : ""}`} onClick={() => onChange({ statut: "valeur", texte: etat.texte })}>
          Valeur finie
        </button>
      </div>
      {etat.statut === "valeur" && (
        <input type="text" className={`text-input contenu-conditionnel ${erreur ? "is-erronee" : ""}`} value={etat.texte} placeholder="ex : 1, 0.5..." onChange={(e) => onChange({ statut: "valeur", texte: e.target.value })} />
      )}
    </div>
  );
}

interface Props {
  enonceLatex: string;
  consigneEcran: string;
  /** Rappel du domaine confirmé à l'écran précédent (consigne : "aux bornes de SON DOMAINE") — voir
   * `ui6e/formatEtudeFonctionLogarithme.ts::etatActuel`. */
  etatActuel: string[];
  labels: DirectionLabel[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLimite[]) => void;
}

/** Écran "limites" — arité VARIABLE (2 directions pour A/B/D, 6 pour C, voir
 * `ui6e/formatEtudeFonctionLogarithme.ts::directionLabelsLimites`) — UN SEUL composant générique,
 * jamais un par arité (contrairement à `6gen11` qui avait `EtapeLimitesDeux`/`EtapeLimitesQuatre`
 * séparés). `App6gen21.tsx` doit le rendre avec `key={indexExercice}`. */
export function EtapeLimitesMultiLog({ enonceLatex, consigneEcran, etatActuel, labels, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [etats, setEtats] = useState<EtatLocal[]>(() => labels.map(() => ({ statut: null, texte: "" })));
  const montrerErreurs = tentativesUtilisees > 0;

  function complet(e: EtatLocal): boolean {
    return e.statut !== null && (e.statut !== "valeur" || e.texte.trim() !== "");
  }
  const tousComplets = etats.every(complet);

  function majEtat(index: number, nouvel: EtatLocal) {
    setEtats(etats.map((e, i) => (i === index ? nouvel : e)));
  }

  function valider() {
    if (!tousComplets) return;
    const reponse: ReponseLimite[] = etats.map((e) => (e.statut === "valeur" ? { type: "valeur", texte: e.texte } : { type: e.statut as "plus_infini" | "moins_infini" | "zero" }));
    onValider(reponse);
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
        <GroupeLimite key={l.id} label={l.latex} etat={etats[i]} erreur={montrerErreurs} onChange={(e) => majEtat(i, e)} />
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
