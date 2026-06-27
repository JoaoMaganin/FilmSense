import * as tf from '@tensorflow/tfjs';

export interface TrainingData {
    xs: tf.Tensor2D;
    ys: tf.Tensor2D;
    inputDimensions: number;
}