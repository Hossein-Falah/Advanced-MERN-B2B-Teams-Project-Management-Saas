const calculateNextRun = async (daysOfWeek: number[], timeOfDay: string) => {
    const now = new Date();

    const [hour, minute] = timeOfDay.split(":").map(Number);

    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);

        const day = date.getDay();

        if (daysOfWeek.includes(day)) {
            const runTime = new Date(date);
            runTime.setHours(hour);
            runTime.setMinutes(minute);
            runTime.setSeconds(0);
            runTime.setMilliseconds(0);

            if (runTime > now) {
                return runTime;
            }
        }
    }

    return null;
}

export default calculateNextRun;
