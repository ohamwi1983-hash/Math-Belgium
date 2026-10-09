import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseDiagnosticC, ReponseLimiteLog } from "../moteur6e/verificationLimitesLogarithmiques";
import type { ConfigPartieDiagnostic } from "../ui6e/formatLimitesLogarithmiques";
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
  partie1: ConfigPartieDiagnostic;
  partie2: ConfigPartieDiagnostic;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDiagnosticC) => void;
}

interface EtatPartie {
  statut: OptionCategorielle | "valeur" | null;
  texte: string;
}

function GroupePartie({ config, etat, erreur, onChange }: { config: ConfigPartieDiagnostic; etat: EtatPartie; erreur: boolean; onChange: (e: EtatPartie) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">{config.label}</p>
      <div className="options-grid-compact">
        {config.optionsCategorielles.map((option) => (
          <button
            key={option}
            type="button"
            className={`btn ${etat.statut === option ? "toggle-active" : ""} ${erreur && etat.statut === option ? "is-erronee" : ""}`}
            onClick={() => onChange({ statut: option, texte: etat.texte })}
          >
            <Katex expression={LABELS[option]} />
          </button>
        ))}
        {config.autoriserValeurLibre && (
          <button
            type="button"
            className={`btn ${etat.statut === "valeur" ? "toggle-active" : ""} ${erreur && etat.statut === "valeur" ? "is-erronee" : ""}`}
            onClick={() => onChange({ statut: "valeur", texte: etat.texte })}
          >
            Valeur finie
          </button>
        )}
      </div>
      {etat.statut === "valeur" && (
        <>
          <ApercuExpressionLatex texte={etat.texte} />
          <div className="field contenu-conditionnel">
            <input type="text" className={`text-input ${erreur ? "is-erronee" : ""}`} value={etat.texte} placeholder={config.placeholderValeur} onChange={(e) => onChange({ statut: "valeur", texte: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );
}

function reponseDepuisEtat(etat: EtatPartie): ReponseLimiteLog | null {
  if (etat.statut === null) return null;
  if (etat.statut === "valeur") return etat.texte.trim() === "" ? null : { type: "valeur", texte: etat.texte };
  return { type: etat.statut };
}

/** Écran "cDiagnostic" (`6gen17`, famille C) — évalue séparément 2 parties (numérateur/
 * dénominateur, ou 2 facteurs selon le sous-type) AVANT toute conclusion, 2 sous-réponses
 * indépendantes combinées derrière UN SEUL bouton "Valider" (spec : "Champ : valeurs/statuts de
 * chaque partie"). Même patron que `EtapeFacteursC.tsx` (6gen6), étendu pour supporter une option
 * "Valeur finie" par partie. `App6gen17.tsx` doit le rendre avec `key={phase}`. */
export function EtapeDiagnosticC({ consigneEcran, enonceLatex, partie1, partie2, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [etat1, setEtat1] = useState<EtatPartie>({ statut: null, texte: "" });
  const [etat2, setEtat2] = useState<EtatPartie>({ statut: null, texte: "" });
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    const reponse1 = reponseDepuisEtat(etat1);
    const reponse2 = reponseDepuisEtat(etat2);
    if (reponse1 === null || reponse2 === null) return;
    onValider({ partie1: reponse1, partie2: reponse2 });
  }

  const pretAValider = reponseDepuisEtat(etat1) !== null && reponseDepuisEtat(etat2) !== null;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      <p className="prompt-text">{consigneEcran}</p>
      <GroupePartie config={partie1} etat={etat1} erreur={montrerErreurs} onChange={setEtat1} />
      <GroupePartie config={partie2} etat={etat2} erreur={montrerErreurs} onChange={setEtat2} />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!pretAValider} onClick={valider}>
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
