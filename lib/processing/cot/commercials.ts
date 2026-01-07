export function computeCommercialMetrics(
  history: {
    commercialLong: number;
    commercialShort: number;
  }[]
) {
  const net = history.map(
    h => h.commercialLong - h.commercialShort
  );

  const min = Math.min(...net);
  const max = Math.max(...net);
  const current = net.at(-1)!;

  const cotIndex =
    max === min ? 50 : ((current - min) / (max - min)) * 100;

  return {
    netPosition: current,
    cotIndex,
    range: { min, max },
  };
}
