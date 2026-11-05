import qrcode from "qrcode-generator";

/**
 * QR code d'un lien, en SVG inline autonome (un seul `<path>`), pour les documents imprimables —
 * aucune image externe, aucune requête réseau à l'ouverture du fichier. Niveau de correction « M »,
 * taille automatique ; `taillePx` = côté du dessin, marge de 2 modules incluse.
 */
export function qrCodeSvg(texte: string, taillePx = 64, libelle = "QR code"): string {
  const qr = qrcode(0, "M");
  qr.addData(texte);
  qr.make();
  const n = qr.getModuleCount();
  const marge = 2;
  const cote = n + 2 * marge;
  let chemin = "";
  for (let ligne = 0; ligne < n; ligne++) {
    for (let col = 0; col < n; col++) {
      if (qr.isDark(ligne, col)) chemin += `M${col + marge},${ligne + marge}h1v1h-1z`;
    }
  }
  const titre = libelle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<svg class="qr" width="${taillePx}" height="${taillePx}" viewBox="0 0 ${cote} ${cote}" role="img" aria-label="${titre}" shape-rendering="crispEdges"><rect width="${cote}" height="${cote}" fill="#ffffff"/><path d="${chemin}" fill="#1b1d22"/></svg>`;
}
