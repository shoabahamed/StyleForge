
import * as fabric from "fabric";



function isBase64(input) {
  // Regular expression to check if the input is a valid base64 string
  const base64Pattern = /^([A-Za-z0-9+/=]|\r|\n)*$/;
  
  // Check if the input starts with "data:" (base64) or "http://" or "https://" (URL)
  if (input.startsWith('data:') && base64Pattern.test(input.split(',')[1])) {
    return true; // Base64 string
  }
}

const  base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch?.[1] ?? "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}



const  urlToBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const urlToFile = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], "image.png", { type: "image/png" });

  return file;
};



function getRotatedBoundingBox(obj: fabric.Object) {
  const coords = obj.getCoords(); // returns array of 4 points: TL, TR, BR, BL

  const xValues = coords.map((p) => p.x);
  const yValues = coords.map((p) => p.y);

  const left = Math.min(...xValues);
  const top = Math.min(...yValues);
  const right = Math.max(...xValues);
  const bottom = Math.max(...yValues);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

const getCanvasDataUrl = (  canvas: fabric.Canvas,
  image: fabric.FabricImage, downloadFrame:boolean=false, changeAngle:boolean=false) => {


    const currentAngle = image.angle
    if(changeAngle) {image.angle = 0}
    

    let dataURL: string = "";
    const originalViewportTransform = canvas.viewportTransform;
    const originalZoom = canvas.getZoom();
    


    // Reset to neutral
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvas.setZoom(1);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());


    const frameObject = canvas
    .getObjects() // @ts-ignore
    .find((obj) => obj.name?.startsWith("Frame"));

    if(changeAngle && frameObject){
      image.clipPath = null
    }

    // Find the object named "Frame" or starting with "Frame"
    let bounds = getRotatedBoundingBox(image);

    if (frameObject && downloadFrame) {
      bounds = getRotatedBoundingBox(frameObject);
    }

    console.log(bounds);
    // TODO: since scale has changed I also need to scale other objects too

    dataURL = canvas.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });



    // Restore zoom & transform
    canvas.setViewportTransform(originalViewportTransform);
    canvas.setZoom(originalZoom);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());
    

    if(changeAngle) {
      image.angle = currentAngle
      if(frameObject){
        frameObject.absolutePositioned = true;
        image.clipPath = frameObject
      }
      
    }

    canvas.renderAll();
   

    return dataURL
      
  }


export {urlToBase64, base64ToFile, urlToFile, getRotatedBoundingBox, isBase64, getCanvasDataUrl}




