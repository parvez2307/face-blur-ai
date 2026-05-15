export type FaceBox = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  velocityX: number;
  velocityY: number;
  confidence: number;
  life: number;
};

let nextId = 1;

export function trackFaces(
  previous: FaceBox[],
  detected: FaceBox[]
) {
  const updated: FaceBox[] = [];

  detected.forEach((newFace) => {
    let matched: FaceBox | undefined;

    let closest = Infinity;

    previous.forEach((oldFace) => {
      const dx =
        oldFace.centerX -
        newFace.centerX;

      const dy =
        oldFace.centerY -
        newFace.centerY;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      if (
        distance < 140 &&
        distance < closest
      ) {
        closest = distance;
        matched = oldFace;
      }
    });

    if (matched !== undefined) {
      updated.push({
        ...matched,

        x:
          matched.x * 0.7 +
          newFace.x * 0.3,

        y:
          matched.y * 0.7 +
          newFace.y * 0.3,

        width:
          matched.width * 0.7 +
          newFace.width * 0.3,

        height:
          matched.height * 0.7 +
          newFace.height * 0.3,

        centerX:
          matched.centerX * 0.7 +
          newFace.centerX * 0.3,

        centerY:
          matched.centerY * 0.7 +
          newFace.centerY * 0.3,

        velocityX:
          newFace.centerX -
          matched.centerX,

        velocityY:
          newFace.centerY -
          matched.centerY,

        confidence: 1,

        life: 45,
      });
    } else {
      updated.push({
        ...newFace,
        id: nextId++,
      });
    }
  });

  const surviving = previous.filter(
    (oldFace) =>
      !updated.some(
        (newFace) =>
          newFace.id ===
          oldFace.id
      )
  );

  return [
    ...updated,
    ...surviving,
  ];
}