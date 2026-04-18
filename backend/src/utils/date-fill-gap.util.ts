export const generateDateRange = (start: Date, end: Date) => {
    const dates = [];
    const current = new Date(start);

    while (current <= end) {
        dates.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}
