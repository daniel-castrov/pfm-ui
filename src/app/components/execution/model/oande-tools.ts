import { ExecutionLine } from "../../../generated";

export class OandETools{
    static calculateToasAndReleaseds(exeline: ExecutionLine, snapshots: Map<Date, ExecutionLine>,
        maxidx: number, fy: number): ToaAndReleased[] {

        var rets: ToaAndReleased[] = [];
        rets.push({
            toa: exeline.initial,
            released: 0
        });
        for (var i = 1; i < maxidx; i++) {
            rets.push({
                toa: 0,
                released: 0
            });
        }

        // make sure we start from the earliest date to the latest
        var keys: Date[] = [];
        snapshots.forEach((el, date) => {
            keys.push(date)
        });
        keys.sort((a, b) => (a.getTime() == b.getTime() ? 0 : a.getTime() - b.getTime()));
        keys.forEach(date => {
            var el: ExecutionLine = snapshots.get(date);
            var idx: number = this.convertDateToFyMonth(fy, date);
            for (var i = idx; i < maxidx; i++) {
                rets[i].toa = el.toa;
                // snapshots show totals for that month (not cumulative) so aggregate!
                rets[i].released += el.released;
            }
        });

        return rets;
    }

    static convertDateToFyMonth(fy: number, timestamp: Date | number): number {
        if (typeof timestamp === 'number') {
            timestamp = new Date(timestamp);
        }

        var yeardiff: number = timestamp.getFullYear() - fy;

        // -9 because the FY starts in October
        return (yeardiff * 12) + timestamp.getMonth() - 9;
    }
}

export interface ToaAndReleased {
    toa: number,
    released: number
}