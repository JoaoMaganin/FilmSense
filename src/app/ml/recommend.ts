// search and generate recommendations
import * as tf from '@tensorflow/tfjs'
import { TmdbMovie } from '../models/tmdb.model';
import { movieToFeatures } from './features';

export async function recommend(
    model: tf.Sequential,
    candidates: TmdbMovie[],
    ratedTmdbIds: number[]
): Promise<TmdbMovie[]> {
    const filtered = candidates.filter(movie => !ratedTmdbIds.includes(movie.id));

    const moviesFeatures = filtered.map(film => movieToFeatures(
        film.genre_ids,
        parseInt(film.release_date?.split('-')[0] ?? '0'),
        film.popularity,
        0,
        0
    ));

    const inputTensor = tf.tensor2d(moviesFeatures);
    const predictionTensor = model.predict(inputTensor) as tf.Tensor;
    const scores = predictionTensor.dataSync();

    inputTensor.dispose();
    predictionTensor.dispose();

    const recommendations = filtered.map((item, index) => {
        return {
            ...item,
            score: scores[index]
        }
    })

    const sortedMovies = recommendations.sort((a, b) => b.score - a.score)

    return sortedMovies.slice(0, 20);
}