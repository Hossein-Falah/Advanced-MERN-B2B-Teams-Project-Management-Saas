export const calculateTrendFromChart = (chart: number[], trendRange: number) => {
    if (chart.length < 2) return 0;

    const today = chart[chart.length - 1];

    // get avarage before tody
    const daysToAverage = Math.min(trendRange, chart.length - 1);

    const previousDays = chart.slice(chart.length - 1 - daysToAverage, chart.length - 1);

    const sum = previousDays.reduce((a, b) => a + b, 0);
    const avg = sum / previousDays.length;


    if (avg === 0) {
        return today > 0 ? 100 : 0;
    }

    return Math.round(((today - avg) / avg) * 100);
};
