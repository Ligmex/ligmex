import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import { PolygonMeshBuilder, VertexData, Mesh } from "@babylonjs/core/Meshes";

export const buildFromPlan = function (walls, ply, height, options, scene) {

    //Arrays for vertex positions and indices
    let positions = [] as number[];
    let indices = [] as number[];
    let uvs = [] as any;
    let colors = [] as any;

    let interiorUV = options.interiorUV || new Vector4(0, 0, 1, 1);
    let exteriorUV = options.exteriorUV || new Vector4(0, 0, 1, 1);

    let interiorColor = options.interiorColor || new Color4(1, 1, 1, 1);
    let exteriorColor = options.exteriorColor || new Color4(1, 1, 1, 1);
    let interior = options.interior || false;
    if (!interior) {
        walls.push(walls[0]);
    }

    let interiorIndex;

    //Arrays to hold wall corner data 
    let innerBaseCorners = [] as Array<Vector3>;
    let outerBaseCorners = [] as Array<Vector3>;
    let innerTopCorners = [] as Array<Vector3>;
    let outerTopCorners = [] as Array<Vector3>;
    let innerDoorCorners = [] as Array<Vector3[][]>;
    let outerDoorCorners = [] as Array<Vector3[][]>;
    let innerWindowCorners = [] as Array<Vector3[][]>;
    let outerWindowCorners = [] as Array<Vector3[][]>;

    let angle = 0;
    let direction = 0;

    let line = Vector3.Zero();
    let nextLine = Vector3.Zero();

    let nbWalls = walls.length;
    if (nbWalls === 2) {
        walls[1].corner.subtractToRef(walls[0].corner, line);
        let lineNormal = new Vector3(line.z, 0, -1 * line.x).normalize();
        line.normalize();
        innerBaseCorners[0] = walls[0].corner;
        outerBaseCorners[0] = walls[0].corner.add(lineNormal.scale(ply));
        innerBaseCorners[1] = walls[1].corner;
        outerBaseCorners[1] = walls[1].corner.add(lineNormal.scale(ply));
    }
    else if (nbWalls > 2) {
        for (let w = 0; w < nbWalls - 1; w++) {
            walls[w + 1].corner.subtractToRef(walls[w].corner, nextLine);
            angle = Math.PI - Math.acos(Vector3.Dot(line, nextLine) / (line.length() * nextLine.length()));
            direction = Vector3.Cross(nextLine, line).normalize().y;
            let lineNormal = new Vector3(line.z, 0, -1 * line.x).normalize();
            line.normalize();
            innerBaseCorners[w] = walls[w].corner
            outerBaseCorners[w] = walls[w].corner.add(lineNormal.scale(ply)).add(line.scale(direction * ply / Math.tan(angle / 2)));
            line = nextLine.clone();
        }
        if (interior) {
            let lineNormal = new Vector3(line.z, 0, -1 * line.x).normalize();
            line.normalize();
            innerBaseCorners[nbWalls - 1] = walls[nbWalls - 1].corner
            outerBaseCorners[nbWalls - 1] = walls[nbWalls - 1].corner.add(lineNormal.scale(ply));
            walls[1].corner.subtractToRef(walls[0].corner, line);
            // lineNormal = new Vector3(line.z, 0, -1 * line.x).normalize();
            line.normalize();
            innerBaseCorners[0] = walls[0].corner;
            outerBaseCorners[0] = walls[0].corner.add(lineNormal.scale(ply));
        }
        else {
            walls[1].corner.subtractToRef(walls[0].corner, nextLine);
            angle = Math.PI - Math.acos(Vector3.Dot(line, nextLine) / (line.length() * nextLine.length()));
            direction = Vector3.Cross(nextLine, line).normalize().y;
            let lineNormal = new Vector3(line.z, 0, -1 * line.x).normalize();
            line.normalize();
            innerBaseCorners[0] = walls[0].corner
            outerBaseCorners[0] = walls[0].corner.add(lineNormal.scale(ply)).add(line.scale(direction * ply / Math.tan(angle / 2)));
            innerBaseCorners[nbWalls - 1] = innerBaseCorners[0];
            outerBaseCorners[nbWalls - 1] = outerBaseCorners[0]

        }
    }

    // inner and outer top corners
    for (let w = 0; w < nbWalls; w++) {
        innerTopCorners.push(new Vector3(innerBaseCorners[w].x, height, innerBaseCorners[w].z));
        outerTopCorners.push(new Vector3(outerBaseCorners[w].x, height, outerBaseCorners[w].z));
    }

    let maxL = 0;
    for (let w = 0; w < nbWalls - 1; w++) {
        maxL = Math.max(innerBaseCorners[w + 1].subtract(innerBaseCorners[w]).length(), maxL);
    }

    let maxH = height; // for when gables introduced

    /******House Mesh Construction********/

    // Wall Construction
    let polygonCorners;
    let polygonTriangulation;
    let wallData;
    let wallDirection = Vector3.Zero();
    let wallNormal = Vector3.Zero();
    let wallLength;
    let exteriorWallLength;
    let doorData;
    let windowData;
    let uvx, uvy;
    let wallDiff;

    for (let w = 0; w < nbWalls - 1; w++) {
        walls[w + 1].corner.subtractToRef(walls[w].corner, wallDirection);
        wallLength = wallDirection.length();
        wallDirection.normalize();
        wallNormal.x = wallDirection.z;
        wallNormal.z = -1 * wallDirection.x;
        exteriorWallLength = outerBaseCorners[w + 1].subtract(outerBaseCorners[w]).length();
        wallDiff = exteriorWallLength - wallLength;
        let gableHeight = 0;

        //doors
        if (walls[w].doorSpaces) {
            walls[w].doorSpaces.sort((a, b) => {
                return a.left - b.left
            });
        }
        let doors = walls[w].doorSpaces.length;

        //Construct INNER wall polygon starting from (0, 0) using wall length and height and door data
        polygonCorners = [];
        polygonCorners.push(new Vector2(0, 0));

        for (let d = 0; d < doors; d++) {
            polygonCorners.push(new Vector2(walls[w].doorSpaces[d].left, 0));
            polygonCorners.push(new Vector2(walls[w].doorSpaces[d].left, walls[w].doorSpaces[d].door.height));
            polygonCorners.push(new Vector2(walls[w].doorSpaces[d].left + walls[w].doorSpaces[d].door.width, walls[w].doorSpaces[d].door.height));
            polygonCorners.push(new Vector2(walls[w].doorSpaces[d].left + walls[w].doorSpaces[d].door.width, 0));
        }

        polygonCorners.push(new Vector2(wallLength, 0));
        polygonCorners.push(new Vector2(wallLength, height));
        polygonCorners.push(new Vector2(0, height));

        //Construct triangulation of polygon using its corners
        polygonTriangulation = new PolygonMeshBuilder("", polygonCorners, scene);

        //windows
        //Construct holes and add to polygon from window data			
        let windows = walls[w].windowSpaces.length;
        let holes = [] as Array<Vector2[]>;
        for (let ws = 0; ws < windows; ws++) {
            let holeData = [] as Vector2[];
            holeData.push(new Vector2(walls[w].windowSpaces[ws].left, height - walls[w].windowSpaces[ws].top - walls[w].windowSpaces[ws].window.height));
            holeData.push(new Vector2(walls[w].windowSpaces[ws].left + walls[w].windowSpaces[ws].window.width, height - walls[w].windowSpaces[ws].top - walls[w].windowSpaces[ws].window.height));
            holeData.push(new Vector2(walls[w].windowSpaces[ws].left + walls[w].windowSpaces[ws].window.width, height - walls[w].windowSpaces[ws].top));
            holeData.push(new Vector2(walls[w].windowSpaces[ws].left, height - walls[w].windowSpaces[ws].top));
            holes.push(holeData);
        }

        for (let h = 0; h < holes.length; h++) {
            polygonTriangulation.addHole(holes[h]);
        }


        // wallBuilder produces wall vertex positions array and indices using the current and next wall to rotate and translate vertex positions to correct place
        wallData = polygonTriangulation.wallBuilder(walls[w], walls[w + 1]);

        let nbIndices = positions.length / 3; // current number of indices

        polygonTriangulation._points.elements.forEach((p) => {
            uvx = interiorUV.x + p.x * (interiorUV.z - interiorUV.x) / maxL;
            uvy = interiorUV.y + p.y * (interiorUV.w - interiorUV.y) / height;
            uvs.push(uvx, uvy);
            colors.push(interiorColor.r, interiorColor.g, interiorColor.b, interiorColor.a);
        });

        //Add inner wall positions (repeated for flat shaded mesh)
        positions = positions.concat(wallData.positions);

        interiorIndex = positions.length / 3;

        indices = indices.concat(wallData.indices.map(function (idx) {
            return idx + nbIndices;
        }));

        //wallData has format for inner wall [base left, 0 or more doors, base right, top right, top left, windows]
        //extract door and wall data

        windowData = wallData.positions.slice(12 * (doors + 1)); //4 entries per door + 4 entries for wall corners, each entry has 3 data points
        doorData = wallData.positions.slice(3, 3 * (4 * doors + 1));

        //For each inner door save corner as an array of four Vector3s, base left, top left, top right, base right
        //Extend door data outwards by ply and save outer door corners 		
        let doorCornersIn = [] as Array<Vector3[]>;
        let doorCornersOut = [] as Array<Vector3[]>;
        for (let p = 0; p < doorData.length / 12; p++) {
            let doorsIn = [] as Vector3[];
            let doorsOut = [] as Vector3[];
            for (let d = 0; d < 4; d++) {
                doorsIn.push(new Vector3(doorData[3 * d + 12 * p], doorData[3 * d + 12 * p + 1], doorData[3 * d + 12 * p + 2]));
                doorData[3 * d + 12 * p] += ply * wallNormal.x;
                doorData[3 * d + 12 * p + 2] += ply * wallNormal.z;
                doorsOut.push(new Vector3(doorData[3 * d + 12 * p], doorData[3 * d + 12 * p + 1], doorData[3 * d + 12 * p + 2]));
            }
            doorCornersIn.push(doorsIn);
            doorCornersOut.push(doorsOut);
        }
        innerDoorCorners.push(doorCornersIn);
        outerDoorCorners.push(doorCornersOut);

        //For each inner window save corner as an array of four Vector3s, base left, top left, top right, base right
        //Extend window data outwards by ply and save outer window corners 		
        let windowCornersIn = [] as Vector3[][];
        let windowCornersOut = [] as Vector3[][];
        for (let p = 0; p < windowData.length / 12; p++) {
            let windowsIn = [] as Vector3[];
            let windowsOut = [] as Vector3[];
            for (let d = 0; d < 4; d++) {
                windowsIn.push(new Vector3(windowData[3 * d + 12 * p], windowData[3 * d + 12 * p + 1], windowData[3 * d + 12 * p + 2]));
                windowData[3 * d + 12 * p] += ply * wallNormal.x;
                windowData[3 * d + 12 * p + 2] += ply * wallNormal.z;
                windowsOut.push(new Vector3(windowData[3 * d + 12 * p], windowData[3 * d + 12 * p + 1], windowData[3 * d + 12 * p + 2]));
            }
            windowCornersIn.push(windowsIn);
            windowCornersOut.push(windowsOut);
        }
        innerWindowCorners.push(windowCornersIn);
        outerWindowCorners.push(windowCornersOut);

        //Construct OUTER wall facet positions from inner wall 
        //Add outer wall corner positions back to wallData positions
        wallData.positions = [];

        wallData.positions.push(outerBaseCorners[w].x, outerBaseCorners[w].y, outerBaseCorners[w].z);
        wallData.positions = wallData.positions.concat(doorData);
        wallData.positions.push(outerBaseCorners[w + 1].x, outerBaseCorners[w + 1].y, outerBaseCorners[(w + 1) % nbWalls].z);
        wallData.positions.push(outerTopCorners[w + 1].x, outerTopCorners[w + 1].y, outerTopCorners[(w + 1) % nbWalls].z);
        wallData.positions.push(outerTopCorners[w].x, outerTopCorners[w].y, outerTopCorners[w].z);
        wallData.positions = wallData.positions.concat(windowData);

        //Calulate exterior wall uvs
        polygonTriangulation._points.elements.forEach(function (p) {
            if (p.x == 0) {
                uvx = exteriorUV.x;
            }
            else if (wallLength - p.x < 0.000001) {
                uvx = exteriorUV.x + (wallDiff + p.x) * (exteriorUV.z - exteriorUV.x) / (maxL + wallDiff)
            }
            else {
                uvx = exteriorUV.x + (0.5 * wallDiff + p.x) * (exteriorUV.z - exteriorUV.x) / (maxL + wallDiff);
            }
            uvy = exteriorUV.y + p.y * (exteriorUV.w - exteriorUV.y) / height;
            uvs.push(uvx, uvy);
        });

        nbIndices = positions.length / 3; // current number of indices

        //Add outer wall positions, uvs and colors (repeated for flat shaded mesh)
        positions = positions.concat(wallData.positions);


        //Reverse indices for correct normals
        wallData.indices.reverse();

        indices = indices.concat(wallData.indices.map(function (idx) {
            return idx + nbIndices;
        }));

        //Construct facets for base and door top and door sides, repeating positions for flatshaded mesh
        let doorsRemaining = doors;
        let doorNb = 0;

        if (doorsRemaining > 0) {
            //base
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerBaseCorners[w].x, innerBaseCorners[w].y, innerBaseCorners[w].z); //tl
            positions.push(outerBaseCorners[w].x, outerBaseCorners[w].y, outerBaseCorners[w].z); //bl
            positions.push(innerDoorCorners[w][doorNb][0].x, innerDoorCorners[w][doorNb][0].y, innerDoorCorners[w][doorNb][0].z); //tr
            positions.push(outerDoorCorners[w][doorNb][0].x, outerDoorCorners[w][doorNb][0].y, outerDoorCorners[w][doorNb][0].z); //br

            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left				
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].doorSpaces[doorNb].left / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].doorSpaces[doorNb].left / maxL, exteriorUV.y); //base right

            indices.push(nbIndices, nbIndices + 2, nbIndices + 3, nbIndices + 3, nbIndices + 1, nbIndices);

            //left side
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerDoorCorners[w][doorNb][0].x, innerDoorCorners[w][doorNb][0].y, innerDoorCorners[w][doorNb][0].z); //br
            positions.push(innerDoorCorners[w][doorNb][1].x, innerDoorCorners[w][doorNb][1].y, innerDoorCorners[w][doorNb][1].z); //tr
            positions.push(outerDoorCorners[w][doorNb][0].x, outerDoorCorners[w][doorNb][0].y, outerDoorCorners[w][doorNb][0].z); //bl
            positions.push(outerDoorCorners[w][doorNb][1].x, outerDoorCorners[w][doorNb][1].y, outerDoorCorners[w][doorNb][1].z); //tl

            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top right
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top Left

            indices.push(nbIndices, nbIndices + 1, nbIndices + 3, nbIndices, nbIndices + 3, nbIndices + 2);

            //top
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerDoorCorners[w][doorNb][1].x, innerDoorCorners[w][doorNb][1].y, innerDoorCorners[w][doorNb][1].z); //bl
            positions.push(innerDoorCorners[w][doorNb][2].x, innerDoorCorners[w][doorNb][2].y, innerDoorCorners[w][doorNb][2].z); //br
            positions.push(outerDoorCorners[w][doorNb][1].x, outerDoorCorners[w][doorNb][1].y, outerDoorCorners[w][doorNb][1].z); //tl
            positions.push(outerDoorCorners[w][doorNb][2].x, outerDoorCorners[w][doorNb][2].y, outerDoorCorners[w][doorNb][2].z); //tr

            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].doorSpaces[doorNb].door.width / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].doorSpaces[doorNb].door.width / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right

            indices.push(nbIndices + 2, nbIndices + 1, nbIndices + 3, nbIndices + 2, nbIndices, nbIndices + 1);

            //right side
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerDoorCorners[w][doorNb][2].x, innerDoorCorners[w][doorNb][2].y, innerDoorCorners[w][doorNb][2].z); //tl
            positions.push(innerDoorCorners[w][doorNb][3].x, innerDoorCorners[w][doorNb][3].y, innerDoorCorners[w][doorNb][3].z); //bl
            positions.push(outerDoorCorners[w][doorNb][2].x, outerDoorCorners[w][doorNb][2].y, outerDoorCorners[w][doorNb][2].z); //tr
            positions.push(outerDoorCorners[w][doorNb][3].x, outerDoorCorners[w][doorNb][3].y, outerDoorCorners[w][doorNb][3].z); //br

            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top Left
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top right
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y); //base right

            indices.push(nbIndices, nbIndices + 3, nbIndices + 2, nbIndices, nbIndices + 1, nbIndices + 3);
        }
        doorsRemaining--
        doorNb++

        while (doorsRemaining > 0) {

            //base
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerDoorCorners[w][doorNb - 1][3].x, innerDoorCorners[w][doorNb - 1][3].y, innerDoorCorners[w][doorNb - 1][3].z); //bl
            positions.push(innerDoorCorners[w][doorNb][0].x, innerDoorCorners[w][doorNb][0].y, innerDoorCorners[w][doorNb][0].z); //br
            positions.push(outerDoorCorners[w][doorNb - 1][3].x, outerDoorCorners[w][doorNb - 1][3].y, outerDoorCorners[w][doorNb - 1][3].z); //tl
            positions.push(outerDoorCorners[w][doorNb][0].x, outerDoorCorners[w][doorNb][0].y, outerDoorCorners[w][doorNb][0].z); //tr

            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * (walls[w].doorSpaces[doorNb].left - (walls[w].doorSpaces[doorNb - 1].left + walls[w].doorSpaces[doorNb - 1].door.width)) / maxL / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * (walls[w].doorSpaces[doorNb].left - (walls[w].doorSpaces[doorNb - 1].left + walls[w].doorSpaces[doorNb - 1].door.width)) / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right

            indices.push(nbIndices, nbIndices + 1, nbIndices + 3, nbIndices + 3, nbIndices + 2, nbIndices);

            //left side
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerDoorCorners[w][doorNb][0].x, innerDoorCorners[w][doorNb][0].y, innerDoorCorners[w][doorNb][0].z); //br
            positions.push(innerDoorCorners[w][doorNb][1].x, innerDoorCorners[w][doorNb][1].y, innerDoorCorners[w][doorNb][1].z); //tr
            positions.push(outerDoorCorners[w][doorNb][0].x, outerDoorCorners[w][doorNb][0].y, outerDoorCorners[w][doorNb][0].z); //bl
            positions.push(outerDoorCorners[w][doorNb][1].x, outerDoorCorners[w][doorNb][1].y, outerDoorCorners[w][doorNb][1].z); //tl

            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top right
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top Left

            indices.push(nbIndices, nbIndices + 1, nbIndices + 3, nbIndices, nbIndices + 3, nbIndices + 2);

            //top
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerDoorCorners[w][doorNb][1].x, innerDoorCorners[w][doorNb][1].y, innerDoorCorners[w][doorNb][1].z); //bl
            positions.push(innerDoorCorners[w][doorNb][2].x, innerDoorCorners[w][doorNb][2].y, innerDoorCorners[w][doorNb][2].z); //br
            positions.push(outerDoorCorners[w][doorNb][1].x, outerDoorCorners[w][doorNb][1].y, outerDoorCorners[w][doorNb][1].z); //tl
            positions.push(outerDoorCorners[w][doorNb][2].x, outerDoorCorners[w][doorNb][2].y, outerDoorCorners[w][doorNb][2].z); //tr

            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].doorSpaces[doorNb].door.width / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].doorSpaces[doorNb].door.width / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right

            indices.push(nbIndices + 2, nbIndices + 1, nbIndices + 3, nbIndices + 2, nbIndices, nbIndices + 1);

            //right side
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerDoorCorners[w][doorNb][2].x, innerDoorCorners[w][doorNb][2].y, innerDoorCorners[w][doorNb][2].z); //tl
            positions.push(innerDoorCorners[w][doorNb][3].x, innerDoorCorners[w][doorNb][3].y, innerDoorCorners[w][doorNb][3].z); //bl
            positions.push(outerDoorCorners[w][doorNb][2].x, outerDoorCorners[w][doorNb][2].y, outerDoorCorners[w][doorNb][2].z); //tr
            positions.push(outerDoorCorners[w][doorNb][3].x, outerDoorCorners[w][doorNb][3].y, outerDoorCorners[w][doorNb][3].z); //br

            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top Left
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].doorSpaces[doorNb].door.height / maxH); //top right
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y); //base right

            indices.push(nbIndices, nbIndices + 3, nbIndices + 2, nbIndices, nbIndices + 1, nbIndices + 3);

            doorsRemaining--
            doorNb++

        }

        doorNb--;
        nbIndices = positions.length / 3; // current number of indices

        //final base
        if (doors > 0) {
            positions.push(innerDoorCorners[w][doorNb][3].x, innerDoorCorners[w][doorNb][3].y, innerDoorCorners[w][doorNb][3].z); //bl
            positions.push(innerBaseCorners[w + 1].x, innerBaseCorners[w + 1].y, innerBaseCorners[w + 1].z); //br
            positions.push(outerDoorCorners[w][doorNb][3].x, outerDoorCorners[w][doorNb][3].y, outerDoorCorners[w][doorNb][3].z); //tl
            positions.push(outerBaseCorners[w + 1].x, outerBaseCorners[w + 1].y, outerBaseCorners[w + 1].z); //tr

            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * (wallLength - (walls[w].doorSpaces[doorNb].left + walls[w].doorSpaces[doorNb].door.width)) / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * (wallLength - (walls[w].doorSpaces[doorNb].left + walls[w].doorSpaces[doorNb].door.width)) / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right

        }
        else {
            positions.push(innerBaseCorners[w].x, innerBaseCorners[w].y, innerBaseCorners[w].z); //bl
            positions.push(innerBaseCorners[w + 1].x, innerBaseCorners[w + 1].y, innerBaseCorners[w + 1].z); //br
            positions.push(outerBaseCorners[w].x, outerBaseCorners[w].y, outerBaseCorners[w].z); //tl
            positions.push(outerBaseCorners[w + 1].x, outerBaseCorners[w + 1].y, outerBaseCorners[w + 1].z); //tr

            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * wallLength / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * wallLength / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right

        }
        indices.push(nbIndices, nbIndices + 1, nbIndices + 3, nbIndices + 3, nbIndices + 2, nbIndices);

        //Construct facets for window base, top and sides, repeating positions for flatshaded mesh
        for (let ww = 0; ww < innerWindowCorners[w].length; ww++) {
            //left side
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerWindowCorners[w][ww][3].x, innerWindowCorners[w][ww][3].y, innerWindowCorners[w][ww][3].z); //tr
            positions.push(innerWindowCorners[w][ww][0].x, innerWindowCorners[w][ww][0].y, innerWindowCorners[w][ww][0].z); //br
            positions.push(outerWindowCorners[w][ww][3].x, outerWindowCorners[w][ww][3].y, outerWindowCorners[w][ww][3].z); //tl
            positions.push(outerWindowCorners[w][ww][0].x, outerWindowCorners[w][ww][0].y, outerWindowCorners[w][ww][0].z); //bl

            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].windowSpaces[ww].window.height / maxH); //top right
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].windowSpaces[ww].window.height / maxH); //top Left
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left

            indices.push(nbIndices + 1, nbIndices, nbIndices + 3, nbIndices + 2, nbIndices + 3, nbIndices);

            //base
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerWindowCorners[w][ww][0].x, innerWindowCorners[w][ww][0].y, innerWindowCorners[w][ww][0].z); //tl
            positions.push(innerWindowCorners[w][ww][1].x, innerWindowCorners[w][ww][1].y, innerWindowCorners[w][ww][1].z); //tr
            positions.push(outerWindowCorners[w][ww][0].x, outerWindowCorners[w][ww][0].y, outerWindowCorners[w][ww][0].z); //bl
            positions.push(outerWindowCorners[w][ww][1].x, outerWindowCorners[w][ww][1].y, outerWindowCorners[w][ww][1].z); //br

            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].windowSpaces[ww].window.width / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].windowSpaces[ww].window.width / maxL, exteriorUV.y); //base right

            indices.push(nbIndices + 1, nbIndices, nbIndices + 3, nbIndices + 3, nbIndices, nbIndices + 2);

            //right side
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerWindowCorners[w][ww][1].x, innerWindowCorners[w][ww][1].y, innerWindowCorners[w][ww][1].z); //bl
            positions.push(innerWindowCorners[w][ww][2].x, innerWindowCorners[w][ww][2].y, innerWindowCorners[w][ww][2].z); //tl
            positions.push(outerWindowCorners[w][ww][1].x, outerWindowCorners[w][ww][1].y, outerWindowCorners[w][ww][1].z); //br
            positions.push(outerWindowCorners[w][ww][2].x, outerWindowCorners[w][ww][2].y, outerWindowCorners[w][ww][2].z); //tr

            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].windowSpaces[ww].window.height / maxH); //top Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x), exteriorUV.y + (exteriorUV.w - exteriorUV.y) * walls[w].windowSpaces[ww].window.height / maxH); //top right

            indices.push(nbIndices + 1, nbIndices + 2, nbIndices + 3, nbIndices, nbIndices + 2, nbIndices + 1);

            //top
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerWindowCorners[w][ww][2].x, innerWindowCorners[w][ww][2].y, innerWindowCorners[w][ww][2].z); //br
            positions.push(innerWindowCorners[w][ww][3].x, innerWindowCorners[w][ww][3].y, innerWindowCorners[w][ww][3].z); //bl
            positions.push(outerWindowCorners[w][ww][2].x, outerWindowCorners[w][ww][2].y, outerWindowCorners[w][ww][2].z); //tr
            positions.push(outerWindowCorners[w][ww][3].x, outerWindowCorners[w][ww][3].y, outerWindowCorners[w][ww][3].z); //tl

            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].windowSpaces[ww].window.width / maxL, exteriorUV.y); //base right
            uvs.push(exteriorUV.x, exteriorUV.y); //base Left
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * walls[w].windowSpaces[ww].window.width / maxL, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right
            uvs.push(exteriorUV.x, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left

            indices.push(nbIndices + 3, nbIndices, nbIndices + 2, nbIndices + 1, nbIndices, nbIndices + 3);

        }

        //Construction of top of wall facets
        nbIndices = positions.length / 3; // current number of indices

        positions.push(innerTopCorners[w].x, innerTopCorners[w].y, innerTopCorners[w].z); //tl
        positions.push(innerTopCorners[w + 1].x, innerTopCorners[w + 1].y, innerTopCorners[w + 1].z); //tr
        positions.push(outerTopCorners[w].x, outerTopCorners[w].y, outerTopCorners[w].z); //bl
        positions.push(outerTopCorners[w + 1].x, outerTopCorners[w + 1].y, outerTopCorners[w + 1].z); //br

        uvx = exteriorUV.x + 0.5 * wallDiff * (exteriorUV.z - exteriorUV.x) / maxL;
        uvs.push(uvx, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top Left

        uvx = exteriorUV.x + (0.5 * wallDiff + wallLength) * (exteriorUV.z - exteriorUV.x) / maxL;
        uvs.push(uvx, exteriorUV.y + (exteriorUV.w - exteriorUV.y) * ply / maxH); //top right

        uvs.push(exteriorUV.x, exteriorUV.y); //base Left		
        uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * exteriorWallLength / (maxL + wallDiff), exteriorUV.y); //base right

        indices.push(nbIndices + 1, nbIndices, nbIndices + 3, nbIndices + 2, nbIndices + 3, nbIndices);

        for (let p = interiorIndex; p < positions.length / 3; p++) {
            colors.push(exteriorColor.r, exteriorColor.g, exteriorColor.b, exteriorColor.a);
        }

        if (interior) {  //close ends of walls
            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerBaseCorners[0].x, innerBaseCorners[0].y, innerBaseCorners[0].z);
            positions.push(outerBaseCorners[0].x, outerBaseCorners[0].y, outerBaseCorners[0].z);
            positions.push(outerTopCorners[0].x, outerTopCorners[0].y, outerTopCorners[0].z);
            positions.push(innerTopCorners[0].x, innerTopCorners[0].y, innerTopCorners[0].z);

            uvs.push(exteriorUV.x, exteriorUV.y);
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y);
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.z);
            uvs.push(exteriorUV.x, exteriorUV.z);

            indices.push(nbIndices, nbIndices + 1, nbIndices + 2, nbIndices, nbIndices + 2, nbIndices + 3);

            nbIndices = positions.length / 3; // current number of indices

            positions.push(innerBaseCorners[nbWalls - 1].x, innerBaseCorners[nbWalls - 1].y, innerBaseCorners[nbWalls - 1].z);
            positions.push(outerBaseCorners[nbWalls - 1].x, outerBaseCorners[nbWalls - 1].y, outerBaseCorners[nbWalls - 1].z);
            positions.push(outerTopCorners[nbWalls - 1].x, outerTopCorners[nbWalls - 1].y, outerTopCorners[nbWalls - 1].z);
            positions.push(innerTopCorners[nbWalls - 1].x, innerTopCorners[nbWalls - 1].y, innerTopCorners[nbWalls - 1].z);

            uvs.push(exteriorUV.x, exteriorUV.y);
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.y);
            uvs.push(exteriorUV.x + (exteriorUV.z - exteriorUV.x) * ply / maxL, exteriorUV.z);
            uvs.push(exteriorUV.x, exteriorUV.z);

            indices.push(nbIndices + 1, nbIndices, nbIndices + 2, nbIndices + 2, nbIndices, nbIndices + 3);

            for (let p = 0; p < 8; p++) {
                colors.push(exteriorColor.r, exteriorColor.g, exteriorColor.b, exteriorColor.a);
            }
        }

    }

    let normals = [];

    VertexData.ComputeNormals(positions, indices, normals);
    VertexData._ComputeSides(Mesh.FRONTSIDE, positions, indices, normals, uvs);


    //Create a custom mesh  
    let customMesh = new Mesh("custom", scene);

    //Create a vertexData object
    let vertexData = new VertexData();

    //Assign positions and indices to vertexData
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    vertexData.colors = colors;

    //Apply vertexData to custom mesh
    vertexData.applyToMesh(customMesh);

    return customMesh;

}