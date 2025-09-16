const connections = [
  // Face
  [0, 1], [0, 2], [1, 3], [2, 4],
  // Body
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], [5, 11], [6, 12], [11, 12],
  // Legs
  [11, 13], [13, 15], [12, 14], [14, 16]
];

// This function now accepts a 'color' parameter
export const drawCanvas = (poses, videoWidth, videoHeight, ctx, canvasRef, color = '#00FF00') => {
  const canvas = canvasRef.current;
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-videoWidth, 0);

  if (poses && poses.length > 0) {
    poses.forEach(pose => {
      // Pass the color to the drawing functions
      drawKeypoints(pose.keypoints, 0.6, ctx, color);
      drawSkeleton(pose.keypoints, 0.7, ctx, color);
    });
  }
  
  ctx.restore();
};

function drawKeypoints(keypoints, minConfidence, ctx, color) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];
    if (keypoint.score > minConfidence) {
      const { x, y } = keypoint;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = color; // Use the dynamic color
      ctx.fill();
    }
  }
}

function drawSkeleton(keypoints, minConfidence, ctx, color) {
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
      ctx.strokeStyle = color; // Use the dynamic color
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}
