export class Key {
    static create(appropriation: string, blin: string, item: string, opAgency: string ): string {
        return `${appropriation}|${blin}|${item}|${opAgency}`;
    }
}