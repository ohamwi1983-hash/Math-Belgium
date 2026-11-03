import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { SigneCroissance } from "../core6e/etudeFonctionLogarithme.types";
import type { ReponseCroissanceGrilleC } from "../moteur6e/verificationEtudeFonctionLogarithme";
import type { FragmentConsigne } from "../ui6e/formatEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE, PLACEHOLDER_VALEUR_EXTREMUM } from "../ui6e/formatEtudeFonctionLogarithme";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  enonceLatex: string;
  consigneEcran: FragmentConsigne[];
  /** Les 4 intervalles en LaTeX, délimités par les 2 valeurs exclues et le zéro de f'
   * (`intervallesGrilleCLatex`). */
  intervalles: string[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCroissanceGrilleC) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "croissance", forme "grilleC" — famille C uniquement : tableau de signe de f' à 4 cases
 * FIXES (domaine à 3 branches + zéro de f'), plus la VALEUR de l'extremum local (sa position est
 * l'une des bornes affichées, la demander n'aurait rien vérifié). */
export function EtapeCroissanceGrilleCLog({ enonceLatex, consigneEcran, intervalles, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [signes, setSignes] = useState<(SigneCroissance | null)[]>([null, null, null, null]);
  const [valeur, setValeur] = useState("");
  /** Dernière réponse soumise — une case n'est rouge que si elle n'a pas changé depuis ce refus. */
  const [soumis, setSoumis] = useState<ReponseCroissanceGrilleC | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && !validation;
  const caseRefusee = (i: number) => montrerErreurs && soumis !== null && soumis.signes[i] === signes[i];
  const valeurRefusee = montrerErreurs && soumis !== null && soumis.valeurExtremum === valeur;

  const complet = signes.every((s) => s !== null) && valeur.trim() !== "";

  function majSigne(index: number, valeur: SigneCroissance) {
    setSignes(signes.map((s, i) => (i === index ? valeur : s)));
  }

  function valider() {
    if (!complet) return;
    const reponse = { signes: signes as SigneCroissance[], valeurExtremum: valeur };
    setSoumis(reponse);
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
        <RenduFragments fragments={consigneEcran} />
      </p>
      {intervalles.map((label, i) => (
        <div className="field" key={label}>
          <p className="field-label field-label-minuscule">
            <Katex expression={label} />
          </p>
          <div className="options-grid-compact">
            <button
              type="button"
              className={`btn ${signes[i] === "croissante" ? "toggle-active" : ""} ${caseRefusee(i) && signes[i] === "croissante" ? "is-erronee" : ""}`}
              onClick={() => majSigne(i, "croissante")}
            >
              Croissante
            </button>
            <button
              type="button"
              className={`btn ${signes[i] === "decroissante" ? "toggle-active" : ""} ${caseRefusee(i) && signes[i] === "decroissante" ? "is-erronee" : ""}`}
              onClick={() => majSigne(i, "decroissante")}
            >
              Décroissante
            </button>
          </div>
        </div>
      ))}
      <ApercuExpressionLatex texte={valeur} />
      <div className="field">
        <label className="field-label field-label-minuscule">Valeur de l'extremum local</label>
        <input type="text" className={`text-input ${valeurRefusee ? "is-erronee" : ""}`} value={valeur} placeholder={PLACEHOLDER_VALEUR_EXTREMUM} onChange={(e) => setValeur(e.target.value)} />
      </div>
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
