const calculateNextRun = async (
    daysOfWeek: number[],
    timeOfDay: string,
    timezone: string = "Asia/Tehran"
) => {
    const [hour, minute] = timeOfDay.split(":").map(Number);
    const now = new Date();

    // find timezone user
    const nowInTZ = new Date(now.toLocaleString("en-US", { timeZone: timezone }));

    for (let i = 0; i < 8; i++) {
        const candidate = new Date(nowInTZ);
        candidate.setDate(nowInTZ.getDate() + i);
        candidate.setHours(hour, minute, 0, 0);

        const day = candidate.getDay(); // 0-6 (Sun-Sat)

        if (daysOfWeek.includes(day) && candidate > nowInTZ) {

            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                year: "numeric", month: "numeric", day: "numeric",
                hour: "numeric", minute: "numeric", second: "numeric",
                hour12: false
            });

            let low = new Date(candidate.getTime() - 24 * 60 * 60 * 1000);
            let high = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);

            const parts = formatter.formatToParts(candidate);
            const p: any = {};
            parts.forEach(part => p[part.type] = part.value);

            const targetISO = `${p.year}-${p.month.padStart(2, '0')}-${p.day.padStart(2, '0')}T${p.hour.padStart(2, '0')}:${p.minute.padStart(2, '0')}:00`;

            const dateInUTC = new Date(candidate.getTime());
            const offset = new Date(dateInUTC.toLocaleString("en-US", { timeZone: timezone })).getTime() - dateInUTC.getTime();

            return new Date(candidate.getTime() - offset);
        }
    }

    return null;
}

export default calculateNextRun;
