import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/** Rendu d'un graphique à une taille donnée — le MÊME composant que celui de la carte (seule la
 * taille change), fourni par l'écran qui le connaît. */
type Rendu = (largeur: number, hauteur: number) => ReactNode;

function IconeLoupe() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5M10.5 8v5M8 10.5h5" />
    </svg>
  );
}

function tailleAgrandie(ratio: number) {
  const largeurDispo = Math.min(window.innerWidth - 32, 960);
  const hauteurDispo = window.innerHeight - 120;
  const largeur = Math.max(200, Math.min(largeurDispo, hauteurDispo / ratio));
  return { largeur: Math.round(largeur), hauteur: Math.round(largeur * ratio) };
}

/** Panneau plein écran : le graphique redessiné en grand (Échap, bouton Fermer, focus rendu). */
function PanneauLoupe({ titre, rendu, ratio, onFermer }: { titre: ReactNode; rendu: Rendu; ratio: number; onFermer: () => void }) {
  const fermerRef = useRef<HTMLButtonElement>(null);
  const [taille, setTaille] = useState(() => tailleAgrandie(ratio));
  const fermerRappel = useRef(onFermer);
  fermerRappel.current = onFermer;
  useEffect(() => {
    const precedent = document.activeElement as HTMLElement | null;
    fermerRef.current?.focus({ preventScroll: true });
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermerRappel.current();
    };
    const surRedimension = () => setTaille(tailleAgrandie(ratio));
    document.addEventListener("keydown", surTouche);
    window.addEventListener("resize", surRedimension);
    return () => {
      document.removeEventListener("keydown", surTouche);
      window.removeEventListener("resize", surRedimension);
      precedent?.focus?.({ preventScroll: true });
    };
  }, [ratio]);
  return (
    <div className="gen-loupe-overlay no-export" role="dialog" aria-modal="true" aria-label={typeof titre === "string" ? titre : "Graphique agrandi"} onClick={(e) => e.stopPropagation()}>
      <div className="gen-loupe-entete">
        <p className="gen-loupe-titre">{titre}</p>
        <button type="button" className="btn" ref={fermerRef} onClick={onFermer}>
          Fermer
        </button>
      </div>
      <div className="gen-loupe-figure">{rendu(taille.largeur, taille.hauteur)}</div>
    </div>
  );
}

/**
 * Loupe d'une carte de graphique (maquette C, 22/11/2026) : bouton 44 × 44 en haut à droite de la
 * carte, ouvre le même graphique en plein écran. N'intervient jamais dans le choix (clic arrêté).
 */
export function LoupeGraphique({ titre, rendu, ratio }: { titre: string; rendu: Rendu; ratio: number }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <>
      <button
        type="button"
        className="gen-loupe no-export"
        aria-label={`Agrandir : ${titre}`}
        title="Agrandir"
        onClick={(e) => {
          e.stopPropagation();
          setOuvert(true);
        }}
      >
        <IconeLoupe />
      </button>
      {ouvert && <PanneauLoupe titre={titre} rendu={rendu} ratio={ratio} onFermer={() => setOuvert(false)} />}
    </>
  );
}

/**
 * Graphique de référence ÉPINGLÉ (maquette C) : sur téléphone, une bande compacte (vignette + titre)
 * reste sous la barre du haut pendant qu'on compare les propositions ; la toucher agrandit le même
 * graphique en plein écran. Sur ordinateur, la carte complète de l'écran reste affichée (la bande est
 * masquée par `cadre.css`). Le contenu est le même graphique, redessiné à une autre taille.
 */
export function ReferenceEpinglee({ titre, rendu, ratio }: { titre: string; rendu: Rendu; ratio: number }) {
  const [ouvert, setOuvert] = useState(false);
  const largeur = 120;
  return (
    <div className="graphe-reference-epingle no-export">
      <button type="button" className="graphe-reference-bouton" onClick={() => setOuvert(true)} aria-label={`${titre} : agrandir`}>
        <span className="graphe-reference-vignette" aria-hidden="true">
          {rendu(largeur, Math.round(largeur * ratio))}
        </span>
        <span className="graphe-reference-texte">
          <span className="graphe-reference-titre">{titre}</span>
          <span className="graphe-reference-aide">épinglé · touche pour agrandir</span>
        </span>
        <span className="gen-loupe graphe-reference-loupe" aria-hidden="true">
          <IconeLoupe />
        </span>
      </button>
      {ouvert && <PanneauLoupe titre={titre} rendu={rendu} ratio={ratio} onFermer={() => setOuvert(false)} />}
    </div>
  );
}
