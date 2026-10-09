import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex } from "../ui6e/formatTransformationsPlan";
import { BoutonAide } from "./BoutonAide";

type TypeTransformationB = "translation" | "similitude";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
}

/**
 * Écran DÉDIÉ famille B, écran 2 ("identifier la transformation représentée : type PUIS
 * paramètre(s)") — champ structuré en 2 étapes, pas de texte libre pour le TYPE : d'abord un choix
 * `.btn.toggle-active` "translation"/"similitude" (JAMAIS `.btn-primary`, convention CLAUDE.md),
 * PUIS (dans un bloc `.contenu-conditionnel`, révélé seulement après le choix — convention CLAUDE.md
 * "espacement bouton → contenu conditionnel") le(s) champ(s) texte pertinent(s) : 1 champ "vecteur"
 * (a+bi) pour translation, 2 champs "rapport"/"angle" (réels) pour similitude. `valeurs` soumis à
 * `onValider`/`diagnostiquer` : `[type, vecteur]` ou `[type, rapport, angle]` — voir
 * `moteur6e/verificationTransformationsPlan.ts`, `diagnostiquerBEcran2`, pour le statut combiné.
 * `App6gen40.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeTypeParametresTransformationsPlan({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [type, setType] = useState<TypeTransformationB | null>(null);
  const [vecteur, setVecteur] = useState("");
  const [rapport, setRapport] = useState("");
  const [angle, setAngle] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  const valeursActuelles = type === "similitude" ? [type, rapport, angle] : [type ?? "", vecteur];
  const dernierStatut = montrerErreurs ? diagnostiquer(valeursActuelles) : null;
  const toutRempli = type === "translation" ? vecteur.trim() !== "" : type === "similitude" ? rapport.trim() !== "" && angle.trim() !== "" : false;

  function choisirType(t: TypeTransformationB) {
    setType(t);
  }

  function valider() {
    if (!toutRempli || type === null) return;
    onValider(type === "similitude" ? [type, rapport, angle] : [type, vecteur]);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
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
        <button type="button" className={`btn ${type === "translation" ? "toggle-active" : ""} ${montrerErreurs && type === "translation" ? "is-erronee" : ""}`} onClick={() => choisirType("translation")}>
          Translation
        </button>
        <button type="button" className={`btn ${type === "similitude" ? "toggle-active" : ""} ${montrerErreurs && type === "similitude" ? "is-erronee" : ""}`} onClick={() => choisirType("similitude")}>
          Similitude
        </button>
      </div>
      {type === "translation" && (
        <div className="contenu-conditionnel">
          <ApercuExpressionLatex texte={vecteur} label="Vecteur (affixe) =" />
          <div className="field">
            <label className="field-label field-label-minuscule">Vecteur (affixe) =</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={vecteur} placeholder="ex : 3+2i" onChange={(e) => setVecteur(e.target.value)} />
          </div>
        </div>
      )}
      {type === "similitude" && (
        <div className="contenu-conditionnel">
          <ApercuExpressionLatex texte={angle} label="Angle =" />
          <div className="field-row field-row-wrap">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule">Rapport =</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={rapport} placeholder="ex : 2" onChange={(e) => setRapport(e.target.value)} />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule">Angle =</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={angle} placeholder="ex : pi/3" onChange={(e) => setAngle(e.target.value)} />
            </div>
          </div>
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
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
