import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { TypeConcaviteLog } from "../core6e/etudeFonctionLogarithme.types";
import type { ReponseConcaviteLog } from "../moteur6e/verificationEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE, consigneConcavite } from "../ui6e/formatEtudeFonctionLogarithme";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const OPTIONS: { id: TypeConcaviteLog; label: string }[] = [
  { id: "convexe_partout", label: "Convexe (partout)" },
  { id: "concave_partout", label: "Concave (partout)" },
  { id: "inflexions", label: "Point(s) d'inflexion" },
];

interface Props {
  enonceLatex: string;
  /** Rappel de domaine + limites + asymptotes + croissance déjà confirmés — voir
   * `ui6e/formatEtudeFonctionLogarithme.ts::etatActuel`. */
  etatActuel: string[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConcaviteLog) => void;
}

/** Écran "concavité" — généralise `6gen11` (au plus 1 point d'inflexion) à 0..N points, pattern
 * "add-as-needed" (croix rouge `×`/bouton "+ Ajouter") pour la liste de positions — nécessaire pour
 * la famille B, qui a TOUJOURS un point d'inflexion mais parfois DEUX (voir
 * `generateurs6e/etudeFonctionLogarithme/familles/B.ts`). Commun aux 4 familles A-D.
 * `App6gen21.tsx` doit le rendre avec `key={indexExercice}`. */
export function EtapeConcaviteLog({ enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [type, setType] = useState<TypeConcaviteLog | null>(null);
  const [positions, setPositions] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;

  const requiertPositions = type === "inflexions";
  const complet = type !== null && (!requiertPositions || positions.every((p) => p.trim() !== ""));

  function valider() {
    if (!complet || type === null) return;
    onValider({ type, positionsTexte: requiertPositions ? positions : [] });
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
      <p className="prompt-text">{consigneConcavite()}</p>
      <div className="options-liste-longue">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${type === o.id ? "toggle-active" : ""} ${montrerErreurs && type === o.id ? "is-erronee" : ""}`} onClick={() => setType(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      {requiertPositions && (
        <div className="liste-morceaux contenu-conditionnel">
          {positions.map((p, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={p} />
              <div className="liste-morceaux-ligne">
                <input
                  type="text"
                  className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
                  placeholder="position (x=...)"
                  value={p}
                  onChange={(e) => setPositions(positions.map((v, j) => (j === i ? e.target.value : v)))}
                />
                {positions.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la position ${i + 1}`} onClick={() => setPositions(positions.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={() => setPositions([...positions, ""])}>
            + Ajouter un point d'inflexion
          </button>
        </div>
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
