import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

export const usePoseNet = () => {
  const [detector, setDetector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAndLoadModel() {
      try {
        // --- THIS IS THE FIX ---
        // Explicitly set the backend to WebGL to avoid the WebGPU bug
        await tf.setBackend('webgl');
        // -----------------------

        await tf.ready();
        console.log("TensorFlow.js backend initialized.");

        const model = posedetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        const loadedDetector = await posedetection.createDetector(model, detectorConfig);
        
        setDetector(loadedDetector);
        setLoading(false);
        console.log("MoveNet model loaded successfully.");
      } catch (error) {
        console.error("Error loading MoveNet model:", error);
      }
    }
    initAndLoadModel();
  }, []);

  return { detector, loading };
};
