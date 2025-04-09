import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Canvas, FabricImage } from "fabric";
import { Switch } from "./ui/switch";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "./ui/label";
import { useAuthContext } from "@/hooks/useAuthContext";

type ImageSizeProps = {
  canvas: Canvas;
  image: FabricImage;
};

const ImageSize = ({ canvas, image }: ImageSizeProps) => {
  const { user } = useAuthContext();
  const { finalImageDimensions, setFinalImageDimensions } = useCanvasObjects();
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const { addLog } = useLogContext();
  const [superResValue, setSuperResValue] = useState("none");

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value);
    const oldHeight = image.height;
    const oldWidth = image.width;

    const ratio = oldWidth / oldHeight;
    const newHeight = Math.floor(newWidth / ratio);

    let scaleY = newHeight / oldHeight;
    const scaleX = newWidth / oldWidth;

    if (newWidth > 0) {
      if (maintainAspectRatio) {
        setFinalImageDimensions({
          imageHeight: newHeight,
          imageWidth: newWidth,
        });
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image height change to ${newHeight} width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
      } else {
        setFinalImageDimensions({
          ...finalImageDimensions,
          imageWidth: newWidth,
        });
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
        scaleY = image.scaleY;
      }
    }

    image.scaleX = scaleX;
    image.scaleY = scaleY;
    canvas.renderAll();
  };
  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value);
    const oldHeight = image.height;
    const oldWidth = image.width;

    const ratio = oldWidth / oldHeight;
    const newWidth = Math.floor(newHeight * ratio);

    const scaleY = newHeight / oldHeight;
    let scaleX = newWidth / oldWidth;

    if (newHeight > 0) {
      if (maintainAspectRatio) {
        setFinalImageDimensions({
          imageHeight: newHeight,
          imageWidth: newWidth,
        });
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image height change to ${newHeight} width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
      } else {
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image height change to ${newHeight}`,
          param: "image size",
          objType: "image",
        });
        setFinalImageDimensions({
          ...finalImageDimensions,
          imageHeight: newHeight,
        });
        scaleX = image.scaleX;
      }
    }

    image.scaleX = scaleX;
    image.scaleY = scaleY;
    canvas.renderAll();
  };

  const handleImageResizeReset = () => {
    setFinalImageDimensions({
      imageHeight: image.height,
      imageWidth: image.width,
    });
    addLog({
      section: "arrange",
      tab: "image size",
      event: "update",
      message: `image height & width changed to default value`,
      param: "image size",
      objType: "image",
    });

    image.scaleX = 1;
    image.scaleY = 1;
    canvas.renderAll();
  };

  const handleImageResizeX = (inc: number) => {
    const newWidth = finalImageDimensions.imageWidth * inc;
    const newHeight = finalImageDimensions.imageHeight * inc;

    image.scaleX *= inc;
    image.scaleY *= inc;
    canvas.renderAll();

    setFinalImageDimensions({
      imageWidth: newWidth,
      imageHeight: newHeight,
    });

    addLog({
      section: "arrange",
      tab: "image size",
      event: "scale up",
      message: `Image scaled ${inc}x`,
      param: `${inc}x scale`,
      objType: "image",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Image Size</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col w-full gap-3  items-center justify-center">
            <div className="grid grid-cols-2  items-center justify-center">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                name="height"
                value={finalImageDimensions.imageHeight}
                onChange={handleHeightChange}
              />
            </div>
            <div className="grid grid-cols-2  items-center justify-center">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                name="width"
                value={finalImageDimensions.imageWidth}
                onChange={handleWidthChange}
              />
            </div>
            <div className="mt-2 w-full flex justify-between items-center">
              <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
              <Switch
                id="aspect-ratio"
                checked={maintainAspectRatio}
                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
              />
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                handleImageResizeX(2);
              }}
            >
              +2x
            </Button>

            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                handleImageResizeX(4);
              }}
            >
              +4x
            </Button>
          </div>

          <button className="custom-button" onClick={handleImageResizeReset}>
            Reset
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageSize;
