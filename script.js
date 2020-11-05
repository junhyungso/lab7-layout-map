Promise.all([ // load multiple files
    d3.json('airports.json'),
    d3.json('world-110m.json')
    ]).then(data=>{ // or use destructuring :([airports, wordmap])=>{ ... 
    let airports = data[0]; // data1.csv
    let worldmap = data[1]; // data2.json
    let visType;

    const margin = { top: 20, right: 20, bottom: 40, left: 90 }
    const width = 1200 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom; 
    
    const topology = topojson.feature(worldmap, worldmap.objects.countries);
    console.log(topology)

    const projection = d3.geoMercator()
    .fitExtent([[0,0], [width, height]], topology);
    

    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.chart').append('svg')
    .attr('viewBox', [0,0,width,height])

    const force = d3.forceSimulation(airports.nodes)
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(airports.links))
        .force('x', d3.forceX(width/2))
        .force('y', d3.forceY(height/2))

        nodesInitial()

    d3.selectAll("input[name=type]").on("change", event=>{
        visType = event.target.value;// selected button
        console.log(visType)
        switchLayout();
    });


    function switchLayout() {

        if (visType === "Map") {
            svg.selectAll('.force').remove()

            force.alpha(0.5).stop();

            svg.selectAll('path')
            .data(topology.features)
            .join('path')
            .attr('d', path)
            
            svg.append("path")
            .datum(topojson.mesh(worldmap, worldmap.objects.countries))
            .attr("d", path)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr("class", "subunit-boundary");

            const sizeScale = d3.scaleLinear()
                .domain(d3.extent(airports.nodes, d=>d.passengers))
                .range([3,10])

            const drag = force => {
                drag.filter(event => visType === "force")
              }

            const edges = svg.selectAll('.chart')
              .data(airports.links)
              .enter()
              .append('line')
              .attr('class','map')
              .attr('x1', (d)=> (d.source.x))
              .attr('y1',(d) => (d.source.y))
              .attr('x2', (d) => (d.target.x))
              .attr('y2',(d) => (d.target.y))
              .attr('stroke', 'grey')
              .transition()
              .duration(1000)
              .attr("x1", function(d) {
                return projection([d.source.longitude, d.source.latitude])[0];
              })
              .attr("y1", function(d) {
                return projection([d.source.longitude, d.source.latitude])[1];
              })
              .attr("x2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[0];
              })
              .attr("y2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[1];
              });

        const nodes = svg.selectAll('.chart')
            .data(airports.nodes)
            .enter()
            .append('circle')
            .attr('class','map')
            .attr('fill', 'coral') 
            .attr('cx', (d,i)=>(d.x))
            .attr('cy', (d,i)=>(d.y))
            .attr('r',d=>sizeScale(d.passengers))
            .on("mouseenter", (event, d) => {
            const pos = d3.pointer(event, window)
            d3.selectAll('.tooltip')
                .style('display','inline-block')
                .style('position','fixed')
                .style('top', pos[1]+'px')
                .style('left', pos[0]+'px')
                .html(
                    d.name 
                )
            })
            .on("mouseleave", (event, d) => {
                d3.selectAll('.tooltip')
                    .style('display','none')
            })
            .transition()
            .duration(1000)
            .attr("cx", function(d) {
            return projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", function(d) {
            return projection([d.longitude, d.latitude])[1];
            })



        svg.selectAll("path")
            .transition()
            .delay(450)
            .attr("opacity", 1);




            } else { // force layout
                nodesFinal()
                svg.selectAll("path")
                .attr("opacity", 0);
            }
        }


        
    function nodesInitial() {

        const sizeScale = d3.scaleLinear()
            .domain(d3.extent(airports.nodes, d=>d.passengers))
            .range([3,10])

        let drag = force => {

            function dragstarted(event) {
              if (!event.active) force.alphaTarget(0.3).restart();
              event.subject.fx = event.subject.x;
              event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
              event.subject.fx = event.x;
              event.subject.fy = event.y;
            }
            
            function dragended(event) {
              if (!event.active) force.alphaTarget(0);
              event.subject.fx = null;
              event.subject.fy = null;
            }
            
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended); 
          }

        force.alpha(0.5).restart();
        const edges = svg.selectAll("chart")
                .data(airports.links)
                .enter()
                .append("line")
                .attr('class','force')
                .style("stroke", "#ccc")
                .style("stroke-width", 1);

        const nodes = svg.selectAll(".node")
            .data(airports.nodes)
            .enter()
            .append("circle")
            .attr('class','force') 
            .attr('cx', (d,i)=>(d.x))
            .attr('cy', (d,i)=>(d.y))
            .attr("r", d=>sizeScale(d.passengers))
            .style("fill", "coral")
            .call(drag(force));

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
    }


    function nodesFinal() {

        svg.selectAll('.map').remove()

        let drag = force => {

            function dragstarted(event) {
              if (!event.active) force.alphaTarget(0.3).restart();
              event.subject.fx = event.subject.x;
              event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
              event.subject.fx = event.x;
              event.subject.fy = event.y;
            }
            
            function dragended(event) {
              if (!event.active) force.alphaTarget(0);
              event.subject.fx = null;
              event.subject.fy = null;
            }
            
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended); 
          }

        const sizeScale = d3.scaleLinear()
            .domain(d3.extent(airports.nodes, d=>d.passengers))
            .range([3,10])

        const edges = svg.selectAll("chart")
                .data(airports.links)
                .enter()
                .append("line")
                .attr('class','force')
                .style("stroke", "#ccc")
                .style("stroke-width", 1)
                .attr("x1", function(d) {
                    return projection([d.source.longitude, d.source.latitude])[0];
                  })
                .attr("y1", function(d) {
                return projection([d.source.longitude, d.source.latitude])[1];
                })
                .attr("x2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[0];
                })
                .attr("y2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[1];
                })

            edges
                .transition()
                .duration(500)
                .attr('x1', (d)=> (d.source.x))
                .attr('y1',(d) => (d.source.y))
                .attr('x2', (d) => (d.target.x))
                .attr('y2',(d) => (d.target.y));            
                

        const nodes = svg.selectAll(".node")
            .data(airports.nodes)
            .enter()
            .append("circle")
            .attr('class','force')
            .style("fill", "coral")
            .attr("cx", function(d) {
                return projection([d.longitude, d.latitude])[0];
              })
            .attr("cy", function(d) {
                return projection([d.longitude, d.latitude])[1];
              })
            .attr("r", d=>sizeScale(d.passengers))
            .call(drag(force));

            nodes
            .transition()
            .duration(500)   
            .attr('cx', (d,i)=>(d.x))
            .attr('cy', (d,i)=>(d.y))

        force.alpha(0.5).stop();

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

    }
})



