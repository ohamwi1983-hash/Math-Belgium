import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExercicePerspectiveCavaliere, PointDessin } from "./core/perspectiveCavaliere.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePerspectiveCavaliere } from "./generateurs/perspectiveCavaliere";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { acquerir, activerAide, aPlacer, demarrer, echec, ecranSuivant, tentativesMax, type EtatPerspectiveCavaliere } from "./moteur/sessionPerspectiveCavaliere";
import { aimanter, diagnostiquerSommet, sommet, verifierAretes, type BilanAretes } from "./moteur/verificationPerspectiveCavaliere";
import {
  NOMBRE_ECRANS,
  aidesEcran,
  consigneEcran,
  consigneGlobale,
  enonce,
  explicationAretes,
  figureEcran,
  messageDiagnostic,
  reponseEcran,
  texteMesure,
  titreEcran,
  type EtatPointEleve,
} from "./ui/formatCavaliere";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { FigurePerspectiveCavaliere } from "./components/FigurePerspectiveCavaliere";
import { EtapeAretes, EtapePlacement } from "./components/EtapesPerspectiveCavaliere";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen104 — « Dessiner en perspective cavalière » (4e, chapitre 8 « Géométrie dans l'espace », section
 * `cavaliere`, processus 2 APPLIQUER). Vraie construction sur un quadrillage de 1 cm : le dessin
 * d'un pavé, d'un prisme droit ou d'une pyramide est commencé (face avant en vraie grandeur ; arête
 * [AB] pour la pyramide) ; l'élève
 * 1. place un premier sommet arrière au bout de sa fuyante (45°, réduite de moitié) ;
 * 2. place les autres sommets arrière (fuyantes parallèles, de même longueur) — ou le sommet S de la
 *    pyramide (à la verticale du centre de la base, hauteur en vraie grandeur) ;
 * 3. classe les arêtes en vues (trait plein) ou cachées (pointillés), validation globale.
 * Placement libre au doigt (une seule poignée, aimant vers la position exacte), 3 tentatives ;
 * classement : une tentative. Aucun point affiché. `?code=` : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExercicePerspectiveCavaliere {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExercicePerspectiveCavaliere();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExercicePerspectiveCavaliere, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  derniere: boolean;
  bilan: string | null;
}

