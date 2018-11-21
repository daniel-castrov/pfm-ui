import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { OandEMonthly, ExecutionLine, Execution, ExecutionEvent, OSDGoalPlan } from '../../../generated';
import { OandETools, ToaAndReleased } from '../model/oande-tools';

import * as d3 from 'd3';
import 'rxjs/add/operator/takeUntil';

@Component({
    selector: 'graphs-tab',
    templateUrl: './graphs-tab.component.html',
    styleUrls: ['./graphs-tab.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        '(window:resize)': 'onResize($event)'
    }
})
export class GraphsTabComponent implements OnInit {
    private _oandes: OandEMonthly[];
    private _exeline: ExecutionLine;
    private _exe: Execution;
    private _deltas: Map<Date, ExecutionEvent>;
    private datasets: DataSet[];
    private maxmonths: number;
    private showPercentages: boolean;

    @Input() set exeline(e: ExecutionLine) {
        this._exeline = e;
        this.refreshGraph();
    }

    get exeline(): ExecutionLine {
        return this._exeline;
    }

    @Input() set exe(e: Execution) {
        this._exe = e;
        this.refreshGraph();
    }

    get exe(): Execution {
        return this._exe;
    }

    @Input() set oandes(o: OandEMonthly[]) {
        this._oandes = o;
        this.refreshGraph();
    }

    get oandes() {
        return this._oandes;
    }

    @Input() set deltas(evs: Map<Date, ExecutionLine>) {
        this._deltas = evs;
        this.refreshGraph();
    }

    get deltas(): Map<Date, ExecutionLine> {
        return this._deltas;
    }

    constructor() { }

    ngOnInit() {
    }

    onResize(event) {
        this.refreshGraph();
    }

    refreshGraph() {
        if (this._deltas && this._exe && this._exeline && this._oandes) {
            this.createDatasets();
            this.regraph();
        }
    }

    private createDatasets() {
        var progtype: string = this.exeline.appropriation;
        var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
        var egoals: OSDGoalPlan = this.exe.osdExpenditureGoals[progtype];

        var my: GraphsTabComponent = this;

        var cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() + 1);
        var fymonth = OandETools.convertDateToFyMonth(this.exe.fy, cutoff);
        // we can only graph up to the current month
        this.maxmonths = Math.min(ogoals.monthlies.length, egoals.monthlies.length, fymonth);

        // get our O&E values in order of month, so we can
        // run right through them
        var myoandes: OandEMonthly[] = [];
        this.oandes.forEach(oande => {
            myoandes[oande.month] = oande;
        });

        // calculate TOAs for these months
        var toasAndReleaseds: ToaAndReleased[]
            = OandETools.calculateToasAndReleaseds(this.exeline, this.deltas,
                this.maxmonths, this.exe.fy);

        var obgDataset: DataSet = {
            label: 'Obligation Goal' + (this.showPercentages ? ' %' : ''),
            csskey: 'obgplan',
            data: [],
            toas:[],
            status: [],
            notes: []
        };

        var expDataset: DataSet = {
            label: 'Expenditure Goal' + (this.showPercentages ? ' %' : ''),
            data: [],
            toas: [],
            status: [],
            csskey: 'expplan',
            notes: []
        };

        var realexpDataset: DataSet = {
            label: 'Actual Expenditures' + (this.showPercentages ? ' %' : ''),
            data: [],
            toas: [],
            status: [],
            csskey: 'realexp',
            notes: []
        };

        var realobgDataset: DataSet = {
            label: 'Actual Obligations' + (this.showPercentages ? ' %' : ''),
            data: [],
            toas: [],
            status: [],
            csskey: 'realobg',
            notes: []
        };

        var obgplanRed: DataSet = {
            csskey: 'planred',
            data: [],
            toas: [],
            status: [],
            notes: []
        };

        var expplanRed: DataSet = {
            csskey: 'planred',
            data: [],
            toas: [],
            status: [],
            notes: []
        };

        var makeHtmlNote = function (oande: OandEMonthly, title: string,
            goal: number, actual: number, toa: number) {

            var notes: string =
                title + ' Goal: ' + goal.toFixed(2) + ' (' + (goal / toa * 100).toFixed(2) + '%)'
                + '<br/>Actual: ' + actual.toFixed(2) + ' (' + (actual / toa * 100).toFixed(2) + '%)';
            if (oande && oande.explanation) {
                notes += '<br/>Explanation: ' + oande.explanation
                    + '<br/>Remediation: ' + oande.remediation
                    + '<br/>Months to Fix: ' + oande.monthsToFix;
            }

            return notes;
        }

        var getStatus = function (actual: number, goal: number, toa: number) :number {
            var diff: number = (goal - actual) / toa;
            if (diff > 0.10) {
                return 2;
            }
            if (diff >= 0 && diff <= 0.10) {
                return 1;
            }
            return 0;
        }

