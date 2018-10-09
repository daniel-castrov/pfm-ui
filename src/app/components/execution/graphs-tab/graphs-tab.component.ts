import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { OandEMonthly, ExecutionLine, Execution, SpendPlan, ExecutionEvent } from '../../../generated';
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
        var ogoals: SpendPlan = this.exe.osdObligationGoals[progtype];
        var egoals: SpendPlan = this.exe.osdExpenditureGoals[progtype];

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
            label: 'Obligation Goal',
            csskey: 'obgplan',
            data: [],
            toas:[],
            status: [],
            notes: []
        };

        var expDataset: DataSet = {
            label: 'Expenditure Goal',
            data: [],
            toas: [],
            status: [],
            csskey: 'expplan',
            notes: []
        };

        var realexpDataset: DataSet = {
            label: 'Actual Expenditures',
            data: [],
            toas: [],
            status: [],
            csskey: 'realexp',
            notes: []
        };

        var realobgDataset: DataSet = {
            label: 'Actual Obligations',
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

        var obgplanYellow: DataSet = {
            csskey: 'planyellow',
            data: [],
            toas: [],
            status: [],
            notes: []
        };

        var expplanYellow: DataSet = {
            csskey: 'planyellow',
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
            if (diff >= 0.15) {
                return 2;
            }
            if (diff > 0.10) {
                return 1;
            }
            return 0;
        }

        for (var i = 0; i < this.maxmonths; i++) {
            var toa = toasAndReleaseds[i].toa;
            var ogoal: number = toa * (ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1);
            var egoal: number = toa * (egoals.monthlies.length > i ? egoals.monthlies[i] : 1);
            obgDataset.toas.push(toa);
            obgDataset.data.push(ogoal);
            obgDataset.notes.push('Obligation Goal: ' + ogoal.toFixed(2) + ' (' + (ogoal / toa * 100).toFixed(2) + '%)');
            obgDataset.status.push(0);

            obgplanRed.toas.push(toa);
            obgplanRed.data.push(ogoal - (toa * 0.15));
            obgplanRed.notes.push('Obligation "Red Zone"');
            obgplanRed.status.push(0);

            obgplanYellow.toas.push(toa);
            obgplanYellow.data.push(ogoal - (toa * 0.10));
            obgplanYellow.notes.push('Obligation "Yellow Zone"');
            obgplanYellow.status.push(0);

            expDataset.toas.push(toa);
            expDataset.data.push(egoal);            
            expDataset.notes.push('Expenditure Goal: ' + egoal.toFixed(2) + ' (' + (egoal / toa * 100).toFixed(2) + '%)');
            expDataset.status.push(0);

            expplanRed.toas.push(toa);
            expplanRed.data.push(egoal - (toa * 0.15));
            expplanRed.notes.push('Expenditure "Red Zone"');
            expplanRed.status.push(0);

            expplanYellow.toas.push(toa);
            expplanYellow.data.push(egoal - (toa * 0.10));
            expplanYellow.notes.push('Expenditure "Yellow Zone"');
            expplanYellow.status.push(0);

            // we want cumulatives, so add last month's totals
            var lastexp: number = (i > 0 ? realexpDataset.data[i - 1] : 0);
            var lastobg: number = (i > 0 ? realobgDataset.data[i - 1] : 0);
            realexpDataset.toas.push(toa);
            realobgDataset.toas.push(toa);
            if (myoandes[i]) {
                var eactual: number = myoandes[i].outlayed + lastexp;
                realexpDataset.data.push(eactual);
                realexpDataset.notes.push(makeHtmlNote(myoandes[i], 'Expenditure', egoal, eactual, toa));
                realexpDataset.status.push(getStatus(eactual, egoal, toa));

                var oactual: number = myoandes[i].obligated + lastobg;
                realobgDataset.data.push(oactual);
                realobgDataset.notes.push(makeHtmlNote(myoandes[i], 'Obligation', ogoal, oactual, toa));
                realobgDataset.status.push(getStatus(oactual, ogoal, toa));
            }
            else {
                realexpDataset.data.push(lastexp);
                realexpDataset.notes.push(makeHtmlNote(myoandes[i], 'Expenditure', egoal, lastexp, toa));
                realexpDataset.status.push(getStatus(lastexp, egoal, toa));

                realobgDataset.data.push(lastobg);
                realobgDataset.notes.push(makeHtmlNote(myoandes[i], 'Obligation', ogoal, lastobg, toa));
                realobgDataset.status.push(getStatus(lastobg, ogoal, toa));
            }
        }

        this.datasets = [obgDataset, expDataset, realexpDataset, realobgDataset,
            obgplanRed, obgplanYellow, expplanRed, expplanYellow];
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

        // 4. Call the y axis in a group tag
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

        // 7. d3's line generator
        var line = d3.line()
            .x(function (d, i) { return xScale(i); }) // set the x values for the line generator
            .y(function (d) { return yScale(d); }) // set the y values for the line generator
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
                    var klass : string = 'dot dot-' + ds.csskey;
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
                        .style("opacity", .9);
                    // d3.select(this).attr('class', 'focus');
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    // d3.select(this).attr('')
                })
        });

        //       .on("mousemove", mousemove);

        //   var focus = svg.append("g")
        //       .attr("class", "focus")
        //       .style("display", "none");

        //   focus.append("circle")
        //       .attr("r", 4.5);

        //   focus.append("text")
        //       .attr("x", 9)
        //       .attr("dy", ".35em");

        //   svg.append("rect")
        //       .attr("class", "overlay")
        //       .attr("width", width)
        //       .attr("height", height)
        //       .on("mouseover", function() { focus.style("display", null); })
        //       .on("mouseout", function() { focus.style("display", "none"); })
        //       .on("mousemove", mousemove);

        //   function mousemove() {
        //     var x0 = x.invert(d3.mouse(this)[0]),
        //         i = bisectDate(data, x0, 1),
        //         d0 = data[i - 1],
        //         d1 = data[i],
        //         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        //     focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
        //     focus.select("text").text(d);
        //   }
    }

    getLegendDatasets(): DataSet[] {
        return (this.datasets
            ? this.datasets.filter(ds => (!(ds.csskey.endsWith('red') || ds.csskey.endsWith('yellow'))))
            : []);
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
