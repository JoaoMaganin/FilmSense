// transform a film into tensor

import { Rating } from "../models/rating.model";

export const GENRES = [
    28, 12, 16, 35, 80, 99, 18, 10751, 14,
    36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37
];

const normalize = (value: number, min: number, max: number) => (value - min) / ((max - min) || 1)
export const MAX_POPULARITY = 500;
export const MAX_VOTE_COUNT = 100000;
export const MAX_VOTE_AVERAGE = 10;
export const MIN_YEAR = 1900;

export function movieToFeatures(
    genres: number[],
    release_year: number,
    popularity: number,
    vote_average: number,
    vote_count: number
): number[] {

    const genreVector = GENRES.map(g => genres.includes(g) ? 1 : 0);
    const normalized_release_year = normalize(release_year, MIN_YEAR, new Date().getFullYear())
    const normalized_popularity = normalize(popularity, 0, MAX_POPULARITY)
    const normalized_vote_average = normalize(vote_average, 0, MAX_VOTE_AVERAGE)
    const normalized_vote_count = normalize(vote_count, 0, MAX_VOTE_COUNT)

    return [
        ...genreVector,
        normalized_release_year,
        normalized_popularity,
        normalized_vote_average,
        normalized_vote_count
    ];
}

export function ratingToFeatures(rating: Rating): number[] {
    return movieToFeatures(
        rating.genres,
        rating.release_year,
        rating.popularity,
        0,
        0
    );
}