        var lastexp: number = 0;
        var lastobg: number = 0;
        for (var i = 0; i < this.maxmonths; i++) {
            var raw_toa: number = toasAndReleaseds[i].toa;

            if (this.showPercentages) {
                var toa = 100;
                var redtoa: number = toa * 0.1;
                var ogoalpct: number = 100 * (ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1);
                var egoalpct: number = 100 * (egoals.monthlies.length > i ? egoals.monthlies[i] : 1);

                obgDataset.toas.push(toa);
                obgDataset.data.push(ogoalpct);
                obgDataset.notes.push('Obligation Goal: ' + ogoalpct.toFixed(2) + '%');
                obgDataset.status.push(0);

                obgplanRed.toas.push(toa);
                obgplanRed.data.push(ogoalpct - redtoa);
                obgplanRed.notes.push('Obligation "Red Zone"');
                obgplanRed.status.push(0);

                expDataset.toas.push(toa);
                expDataset.data.push(egoalpct);
                expDataset.notes.push('Expenditure Goal: ' + egoalpct.toFixed(2) + '%');
                expDataset.status.push(0);

                expplanRed.toas.push(toa);
                expplanRed.data.push(egoalpct - redtoa);
                expplanRed.notes.push('Expenditure "Red Zone"');
                expplanRed.status.push(0);

                // we want cumulatives, so add last month's totals
                realexpDataset.toas.push(toa);
                realobgDataset.toas.push(toa);
                if (myoandes[i]) {
                    lastexp += myoandes[i].expensed;
                    lastobg += myoandes[i].obligated;
                }

                realexpDataset.data.push(0===raw_toa ? 0 : 100 * lastexp / raw_toa);
                realexpDataset.notes.push(makeHtmlNote(myoandes[i], 'Expenditure', egoalpct * raw_toa / 100, lastexp, raw_toa));
                realexpDataset.status.push(getStatus(lastexp, egoalpct * raw_toa / 100, raw_toa));

                realobgDataset.data.push(0 === raw_toa ? 0 : 100 * lastobg / raw_toa);
                realobgDataset.notes.push(makeHtmlNote(myoandes[i], 'Obligation', ogoalpct * raw_toa / 100, lastobg, raw_toa));
                realobgDataset.status.push(getStatus(lastobg, ogoalpct * raw_toa / 100, raw_toa));
            }
            else {
                var toa = raw_toa;
                var redtoa: number = toa * 0.1;
                var ogoalpct: number = (ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1);
                var egoalpct: number = (egoals.monthlies.length > i ? egoals.monthlies[i] : 1);
                var ogoaltoa: number = toa * ogoalpct;
                var egoaltoa: number = toa * egoalpct;

                obgDataset.toas.push(toa);
                obgDataset.data.push(ogoaltoa);
                obgDataset.notes.push('Obligation Goal: ' + ogoaltoa.toFixed(2) + ' (' + (ogoalpct * 100).toFixed(2) + '%)');
                obgDataset.status.push(0);

                obgplanRed.toas.push(toa);
                obgplanRed.data.push(ogoaltoa - redtoa);
                obgplanRed.notes.push('Obligation "Red Zone"');
                obgplanRed.status.push(0);

                expDataset.toas.push(toa);
                expDataset.data.push(egoaltoa);
                expDataset.notes.push('Expenditure Goal: ' + egoaltoa.toFixed(2) + ' (' + (egoalpct * 100).toFixed(2) + '%)');
                expDataset.status.push(0);

                expplanRed.toas.push(toa);
                expplanRed.data.push(egoaltoa - redtoa);
                expplanRed.notes.push('Expenditure "Red Zone"');
                expplanRed.status.push(0);

                // we want cumulatives, so add last month's totals
                realexpDataset.toas.push(toa);
                realobgDataset.toas.push(toa);
                if (myoandes[i]) {
                    lastexp += myoandes[i].expensed;
                    lastobg += myoandes[i].obligated;
                }

                realexpDataset.data.push(lastexp);
                realexpDataset.notes.push(makeHtmlNote(myoandes[i], 'Expenditure', egoalpct * raw_toa, lastexp, raw_toa));
                realexpDataset.status.push(getStatus(lastexp, egoalpct * raw_toa, raw_toa));

                realobgDataset.data.push(lastobg);
                realobgDataset.notes.push(makeHtmlNote(myoandes[i], 'Obligation', ogoalpct * raw_toa, lastobg, raw_toa));
                realobgDataset.status.push(getStatus(lastobg, ogoalpct * raw_toa, raw_toa));
            } 
        }

