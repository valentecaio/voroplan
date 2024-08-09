
## VoroPlan

Try it at [valentecaio.itch.io/voroplan](https://valentecaio.itch.io/voroplan/).  

![screenshot2.png](https://github.com/valentecaio/voroplan/blob/main/media/screenshot2.png?raw=true)

VoroPlan is an interactive Voronoi diagram of the metro and bike-sharing station networks in the city of Rio de Janeiro. It collects real-data about stations from Metro Rio and Bike Rio (official Rio's bike-sharing system) websites. Click on the map to create new stations, or move existing stations by dragging and dropping them.    

The project is built on Node.js runtime and uses [Leaflet](https://leafletjs.com/) for the map drawing and [D3.js](https://d3js.org/what-is-d3) for the basic geometric calculations.  

For more information, see [the technical report](media/VoroPlan.pdf) and [the demo video](https://drive.google.com/file/d/16eQ6ag3iZrek7HiCUyrd1eWrEeVvus6Z/view?usp=drive_link).  

---
### How to execute
To run this project locally, follow the steps outlined below.

1. Install Node.js from [nodejs.org](https://nodejs.org).
2. Install the dependencies: `$ npm install`
3. Run the node server: `$ npm run dev`
4. Access the application at [localhost:5173](http://localhost:5173) in a browser.

---
### How to build
To build the project, follow the steps below.
1. Install Node.js from [nodejs.org](https://nodejs.org).
2. Install the dependencies: `$ npm install`
3. Run the build script: `$ npm run build`
4. The build will be available in the `dist/` folder.
5. Zip the contents of the `dist/` folder and upload it to a server.

---
### Some examples

![screenvideo2.gif](https://github.com/valentecaio/voroplan/blob/main/media/screenvideo2.gif?raw=true)
-
![screenvideo1.gif](https://github.com/valentecaio/voroplan/blob/main/media/screenvideo1.gif?raw=true)
-
![screenshot3.png](https://github.com/valentecaio/voroplan/blob/main/media/screenshot3.png?raw=true)
