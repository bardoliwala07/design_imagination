import { useEffect, useRef } from "react";

export default function App() {
  const canvasEl = useRef(null);
  const fabricCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  // ✅ init fabric safely
  useEffect(() => {
    if (typeof window !== "undefined" && window.fabric) {
      const { fabric } = window;

      const canvas = new fabric.Canvas(canvasEl.current, {
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        selection: true,
      });
      fabricCanvas.current = canvas;

      return () => canvas.dispose();
    }
  }, []);

  // ✅ Helpers
  const addRect = () => {
    const { fabric } = window;
    const c = fabricCanvas.current;
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      width: 160,
      height: 100,
      fill: "#4f46e5",
      rx: 8,
      ry: 8,
    });
    c.add(rect).setActiveObject(rect);
    c.requestRenderAll();
  };

  const addCircle = () => {
    const { fabric } = window;
    const c = fabricCanvas.current;
    const circle = new fabric.Circle({
      left: 120,
      top: 80,
      radius: 50,
      fill: "#22c55e",
    });
    c.add(circle).setActiveObject(circle);
    c.requestRenderAll();
  };

  const addText = () => {
    const { fabric } = window;
    const c = fabricCanvas.current;
    const text = new fabric.IText("Double-click to edit", {
      left: 80,
      top: 80,
      fontSize: 28,
      fill: "#111827",
      fontFamily: "Arial",
      editable: true,
    });
    c.add(text).setActiveObject(text);
    c.requestRenderAll();
  };

  const onChooseImage = (e) => {
    const { fabric } = window;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      fabric.Image.fromURL(
        reader.result,
        (img) => {
          const c = fabricCanvas.current;
          const maxW = c.getWidth() * 0.6;
          const scale = Math.min(1, maxW / img.width);
          if (scale < 1) img.scale(scale);
          img.set({ left: 100, top: 100 });
          c.add(img).setActiveObject(img);
          c.requestRenderAll();
        },
        { crossOrigin: "anonymous" }
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addVideoSnapshot = (url) => {
    const { fabric } = window;
    const c = fabricCanvas.current;
    const videoEl = document.createElement("video");
    videoEl.src = url;
    videoEl.crossOrigin = "anonymous";
    videoEl.playsInline = true;
    videoEl.muted = true;
    videoEl.currentTime = 0; // first frame

    videoEl.addEventListener("loadeddata", () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = videoEl.videoWidth;
      tempCanvas.height = videoEl.videoHeight;
      const ctx = tempCanvas.getContext("2d");
      ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);

      const snapshotUrl = tempCanvas.toDataURL("image/png");

      fabric.Image.fromURL(snapshotUrl, (img) => {
        const maxW = c.getWidth() * 0.6;
        const scale = Math.min(1, maxW / img.width);
        if (scale < 1) img.scale(scale);
        img.set({ left: 100, top: 100 });
        c.add(img).setActiveObject(img);
        c.requestRenderAll();
      });
    });
  };

  const deleteSelected = () => {
    const c = fabricCanvas.current;
    const active = c.getActiveObjects();
    active.forEach((o) => c.remove(o));
    c.discardActiveObject();
    c.requestRenderAll();
  };

  const bringForward = () => {
    const c = fabricCanvas.current;
    const obj = c.getActiveObject();
    if (obj) {
      c.bringForward(obj);
      c.requestRenderAll();
    }
  };

  const sendBackward = () => {
    const c = fabricCanvas.current;
    const obj = c.getActiveObject();
    if (obj) {
      c.sendBackwards(obj);
      c.requestRenderAll();
    }
  };

  const clearAll = () => {
    const c = fabricCanvas.current;
    c.getObjects().forEach((o) => c.remove(o));
    c.discardActiveObject();
    c.requestRenderAll();
  };

  const downloadPNG = () => {
    const c = fabricCanvas.current;
    const dataURL = c.toDataURL({ format: "png", multiplier: 2, quality: 1 });
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "design.png";
    a.click();
  };

  const changeColor = (e) => {
    const c = fabricCanvas.current;
    const obj = c.getActiveObject();
    if (obj) {
      obj.set("fill", e.target.value);
      c.requestRenderAll();
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 16,
        padding: 16,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Sidebar / Tools */}
      <aside
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
          background: "#fff",
          alignSelf: "start",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Tools</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <button onClick={addText}>Add Text</button>
          <button onClick={addRect}>Add Rectangle</button>
          <button onClick={addCircle}>Add Circle</button>
          <button onClick={() => fileInputRef.current.click()}>
            Upload Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onChooseImage}
            style={{ display: "none" }}
          />

          <input
            type="text"
            placeholder="Enter video URL"
            id="videoUrlInput"
            style={{ fontSize: 14, padding: 4 }}
          />
          <button
            onClick={() => {
              const url = document.getElementById("videoUrlInput").value;
              if (url) addVideoSnapshot(url);
            }}
          >
            Add Video Snapshot
          </button>

          <label style={{ fontSize: 14, marginTop: 8 }}>Change Color:</label>
          <input
            ref={colorInputRef}
            type="color"
            defaultValue="#111827"
            onChange={changeColor}
          />

          <hr />
          <button onClick={bringForward}>Bring Forward</button>
          <button onClick={sendBackward}>Send Backward</button>
          <button onClick={deleteSelected}>Delete Selected</button>
          <button onClick={clearAll}>Clear All</button>
          <hr />
          <button onClick={downloadPNG}>Download PNG</button>
        </div>

        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 12 }}>
          Tip: Select an object and use its corners to resize/rotate. Double-click on text to edit it.
        </p>
      </aside>

      {/* Canvas */}
      <main style={{ alignSelf: "start" }}>
        <canvas
          ref={canvasEl}
          width={800}
          height={500}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 12,
            background: "#fff",
          }}
        />
      </main>
    </div>
  );
}
