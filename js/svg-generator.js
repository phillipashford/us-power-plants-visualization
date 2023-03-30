// Full disclosure - I attempted this dynamic svg feature on my own, but after multiple attempts, I came 
// to realize I don't have the necessary fluency with the trigonometry needed. So I procured the code below
// from Github Copilot after explaining the needed logic to the AI.

function createPieChart(data) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "40");
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "none");

    var total = 0;
    for (var i = 0; i < data.length; i++) {
        total += data[i].value;
    }

    var startAngle = 0;
    for (var i = 0; i < data.length; i++) {
        var endAngle = startAngle + (360 * data[i].value / total);

        var x1 = 50 + Math.sin(startAngle * Math.PI / 180) * 40;
        var y1 = 50 - Math.cos(startAngle * Math.PI / 180) * 40;

        var x2 = 50 + Math.sin(endAngle * Math.PI / 180) * 40;
        var y2 = 50 - Math.cos(endAngle * Math.PI / 180) * 40;

        var largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M50,50 L" + x1 + "," + y1 + " A40,40 0 " + largeArcFlag + ",1 " + x2 + "," + y2 + " L50,50 Z");
        path.setAttribute("fill", data[i].color);

        svg.appendChild(path);

        startAngle = endAngle;
    }

    svg.appendChild(circle);

    return svg;
}