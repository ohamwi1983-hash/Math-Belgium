import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { TypeConcaviteLog } from "../core6e/etudeFonctionLogarithme.types";
import type { ReponseConcaviteLog } from "../moteur6e/verificationEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE, PLACEHOLDER_INFLEXION, consigneConcavite } from "../ui6e/formatEtudeFonctionLogarithme";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

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
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConcaviteLog) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "concavité" — 0, 1 ou 2 points d'inflexion, pattern "add-as-needed" (croix `×`/bouton
 * "+ Ajouter") pour la liste de positions (famille D : 2 points d'inflexion). Commun aux 5 familles. */
export function EtapeConcaviteLog({ enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [type, setType] = useState<TypeConcaviteLog | null>(null);
  const [positions, setPositions] = useState<string[]>([""]);
  /** Dernière réponse soumise — rouge seulement sur ce qui n'a pas changé depuis ce refus. */
  const [soumis, setSoumis] = useState<ReponseConcaviteLog | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && !validation;
  const typeRefuse = montrerErreurs && soumis !== null && soumis.type === type;
  const positionsRefusees = typeRefuse && soumis !== null && soumis.positionsTexte.join("|") === positions.join("|");

  const requiertPositions = type === "inflexions";
  const complet = type !== null && (!requiertPositions || positions.every((p) => p.trim() !== ""));

  function valider() {
    if (!complet || type === null) return;
    const reponse = { type, positionsTexte: requiertPositions ? positions : [] };
    setSoumis({ type, positionsTexte: positions });
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={enonceLatex} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneConcavite()} />
      </p>
      <div className="options-liste-longue">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${type === o.id ? "toggle-active" : ""} ${typeRefuse && type === o.id ? "is-erronee" : ""}`} onClick={() => setType(o.id)}>
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
                  className={`text-input ${positionsRefusees ? "is-erronee" : ""}`}
                  placeholder={PLACEHOLDER_INFLEXION}
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
