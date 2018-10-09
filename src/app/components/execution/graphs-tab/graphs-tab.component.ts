import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';

import { OandEMonthly, ExecutionLine, Execution, SpendPlan, ExecutionEvent, ExecutionEventData } from '../../../generated';
import { OandETools, ToaAndReleased } from '../model/oande-tools';

import * as d3 from 'd3';
import 'rxjs/add/operator/takeUntil';
import { max } from 'rxjs/operators';

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
    private focus: any;

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
            console.log('got all our data!')
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
        var myoandes: OandEMonthly[] = new Array(this.maxmonths);
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
            notes: []
        };
        var expDataset: DataSet = {
            label: 'Expenditure Goal',
            data: [],
            csskey: 'expplan',
            notes: []
        };

        var realexpDataset: DataSet = {
            label: 'Actual Expenditures',
            data: [],
            csskey: 'realexp',
            notes: []
        };

        var realobgDataset: DataSet = {
            label: 'Actual Obligations',
            data: [],
            csskey: 'realobg',
            notes: []
        };

        var makeNote = function (oande: OandEMonthly, title: string, goal: number, actual: number ){
            return title + ' Goal: ' + goal
                + '\nActuals: ' + actual
                + '\nExplanation: ' + oande.explanation
                + '\nRemediation: ' + oande.remediation
                + '\nMonths to Fix: ' + oande.monthsToFix;
        }

        for (var i = 0; i < this.maxmonths; i++) {
            var toa = toasAndReleaseds[i].toa;
            var ogoal: number = toa * (ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1);
            var egoal: number = toa * (egoals.monthlies.length > i ? egoals.monthlies[i] : 1);
            obgDataset.data.push(ogoal);
            obgDataset.notes.push('target: ' + ogoal);
            expDataset.data.push(egoal);
            expDataset.notes.push('target: ' + egoal);

            if (myoandes[i]) {
                // we want cumulatives, so add last month's totals
                var lastexp: number = (i > 0 ? realexpDataset.data[i - 1] : 0);
                var lastobg: number = (i > 0 ? realobgDataset.data[i - 1] : 0);

                realexpDataset.data.push(myoandes[i].outlayed + lastexp);
                var notes: string = (myoandes[i] && myoandes[i].explanation
                    ? makeNote(myoandes[i], 'Expenditure', egoal, myoandes[i].outlayed + lastexp)
                    : '');
                realexpDataset.notes.push(notes);

                realobgDataset.data.push(myoandes[i].obligated + lastobg);
                var notes: string = (myoandes[i] && myoandes[i].explanation
                    ? makeNote(myoandes[i], 'Obligation', ogoal, myoandes[i].obligated + lastobg)
                    : '');
                realobgDataset.notes.push(notes);
            }
        }


        this.datasets = [obgDataset, expDataset, realexpDataset, realobgDataset ];
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

        //console.log(width + 'x' + height);

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

        svg.focus.append("line")
               .attr("class", "x-hover-line hover-line")
               .attr("y1", 0)
               .attr("y2", height);

       svg.focus.append("line")
           .attr("class", "y-hover-line hover-line")
           .attr("x1", width)
           .attr("x2", width);

        // 7. d3's line generator
        var line = d3.line()
            .x(function (d, i) { return xScale(i); }) // set the x values for the line generator
            .y(function (d) { return yScale(d); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // create tooltips
        function createTooltip(i){
          div.transition()
             .duration(200)
             .style("opacity", .9);
          } // end createTooltip

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
                .enter().append("circle") // Uses the enter().append() method
                .attr("class", "dot dot-" + ds.csskey) // Assign a class for styling
                .attr("cx", function (d, i) { return xScale(i) })
                .attr("cy", function (d) { return yScale(d) })
                .attr("r", 5)
                .on("mouseover", function (value, month, z) {
                  console.log('mouseover!');
                  console.log(value)
                  console.log(month)
                  console.log(ds.notes[month])
                  console.log( 'done with mo')
                  //this.attr('class', 'focus')
              })
                .on("mouseover",(d,i) => createTooltip(i))
                .on("mouseout",function(d){
                 div.transition()
                    .duration(500)
                    .style("opacity", 0);
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
}

interface DataSet {
    label: string,
    data: number[];
    notes: string[],
    csskey: string
}
