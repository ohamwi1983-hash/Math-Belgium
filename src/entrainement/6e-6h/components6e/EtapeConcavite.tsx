import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseConcavite } from "../moteur6e/verificationEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE, consigneConcavite } from "../ui6e/formatEtudeFonctionExponentielle";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const OPTIONS: { id: ReponseConcavite["type"]; label: string; requiertPosition: boolean }[] = [
  { id: "convexe_partout", label: "Convexe (partout)", requiertPosition: false },
  { id: "concave_partout", label: "Concave (partout)", requiertPosition: false },
  { id: "inflexion", label: "Un point d'inflexion", requiertPosition: true },
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
  onValider: (reponse: ReponseConcavite) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 5/6, "concavité" — COMMUN aux 4 familles (même contrat `CibleConcavite`). Nouveauté du
 * chapitre : l'aide niveau 1 rappelle TOUJOURS la méthode complète (signe de f'', voir
 * `ui6e/formatEtudeFonctionExponentielle.ts::aideConcaviteNiveau1`) — jamais seulement "la première
 * fois". `App6gen11.tsx` doit le rendre avec `key={indexExercice}`. Le domaine, les limites, les
 * asymptotes et la croissance confirmés aux 4 écrans précédents sont listés dans le récapitulatif
 * "Ce qu'on sait déjà" (`ui6e/recapitulatifEtudeFonctionExponentielle.ts`). */
export function EtapeConcavite({ enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [type, setType] = useState<ReponseConcavite["type"] | null>(null);
  const [position, setPosition] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  const requiertPosition = type === "inflexion";
  const complet = type !== null && (!requiertPosition || position.trim() !== "");

  function valider() {
    if (!complet || type === null) return;
    onValider({ type, position });
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
      <p className="prompt-text">{consigneConcavite()}</p>
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
            <label className="field-label field-label-minuscule">Position du point d'inflexion (x=...)</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={position} placeholder="ex : -2, 1/2..." onChange={(e) => setPosition(e.target.value)} />
          </div>
        </>
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
