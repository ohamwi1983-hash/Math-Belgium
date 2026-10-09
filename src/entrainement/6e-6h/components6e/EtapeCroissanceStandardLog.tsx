import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseCroissanceStandard } from "../moteur6e/verificationEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionLogarithme";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const OPTIONS: { id: ReponseCroissanceStandard["type"]; label: string; requiertPosition: boolean }[] = [
  { id: "croissante_partout", label: "Croissante (partout)", requiertPosition: false },
  { id: "decroissante_partout", label: "Décroissante (partout)", requiertPosition: false },
  { id: "minimum", label: "Un minimum", requiertPosition: true },
  { id: "maximum", label: "Un maximum", requiertPosition: true },
];

interface Props {
  enonceLatex: string;
  consigneEcran: string;
  /** Rappel de domaine + limites + asymptotes déjà confirmés — voir
   * `ui6e/formatEtudeFonctionLogarithme.ts::etatActuel`. */
  etatActuel: string[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCroissanceStandard) => void;
}

/** Écran "croissance", forme "standard" — familles A/B/D (catégorie + position d'extremum
 * optionnelle, même contrat `CibleCroissance` que `6gen11`). Voir `EtapeCroissanceGrilleCLog.tsx`
 * pour la famille C. `App6gen21.tsx` doit le rendre avec `key={indexExercice}`. */
export function EtapeCroissanceStandardLog({ enonceLatex, consigneEcran, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [type, setType] = useState<ReponseCroissanceStandard["type"] | null>(null);
  const [position, setPosition] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  const requiertPosition = type === "minimum" || type === "maximum";
  const complet = type !== null && (!requiertPosition || position.trim() !== "");

  function valider() {
    if (!complet || type === null) return;
    onValider({ type, position });
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
      <div className="options-liste-longue">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${type === o.id ? "toggle-active" : ""} ${montrerErreurs && type === o.id ? "is-erronee" : ""}`} onClick={() => setType(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      {requiertPosition && (
        <>
          <ApercuExpressionLatex texte={position} />
          <div className="field contenu-conditionnel">
            <label className="field-label field-label-minuscule">Position de l'extremum (x=...)</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={position} placeholder="ex : 1/e, e, ln(3)..." onChange={(e) => setPosition(e.target.value)} />
          </div>
        </>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
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