        this.datasets = [
            obgDataset,
            expDataset,
            obgplanRed,
            expplanRed,
            realexpDataset,
            realobgDataset
        ];
    }

    private regraph() {
        // 2. Use the margin convention practice
        var margin = { top: 50, right: 50, bottom: 50, left: 50 };

        var chartdiv = d3.select('#line-chart');
        var width = window.innerWidth - margin.left - margin.right - 90; // Use the window's width
        var height = window.innerHeight - margin.top - margin.bottom - 300; // Use the window's height

        //create a tooltip
        var div = d3.select("#line-chart")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // The number of datapoints
        var n = this.maxmonths;

        // 5. X scale will use the index of our data
        var xScale = d3.scaleLinear()
            .domain([0, n - 1]) // input
            .range([0, width]); // output

        // 6. Y scale will use the randomly generate number
        // figure out our max number
        var maxval: number = 0;
        this.datasets.forEach(ds => {
            maxval = Math.max(maxval, Math.max(...ds.data));
        });

        var yScale = d3.scaleLinear()
            .domain([0, maxval]) // input
            .range([height, 0]); // output

        // 1. Add the SVG to the page and employ #2
        d3.select('svg').remove();
        var svg = chartdiv.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
        svg.append("text")
            .attr("transform",
                 "translate(" + (width / 2) + " ," +
                  (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("FY Month");

        // 4. Call the y axis in a group tag
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

        // 7. d3's line generator
        var line = d3.line()
            .x(function (d, i) { return xScale(i); }) // set the x values for the line generator
            .y(function (d) { return yScale(d < 0 ? 0 : d); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        var topidx: number = this.datasets[0].data.length;
        var toprange: number[] = [];
        for (var i = 0; i < topidx; i++) {
            toprange.push(i);
        }
        for (var i = 0; i < topidx; i++) {
            toprange.push(topidx - i - 1);
        }
        var bandline = d3.line()
            .x(function (d, i) { return xScale(toprange[i]); }) // set the x values for the line generator
            .y(function (d) { return yScale(d < 0 ? 0 : d); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        this.datasets.forEach(ds => {
            // 8. (skipped)

            // 9. Append the path, bind the data, and call the line generator
            svg.append("path")
                .datum(ds.data) // 10. Binds data to the line
                .attr("class", "line line-" + ds.csskey) // Assign a class for styling
                .attr("data-legend", function (d) { return ds.label })
                .attr("d", line); // 11. Calls the line generator

            // 12. Appends a circle for each datapoint
            svg.selectAll(".dot-" + ds.csskey)
                .data(ds.data)
                .enter().append('circle')
                .attr("class", function (value, month) {
                    var klass: string = 'dot dot-' + ds.csskey;
                    if (2 === ds.status[month]) {
                        klass += ' dot-red';
                    }
                    else if (1 === ds.status[month]) {
                        klass += ' dot-yellow';
                    }

                    return klass;
                })
                .attr("cx", function (d, i) { return xScale(i) })
                .attr("cy", function (d) { return yScale(d) })
                .attr("r", function (value, month) {
                    return 5 + 2 * ds.status[month];
                })
                .on("mouseover", function (value, month, z) {
                    div.html(ds.notes[month])
                        .style("left", xScale(month) + 70 + "px")
                        .style("top", yScale(value) + 60 + "px");
                    div.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    // d3.select(this).attr('class', 'focus');
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    // d3.select(this).attr('')
                })
            
            
            if (ds.csskey.endsWith('plan')) {
                // make a yellow band that follows the plan line
                var yellows: number[] = [];
                ds.data.forEach(val => {
                    yellows.push(val);
                });
                for (var i = ds.data.length - 1; i >= 0; i--) {
                    yellows.push(ds.data[i] - ds.toas[i] * 0.1);
                }
                svg.append('path')
                    .datum(yellows)
                    .attr('class', 'yellowband')
                    .attr('d', bandline);

                // make a small red band, too
                var reds: number[] = [];
                for (var i = 0; i < ds.data.length; i++){
                    reds.push(ds.data[i] - ds.toas[i] * 0.1);
                };
                for (var i = ds.data.length - 1; i >= 0; i--) {
                    reds.push(ds.data[i] - ds.toas[i] * 0.15);
                }
                svg.append('path')
                    .datum(reds)
                    .attr('class', 'redband')
                    .attr('d', bandline);
            }
        });
    }

    getLegendDatasets(): DataSet[] {
        return (this.datasets
            ? this.datasets.filter(ds => (!(ds.csskey.endsWith('red') || ds.csskey.endsWith('yellow'))))
            : []);
    }

    @Input() set percentages(p: boolean) {
        this.showPercentages = p;
        this.refreshGraph();
    }
}

interface DataSet {
    label?: string,
    data: number[],
    toas:number[],
    notes: string[],
    csskey: string,
    status: number[] // 0:green, 1:yellow, 2: red
}
