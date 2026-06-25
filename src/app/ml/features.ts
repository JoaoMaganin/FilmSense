// transform a film into tensor

export const GENRES = [
    28, 12, 16, 35, 80, 99, 18, 10751, 14,
    36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37
];

const normalize = (value: number, min: number, max: number) => (value - min) / ((max - min) || 1)

export function movieToFeatures(
    genres: number[],
    release_year: number,
    popularity: number,
    vote_average: number,
    vote_count: number,
    maxPopularity: number,
    maxVoteCount: number
  ): number[] {
    const firstYear = 1900
    const actualYear = new Date().getFullYear()
    const minPopularityAndVote = 0
    const maxVoteAverage = 10

    const genreVector = GENRES.map(g => genres.includes(g) ? 1 : 0);
    const normalized_release_year = normalize(release_year, firstYear, actualYear)
    const normalized_popularity = normalize(popularity, minPopularityAndVote, maxPopularity)
    const normalized_vote_average = normalize(vote_average, minPopularityAndVote, maxVoteAverage)
    const normalized_vote_count = normalize(vote_count, minPopularityAndVote, maxVoteCount)

    return [
        ...genreVector, 
        normalized_release_year,
        normalized_popularity,
        normalized_vote_average,
        normalized_vote_count
    ];
}