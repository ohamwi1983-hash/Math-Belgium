import type { EtatMorceau } from "../ui/morceauIntervalle";
import { crochetDroitEffectif, crochetGaucheEffectif, etatMorceauInitial } from "../ui/morceauIntervalle";
import { MorceauIntervalleInput } from "./MorceauIntervalleInput";
import { Katex } from "./Katex";
import { ENSEMBLE_REELS, ENSEMBLE_VIDE, ensembleLatex, ensemblePoints, intervalleReel, lireNombreSaisi, lireValeurs, normaliserEnsemble, reelsSauf, type EnsembleReel } from "../ui/ensembleSolutionTrinome";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Saisie guidée d'un ensemble-solution (4e, chapitre 2 : gen121, gen117) — mêmes six allures que
 * l'écran « ensemble-solution » de gen2 (∅, ℝ, valeurs isolées, ℝ privé de valeurs, un intervalle,
 * union de deux intervalles), avec les rangées de bornes de `MorceauIntervalleInput` (crochets à
 * choisir, ±∞). Les champs ne sont JAMAIS filtrés (règle CLAUDE.md) : seule `normaliserSigneMoins`
 * est appliquée ; une borne ou une valeur illisible rend la saisie « illisible » (aucune tentative
 * comptée par l'appelant). Fractions et racines acceptées (« 1/2 », « sqrt(5) »).
 */

export type FormeSaisieEnsemble = "vide" | "reels" | "points" | "reelsSauf" | "intervalle" | "union";

export interface EtatSaisieEnsemble {
  forme: FormeSaisieEnsemble | null;
  valeurs: string;
  morceau1: EtatMorceau;
  morceau2: EtatMorceau;
}

export function etatSaisieEnsembleInitial(): EtatSaisieEnsemble {
  return { forme: null, valeurs: "", morceau1: etatMorceauInitial(), morceau2: etatMorceauInitial() };
}

export type LectureSaisieEnsemble = { statut: "incomplet" } | { statut: "illisible" } | { statut: "ok"; ensemble: EnsembleReel };

const LIBELLES: Record<FormeSaisieEnsemble, string> = {
  vide: "∅",
  reels: "ℝ",
  points: "Des valeurs isolées",
  reelsSauf: "ℝ privé de valeurs",
  intervalle: "Un intervalle",
  union: "Union de deux intervalles",
};

const TOUTES: FormeSaisieEnsemble[] = ["vide", "reels", "points", "reelsSauf", "intervalle", "union"];

function lireMorceau(m: EtatMorceau): EnsembleReel | "incomplet" | "illisible" {
  const cg = crochetGaucheEffectif(m);
  const cd = crochetDroitEffectif(m);
  const gTexte = m.borneGaucheValeur.trim();
  const dTexte = m.borneDroiteValeur.trim();
  if (cg === null || cd === null || (m.borneGaucheMode === "nombre" && gTexte === "") || (m.borneDroiteMode === "nombre" && dTexte === "")) return "incomplet";
  const g = m.borneGaucheMode === "-inf" ? null : lireNombreSaisi(gTexte);
  const d = m.borneDroiteMode === "+inf" ? null : lireNombreSaisi(dTexte);
  if ((m.borneGaucheMode === "nombre" && g === null) || (m.borneDroiteMode === "nombre" && d === null)) return "illisible";
  return [intervalleReel(g, cg === "[", d, cd === "]")];
}

/** Lecture de la saisie : incomplète (bouton « Valider » grisé), illisible, ou un ensemble. */
export function lireSaisieEnsemble(etat: EtatSaisieEnsemble): LectureSaisieEnsemble {
  switch (etat.forme) {
    case null:
      return { statut: "incomplet" };
    case "vide":
      return { statut: "ok", ensemble: ENSEMBLE_VIDE };
    case "reels":
      return { statut: "ok", ensemble: ENSEMBLE_REELS };
    case "points":
    case "reelsSauf": {
      if (etat.valeurs.trim() === "") return { statut: "incomplet" };
      const v = lireValeurs(etat.valeurs);
      if (v === null || v.length === 0) return { statut: "illisible" };
      return { statut: "ok", ensemble: etat.forme === "points" ? ensemblePoints(v) : reelsSauf(v) };
    }
    case "intervalle": {
      const m = lireMorceau(etat.morceau1);
      return typeof m === "string" ? { statut: m } : { statut: "ok", ensemble: normaliserEnsemble(m) };
    }
    case "union": {
      const m1 = lireMorceau(etat.morceau1);
      const m2 = lireMorceau(etat.morceau2);
      if (m1 === "incomplet" || m2 === "incomplet") return { statut: "incomplet" };
      if (m1 === "illisible" || m2 === "illisible") return { statut: "illisible" };
      return { statut: "ok", ensemble: normaliserEnsemble([...m1, ...m2]) };
    }
  }
}

interface Props {
  etat: EtatSaisieEnsemble;
  onChange: (etat: EtatSaisieEnsemble) => void;
  fige: boolean;
  /** Champ souligné (dernière tentative fausse). */
  erronee?: boolean;
  /** Nom de l'ensemble dans l'aperçu (« S »). */
  nom?: string;
}

export function SaisieEnsembleSolutionTrinome({ etat, onChange, fige, erronee = false, nom = "S" }: Props) {
  const lecture = lireSaisieEnsemble(etat);
  const choisir = (forme: FormeSaisieEnsemble) => onChange({ ...etatSaisieEnsembleInitial(), forme });
  return (
    <div style={{ minWidth: 0 }}>
      <div className="options-grid" role="group" aria-label="Allure de l'ensemble">
        {TOUTES.map((forme) => (
          <button key={forme} type="button" disabled={fige} aria-pressed={etat.forme === forme} className={`btn${etat.forme === forme ? " toggle-active" : ""}${erronee && etat.forme === forme ? " is-erronee" : ""}`} style={{ minHeight: 44, whiteSpace: "normal", lineHeight: 1.3 }} onClick={() => choisir(forme)}>
            {LIBELLES[forme]}
          </button>
        ))}
      </div>
      {(etat.forme === "points" || etat.forme === "reelsSauf") && (
        <div className="field contenu-conditionnel" style={{ display: "grid", gap: 6 }}>
          <label className="field-label field-label-minuscule" htmlFor="saisie-ensemble-valeurs">
            {etat.forme === "points" ? "Les valeurs, séparées par « ; »" : "Les valeurs exclues, séparées par « ; »"}
          </label>
          <input
            id="saisie-ensemble-valeurs"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={etat.valeurs}
            disabled={fige}
            onChange={(ev) => onChange({ ...etat, valeurs: normaliserSigneMoins(ev.target.value) })}
          />
        </div>
      )}
      {(etat.forme === "intervalle" || etat.forme === "union") && (
        <div className="field contenu-conditionnel" style={{ pointerEvents: fige ? "none" : undefined, opacity: fige ? 0.75 : undefined }}>
          <MorceauIntervalleInput etat={etat.morceau1} onChange={(m) => onChange({ ...etat, morceau1: { ...m, borneGaucheValeur: normaliserSigneMoins(m.borneGaucheValeur), borneDroiteValeur: normaliserSigneMoins(m.borneDroiteValeur) } })} />
          {etat.forme === "union" && (
            <>
              <p className="union-separator">∪</p>
              <MorceauIntervalleInput etat={etat.morceau2} onChange={(m) => onChange({ ...etat, morceau2: { ...m, borneGaucheValeur: normaliserSigneMoins(m.borneGaucheValeur), borneDroiteValeur: normaliserSigneMoins(m.borneDroiteValeur) } })} />
            </>
          )}
        </div>
      )}
      {lecture.statut === "ok" && (
        <div className="apercu-box" aria-live="polite">
          <Katex expression={`${nom}=${ensembleLatex(lecture.ensemble)}`} />
        </div>
      )}
    </div>
  );
}
