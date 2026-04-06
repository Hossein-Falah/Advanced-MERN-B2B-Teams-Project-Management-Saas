export const calculateTrendFromChart = (chart: number[]) => {
    if (chart.length < 2) return 0;

    const today = chart[chart.length - 1];
    const yesterday = chart[chart.length - 2];

    if (yesterday === 0) {
        return today > 0 ? 100 : 0;
    }

    return Math.round(((today - yesterday) / yesterday) * 100);
};
