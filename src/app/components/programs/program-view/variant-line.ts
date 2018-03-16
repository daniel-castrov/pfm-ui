export interface VariantLine {
    cycle: number,
    name: string,
    id: string,
    description: string,
    branch: string,
    contractor: string,
    unitcost: number,
    quantities: Map<number, number>,
    total: number
}
