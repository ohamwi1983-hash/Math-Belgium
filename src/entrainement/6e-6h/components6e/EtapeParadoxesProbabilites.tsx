import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionParadoxe } from "../ui6e/formatParadoxesProbabilites";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranParadoxe =
  | { type: "champs"; champs: ChampDef[] }
  /** `note: false` : prédiction (jamais fausse) — validation neutre au lieu de « Bonne réponse ! ». */
  | { type: "choix"; options: OptionParadoxe[]; note: boolean };

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Arbre (chaîne SVG autonome) affiché sous les données, `null` si inutile pour cet écran. */
  figureSvg: string | null;
  consigneEcran: FragmentConsigne[];
  /** Rappel de la prédiction de l'élève (écran de conclusion seulement). */
  rappelPrediction?: FragmentConsigne[] | null;
  mode: ModeEcranParadoxe;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Statut champ par champ : seuls les champs faux sont marqués. */
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen76` (champs libres OU choix fermé) — même structure que les écrans du
 * chapitre (`EtapeChampsIndependanceBayes`, `EtapeChoixProbabilitesProblemes`) : consigne générale
 * → données (+ arbre) → bloc de travail → aide → « Valider ». Choix fermé : une seule tentative,
 * boutons `.btn.toggle-active` (jamais `.btn-primary`, réservé à « Valider »). `App6gen76.tsx` le
 * rend avec une `key` qui change à chaque écran ET à chaque nouvel exercice (saisie remise à vide).
 */
export function EtapeParadoxesProbabilites({
  consigneGenerale,
  blocDonnees,
  figureSvg,
  consigneEcran,
  rappelPrediction,
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
  const nombreChamps = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreChamps }, () => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const statuts = montrerErreurs ? diagnostiquer(valeurs) : null;
  const dernierStatut: StatutVerification | null = statuts ? (statuts.includes("parse_error") ? "parse_error" : statuts.every((s) => s === "correct") ? "correct" : "not_equivalent") : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const prediction = mode.type === "choix" && !mode.note;

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          blocDonnees.length > 0 ? (
            <div className="equation-box">
              <div className="equation-box-donnees">
                {blocDonnees.map((frag, i) => (
                  <Katex key={i} expression={frag} block />
                ))}
              </div>
            </div>
          ) : null
        }
      />
      {/* Arbre HORS du bandeau teinté de l'énoncé : ses étiquettes ont un halo couleur de carte. */}
      {figureSvg && <div className="figure-arbre-paradoxe" style={{ textAlign: "center", margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: figureSvg }} />}
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {rappelPrediction && rappelPrediction.length > 0 && (
        <p className="prompt-text">
          <strong>Ta prédiction : </strong>
          <RenduFragments fragments={rappelPrediction} />
        </p>
      )}
      {mode.type === "champs" ? (
        // Champs EMPILÉS (étiquette au-dessus du champ) : les étiquettes sont des phrases (« Gagner en
        // changeant, si elle n'y est pas »), `.field-inline` les écrasait et débordait à 390 px.
        <div>
          {mode.champs.map((champ, i) => (
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <input
                type="text"
                className={`text-input ${statuts && statuts[i] !== "correct" ? "is-erronee" : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={!!validation}
                onChange={(e) => changer(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${statuts && valeurs[0] === option.id && statuts[0] !== "correct" ? "is-erronee" : ""}`}
              disabled={!!validation}
              onClick={() => changer(0, option.id)}
            >
              <span>
                <RenduFragments fragments={option.fragments} />
              </span>
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
          <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={() => toutRempli && onValider(valeurs)}>
            Valider
          </button>
          {montrerErreurs && dernierStatut !== "correct" && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
            </p>
          )}
        </>
      )}
      {validation && prediction && (
        <div className="validation-ecran">
          <p className="prompt-text">Prédiction enregistrée : on la confrontera au calcul à la fin.</p>
          <button type="button" className="btn btn-primary" onClick={validation.onSuivant}>
            {validation.labelSuivant}
          </button>
        </div>
      )}
      {validation && !prediction && <ValidationEcran {...validation} />}
    </div>
  );
}
