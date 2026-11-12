import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideFrequence, ChampDef, FragmentConsigne, OptionChoix, TableauFrequence } from "../ui6e/formatFrequenceProbabilite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeSaisieFrequence = { type: "champ"; champ: ChampDef; diagnostiquer: (valeurs: string[]) => StatutVerification } | { type: "choix"; options: OptionChoix[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  tableaux: TableauFrequence[];
  /** Figure SVG autonome sous les données (diagramme fréquences/modèle, grille surlignée) — null si aucune. */
  figureDonnees: string | null;
  consigneEcran: FragmentConsigne[];
  mode: ModeSaisieFrequence;
  aideNiveau1: AideFrequence;
  aideNiveau2: AideFrequence;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

/** Tableau en lecture seule (texte brut) — réutilise `.summary-table`/`.summary-table-scroll`. */
function TableauDonnees({ tableau }: { tableau: TableauFrequence }) {
  return (
    <div className="summary-table-scroll">
      <table className="summary-table">
        {tableau.titre && <caption style={{ captionSide: "top", textAlign: "left", fontWeight: 600, padding: "4px 0" }}>{tableau.titre}</caption>}
        <tbody>
          {tableau.lignes.map((ligne, i) => (
            <tr key={i}>{ligne.cellules.map((c, j) => (ligne.entete || j === 0 ? <th key={j}>{c}</th> : <td key={j}>{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Figure({ svg }: { svg: string }) {
  // SVG produit par `ui6e/figuresFrequenceProbabilite.ts` à partir des seules données de l'exercice.
  return <div style={{ textAlign: "center", margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

function Aide({ aide }: { aide: AideFrequence }) {
  return (
    <>
      <p>{aide.texte}</p>
      {aide.latex && <Katex expression={aide.latex} block />}
      {aide.figureHtml && <Figure svg={aide.figureHtml} />}
    </>
  );
}

/**
 * Écran unique de `6gen75` : champ texte (probabilité, fréquence, effectif attendu) OU choix fermé
 * (« impossible a priori » en C, verdict de l'écran 3). Structure imposée : consigne générale →
 * données (tableau des effectifs, règle de décision, figure) → travail. Choix fermé : boutons
 * `.btn.toggle-active` (jamais `.btn-primary`), une seule tentative (le moteur la fixe). L'appli le
 * rend avec une `key` propre à l'exercice ET à l'écran : la saisie repart vide.
 */
export function EtapeFrequenceProbabilite({
  consigneGenerale,
  tableaux,
  figureDonnees,
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
  validation,
}: Props) {
  const [texte, setTexte] = useState("");
  const [choix, setChoix] = useState<string | null>(null);
  const [choixRefuse, setChoixRefuse] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const pret = mode.type === "champ" ? texte.trim() !== "" : choix !== null;

  function valider() {
    if (!pret) return;
    if (mode.type === "champ") onValider([texte]);
    else if (choix !== null) {
      setChoixRefuse(choix);
      onValider([choix]);
    }
  }

  const message = montrerErreurs ? (mode.type === "champ" ? formatMessageErreur(tentativesUtilisees, tentativesMax, mode.diagnostiquer([texte])) : `Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}.`) : null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <>
            {tableaux.map((t, i) => (
              <TableauDonnees key={i} tableau={t} />
            ))}
            {figureDonnees && <Figure svg={figureDonnees} />}
          </>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champ" ? (
        <div className="field">
          <label className="field-label" htmlFor="champ-6gen75">
            {mode.champ.label}
          </label>
          <input
            id="champ-6gen75"
            type="text"
            inputMode="text"
            autoComplete="off"
            className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
            value={texte}
            placeholder={mode.champ.placeholder}
            disabled={!!validation}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !validation) valider();
            }}
          />
        </div>
      ) : (
        <div className="options-grid-compact">
          {mode.options.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={!!validation}
              className={`btn ${choix === o.id ? "toggle-active" : ""} ${montrerErreurs && choixRefuse === o.id ? "is-erronee" : ""}`}
              onClick={() => setChoix(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <Aide aide={aideNiveau1} />
          {niveauAide >= 2 && <Aide aide={aideNiveau2} />}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!pret} onClick={valider}>
            Valider
          </button>
          {message && (
            <p className="alert-error" role="alert">
              {message}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
