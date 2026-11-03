import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ReponseCasBaseLog } from "../core6e/inequationsLogarithmiques.types";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { ReponseFConclure } from "../moteur6e/verificationInequationsLogarithmiques";
import { CONSIGNE_GENERALE } from "../ui6e/formatInequationsLogarithmiques";
import type { FragmentConsigne } from "../ui6e/formatInequationsLogarithmiques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFConclure) => void;
  /** Verdict cas par cas de la réponse soumise — seul le choix ∅/intervalle du cas réellement faux
   * passe en rouge (audit 6e ch. 3, point 4). */
  evaluerCas: (reponse: ReponseFConclure) => { superieur: boolean; inferieur: boolean };
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

interface EtatCas {
  statut: "vide" | "intervalle" | null;
  ensemble: EnsembleReelGuide | null;
}

const CAS_VIDE: EtatCas = { statut: null, ensemble: null };

function versReponse(etat: EtatCas): ReponseCasBaseLog | null {
  if (etat.statut === "vide") return { estVide: true, ensemble: null };
  if (etat.statut === "intervalle" && etat.ensemble !== null) return { estVide: false, ensemble: etat.ensemble };
  return null;
}

/**
 * Écran GÉNÉRIQUE "2 cas indépendants" (`6gen15`, famille F écran 3 — le seul écran à réponse
 * DOUBLE de ce générateur) : traiter séparément le cas `a>1` et le cas `0<a<1`, chacun étant soit
 * "∅" soit un `EnsembleReelGuide` à construire — jamais un 3e statut ajouté au type partagé (voir
 * `core6e/inequationsLogarithmiques.types.ts::ReponseCasBaseLog`). `.btn.toggle-active` pour le
 * choix ∅/intervalle (jamais `.btn-primary`, réservé à "Valider" — voir CLAUDE.md), constructeur
 * d'intervalle révélé dans un conteneur `.contenu-conditionnel` uniquement après le choix
 * "Un intervalle". `App6gen15.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeDeuxCasIneqLog({ consigneEcran, enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, evaluerCas, validation}: Props) {
  const [casSuperieur, setCasSuperieur] = useState<EtatCas>(CAS_VIDE);
  const [casInferieur, setCasInferieur] = useState<EtatCas>(CAS_VIDE);
  /** Statut soumis de chaque cas QUAND il a été refusé (`null` si ce cas était juste) — le rouge
   * disparaît dès que l'élève change le choix de ce cas. */
  const [refuses, setRefuses] = useState<{ superieur: EtatCas["statut"]; inferieur: EtatCas["statut"] }>({ superieur: null, inferieur: null });
  const montrerErreurs = tentativesUtilisees > 0;

  const reponseSuperieur = versReponse(casSuperieur);
  const reponseInferieur = versReponse(casInferieur);
  const complet = reponseSuperieur !== null && reponseInferieur !== null;

  function valider() {
    if (reponseSuperieur === null || reponseInferieur === null) return;
    const reponse = { casSuperieur: reponseSuperieur, casInferieur: reponseInferieur };
    const verdict = evaluerCas(reponse);
    setRefuses({ superieur: verdict.superieur ? null : casSuperieur.statut, inferieur: verdict.inferieur ? null : casInferieur.statut });
    onValider(reponse);
  }

  function renderCas(label: string, etat: EtatCas, setEtat: (e: EtatCas) => void, statutRefuse: EtatCas["statut"]) {
    return (
      <div className="field">
        <p className="field-label">{label}</p>
        <div className="options-grid-compact">
          <button
            type="button"
            className={`btn ${etat.statut === "vide" ? "toggle-active" : ""} ${montrerErreurs && statutRefuse === "vide" && etat.statut === "vide" ? "is-erronee" : ""}`}
            onClick={() => setEtat({ statut: "vide", ensemble: null })}
          >
            ∅ — Aucune solution
          </button>
          <button
            type="button"
            className={`btn ${etat.statut === "intervalle" ? "toggle-active" : ""} ${montrerErreurs && statutRefuse === "intervalle" && etat.statut === "intervalle" ? "is-erronee" : ""}`}
            onClick={() => setEtat({ statut: "intervalle", ensemble: etat.ensemble })}
          >
            Un intervalle (à construire)
          </button>
        </div>
        {etat.statut === "intervalle" && (
          <div className="contenu-conditionnel">
            <EnsembleReelGuideBuilder onChange={(ensemble) => setEtat({ statut: "intervalle", ensemble })} label="S =" />
          </div>
        )}
      </div>
    );
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
        <RenduFragments fragments={consigneEcran} />
      </p>

      {renderCas("Cas a>1", casSuperieur, setCasSuperieur, refuses.superieur)}
      {renderCas("Cas 0<a<1", casInferieur, setCasInferieur, refuses.inferieur)}

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
