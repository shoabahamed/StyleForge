import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import IconComponent from "./icon-component";

import {
  Square,
  Blend,
  Triangle as IconTriangle,
  Circle as IconCircle,
} from "lucide-react";

import { Canvas, FabricImage, Rect, Circle, Triangle, Ellipse } from "fabric";
import { useEffect, useState } from "react";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

type Props = {
  canvas: Canvas;
  image: FabricImage;
};

const CropSidebar = ({ canvas, image }: Props) => {
  const { addLog } = useLogContext();
  const { selectedObject, setSelectedObject } = useCanvasObjects();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState<null | FabricImage>();

  // Helper function to create shapes
  const getShape = (shapeType: string) => {
    const stroke_color = "red";
    const stroke_width = 1;
    const stroke_array = [5, 5];
    const frameName = `Frame ${
      canvas.getObjects(shapeType).length + 1
    } shapeType`;

    if (shapeType === "circle") {
      return new Circle({
        top: 100,
        left: 50,
        radius: 50,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    } else if (shapeType === "rect") {
      return new Rect({
        top: 100,
        left: 50,
        width: 100,
        height: 60,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    } else if (shapeType === "triangle") {
      return new Triangle({
        left: 10,
        top: 10,
        width: 60,
        height: 60,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    } else if (shapeType === "elipse") {
      return new Ellipse({
        left: 50,
        top: 50,
        rx: 50,
        ry: 30,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    } else {
      return new Rect({
        top: 100,
        left: 50,
        width: 100,
        height: 60,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    }
  };

  useEffect(() => {
    const handleObjectCleared = () => {
      // if (image.clipPath) {
      //   image.clipPath = null; // Remove the clipping path
      // }
      setSelectedObject(null);
    };

    const handleObjectCreated = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setSelectedObject(activeObject);

        // if (activeObject.cropRect != undefined) {
        // const newWidth = Math.floor(
        //   activeObject.width! * activeObject.scaleX!
        // );
        // const newHeight = Math.floor(
        //   activeObject.height! * activeObject.scaleY!
        // );

        // setCropWidth(newWidth.toString());
        // setCropHeight(newHeight.toString());
        // }
      }
    };

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        // const objectName = activeObject.type || "Unknown Object";
        setSelectedObject(activeObject);
        // if (activeObject.cropRect != undefined) {
        // const newWidth = Math.floor(
        //   activeObject.width! * activeObject.scaleX!
        // );
        // const newHeight = Math.floor(
        //   activeObject.height! * activeObject.scaleY!
        // );

        // setCropWidth(newWidth.toString());
        // setCropHeight(newHeight.toString());
        // }
      }
    };

    const handleObjectScaled = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        const scaleX = activeObject.scaleX?.toFixed(2) || "N/A";
        const scaleY = activeObject.scaleY?.toFixed(2) || "N/A";

        addLog({
          section: "crop&cut",
          tab: "cut",
          event: "update",
          message: `scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`,
          param: "scale",
          objType: activeObject.type,
        });

        setSelectedObject(activeObject);
        // if (activeObject.cropRect != undefined) {
        //   const newWidth = Math.floor(
        //     activeObject.width! * activeObject.scaleX!
        //   );
        //   const newHeight = Math.floor(
        //     activeObject.height! * activeObject.scaleY!
        //   );

        // setCropWidth(newWidth.toString());
        // setCropHeight(newHeight.toString());
      }
    };

    canvas.on("selection:created", handleObjectCreated);
    canvas.on("selection:cleared", handleObjectCleared);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:scaling", handleObjectScaled);

    return () => {
      if (!image.clipPath) {
        console.log("sdkfd");
        canvas.getObjects().forEach((obj) => {
          // @ts-ignore
          if (obj.name?.startsWith("Frame")) {
            addLog({
              section: "crop&cut",
              tab: "cut",
              event: "deletion",
              message: `deleted unused shape ${obj.type}`,
              objType: obj.type,
            });

            canvas.remove(obj);
          }
        });
        canvas.renderAll();
      } else {
        canvas.discardActiveObject();
        setSelectedObject(null);

        canvas.requestRenderAll();
      }

      canvas.off("selection:created", handleObjectCreated);
      canvas.off("selection:cleared", handleObjectCleared);
      canvas.off("object:scaling", handleObjectScaled);
      canvas.off("object:modified", handleObjectModified);
    };
  }, [canvas]);

  // Function to add shapes to the canvas
  const addShape = (shapeType: string) => {
    if (selectedObject) {
      // TODO: add log here

      // TODO: add log here

      image.clipPath = null; // Remove the clipping path
      canvas.remove(selectedObject);
    }

    const shape = getShape(shapeType);

    canvas.add(shape);
    canvas.setActiveObject(shape); // Set the newly added shape as the active object
    setSelectedObject(shape);
    setSelectedObject(shape);
    canvas.renderAll();

    addLog({
      section: "crop&cut",
      tab: "cut",
      event: "creation",
      message: "created and selected shape " + shape.type + " for clipping",
      objType: shape.type,
    });
  };

  // Function to apply clipping
  const handleShapeClip = () => {
    const frameObject = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));

    if (frameObject) {
      addLog({
        section: "crop&cut",
        tab: "cut",
        event: "update",
        message: `applied ${frameObject.type} to cut the image`,
        objType: frameObject.type,
      });

      canvas.setActiveObject(frameObject);
      setSelectedObject(frameObject);
      frameObject.absolutePositioned = true; // Required for proper clipping
      image.clipPath = frameObject;

      canvas.renderAll();
    }
  };

  // Reset clipping
  const resetClip = () => {
    if (image.clipPath) {
      const frameObject = canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.name?.startsWith("Frame"));

      addLog({
        section: "crop&cut",
        tab: "cut",
        event: "reset",
        message: `removed clipping and deleted ${frameObject.type} object`,
        objType: frameObject.type,
      });

      image.clipPath = null; // Remove the clipping path
      canvas.remove(frameObject);
      canvas.renderAll();
    }
  };

  const handleBackGroundColorChange = (e) => {
    canvas.backgroundColor = e.target.value;
    addLog({
      section: "crop&cut",
      tab: "background",
      event: "update",
      message: `cavnvas background color changed to ${e.target.value}`,
    });

    setBackgroundColor(e.target.value);
    canvas.renderAll();
  };

  const handleBackGroundImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image");
        return;
      }

      // Convert the file to Base64
      const base64Image = await convertFileToBase64(file);

      // Create an Image object
      const backgroundImage = new Image();
      backgroundImage.src = base64Image;

      backgroundImage.onload = () => {
        const fabricBackgroundImage = new FabricImage(backgroundImage);

        // Scale the background image to fit the canvas dimensions
        const scaleX = image.getScaledWidth() / fabricBackgroundImage.width;
        const scaleY = image.getScaledHeight() / fabricBackgroundImage.height;

        fabricBackgroundImage.scaleX = scaleX;
        fabricBackgroundImage.scaleY = scaleY;

        // Set the background image (now using Base64)
        canvas.backgroundImage = fabricBackgroundImage;
        canvas.renderAll();

        setBackgroundImage(fabricBackgroundImage);
        console.log(canvas.toObject(["name"]));

        addLog({
          section: "crop&cut",
          tab: "background",
          event: "creation",
          message: `added background image to canvas`,
        });
      };
    }
  };

  // Helper function to convert File to Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeBackGroundImage = () => {
    addLog({
      section: "crop&cut",
      tab: "background",
      event: "reset",
      message: `background removed from canvas`,
    });

    if (canvas.backgroundImage) {
      canvas.backgroundImage = null;
      canvas.renderAll();
      setBackgroundImage(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      {/* <div className="w-[90%]">
      {/* <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Crop</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col w-full gap-3 items-center justify-center">
              <div className="grid grid-cols-2 justify-center items-center">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  name="height"
                  value={cropHeight}
                  onChange={(e) => setCropHeight(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2  justify-center items-center">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  name="width"
                  value={cropWidth}
                  onChange={(e) => setCropWidth(e.target.value)}
                />
              </div>
              <Button onClick={addCropHandler} className="w-full">
                Start Cropping
              </Button>
              <Button onClick={addCropHandler} className="w-full">
                Start Cropping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div> */}
      {/* </div>  */}

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Shape</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <IconComponent
                icon={<IconCircle />}
                iconName="Circle"
                handleClick={() => addShape("circle")}
              />
              <IconComponent
                icon={<Square />}
                iconName="Rect"
                handleClick={() => addShape("rect")}
              />
              <IconComponent
                icon={<IconTriangle />}
                iconName="Triangle"
                handleClick={() => addShape("triangle")}
              />
              <IconComponent
                icon={<Blend />}
                iconName="Ellipse"
                handleClick={() => addShape("elipse")}
              />
            </div>

            <button className="w-full custom-button" onClick={handleShapeClip}>
              CUT
            </button>
          </CardContent>
        </Card>
      </div>
      {/* <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Canvas BackGround
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-2">
                <label
                  htmlFor="color_picker"
                  className="text-sm text-slate-400 mt-2"
                >
                  Color
                </label>
                <Input
                  className="w-[25%] border-none cursor-pointer rounded"
                  id="color_picker"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    handleBackGroundColorChange(e);
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="background-image"
                  className="custom-button w-full"
                >
                  Add Image
                </Label>
                <Input
                  id="background-image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBackGroundImageChange}
                />
              </div>
              <div>
                <button
                  className="custom-button w-full"
                  onClick={removeBackGroundImage}
                >
                  Remove Image
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Mode</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3 justify-center">
              {/* <Button className="text-sm md:text-sm">Invert Cutout</Button> */}
              <button className="custom-button w-full" onClick={resetClip}>
                Reset Cutout
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CropSidebar;
