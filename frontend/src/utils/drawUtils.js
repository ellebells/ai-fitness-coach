const connections = [
  // Face
  [0, 1], [0, 2], [1, 3], [2, 4],
  // Body
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], [5, 11], [6, 12], [11, 12],
  // Legs
  [11, 13], [13, 15], [12, 14], [14, 16]
];

// Draws the skeleton and keypoints on the canvas
export const drawCanvas = (poses, videoWidth, videoHeight, ctx, canvasRef) => {
  const canvas = canvasRef.current;
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // --- NEW: Flip the canvas context horizontally ---
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-videoWidth, 0);
  // -----------------------------------------------

  if (poses && poses.length > 0) {
    // We must also pass the video dimensions to the drawing functions now
    poses.forEach(pose => {
      drawKeypoints(pose.keypoints, 0.6, ctx);
      drawSkeleton(pose.keypoints, 0.7, ctx);
    });
  }
  
  // --- NEW: Restore the canvas context ---
  ctx.restore();
  // ---------------------------------------
};

function drawKeypoints(keypoints, minConfidence, ctx) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];
    if (keypoint.score > minConfidence) {
      const { x, y } = keypoint;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#00FF00';
      ctx.fill();
    }
  }
}

function drawSkeleton(keypoints, minConfidence, ctx) {
  connections.forEach(connection => {
    const [startPoint, endPoint] = connection;
    const startKeypoint = keypoints[startPoint];
    const endKeypoint = keypoints[endPoint];

    if (startKeypoint.score > minConfidence && endKeypoint.score > minConfidence) {
      const { x: startX, y: startY } = startKeypoint;
      const { x: endX, y: endY } = endKeypoint;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}