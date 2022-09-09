import { Scene } from "@babylonjs/core/scene";
import { Mesh, MeshBuilder, Vector3 } from "@babylonjs/core";

const frameMaker = (id: string, path: Array<Vector3>, profile: Array<Vector3>, scene: Scene) => {

  let originX = Number.MAX_VALUE;

  for(let i = 0; i < profile.length; i++) {
    originX = Math.min(originX, profile[i].x);
  }

  let angle = 0;
  let width = 0;
  let cornerProfile: any = [];

  let nbPoints = path.length;
  let line = Vector3.Zero();
  let nextLine = Vector3.Zero();
  path[1].subtractToRef(path[0], line);
  path[2].subtractToRef(path[1], nextLine);
    console.log(`line: ${JSON.stringify(line, null, 2)}`);
    console.log(`nextLine: ${JSON.stringify(nextLine, null, 2)}`);

  for(let p = 0; p < nbPoints; p++) {
    angle = Math.PI - Math.acos(Vector3.Dot(line, nextLine)/(line.length() * nextLine.length()));
    let direction = Vector3.Cross(line, nextLine).normalize().z;
    console.log(`line: ${JSON.stringify(line, null, 2)}`);
    let lineNormal = new Vector3(line.y, -1 * line.x, 0).normalize();
    line.normalize();
    cornerProfile[(p + 1) % nbPoints] = [];
    //local profile
    for(let m = 0; m < profile.length; m++) {
      width = profile[m].x - originX;
      cornerProfile[(p + 1) % nbPoints].push(path[(p + 1) % nbPoints].subtract(lineNormal.scale(width)).subtract(line.scale(direction * width/Math.tan(angle/2))));
    }

    line = nextLine.clone();
    path[(p + 3) % nbPoints].subtractToRef(path[(p + 2) % nbPoints], nextLine);
  }

  let frame = [] as any[];

  for(let p = 0; p < nbPoints; p++) {
    let extrusionPaths: any = []
    for(let m = 0; m < profile.length; m++) {
      extrusionPaths[m] = [];
      extrusionPaths[m].push(new Vector3(cornerProfile[p][m].x, cornerProfile[p][m].y, profile[m].y));
      extrusionPaths[m].push(new Vector3(cornerProfile[(p + 1) % nbPoints][m].x, cornerProfile[(p + 1) % nbPoints][m].y, profile[m].y));
    }

    frame[p] = MeshBuilder.CreateRibbon("frameLeft", {pathArray: extrusionPaths, sideOrientation: Mesh.DOUBLESIDE, updatable: true, closeArray: true}, scene);
    //frame[p].normalizeToUnitCube();
  }

		//return
  let mesh = Mesh.MergeMeshes(frame, true)?.convertToFlatShadedMesh();
  //mesh?.normalizeToUnitCube();
  //mesh!.scalingDeterminant = 0.1;
  console.log(mesh?.scalingDeterminant);
}

export const addFrame = (scene: Scene) => {
  let path  = [
    new Vector3(1, 1, 0),
    new Vector3(2, 1, 0),
    new Vector3(2, 2, 0),
    new Vector3(1, 2, 0)
  ];
  /*
	let deltaAngle = Math.PI/128;
	let radiusX = 1;
	let radiusY = 1;
	for(let a = 0; a < 2 * Math.PI; a += deltaAngle) {
		path.push(new Vector3(radiusX * Math.cos(a), radiusY * Math.sin(a), 0));
	}
  */

	//profile

	const profilePoints = [
    new Vector3(0.1, 0.2, 0),
    new Vector3(0.1, 0.1, 0),
    new Vector3(0.2, 0.1, 0),
    new Vector3(0.2, 0.25, 0),
    new Vector3(0.25, 0.25, 0),
    new Vector3(0.25, 0.2, 0),
	];
/*
	let height = 0.4;
	let inset = 0.1;
	let width = 2;
	const profilePoints = [
		new Vector3(width, 0, 0),
		new Vector3(-width, 0, 0),
		new Vector3(-width, height, 0),
		new Vector3(-width + inset, height, 0)
	];
*/

  /*
	let theta = -3 * Math.PI / 2;
	let steps = 40;
	let x = 0;
	let y = 0;
	for(let s = 0; s < steps; s++) {
		x = -width + inset + 2 * s * (width - inset) / steps;
		y = height + (1 - 1/((width - inset) * (width - height)) * x * x) * Math.abs(Math.cos(theta)) ;
		profilePoints.push(new Vector3(x, y, 0));
		theta += 3 * Math.PI /steps;
	}

	profilePoints.push(new Vector3(width - inset, height, 0));
	profilePoints.push(new Vector3(width, height, 0));
  */
	frameMaker("line", path, profilePoints, scene);
}
