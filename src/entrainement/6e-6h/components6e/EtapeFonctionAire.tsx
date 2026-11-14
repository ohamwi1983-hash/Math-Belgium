import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { MESSAGE_SAISIE_ILLISIBLE } from "../ui6e/formatFonctionAire";
import type { AideAvecLatex, ChampDef, FragmentConsigne, LigneChoix } from "../ui6e/formatFonctionAire";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranFonctionAire =
  | { type: "champs"; champs: ChampDef[] }
  /** Tableau de choix fermés : une option par ligne (une seule tentative pour l'écran). */
  | { type: "lignes"; lignes: LigneChoix[] }
  /** Graphiques candidats (chaînes SVG), `id` = indice canonique. */
  | { type: "graphes"; graphes: { id: string; svg: string }[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Courbe de f (chaîne SVG autonome), affichée sous l'énoncé sur chaque écran. */
  figureSvg: string;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranFonctionAire;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  validation?: ValidationEtapeProps | null;
  /** Figure du corrigé (courbe de A, aires utilisées), montrée une fois l'exercice terminé. */
  figureCorrige?: string | null;
}

/**
 * Écran unique de `6gen78` « La fonction aire » : consigne générale → données → courbe de f
 * (quadrillage) → bloc de travail (champs libres, tableau de choix, ou graphiques) → aide →
 * « Valider ». Même structure que `EtapeParadoxesProbabilites` (6gen76). Choix fermés : boutons
 * `.btn.toggle-active`, une seule tentative. Saisie illisible : message de syntaxe, aucune tentative
 * décomptée. `App6gen78.tsx` le rend avec une `key` qui change à chaque écran ET à chaque nouvel
 * exercice (saisie remise à vide).
 */
export function EtapeFonctionAire({
  consigneGenerale,
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
  validation,
  figureCorrige,
}: Props) {
  const nombre = mode.type === "champs" ? mode.champs.length : mode.type === "lignes" ? mode.lignes.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombre }, () => ""));
  const [saisieIllisible, setSaisieIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0 && !saisieIllisible;
  const statuts = montrerErreurs || validation ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

  function changer(index: number, valeur: string) {
    setSaisieIllisible(false);
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  function valider() {
    if (!toutRempli) return;
    if (mode.type === "champs" && diagnostiquer(valeurs).includes("parse_error")) {
      setSaisieIllisible(true);
      return;
    }
    setSaisieIllisible(false);
    onValider(valeurs);
  }

  const marque = (i: number) => (statuts && statuts[i] !== "correct" ? "is-erronee" : "");

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={null}
      />
      <figure className="figure-fonction-aire" style={{ margin: "12px 0", textAlign: "center" }} aria-label="Courbe de f" dangerouslySetInnerHTML={{ __html: figureSvg }} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>

      {mode.type === "champs" && (
        <div>
          {mode.champs.map((champ, i) => (
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule" htmlFor={`champ-6gen78-${i}`}>
                <RenduFragments fragments={champ.label} />
              </label>
              <input
                id={`champ-6gen78-${i}`}
                type="text"
                autoComplete="off"
                className={`text-input ${montrerErreurs ? marque(i) : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={!!validation}
                onChange={(e) => changer(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {mode.type === "lignes" && (
        <div>
          {mode.lignes.map((ligne, i) => (
            <div key={i} className="field" style={{ marginBottom: 10 }}>
              <p className="field-label field-label-minuscule" style={{ marginBottom: 4 }}>
                <RenduFragments fragments={ligne.label} />
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ligne.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`btn ${valeurs[i] === option.id ? "toggle-active" : ""} ${valeurs[i] === option.id ? marque(i) : ""}`}
                    style={{ flex: "1 1 auto", minHeight: 44 }}
                    disabled={!!validation}
                    aria-pressed={valeurs[i] === option.id}
                    onClick={() => changer(i, option.id)}
                  >
                    <RenduFragments fragments={option.fragments} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {mode.type === "graphes" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, margin: "8px 0" }}>
          {mode.graphes.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`btn ${valeurs[0] === g.id ? "toggle-active" : ""} ${valeurs[0] === g.id ? marque(0) : ""}`}
              style={{ padding: 4, minHeight: 44 }}
              disabled={!!validation}
              aria-pressed={valeurs[0] === g.id}
              onClick={() => changer(0, g.id)}
            >
              <span style={{ display: "block", width: "100%" }} dangerouslySetInnerHTML={{ __html: g.svg }} />
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
              </p>
            )
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {validation && figureCorrige && (
        <figure style={{ margin: "12px 0 0", textAlign: "center" }} aria-label="Corrigé : aires utilisées et courbe de A">
          <p className="prompt-text" style={{ textAlign: "left" }}>
            Les aires utilisées (vert : au-dessus de l'axe, rouge : en dessous) et la courbe de la fonction aire A :
          </p>
          <div dangerouslySetInnerHTML={{ __html: figureCorrige }} />
        </figure>
      )}
    </div>
  );
}
