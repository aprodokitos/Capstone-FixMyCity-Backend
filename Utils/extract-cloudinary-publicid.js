function extractPublicId(imageUrl) {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/");

    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
    const publicIdParts = parts.slice(versionIndex + 1);

    const fullPath = decodeURIComponent(publicIdParts.join("/"));
    const publicId = fullPath.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    return null;
  }
}

module.exports = extractPublicId;