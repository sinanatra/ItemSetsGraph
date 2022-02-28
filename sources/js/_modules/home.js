const d3 = require('d3');
let dragging;

const Home = {
  init: () => {
    const json = JSON.parse($('#item-sets-graph').attr('data-json'));
    const nodesCluster = Array.from(new Set(json.flatMap(l => [l.source, l.target])), id => ({ id }))

    nodesCluster.forEach((l) => {
      json.forEach((j) => {
        if (l.id == j.target) {
          l.source = { type: "item", data: j.itemData, color: j.color };
        }
        if (l.id == j.source) {
          l.source = { type: "item-set", data: j.itemSetData, color: j.color };
        }
      })
    })

    data = ({ nodes: nodesCluster, links: json });
    console.log("Data Loaded:", data)


    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
    const types = Array.from(new Set(links.map(d => d.color)));

    const height = window.innerHeight;
    const width = window.innerWidth;

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const svg = d3.select('.item-sets-graph').append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .style("font", "12px sans-serif");

    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      // .attr("stroke", d => d.color)
      .attr("stroke", "rgb(212, 212, 212)")

    const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));

    node.append("foreignObject")
      .attr("x", "-1em")
      .attr("y", "-.5em")
      .attr("height", "1.2rem")
      .attr("width", 200)
      .style("display", d => {
        if (d.source.type == "item") {
          return "none";
        }
      })
      .append("xhtml:div")
      .style("border-radius", ".25rem")
      .style("padding", ".25rem")
      .style("background", (d) => d.source.color)
      .style("width", "fit-content")
      .append("xhtml:p")
      .html(d => {
        return d.id;
      })

    node.append("circle")
      .attr("r", 5)
      .on("mouseover", circleMouseEnterEvent)
      .on("mouseout", circleMouseLeaveEvent)
      .attr("display", d => {
        if (d.source.type == "item-set") {
          return "none";
        }
      })

    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

  }
};


export default Home;


const drag = simulation => {
  function dragstarted(event, d) {
    dragging = true;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    dragging = false;
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

function mergeArrayObjects(arr1, arr2) {
  let start = 0;
  let merge = [];

  while (start < arr1.length) {
    merge.push({ ...arr1[start], ...arr2[start] })
    start = start + 1
  }
  return merge;
}


function circleMouseEnterEvent(e, d) {
  if (!dragging) {

    d3.select(this.parentNode)
      .selectAll("foreignObject")
      .style("display", "block");

    d3.select(this.parentNode)
      .selectAll("circle")
      .style("opacity", 0);
    // d3.select(`*[data-id="${d.source.data["o:title"]}"]`)
    //   .attr("stroke", d.source.color);
  }
}

function circleMouseLeaveEvent(e, d) {
  if (!dragging) {
    d3.select(this.parentNode)
      .selectAll("foreignObject")
      .style("display", "none");

    d3.select(this.parentNode)
      .selectAll("circle")
      .style("opacity", 1);
  }
}

