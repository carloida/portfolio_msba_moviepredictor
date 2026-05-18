export const genreImageMap: Record<string, string> = {
  Action: "/genre-images/Action.png",
  Adventure: "/genre-images/Adventure.png",
  Animation: "/genre-images/Animation.png",
  Biography: "/genre-images/Biography.png",
  Comedy: "/genre-images/Comedy.png",
  Crime: "/genre-images/Crime.png",
  Documentary: "/genre-images/Documentary.png",
  Drama: "/genre-images/Drama.png",
  Family: "/genre-images/Family.png",
  Fantasy: "/genre-images/Fantasy.png",
  "Film-Noir": "/genre-images/Film-Noir.png",
  History: "/genre-images/History.png",
  Horror: "/genre-images/Horror.png",
  Music: "/genre-images/Music.png",
  Musical: "/genre-images/Musical.png",
  Mystery: "/genre-images/Mystery.png",
  News: "/genre-images/News.png",
  Romance: "/genre-images/Romance.png",
  "Sci-Fi": "/genre-images/Sci-Fi.png",
  Sport: "/genre-images/Sport.png",
  Thriller: "/genre-images/Thriller.png",
  War: "/genre-images/War.png",
  Western: "/genre-images/Western.png",
  "\\N": "/genre-images/Unknown.png",
  Unknown: "/genre-images/Unknown.png"
};

export const genreOptions = Object.keys(genreImageMap).filter((genre) => genre !== "\\N");

export function imageForGenre(genre: string) {
  return genreImageMap[genre] || genreImageMap.Unknown;
}

export function displayGenre(genre: string) {
  return genre === "\\N" ? "Unknown" : genre;
}

export function formatMoney(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  return `$${Math.round(value / 1_000_000)}M`;
}
