import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { ReponseLimite } from "../moteur6e/verificationLimitesExponentielles";
import type { DirectionLabel, FragmentConsigne } from "../ui6e/formatEtudeFonctionLogarithme";
import { CONSIGNE_GENERALE, PLACEHOLDER_LIMITE_VALEUR } from "../ui6e/formatEtudeFonctionLogarithme";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

type Statut = "plus_infini" | "moins_infini" | "zero" | "valeur";
const OPTIONS: { id: Statut; latex: string }[] = [
  { id: "plus_infini", latex: "+\\infty" },
  { id: "moins_infini", latex: "-\\infty" },
  { id: "zero", latex: "0" },
];

interface EtatLocal {
  statut: Statut | null;
  texte: string;
}

function GroupeLimite({ label, etat, erreur, onChange }: { label: string; etat: EtatLocal; erreur: boolean; onChange: (e: EtatLocal) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">
        <Katex expression={label} />
      </p>
      <div className="options-grid-compact">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${etat.statut === o.id ? "toggle-active" : ""} ${erreur && etat.statut === o.id ? "is-erronee" : ""}`} onClick={() => onChange({ statut: o.id, texte: etat.texte })}>
            <Katex expression={o.latex} />
          </button>
        ))}
        <button type="button" className={`btn ${etat.statut === "valeur" ? "toggle-active" : ""} ${erreur && etat.statut === "valeur" ? "is-erronee" : ""}`} onClick={() => onChange({ statut: "valeur", texte: etat.texte })}>
          Valeur finie
        </button>
      </div>
      {etat.statut === "valeur" && (
        <input type="text" className={`text-input contenu-conditionnel ${erreur ? "is-erronee" : ""}`} value={etat.texte} placeholder={PLACEHOLDER_LIMITE_VALEUR} onChange={(e) => onChange({ statut: "valeur", texte: e.target.value })} />
      )}
    </div>
  );
}

interface Props {
  enonceLatex: string;
  consigneEcran: FragmentConsigne[];
  labels: DirectionLabel[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLimite[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "limites" — arité VARIABLE (2 directions, 6 pour la famille C, voir
 * `ui6e/formatEtudeFonctionLogarithme.ts::directionLabelsLimites`) — UN SEUL composant générique.
 * `App6gen21.tsx` le rend avec une `key` qui change à chaque exercice. */
export function EtapeLimitesMultiLog({ enonceLatex, consigneEcran, labels, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [etats, setEtats] = useState<EtatLocal[]>(() => labels.map(() => ({ statut: null, texte: "" })));
  /** Dernière réponse soumise — seule une direction encore identique à cette réponse refusée est
   * marquée en rouge (jamais un nouveau choix pas encore validé). */
  const [soumis, setSoumis] = useState<EtatLocal[] | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && !validation;
  const refusee = (i: number) => montrerErreurs && soumis !== null && soumis[i].statut === etats[i].statut && soumis[i].texte === etats[i].texte;

  function complet(e: EtatLocal): boolean {
    return e.statut !== null && (e.statut !== "valeur" || e.texte.trim() !== "");
  }
  const tousComplets = etats.every(complet);

  function majEtat(index: number, nouvel: EtatLocal) {
    setEtats((courants) => courants.map((e, i) => (i === index ? nouvel : e)));
  }

  function valider() {
    if (!tousComplets) return;
    setSoumis(etats);
    const reponse: ReponseLimite[] = etats.map((e) => (e.statut === "valeur" ? { type: "valeur", texte: e.texte } : { type: e.statut as "plus_infini" | "moins_infini" | "zero" }));
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
      {labels.map((l, i) => (
        <GroupeLimite key={l.id} label={l.latex} etat={etats[i]} erreur={refusee(i)} onChange={(e) => majEtat(i, e)} />
      ))}
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
        <button type="button" className="btn btn-primary" disabled={!tousComplets} onClick={valider}>
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
