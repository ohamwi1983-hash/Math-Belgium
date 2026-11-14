import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui6e/formatTangentesLogarithmiques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

/** `champs` : un champ par valeur attendue ; `liste` : nombre de valeurs libre (1 à 3 lignes,
 * croix rouge pour retirer une ligne) — le nombre de solutions n'est jamais suggéré par l'écran. */
export type ModeEcranTangentes = { type: "champs"; champs: ChampDef[] } | { type: "liste"; champ: ChampDef; labelAjout: string };

const MESSAGE_SAISIE_ILLISIBLE = "Écriture non reconnue — vérifie ta saisie (parenthèses, opérateurs, virgule décimale). Aucune tentative n'est décomptée.";
const LIGNES_MAX = 3;

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Figure (chaîne SVG autonome) sous les données. */
  figureSvg: string | null;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranTangentes;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Statut champ par champ (`liste` : un seul statut pour toute la liste). */
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  messageSpecifique: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen87` — même structure que l'écran de 6gen79 (`EtapeEncadrerIntegrales`) :
 * consigne générale → données (+ figure) → consigne de l'écran → champs (aperçu LaTeX au-dessus de
 * chaque champ) → aide → « Valider ». Saisie illisible : message de syntaxe, AUCUNE tentative
 * décomptée. `App6gen87.tsx` le rend avec une `key` qui change à chaque écran ET à chaque nouvel
 * exercice (saisie remise à vide).
 */
export function EtapeTangentesLogarithmiques({
  consigneGenerale,
  blocDonnees,
  figureSvg,
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
  messageSpecifique,
  validation,
}: Props) {
  const nombreInitial = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreInitial }, () => ""));
  const [valeursSoumises, setValeursSoumises] = useState<string[] | null>(null);
  const [saisieIllisible, setSaisieIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0 && valeursSoumises !== null;
  const statuts = montrerErreurs && valeursSoumises ? diagnostiquer(valeursSoumises) : null;
  /** Liste : les champs ne sont rouges que tant qu'ils contiennent encore la liste soumise. */
  const listeInchangee = valeursSoumises !== null && valeursSoumises.length === valeurs.length && valeursSoumises.every((v, i) => v === valeurs[i]);
  const toutRempli = valeurs.length > 0 && valeurs.every((v) => v.trim() !== "");
  const message = montrerErreurs && valeursSoumises ? messageSpecifique(valeursSoumises) : null;

  function changer(index: number, valeur: string) {
    setSaisieIllisible(false);
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  function ajouterLigne() {
    if (valeurs.length >= LIGNES_MAX) return;
    setSaisieIllisible(false);
    setValeurs((prev) => [...prev, ""]);
  }

  function retirerLigne(index: number) {
    setSaisieIllisible(false);
    setValeurs((prev) => prev.filter((_, i) => i !== index));
  }

  function valider() {
    if (!toutRempli) return;
    if (diagnostiquer(valeurs).includes("parse_error")) {
      setSaisieIllisible(true);
      return;
    }
    setSaisieIllisible(false);
    setValeursSoumises(valeurs);
    onValider(valeurs);
  }

  function erreurChamp(i: number): boolean {
    if (!statuts) return false;
    if (mode.type === "liste") return listeInchangee && statuts[0] !== "correct";
    return statuts[i] !== undefined && statuts[i] !== "correct";
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} block />
              ))}
            </div>
          </div>
        }
      />
      {figureSvg && <div className="figure-tangentes-log" style={{ textAlign: "center", margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: figureSvg }} />}
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champs" ? (
        <div>
          {mode.champs.map((champ, i) => (
            <div className="field" key={i}>
              <ApercuExpressionLatex texte={valeurs[i]} label={champ.label} />
              <label className="field-label field-label-minuscule" htmlFor={`champ-6gen87-${i}`}>
                {champ.label}
              </label>
              <input
                id={`champ-6gen87-${i}`}
                type="text"
                autoComplete="off"
                className={`text-input ${erreurChamp(i) ? "is-erronee" : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={!!validation}
                onChange={(e) => changer(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="contenu-conditionnel">
          {valeurs.map((ligne, i) => (
            <div key={i} className="field">
              <ApercuExpressionLatex texte={ligne} label={mode.champ.label} />
              <label className="field-label field-label-minuscule" htmlFor={`champ-6gen87-${i}`}>
                {mode.champ.label}
              </label>
              <div className="field-row">
                <input
                  id={`champ-6gen87-${i}`}
                  type="text"
                  autoComplete="off"
                  className={`text-input ${erreurChamp(i) ? "is-erronee" : ""}`}
                  value={ligne}
                  placeholder={mode.champ.placeholder}
                  disabled={!!validation}
                  onChange={(e) => changer(i, e.target.value)}
                />
                {valeurs.length > 1 && !validation && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la valeur ${i + 1}`} onClick={() => retirerLigne(i)}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {valeurs.length < LIGNES_MAX && !validation && (
            <button type="button" className="btn" onClick={ajouterLigne}>
              {mode.labelAjout}
            </button>
          )}
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
          <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
            Valider
          </button>
          {saisieIllisible ? (
            <p className="alert-error" role="alert">
              {MESSAGE_SAISIE_ILLISIBLE}
            </p>
          ) : (
            montrerErreurs && (
              <p className="alert-error" role="alert">
                {formatMessageErreur(tentativesUtilisees, tentativesMax)}
                {message ? ` ${message}` : ""}
              </p>
            )
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
