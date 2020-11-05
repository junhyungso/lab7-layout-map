d3.json('airports.json', d3.autoType).then(data => {
    console.log(data)

    const margin = { top: 20, right: 20, bottom: 40, left: 90 }
    const width = 400 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom; 

    const svg = d3.select(".nodes")
    .append("svg")
    .attr('class', 'nodes')
    .attr("viewBox", [0,0,width,height]) 
    .append("g")

    const sizeScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, d=>d.passengers))
        .range([3,10])

    const force = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(data.links))
        .force('x', d3.forceX(width/2))
        .force('y', d3.forceY(height/2))


    const edges = svg.selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", 1);

    const nodes = svg.selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr('class','map')
        .attr('cx', (d,i)=>(d.x))
        .attr('cy', (d,i)=>(d.y))
        .attr("r", d=>sizeScale(d.passengers))
        .style("fill", "orange")
        .call(d3.drag()  //Define what to do on drag events
            .on("start", dragStarted)
            .on("drag", dragging)
            .on("end", dragEnded));

    nodes.append("title")
        .text(d => d.name);
        
    force.on("tick", ()=>{
        edges.attr("x1", d=>{
            return d.source.x;
        })
        edges.attr("y1", d=>{
            return d.source.y;
        })
        edges.attr("x2", d=>{
            return d.target.x;
        })
        edges.attr("y2", d=>{
            return d.target.y;
        })
        nodes.attr("cx", d=>{
            return d.x;
        })
        nodes.attr("cy", d=>{
            return d.y;
        })

    })

        function dragStarted(event) {
            if (!event.active) force.alphaTarget(0.3).restart();
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragging(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragEnded(event) {
            if (!event.active) force.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    })
