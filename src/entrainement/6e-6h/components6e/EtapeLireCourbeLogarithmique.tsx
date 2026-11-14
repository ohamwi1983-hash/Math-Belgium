import { useState } from "react";
import type { ReactNode } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ReponseLireCourbeLog } from "../moteur6e/typesLireCourbeLogarithmique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, FragmentConsigne } from "../ui6e/formatLireCourbeLogarithmique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranLireCourbeLog =
  | { type: "texte"; libelle: string; placeholder: string; rappel?: string }
  | { type: "ensemble"; libelleLatex: string }
  /** Choix fermé (une seule tentative) : une option par expression, `latex` déjà formaté. */
  | { type: "choix"; options: { lettre: string; latex: string }[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Bloc de données (figure(s), liste des expressions…), toujours visible. */
  blocDonnees: ReactNode;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranLireCourbeLog;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLireCourbeLog) => void;
  diagnostiquer: (reponse: ReponseLireCourbeLog) => StatutVerification;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen85` (saisie libre, domaine construit, ou choix fermé) — même structure que les
 * écrans du chantier : consigne générale → données → consigne de l'écran → travail → aide →
 * « Valider ». Une saisie illisible (`parse_error`) est signalée SANS être soumise : elle ne consomme
 * aucune tentative. Aucun filtre de frappe, aucun `inputMode`. `App6gen85.tsx` le rend avec une `key`
 * qui change à chaque écran ET à chaque nouvel exercice (saisie remise à vide).
 */
export function EtapeLireCourbeLogarithmique({
  consigneGenerale,
  blocDonnees,
  consigneEcran,
  mode,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation,
}: Props) {
  const [texte, setTexte] = useState("");
  const [ensemble, setEnsemble] = useState<EnsembleReelGuide | null>(null);
  const [choix, setChoix] = useState<number | null>(null);
  const [soumis, setSoumis] = useState<ReponseLireCourbeLog | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const reponse: ReponseLireCourbeLog | null =
    mode.type === "texte" ? (texte.trim() === "" ? null : { type: "texte", texte }) : mode.type === "ensemble" ? (ensemble ? { type: "ensemble", ensemble } : null) : choix === null ? null : { type: "choix", indice: choix };
  const montrerErreurs = (tentativesUtilisees > 0 || Boolean(validation?.revele)) && soumis !== null && !erreurLecture;
  const saisieInchangee = mode.type === "texte" && soumis?.type === "texte" && soumis.texte === texte;

  function valider() {
    if (reponse === null) return;
    if (diagnostiquer(reponse) === "parse_error") {
      setErreurLecture(true);
      return;
    }
    setErreurLecture(false);
    setSoumis(reponse);
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale} />} blocDonnees={blocDonnees} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "texte" && (
        <>
          {!validation && <ApercuExpressionLatex texte={texte} label={mode.libelle} />}
          <div className="field">
            <label className="field-label field-label-minuscule">{mode.libelle}</label>
            <input
              type="text"
              className={`text-input ${montrerErreurs && saisieInchangee ? "is-erronee" : ""}`}
              value={texte}
              placeholder={mode.placeholder}
              disabled={Boolean(validation)}
              onChange={(e) => {
                setErreurLecture(false);
                setTexte(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !validation) valider();
              }}
            />
          </div>
          {mode.rappel && !validation && <p className="prompt-text" style={{ fontSize: "0.9em", opacity: 0.85 }}>{mode.rappel}</p>}
        </>
      )}
      {mode.type === "ensemble" && <EnsembleReelGuideBuilder onChange={setEnsemble} label={mode.libelleLatex} erronee={montrerErreurs} disabled={Boolean(validation)} />}
      {mode.type === "choix" && (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {mode.options.map((option, i) => (
            <button
              key={option.lettre}
              type="button"
              aria-pressed={choix === i}
              className={`btn ${choix === i ? "toggle-active" : ""} ${montrerErreurs && choix === i ? "is-erronee" : ""}`}
              disabled={Boolean(validation)}
              onClick={() => setChoix(i)}
            >
              <strong>{option.lettre}</strong>&nbsp;: <Katex expression={option.latex} />
            </button>
          ))}
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
          <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={valider}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}
            </p>
          )}
          {montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent")}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
