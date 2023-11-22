import { ResourcesForBuild, ROBBER_TOKEN_NUMBER } from "consts";

export const getResourcesTotalToKeep = (resourceCards) => {
  const count = getResourcesTotal(resourceCards);

  if (count <= ROBBER_TOKEN_NUMBER) {
    return count;
  } else {
    return count - Math.trunc(count / 2);
  }
};

export const getResourcesTotal = (resourceCards) => {
  return resourceCards.reduce((sum, card) => card + sum, 0);
};

export const hasPlayerEnoughResources = (type, player) => {
  return Object.entries(ResourcesForBuild[type]).every(
    ([key, value]) => player.resourceCards[key] >= value
  );
};

export const calculatePlayerLongestRoad = (playerName, players) => {
  let longestRoad = 0;

  const player = players.find((player) => player.name === playerName);

  player.roads.forEach((playerRoad) => {
    const roadsMappedByDistance = [[playerRoad]];

    let isComplete = false;

    while (!isComplete) {
      const remainingRoads = player.roads.filter(
        (road) =>
          !roadsMappedByDistance
            .flat()
            .find((mappedRoad) => mappedRoad === road)
      );

      const nextNeighbours = remainingRoads.filter((road) =>
        roadsMappedByDistance[roadsMappedByDistance.length - 1].find(
          (neighbour) =>
            road.split("-")[0] === neighbour.split("-")[1] ||
            road.split("-")[1] === neighbour.split("-")[1] ||
            road.split("-")[0] === neighbour.split("-")[0] ||
            road.split("-")[1] === neighbour.split("-")[0]
        )
      );

      const connectedRoadEdges = nextNeighbours
        .map((neighbourRoad) => neighbourRoad.split("-"))
        .flat()
        .filter((neighbourRoad) =>
          roadsMappedByDistance[roadsMappedByDistance.length - 1]
            .map((mappedRoad) => mappedRoad.split("-"))
            .flat()
            .some((mappedRoad) => mappedRoad === neighbourRoad)
        );

      const isRoadCutOffByOtherPlayer = players.find(
        (play) =>
          play.name !== player.name &&
          (play.settlements.some((settlement) =>
            connectedRoadEdges.some(
              (roadEdge) => settlement === Number(roadEdge)
            )
          ) ||
            play.cities.some((city) =>
              connectedRoadEdges.some((roadEdge) => city === Number(roadEdge))
            ))
      );

      if (nextNeighbours.length === 0 || isRoadCutOffByOtherPlayer) {
        isComplete = true;

        if (roadsMappedByDistance.length > longestRoad) {
          longestRoad = roadsMappedByDistance.length;
        }
      }

      if (nextNeighbours.length > 0 && isComplete === false) {
        roadsMappedByDistance.push(nextNeighbours);
      }
    }
  });

  return longestRoad;
};
