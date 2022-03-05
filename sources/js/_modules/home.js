const d3 = require('d3');
let dragging;
const radius = 20;
let svg, data, simulation, imgCheck;

const Home = {
  init: () => {
    const json = JSON.parse($('.item-sets-graph-block').attr('data-json'));
    const nodesCluster = Array.from(new Set(json.flatMap(l => [l.source, l.target])), id => ({ id }))

    imgCheck = $('#item-sets-graph').attr('data-img');
    console.log("Load images: ", imgCheck)

    nodesCluster.forEach((l) => {
      json.forEach((j) => {
        if (l.id == j.target) {
          l.source = { type: "item", data: j.to, color: j.color };
        }
        if (l.id == j.source) {
          l.source = { type: "item-set", data: j.from, color: j.color };
        }
      })
    })
    data = ({ nodes: nodesCluster, links: json });


    Home.graph(data);
  },
  graph: (data) => {
    d3.select('.item-sets-graph > svg').remove()

    const width = document.getElementsByClassName("item-sets-graph-block")[0].clientWidth;
    const height = document.getElementsByClassName("item-sets-graph-block")[0].clientHeight;

    svg = d3.select('.item-sets-graph').append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .style("font", "12px sans-serif");

    console.log("Data Loaded:", data)

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    let linearScale = d3.scaleLinear()
      .domain([0, 50])
      .range([0, 300]);

    simulation = d3.forceSimulation(nodes)
      // .force("link", d3.forceLink(links).id(d => d.id))
      // .force("charge", d3.forceManyBody().strength(-100))
      // .force("forceX", d3.forceX().x(0))
      // .force("forceY", d3.forceY().y(0))
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
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
              return radius + 5
            }
          })
          .iterations(20)
      );

    const g_links = svg.append("g")
      .attr("class", "links");

    const g_nodes = svg.append("g")
      .attr("class", "nodes");

    const link = g_links
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("data-from", d => d.from["o:title"])
      .attr("data-to", d => d.to["o:title"])
      .attr("stroke", "rgb(245, 245, 245)")

    const node = g_nodes
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
        .attr("height", radius)
        .attr("width", radius)
        .on("mouseover", mouseEnterEvent)
        .on("mouseout", mouseLeaveEvent)
        .append("xhtml:div")
        .style("width", `${radius}px`)
        .style("height", `${radius}px`)
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
      .attr("height", "25px")
      .attr("width", 50)
      .attr("overflow", "inherit")
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
      .style("padding", "3px")
      .style("background", (d) => d.source.color ? d.source.color : "white")
      .style("border", (d) => d.source.color ? "none" : "1px solid black")
      .style("width", "fit-content")
      .append("xhtml:div")
      .html(d => d.id)
      .on("click", (e, d) => Home.queryItems(e, d.source, data.links))


    if (imgCheck == "true") {
      node.append("circle")
        .filter((d) => d.source.type != "item-set" && !d.source.data["thumbnail_display_urls"]["square"])
        .attr("r", radius / 4)
        .style("fill", "gainsboro")
        .on("mouseover", mouseEnterEvent)
        .on("mouseout", mouseLeaveEvent)
    }

    else {
      node.append("circle")
        .filter((d) => d.source.type != "item-set")
        .attr("r", radius / 4)
        .style("fill", "gainsboro")
        .on("mouseover", mouseEnterEvent)
        .on("mouseout", mouseLeaveEvent)
    }


    simulation
      .on("tick", () => {
        Home.ticked(link, node);
      });

  },
  ticked: (link, node) => {
    link.attr("d", linkArc);
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  },
  drawData: (graph) => {
    data.nodes = mergeArrays([graph.nodes, data.nodes], 'id');
    data.links = data.links.concat(graph.links);
    Home.graph(({ nodes: data.nodes, links: data.links }));
  },
  queryItems: (e, item, links) => {

    let checkItem = false;
    links.forEach(element => {
      if (element.source == item.data["o:title"]) {
        checkItem = true;
      }
    });

    if (checkItem == false) {

      let queryItems = new Set();
      Object.entries(item.data).forEach(([propertyKey, propertyValue]) => {
        try {
          Object.entries(propertyValue).forEach(([key, val]) => {
            if (val.type == "resource" && val.value_resource_name == "items") {
              queryItems.add(val.value_resource_id);
            }
          });
        }
        catch { }
      });

      let query = Array.from(queryItems).join('&id[]=');
      let url = `${window.location.origin}/api/items?id[]=${query}`;

      d3.json(url).then(function (datum) {
        const nodesCluster = Array.from(new Set(datum.flatMap(l => [l["o:title"]])), id => ({ id }), datum)
        const links = [];

        nodesCluster.forEach((l) => {
          datum.forEach((j) => {
            if (l.id == j["o:title"]) {
              l.source = { type: "item", data: j };
              links.push({ source: item.data["o:title"], target: l.id, to: j, from: item.data })
            }
          })
        })
        let updateData = ({ nodes: nodesCluster, links: links });
        Home.drawData(updateData)
      });
    }
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

function mouseEnterEvent(e, d) {
  if (!dragging) {

    let getPaths = [];
    d3.selectAll(`path[data-from="${d.id}"]`)
      .raise()
      .attr("x", function () {
        getPaths.push(d3.select(this).attr("data-to"));
      })

    d3.selectAll(`path[data-to="${d.id}"]`)
      .raise()
      .attr("x", function () {
        getPaths.push(d3.select(this).attr("data-from"));
      })


    getPaths.forEach(element => {
      d3.select(`*[data-from="${element}"] ~ circle`)
        .style("fill", "black")
        .raise()
    });


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
    paths_from.attr("stroke", "black");
    paths_to.attr("stroke", "black");

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

    d3.selectAll("circle")
      .style("fill", "gainsboro")
      .style("opacity", 1);

    const paths_from = d3.selectAll(`*[data-from="${d.source.data["o:title"]}"]`)
    const paths_to = d3.selectAll(`path[data-to="${d.source.data["o:title"]}"]`)
    paths_from.attr("stroke", "rgb(245, 245, 245)");
    paths_to.attr("stroke", "rgb(245, 245, 245)");
  }
}

function mergeArrays(arrays, prop) {
  const merged = {};

  arrays.forEach(arr => {
    arr.forEach(item => {
      merged[item[prop]] = Object.assign({}, merged[item[prop]], item);
    });
  });

  return Object.values(merged);
}
