export class Key {
    static create(appropriation: string, baOrBlin: string, item: string, opAgency: string ): string {
        return `${appropriation}|${baOrBlin}|${item}|${opAgency}`;
    }
}