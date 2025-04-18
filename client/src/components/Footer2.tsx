import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { ZoomIn, ZoomOut, Pencil, Upload, RotateCcw } from "lucide-react";
import IconComponent from "./icon-component";

import { Canvas, FabricImage } from "fabric";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

// TODO: saving canvas when style transfer has been done
// TODO: saving the background image if available(not sure though may be we could just let fabric js handle this)

type mapStateType = {
  scale: number;
  translation: { x: number; y: number };
};

type Props = {
  canvas: Canvas;
  image: FabricImage;
  backupImage: FabricImage;
  canvasId: string;
  imageUrl: string;
  mapState: mapStateType;
  setMapState: (obj: mapStateType) => void;
  setLoadState: (val: boolean) => void;
};

const Footer2 = ({
  canvas,
  image,
  backupImage,
  canvasId,
  imageUrl,
  mapState,
  setMapState,
  setLoadState,
}: Props) => {
  const { selectedObject, loadedFromSaved } = useCanvasObjects();
  const { user } = useAuthContext();
  const { logs, addLog } = useLogContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [openDownloadOptions, setOpenDownloadOptions] = useState(false);
  const [downloadFrame, setDownLoadFrame] = useState(false);
  const [superResValue, setSuperResValue] = useState("none");

  const projectName = useCommonProps((state) => state.projectName);
  const setProjectName = useCommonProps((state) => state.setProjectName);
  const showUpdateButton = useCommonProps((state) => state.showUpdateButton);
  const setShowUpdateButton = useCommonProps(
    (state) => state.setShowUpdateButton
  );
  const resetFilters = useAdjustStore((state) => state.resetFilters);

  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [dataURL, setDataURL] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;
        setDataURL(binaryStr);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, acceptedFiles, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
      },
    });

  const handleImageUpload = (imageUrl: string) => {
    setShowLoadingDialog(false);
    navigate("/temp", { state: { imageUrl } });
    window.location.reload();
  };

  // Function to convert Blob to File
  const convertBlobToFile = (url) => {
    return new Promise((resolve, reject) => {
      // Fetch the blob from the URL
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          // Create a new File object using the Blob
          const file = new File([blob], "image.png", { type: "image/png" });
          resolve(file); // Resolve with the File object
        })
        .catch(reject); // Reject if any error occurs
    });
  };

  const onSaveCanvas = async () => {
    addLog({
      section: "canvas",
      tab: "canvas",
      event: "save",
      message: `Saving project`,
    });

    if (!canvas) return;
    setLoadState(true);
    try {
      if (!canvas || !image) return;

      let backgroundImage: null | FabricImage = null;
      if (canvas.backgroundImage) {
        // @ts-ignore
        backgroundImage = canvas.backgroundImage;
      }

      // current canvas and image dimentions (they are both always same)
      const originalImageWidth = image.width!;
      const originalImageHeight = image.height!;

      // required image width
      const {
        imageWidth: requiredImageWidth,
        imageHeight: requiredImageHeight,
      } = currentImageDim;

      const renderedImageWidth = image.scaleX! * originalImageWidth;
      const renderedImageHeight = image.scaleY! * originalImageHeight;

      // Calculate scaling factors
      const scaleX = requiredImageWidth / renderedImageWidth;
      const scaleY = requiredImageHeight / renderedImageHeight;

      // Scale the canvas to the original image size
      canvas.setDimensions({
        width: requiredImageWidth,
        height: requiredImageHeight,
      });

      // Apply scaling factors to all other objects
      canvas.getObjects().forEach((obj) => {
        obj.scaleX *= scaleX;
        obj.scaleY *= scaleY;
        obj.left *= scaleX;
        obj.top *= scaleY;
        obj.setCoords();
      });

      // scale background image if exist
      if (backgroundImage) {
        backgroundImage.scaleX *= scaleX;
        backgroundImage.scaleY *= scaleY;
      }

      // Get the image representation of the canvas
      const canvasDataUrl = canvas.toDataURL(); // Canvas as data URL

      // Restore the canvas and image to their previous dimensions

      canvas.setDimensions({
        width: renderedImageWidth,
        height: renderedImageHeight,
      });

      // Restore the scale and position of all other objects
      canvas.getObjects().forEach((obj) => {
        obj.scaleX /= scaleX;
        obj.scaleY /= scaleY;
        obj.left /= scaleX;
        obj.top /= scaleY;
        obj.setCoords();
      });

      // scale background image if exist
      if (backgroundImage) {
        backgroundImage.scaleX /= scaleX;
        backgroundImage.scaleY /= scaleY;
      }

      // json data
      const canvasJSON = canvas.toObject(["name"]);
      const mainImageSrc = canvasJSON.objects[0].src;
      // const backgroundImageSrc = canvasJSON.backgroundImage.src;
      // canvasJSON.backgroundImage.src = "temp";
      canvasJSON.objects[0].src = "temp"; //large base64 file does not get parsed in flask for some so using a hack temporaliy as we do not rely on src

      // Convert canvas image (Data URL) to a Blob and then to a File
      const canvasImageFile = await convertBlobToFile(canvasDataUrl);
      // Convert the image URL (blob URL) to a File object
      const originalImageFile = await convertBlobToFile(imageUrl);

      // Create FormData object and append the image and other canvas data
      const formData = new FormData();
      formData.append("canvasId", canvasId);
      formData.append("username", user?.username);
      formData.append("isPublic", "false");
      formData.append("canvasData", JSON.stringify(canvasJSON));
      formData.append("canvasLogs", JSON.stringify(logs));
      // formData.append("mainImageSrc", mainImageSrc);
      formData.append(
        "originalImageShape",
        JSON.stringify({ width: image.width, height: image.height })
      );

      formData.append(
        "finalImageShape",
        JSON.stringify({
          width: requiredImageWidth,
          height: requiredImageHeight,
        })
      );
      formData.append(
        "renderedImageShape",
        JSON.stringify({
          width: renderedImageWidth,
          height: renderedImageHeight,
        })
      );
      formData.append(
        "imageScale",
        JSON.stringify({ scaleX: image.scaleX, scaleY: image.scaleY })
      );
      // @ts-ignore
      formData.append("originalImage", originalImageFile);
      // @ts-ignore
      formData.append("canvasImage", canvasImageFile);
      formData.append("projectName", projectName);
      formData.append("loadedFromSaved", loadedFromSaved ? "true" : "false");
      console.log([...formData]); // This will log the FormData entries as an array

      // Post JSON data to the backend with JWT in headers
      const response = await apiClient.post(
        "/save_project",

        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
          },
        }
      );

      // localStorage.setItem("canvasId", canvasId);
      // localStorage.setItem(
      //   "project_data",
      //   JSON.stringify(response.data.data.project_data)
      // );

      setLoadState(false);

      if (response.status === 201) {
        console.log("canvas saved successfully");
        toast({
          description: "Canvas Successfully saved.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
        // Restore the canvas and image to their previous dimensions
        setShowUpdateButton(true);
      } else if (response.status === 200) {
        toast({
          description: "Canvas Updated Successfully.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
        console.log("updated canvas");
      } else {
        console.log("save failed");
        toast({
          variant: "destructive",
          description: "Save failed",
          className: "bg-red-500 text-gray-900",
          duration: 3000,
        });
      }

      // canvas.renderAll();
    } catch (error) {
      setLoadState(false);
      console.error("Error saving canvas:", error);
      toast({
        variant: "destructive",
        description: "Unexpected Error" + error,
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    }
  };

  const downloadCanvas = async () => {
    addLog({
      section: "canvas",
      tab: "canvas",
      event: "download",
      message: `Downloading project`,
    });
    console.log("sjdf");
    if (!canvas || !image) {
      console.log("image/canvas not found");
      return;
    }
    let dataURL: string;

    let backgroundImage: null | FabricImage = null;
    if (canvas.backgroundImage) {
      // @ts-ignore
      backgroundImage = canvas.backgroundImage;
    }

    console.log("sjdf");

    // // required image width
    // const { imageWidth: requiredImageWidth, imageHeight: requiredImageHeight } =
    //   currentImageDim;

    // Save viewport and zoom
    const originalViewportTransform = canvas.viewportTransform;
    const originalZoom = canvas.getZoom();

    console.log("sjdf");
    // Reset to neutral
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);

    console.log("sjdf");
    canvas.renderAll();

    // Find the object named "Frame" or starting with "Frame"

    console.log("sjdf");
    const frameObject = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));
    if (frameObject && downloadFrame) {
      const clipBoundingBox = frameObject.getBoundingRect();

      // Create a temporary canvas element using fabric's rendering
      const tempCanvas = canvas.toCanvasElement();

      const tempContext = tempCanvas.getContext("2d");
      if (!tempContext) return;

      // Create a new canvas for the clipped region
      const outputCanvas = document.createElement("canvas");
      const outputContext = outputCanvas.getContext("2d");

      if (!outputContext) return;

      // Set dimensions of the output canvas to match the clipBoundingBox
      outputCanvas.width = clipBoundingBox.width;
      outputCanvas.height = clipBoundingBox.height;

      // Draw the clipped region onto the output canvas
      outputContext.drawImage(
        tempCanvas, // Source canvas
        clipBoundingBox.left, // Source x
        clipBoundingBox.top, // Source y
        clipBoundingBox.width, // Source width
        clipBoundingBox.height, // Source height
        0, // Destination x
        0, // Destination y
        clipBoundingBox.width, // Destination width
        clipBoundingBox.height // Destination height
      );

      // Generate a data URL for the clipped image
      dataURL = outputCanvas.toDataURL();

      // Clean up output canvas
      outputCanvas.remove();

      // canvas.backgroundColor = "fff"
    } else {
      console.log("downloading full image");
      const bounds = image.getBoundingRect();
      console.log(bounds);

      // Generate the data URL for the download

      dataURL = canvas.toDataURL({
        format: "png",
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      });
    }

    const link = document.createElement("a");
    link.href = dataURL;
    link.download =
      frameObject && downloadFrame ? "clipped-image.png" : "canvas-image.png";
    link.click();

    // Restore zoom & transform
    canvas.setViewportTransform(originalViewportTransform);
    canvas.setZoom(originalZoom);
    canvas.renderAll();

    canvas.renderAll();
  };

  const deleteObject = () => {
    if (selectedObject) {
      let section = "unknown";
      let tab = "unknown";
      if (
        selectedObject.type === "rect" ||
        selectedObject.type === "circle" ||
        selectedObject.type === "triangle" ||
        selectedObject.type === "line" ||
        selectedObject.type === "path"
      ) {
        section = "shape";
        tab = "shape";
      }

      addLog({
        section: section,
        tab: tab,
        event: "deletion",
        message: `deleted shape ${selectedObject.type}`,
        objType: selectedObject.type,
      });

      canvas.remove(selectedObject);
      canvas.renderAll();
    }
  };

  const handleZoomIn = () => {
    const newScale = mapState.scale + 0.05;
    if (newScale <= 3) {
      setMapState({ ...mapState, scale: newScale });
    } else {
      setMapState({ ...mapState });
    }
  };

  const handleZoomOut = () => {
    const newScale = mapState.scale - 0.05;
    if (newScale >= 0.05) {
      setMapState({ ...mapState, scale: newScale });
    } else {
      setMapState({ ...mapState });
    }
  };

  return (
    <div className="flex w-full items-center justify-between rounded-none border-slate-800 border-t-2 gap-4">
      <div className="px-2 flex items-center gap-2">
        <Pencil className="text-gray-400 w-5 h-5" /> {/* Pencil icon */}
        <input
          type="text"
          className="bg-gray-800 text-white font-semibold px-2 py-1 rounded-md border border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <IconComponent
          icon={<Upload />}
          iconName={"Upload New"}
          handleClick={() => setShowLoadingDialog(true)}
        />
      </div>

      <div className="flex items-center">
        <IconComponent
          icon={<RotateCcw />}
          iconName={"Restore"}
          handleClick={() => {
            // canvas.remove(...canvas.getObjects());
            // console.log(image.toObject());
            // canvas.add(backupImage);
            resetFilters();
            canvas.renderAll();
            // canvas.add()
          }}
        />
        <IconComponent
          icon={<ZoomIn />}
          iconName={"ZoomIn"}
          handleClick={() => {
            handleZoomIn();
          }}
        />
        <div>{Math.floor(mapState.scale * 100)}%</div>
        {/* <IconComponent icon={<Undo />} iconName={"Undo"} /> */}
        {/* <IconComponent icon={<Redo />} iconName={"Redo"} />  */}
        <IconComponent
          icon={<ZoomOut />}
          iconName={"ZoomOut"}
          handleClick={() => handleZoomOut()}
        />
      </div>

      <div className="flex flex-none gap-10">
        <Dialog
          open={openDownloadOptions}
          onOpenChange={setOpenDownloadOptions}
        >
          <DialogTrigger asChild>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-30"
              onClick={() => {
                setOpenDownloadOptions(true);
              }}
            >
              Download
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Download Image</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col justify-start space-y-8">
              <div className="flex justify-between items-center mt-4">
                <Label htmlFor="frame-download">Frame Only</Label>
                <Switch
                  id="frame-download"
                  checked={downloadFrame}
                  onClick={() => setDownLoadFrame(!downloadFrame)}
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <Label className="flex-1">Resolution</Label>
                <div>
                  <Select
                    onValueChange={(value) => {
                      setSuperResValue(value); // Set the value if the user is logged in
                    }}
                    defaultValue={superResValue}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="2x" disabled={!user}>
                        2X
                      </SelectItem>
                      <SelectItem value="4x" disabled={!user}>
                        4X
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <button className="custom-button" onClick={downloadCanvas}>
                DownloadImage
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300  px-6 py-3 text-blue-700"
          onClick={() => {
            if (user) {
              onSaveCanvas();
            } else {
              toast({
                description: "You need to log in first",
                className: "bg-green-500 text-gray-900",
                duration: 3000,
              });
            }
          }}
        >
          {showUpdateButton ? "Update" : "Save"}
        </button>
        {selectedObject && (
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-30  text-red-800"
            onClick={deleteObject}
          >
            Delete
          </button>
        )}
        {/* <div className="relative flex items-center space-x-4">
          <WebSpeechComponent />
        </div> */}
      </div>

      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogTrigger asChild>
          <button className="hidden"></button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900 text-center">
              Upload Image
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center items-center">
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-blue-400 w-full max-w-sm p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50"
            >
              <input {...getInputProps()} />
              {dataURL ? (
                <img
                  src={dataURL}
                  alt="Uploaded Preview"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    height="50"
                    width="50"
                    className="text-blue-500"
                  >
                    <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z" />
                  </svg>
                  <p className="mt-2 text-sm">
                    {isDragActive
                      ? "Drop the files here..."
                      : "Drag & drop an image here, or click to select one"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-center">
            {dataURL && (
              <button
                className="custom-button w-32"
                onClick={() => {
                  handleImageUpload(dataURL);
                }}
              >
                Upload
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Footer2;
