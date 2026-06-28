// define, train and salve the model
import { Rating } from "../models/rating.model";
import * as tf from '@tensorflow/tfjs';
import { GENRES, ratingToFeatures } from "./features";
import { TrainingData } from "../models/trainindata.model";

function prepareTrainingData(ratings: Rating[]) {
    const inputs: number[][] = [];
    const labels: number[] = [];

    ratings.forEach(rating => {
        const features = ratingToFeatures(rating);
        inputs.push(features)
        labels.push(rating.rating / 10) // normalizes scores from 1–10 to 0–1
    })

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),
        inputDimensions: GENRES.length + 4
    }
}

async function buildModel(trainData: TrainingData) {
    const model = tf.sequential()

    model.add(
        tf.layers.dense({
            inputShape: [trainData.inputDimensions],
            units: 128,
            activation: 'relu'
        }
        ))

    model.add(tf.layers.dense({ units: 16, activation: 'relu' }))

    // The final activation is “linear” rather than “sigmoid”
    // because we are predicting a continuous score, not a probability
    model.add(
        tf.layers.dense({
            units: 1,
            activation: 'linear'
        })
    )

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError',
        metrics: ['mse']
    })

    await model.fit(trainData.xs, trainData.ys, {
        epochs: 50,
        batchSize: 8,
        shuffle: true
    })

    return model
}
export async function trainModel(ratings: Rating[]): Promise<tf.Sequential> {
    const trainData = prepareTrainingData(ratings)
    const model = await buildModel(trainData)

    trainData.xs.dispose();
    trainData.ys.dispose();

    return model
}