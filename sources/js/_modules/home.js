const d3 = require('d3');
let dragging;

const Home = {
  init: () => {
    const json = JSON.parse($('#item-sets-graph').attr('data-json'));
    const imgCheck = $('#item-sets-graph').attr('data-img');
    console.log("Load images: ", imgCheck)

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

    const width = document.getElementsByClassName("item-sets-graph-block")[0].clientWidth;
    const height = document.getElementsByClassName("item-sets-graph-block")[0].clientHeight;

    let linearScale = d3.scaleLinear()
      .domain([0, 50])
      .range([0, 300]);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      // .force("x", d3.forceX())
      // .force("y", d3.forceY())
      .force("forceX", d3.forceX().x(0))
      .force("forceY", d3.forceY().y(0))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => {
            if (d.source.type == "item-set") {
              // use a proper scale
              return linearScale(d.source.data["o:title"].length)
            }
            else {
              return 25
            }
          })
          .iterations(20)
      );

    const svg = d3.select('.item-sets-graph').append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .style("font", "12px sans-serif");

    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("data-from", d => d.itemSetData["o:title"])
      .attr("data-to", d => d.itemData["o:title"])
      .attr("stroke", "rgb(245, 245, 245)")

    const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));

    if (imgCheck == "true") {
      node
        .filter((d) => d.source.type != "item-set" && d.source.data["thumbnail_display_urls"]["square"])
        .append("foreignObject")
        .attr("data-from", d => d.id)
        .attr("x", "-1em")
        .attr("y", "-.5em")
        .attr("height", 20)
        .attr("width", 20)
        .on("mouseover", mouseEnterEvent)
        .on("mouseout", mouseLeaveEvent)
        .append("xhtml:div")
        .style("width", "20px")
        .style("height", "20px")
        .append("xhtml:img")
        .attr("src", d => {
          if (d.source.data["thumbnail_display_urls"].square) {
            return d.source.data["thumbnail_display_urls"].square;
          }
        })
        .style("width", "100%")
        .style("height", "100%")
        .style("object-fit", "contain");
    }
    const textObject = node.append("foreignObject")
      .attr("class", (d) => `labels-${d.source.type}`)
      .attr("data-from", d => d.id)
      .attr("x", d => {
        if (d.source.type == "item-set") {
          return "-" + linearScale(d.source.data["o:title"].length) / 2
        }
        if (d.source.type == "item") {
          return "-1em";
        }
      })
      .attr("y", "-.5em")
      .attr("height", "1.2rem")
      .attr("width", 200)
      .style("display", d => {
        if (d.source.type == "item") {
          return "none";
        }
      })
      .on("mouseover", mouseEnterEvent)
      .on("mouseout", mouseLeaveEvent)

    textObject
      .append("xhtml:div")
      .style("border-radius", ".25rem")
      .style("padding", ".25rem")
      .style("background", (d) => d.source.color)
      .style("width", "fit-content")
      .append("xhtml:p")
      .html(d => d.id)
      .on("mouseover", mouseEnterEvent)
      .on("mouseout", mouseLeaveEvent)

    if (imgCheck == "true") {
      node.append("circle")
        .filter((d) => d.source.type != "item-set" && !d.source.data["thumbnail_display_urls"]["square"])
        .attr("r", 5)
        .on("mouseover", mouseEnterEvent)
        .on("mouseout", mouseLeaveEvent)
    }
    else {
      node.append("circle")
        .filter((d) => d.source.type != "item-set")
        .attr("r", 5)
        .on("mouseover", mouseEnterEvent)
        .on("mouseout", mouseLeaveEvent)
    }

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

function mouseEnterEvent(e, d) {
  if (!dragging) {
    if (this.parentNode.tagName == "g") {
      d3.select(this.parentNode)
        .raise()
        .selectAll(".labels-item")
        .style("display", "block")
    }
    else if (this.parentNode.parentNode.tagName == "g") {
      d3.select(this.parentNode.parentNode)
        .raise()
        .selectAll(".labels-item")
        .style("display", "block")
    }

    d3.select(this.parentNode)
      .selectAll("circle")
      .style("opacity", 0);

    const paths_from = d3.selectAll(`*[data-from="${d.source.data["o:title"]}"]`)
    const paths_to = d3.selectAll(`path[data-to="${d.source.data["o:title"]}"]`)
    paths_from.attr("stroke", "rgb(212, 212, 212)");
    paths_to.attr("stroke", "rgb(212, 212, 212)");

  }
}

function mouseLeaveEvent(e, d) {
  if (!dragging) {
    if (this.parentNode.tagName == "g") {
      d3.select(this.parentNode)
        .raise()
        .selectAll(".labels-item")
        .style("display", "none");
    }
    else if (this.parentNode.parentNode.tagName == "g") {
      d3.select(this.parentNode.parentNode)
        .raise()
        .selectAll(".labels-item")
        .style("display", "none");
    }
    d3.select(this.parentNode)
      .selectAll("circle")
      .style("opacity", 1);

    const paths_from = d3.selectAll(`*[data-from="${d.source.data["o:title"]}"]`)
    const paths_to = d3.selectAll(`path[data-to="${d.source.data["o:title"]}"]`)
    paths_from.attr("stroke", "rgb(245, 245, 245)");
    paths_to.attr("stroke", "rgb(245, 245, 245)");
  }
}

function validate(x, a, b) {
  if (x < a) x = a;
  if (x > b) x = b;
  return x;
}