export function AppPerspectiveCavaliere() {
  const [etat, setEtat] = useState<EtatPerspectiveCavaliere>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : tout repart vide après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  /** Positions BRUTES des points de l'élève (avant aimant). */
  const [brutes, setBrutes] = useState<Record<string, PointDessin>>({});
  const [marques, setMarques] = useState<Record<string, EtatPointEleve>>({});
  const [actif, setActif] = useState<string | null>(() => null);
  const [messages, setMessages] = useState<string[] | null>(null);
  const [pointillees, setPointillees] = useState<Set<string>>(new Set());
  const [bilanAretes, setBilanAretes] = useState<BilanAretes | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;
  if (import.meta.env.DEV) (window as unknown as { __debugGen104?: unknown }).__debugGen104 = { exercice: e, connus: etat.connus };
  const noms = aPlacer(e, ecran);
  const actifCourant = actif && noms.includes(actif) && !etat.connus.includes(actif) ? actif : (noms.find((n) => !etat.connus.includes(n)) ?? null);

  function reinitialiserEcran() {
    setBrutes({});
    setMarques({});
    setActif(null);
    setMessages(null);
    setEnAttente(null);
  }

  function recommencer(exercice: ExercicePerspectiveCavaliere) {
    setEtat(demarrer(exercice));
    reinitialiserEcran();
    setHistorique([]);
    setFicheOuverteIndex(null);
    setPointillees(new Set());
    setBilanAretes(null);
    setGeneration((g) => g + 1);
  }

  function clore(nouvelEtat: EtatPerspectiveCavaliere, revele: boolean, votreReponse: ReactNode, bilan: string | null) {
    setEtat(nouvelEtat);
    setHistorique((h) => [...h, ecranClos(titreEcran(e, ecran), votreReponse, revele, etat.niveauAide > 0, <p style={{ margin: 0 }}>{reponseEcran(e, ecran)}</p>)]);
    setEnAttente({ revele, derniere: ecran >= NOMBRE_ECRANS - 1, bilan });
  }

  function deplacer(p: PointDessin) {
    if (!actifCourant || enAttente) return;
    setBrutes((b) => ({ ...b, [actifCourant]: p }));
    setMarques((m) => ({ ...m, [actifCourant]: "place" }));
  }

  function validerPlacement() {
    const restants = noms.filter((n) => !etat.connus.includes(n));
    const autres = [...e.sommets.map((s) => s.nom)];
    const diagnostics = restants.map((n) => ({ n, p: aimanter(e, n, brutes[n]!), d: diagnostiquerSommet(e, n, aimanter(e, n, brutes[n]!), autres) }));
    const justes = diagnostics.filter((x) => x.d.code === "juste").map((x) => x.n);
    const reponse = (
      <>
        {diagnostics.map((x) => (
          <p key={x.n} style={{ margin: 0 }}>
            {texteMesure(e, x.n, x.p)}
          </p>
        ))}
      </>
    );
    if (justes.length === restants.length) {
      clore(acquerir(etat, restants), false, reponse, reponseEcran(e, ecran));
      setMessages(null);
      return;
    }
    const r = echec(acquerir(etat, justes));
    if (r.epuise) {
      clore(acquerir(r.etat, restants), true, reponse, reponseEcran(e, ecran));
      setMessages(null);
      return;
    }
    setEtat(r.etat);
    setMarques((m) => ({ ...m, ...Object.fromEntries(diagnostics.filter((x) => x.d.code !== "juste").map((x) => [x.n, "faux" as const])) }));
    const plusieurs = restants.length > 1;
    setMessages(diagnostics.filter((x) => x.d.code !== "juste").map((x) => (plusieurs ? `${x.n} : ` : "") + messageDiagnostic(x.n, x.d)).concat(plusieurs && justes.length > 0 ? [`${justes.join(", ")} : bien placé${justes.length > 1 ? "s" : ""}, maintenant fixé${justes.length > 1 ? "s" : ""}.`] : []));
  }

  function validerAretes() {
    const bilan = verifierAretes(e, pointillees);
    setBilanAretes(bilan);
    const choisies = e.aretes.filter((a) => pointillees.has(a.cle)).map((a) => `[${a.a}${a.b}]`);
    clore(etat, !bilan.correct, <p style={{ margin: 0 }}>{choisies.length ? `En pointillés : ${choisies.join(", ")}` : "Aucune arête en pointillés"}</p>, null);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExercicePerspectiveCavaliere());
      return;
    }
    setEtat(ecranSuivant(etat));
    reinitialiserEcran();
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <p style={{ margin: 0 }}>{reponseEcran(e, ecran)}</p>,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: ecran === 2 ? "Ce n'était pas le bon classement des arêtes." : undefined,
      }
    : null;

  const communs = { aides: aidesEcran(e, ecran), niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran < 2) {
      const places = Object.fromEntries(Object.entries(brutes).filter(([n]) => !etat.connus.includes(n)).map(([n, p]) => [n, { p: aimanter(e, n, p), etat: marques[n] ?? "place" }]));
      const svg = figureEcran(e, { connus: etat.connus, places, actif: enAttente ? null : actifCourant, diagonales: e.variante === "pyramide" && ecran === 1 });
      const brute = actifCourant ? (brutes[actifCourant] ?? null) : null;
      const affichee = actifCourant && brute ? aimanter(e, actifCourant, brute) : null;
      const figure = (
        <FigurePerspectiveCavaliere
          svg={svg}
          cadre={e.cadreEcran}
          positionActive={enAttente ? null : affichee}
          positionBrute={brute}
          onDeplacer={enAttente ? undefined : deplacer}
          libelle={`Dessin de ${e.variante === "pyramide" ? "la pyramide" : e.variante === "prisme" ? "du prisme" : "du pavé"} sur un quadrillage de 1 cm`}
        />
      );
      return (
        <EtapePlacement
          {...communs}
          consigne={consigneEcran(e, ecran)}
          figure={figure}
          noms={noms}
          verrouilles={noms.filter((n) => etat.connus.includes(n))}
          actif={actifCourant}
          onChoisirActif={setActif}
          poses={Object.keys(brutes)}
          mesure={actifCourant && affichee ? texteMesure(e, actifCourant, affichee) : null}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMax(ecran)}
          messages={messages}
          onValider={validerPlacement}
          bilan={enAttente?.bilan ?? null}
        />
      );
    }
    const clos = !!enAttente;
    const fausses = clos && bilanAretes && !bilanAretes.correct ? new Set([...bilanAretes.manquees, ...bilanAretes.enTrop]) : null;
    // Après un classement faux : le bon classement, les arêtes mal classées en rouge.
    const montrees = fausses ? new Set(e.aretes.filter((a) => a.cachee).map((a) => a.cle)) : pointillees;
    const svg = figureEcran(e, { connus: e.sommets.map((s) => s.nom), pointillees: montrees, fausses });
    const basculer = (cle: string) =>
      setPointillees((s) => {
        const n = new Set(s);
        if (n.has(cle)) n.delete(cle);
        else n.add(cle);
        return n;
      });
    const figure = <FigurePerspectiveCavaliere svg={svg} cadre={e.cadreEcran} aretes={clos ? [] : e.aretes.map((a) => ({ cle: a.cle, a: sommet(e, a.a).dessin, b: sommet(e, a.b).dessin }))} onBasculer={clos ? undefined : basculer} libelle="Dessin complet : arêtes à classer" />;
    return (
      <EtapeAretes
        {...communs}
        consigne={consigneEcran(e, ecran)}
        figure={figure}
        aretes={e.aretes.map((a) => a.cle)}
        pointillees={pointillees}
        onBasculer={basculer}
        fausses={fausses}
        explication={clos && bilanAretes ? explicationAretes(e, bilanAretes) : null}
        onValider={validerAretes}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Dessiner en perspective cavalière</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={`${enonce(e)} ${consigneGlobale(e)}`} blocDonnees={null} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
