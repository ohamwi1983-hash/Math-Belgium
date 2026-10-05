import { useState } from "react";
import { Katex } from "../components/Katex";
import type { ReponseLimites } from "../moteur6e/verificationEtudeFonctionExponentielle";
import type { DirectionLabel } from "../ui6e/formatEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionExponentielle";
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
  labels: DirectionLabel[];
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLimites) => void;
}

/** Écran 2/6, "limites" — familles A/C/D (2 directions, `+∞`/`−∞`). Voir `EtapeLimitesQuatre.tsx`
 * pour la famille B (4 directions, l'écran le plus dense). `App6gen11.tsx` doit le rendre avec
 * `key={indexExercice}`. `etatActuel` rappelle le domaine CONFIRMÉ à l'écran précédent (voir
 * `ui6e/formatEtudeFonctionExponentielle.ts::etatActuel`). */
export function EtapeLimitesDeux({ enonceLatex, consigneEcran, labels, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [plusInfini, setPlusInfini] = useState<EtatLocal>({ statut: null, texte: "" });
  const [moinsInfini, setMoinsInfini] = useState<EtatLocal>({ statut: null, texte: "" });
  const montrerErreurs = tentativesUtilisees > 0;

  function complet(e: EtatLocal): boolean {
    return e.statut !== null && (e.statut !== "valeur" || e.texte.trim() !== "");
  }

  function valider() {
    if (!complet(plusInfini) || !complet(moinsInfini)) return;
    const versReponse = (e: EtatLocal) => (e.statut === "valeur" ? { type: "valeur" as const, texte: e.texte } : { type: e.statut as "plus_infini" | "moins_infini" | "zero" });
    onValider({ type: "deux", plusInfini: versReponse(plusInfini), moinsInfini: versReponse(moinsInfini) });
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
      <GroupeLimite label={labels[0].latex} etat={plusInfini} erreur={montrerErreurs} onChange={setPlusInfini} />
      <GroupeLimite label={labels[1].latex} etat={moinsInfini} erreur={montrerErreurs} onChange={setMoinsInfini} />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet(plusInfini) || !complet(moinsInfini)} onClick={valider}>
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

export { GroupeLimite };
export type { EtatLocal as EtatLimiteLocal };
