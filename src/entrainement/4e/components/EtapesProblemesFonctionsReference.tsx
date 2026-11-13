import { useState } from "react";
import type { SolutionEnsemble } from "../core/inequation.types";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { construireMorceau, etatMorceauInitial, type EtatMorceau } from "../ui/morceauIntervalle";
import { MorceauIntervalleInput } from "./MorceauIntervalleInput";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écrans de gen68 (`AppProblemesFonctionsReference.tsx`). Composants « bêtes » : textes, aides et
 * messages arrivent déjà construits (`ui/formatProblemesFonctionsReference.ts`), la vérification se
 * fait dans le moteur. Les champs vivent ici : l'appli les remonte (clé = numéro d'exercice) pour
 * qu'ils repartent vides après « Nouvel exercice » ou « Générer ».
 */

interface PropsCommunes {
  consigne: FragmentConsigne[];
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
  validation?: ValidationEtapeProps | null;
}

function BlocAides({ aides, niveauAide }: { aides: FragmentConsigne[][]; niveauAide: number }) {
  if (niveauAide === 0) return null;
  return (
    <div className="triangle-quelconque-aide">
      {aides.slice(0, niveauAide).map((fragments, i) => (
        <p key={i}>
          <RenduFragments fragments={fragments} />
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — expression de la fonction (saisie libre)
// ---------------------------------------------------------------------------------------------

interface PropsFonction extends PropsCommunes {
  libelle: string;
  placeholder: string;
  /** Message d'erreur de la dernière tentative refusée (déjà formulé), `null` sinon. */
  messageErreur: string | null;
  onValider: (saisie: string) => void;
}

export function EtapeFonctionProbleme({ consigne, aides, niveauAide, onActiverAide, validation, libelle, placeholder, messageErreur, onValider }: PropsFonction) {
  const [saisie, setSaisie] = useState("");
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <ApercuExpressionLatex texte={saisie} label={libelle} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="pfr-fonction">
          {libelle}
        </label>
        <input
          id="pfr-fonction"
          className={`text-input${messageErreur ? " is-erronee" : ""}`}
          placeholder={placeholder}
          value={saisie}
          disabled={Boolean(validation)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && saisie.trim() !== "" && !validation) onValider(saisie);
          }}
        />
      </div>
      <BlocAides aides={aides} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={saisie.trim() === ""} onClick={() => onValider(saisie)}>
            Valider
          </button>
          {messageErreur && (
            <p className="alert-error" role="alert">
              {messageErreur}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans 2 et 4 — choix fermé, une seule tentative
// ---------------------------------------------------------------------------------------------

interface PropsChoix extends PropsCommunes {
  /** Options dans l'ordre d'affichage : `index` = indice dans la liste d'origine (0 = la bonne). */
  options: { index: number; contenu: string; latex: boolean }[];
  onValider: (index: number) => void;
}

export function EtapeChoixProbleme({ consigne, aides, niveauAide, onActiverAide, validation, options, onValider }: PropsChoix) {
  const [choix, setChoix] = useState<number | null>(null);
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <div className={options.some((o) => !o.latex) ? "options-grid" : "options-grid-compact"}>
        {options.map((o) => (
          <button
            key={o.index}
            type="button"
            className={`btn${choix === o.index ? " toggle-active" : ""}${validation?.revele && choix === o.index ? " is-erronee" : ""}`}
            disabled={Boolean(validation)}
            onClick={() => setChoix(o.index)}
          >
            {o.latex ? <Katex expression={o.contenu} /> : o.contenu}
          </button>
        ))}
      </div>
      <BlocAides aides={aides} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — ensemble-solution (un intervalle ou une union de deux intervalles)
// ---------------------------------------------------------------------------------------------

type Forme = "intervalle" | "union";

const OPTIONS_FORME: { valeur: Forme; libelle: string }[] = [
  { valeur: "intervalle", libelle: "Un intervalle" },
  { valeur: "union", libelle: "Une union de deux intervalles" },
];

interface PropsEnsemble extends PropsCommunes {
  messageErreur: string | null;
  onValider: (saisie: SolutionEnsemble) => void;
}

export function EtapeEnsembleProbleme({ consigne, aides, niveauAide, onActiverAide, validation, messageErreur, onValider }: PropsEnsemble) {
  const [forme, setForme] = useState<Forme | null>(null);
  const [morceau, setMorceau] = useState<EtatMorceau>(etatMorceauInitial());
  const [morceau1, setMorceau1] = useState<EtatMorceau>(etatMorceauInitial());
  const [morceau2, setMorceau2] = useState<EtatMorceau>(etatMorceauInitial());

  function choisirForme(f: Forme) {
    setForme(f);
    setMorceau(etatMorceauInitial());
    setMorceau1(etatMorceauInitial());
    setMorceau2(etatMorceauInitial());
  }

  function construireReponse(): SolutionEnsemble | null {
    if (forme === "intervalle") {
      const mo = construireMorceau(morceau);
      return mo ? { forme: "intervalle", morceau: mo } : null;
    }
    if (forme === "union") {
      const m1 = construireMorceau(morceau1);
      const m2 = construireMorceau(morceau2);
      return m1 && m2 ? { forme: "union", morceau1: m1, morceau2: m2 } : null;
    }
    return null;
  }

  const reponse = construireReponse();

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <div className="options-grid">
        {OPTIONS_FORME.map((o) => (
          <button key={o.valeur} type="button" className={forme === o.valeur ? "btn toggle-active" : "btn"} disabled={Boolean(validation)} onClick={() => choisirForme(o.valeur)}>
            {o.libelle}
          </button>
        ))}
      </div>
      {forme === "intervalle" && (
        <div className="field">
          <MorceauIntervalleInput etat={morceau} onChange={setMorceau} />
        </div>
      )}
      {forme === "union" && (
        <div className="field">
          <MorceauIntervalleInput etat={morceau1} onChange={setMorceau1} />
          <p className="union-separator">∪</p>
          <MorceauIntervalleInput etat={morceau2} onChange={setMorceau2} />
        </div>
      )}
      <BlocAides aides={aides} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={() => reponse !== null && onValider(reponse)}>
            Valider
          </button>
          {messageErreur && (
            <p className="alert-error" role="alert">
              {messageErreur}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
