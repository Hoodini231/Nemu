"use client"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowLeft, RefreshCw, Edit, Sparkles } from "lucide-react"
import React, { useState, useCallback, useRef, useEffect } from "react";
import { segmentWorkerCode } from '../../lib/segment-worker-code';
import { useRouter } from "next/navigation";


// --- Sub-Component for Draggable Panel ---
interface DraggablePanelProps {
    x: number;
    y: number;
    width: number;
    height: number;
    imageSrc: string;
    alt: string;
    index: number;
    isSelected: boolean;
    handleDragStart: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
    handleSelect: (index: number) => void;
    handleResize: (index: number, event: React.MouseEvent<HTMLDivElement>, direction: string) => void;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({
    x, y, width, height, imageSrc, alt, index, isSelected,
    handleDragStart, handleSelect, handleResize
}) => {
    const borderStyle = isSelected
        ? "4px solid #F06292"
        : "1px solid #777";

    return (
        <div
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
                overflow: "hidden",
                cursor: "grab",
                border: borderStyle,
                transition: "border-color 0.2s ease-in-out",
                userSelect: "none",
            }}
            onMouseDown={(event) => {
                handleDragStart(index, event);
            }}
            onClick={(e) => {
                e.stopPropagation();
                handleSelect(index);
            }}
        >
            <img
                src={imageSrc}
                alt={alt}
                draggable="false"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "10px",
                    height: "10px",
                    backgroundColor: "var(--foreground-color)",
                    cursor: "nwse-resize",
                }}
                onMouseDown={(event) => handleResize(index, event, "bottom-right")}
            />
        </div>
    );
};
// ------------------------------------------

interface Point {
    point: [number, number];
    label: number;
}

interface SegmentationPopupProps {
    imageSrc: string;
    onClose: () => void;
    onRegenerate: (originalImage: string, maskImage: string, prompt: string) => void;
}

const SegmentationPopup: React.FC<SegmentationPopupProps> = ({ imageSrc, onClose, onRegenerate }) => {
    const [points, setPoints] = useState<Point[]>([]);
    const [isEncoded, setIsEncoded] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [status, setStatus] = useState('Initializing...');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState('');
    const [prompt, setPrompt] = useState('');
    
    const workerRef = useRef<Worker | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Initialize worker
    useEffect(() => {
        console.log('Initializing worker with image:', imageSrc);
        
        try {
            // Create worker from blob
            const blob = new Blob([segmentWorkerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            workerRef.current = new Worker(workerUrl, { type: 'module' });
            
            workerRef.current.addEventListener('message', (e) => {
                console.log('Worker message received:', e.data);
                const { type, data } = e.data;
                
                if (type === 'debug') {
                    console.log('[Worker Debug]:', data);
                } else if (type === 'loading_progress') {
                    console.log('Loading progress:', data);
                    setStatus(data.status);
                    setLoadingProgress(data.progress);
                    if (data.file) {
                        const fileSizeMB = ((data.loaded || 0) / 1024 / 1024).toFixed(2);
                        const totalSizeMB = ((data.total || 0) / 1024 / 1024).toFixed(2);
                        setLoadingDetails(`${data.file}: ${fileSizeMB}MB / ${totalSizeMB}MB`);
                    }
                } else if (type === 'ready') {
                    console.log('Worker is ready!');
                    setModelReady(true);
                    setLoadingProgress(100);
                    setStatus('Ready - Click to add points (left: include, right: exclude)');
                    setLoadingDetails('Model loaded successfully');
                    
                    // Start segmentation
                    console.log('Sending segment request for image:', imageSrc);
                    setTimeout(() => {
                        workerRef.current?.postMessage({ type: 'segment', data: imageSrc });
                    }, 500);
                } else if (type === 'decode_result') {
                    console.log('Decode result received');
                    setIsDecoding(false);
                    const { mask, scores } = data;
                    
                    if (maskCanvasRef.current && mask && scores) {
                        const canvas = maskCanvasRef.current;
                        canvas.width = mask.width;
                        canvas.height = mask.height;
                        
                        const context = canvas.getContext('2d');
                        if (!context) {
                            console.error('Failed to get canvas context');
                            return;
                        }
                        
                        const imageData = context.createImageData(canvas.width, canvas.height);
                        
                        // Select best mask
                        const numMasks = scores.length;
                        let bestIndex = 0;
                        for (let i = 1; i < numMasks; i++) {
                            if (scores[i] > scores[bestIndex]) {
                                bestIndex = i;
                            }
                        }
                        
                        console.log(`Using mask ${bestIndex} with score ${scores[bestIndex]}`);
                        setStatus(`Segment score: ${scores[bestIndex].toFixed(2)}`);
                        
                        // Fill mask with semi-transparent blue
                        const pixelData = imageData.data;
                        for (let i = 0; i < mask.data.length / numMasks; i++) {
                            if (mask.data[numMasks * i + bestIndex] === 1) {
                                const offset = 4 * i;
                                pixelData[offset] = 0;        // R
                                pixelData[offset + 1] = 114;  // G
                                pixelData[offset + 2] = 189;  // B
                                pixelData[offset + 3] = 180;  // A
                            }
                        }
                        
                        context.putImageData(imageData, 0, 0);
                    }
                } else if (type === 'segment_result') {
                    console.log('Segment result:', data);
                    if (data === 'start') {
                        setStatus('Extracting image embedding...');
                    } else if (data === 'done') {
                        setStatus('Ready - Click to add points');
                        setIsEncoded(true);
                        console.log('Image encoding complete');
                    }
                } else if (type === 'error') {
                    console.error('Worker error:', data);
                    setStatus(`Error: ${data.message}`);
                    setLoadingDetails(data.stack || '');
                }
            });

            workerRef.current.addEventListener('error', (error) => {
                const errorMsg = `Worker error: ${error.message || 'Unknown error'}`;
                setStatus(errorMsg);
                console.error('Worker error event:', error);
            });

            // IMPORTANT: Send initial message to trigger worker
            console.log('Sending initial message to trigger worker...');
            setTimeout(() => {
                console.log('Sending init message now');
                workerRef.current?.postMessage({ type: 'init' });
            }, 100);

            return () => {
                console.log('Cleaning up worker');
                workerRef.current?.terminate();
                URL.revokeObjectURL(workerUrl);
            };
        } catch (error: any) {
            setStatus(`Failed to create worker: ${error.message}`);
            console.error('Worker creation error:', error);
        }
    }, [imageSrc]);

    // Add the decode function
    const decode = useCallback(() => {
        if (points.length > 0 && !isDecoding) {
            setIsDecoding(true);
            workerRef.current?.postMessage({ type: 'decode', data: points });
        }
    }, [points, isDecoding]);

    // Trigger decode when points change and image is encoded
    useEffect(() => {
        if (isEncoded && points.length > 0) {
            decode();
        }
    }, [points, isEncoded, decode]);

    // Add the handleImageClick function
    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEncoded || !imageContainerRef.current) return;
        
        const bb = imageContainerRef.current.getBoundingClientRect();
        const mouseX = Math.max(0, Math.min(1, (e.clientX - bb.left) / bb.width));
        const mouseY = Math.max(0, Math.min(1, (e.clientY - bb.top) / bb.height));
        
        const newPoint: Point = {
            point: [mouseX, mouseY],
            label: e.button === 2 ? 0 : 1
        };
        
        setPoints(prev => [...prev, newPoint]);
    };

    // Add the handleClearPoints function
    const handleClearPoints = () => {
        setPoints([]);
        if (maskCanvasRef.current) {
            const context = maskCanvasRef.current.getContext('2d');
            context?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
        }
    };

    // Add the handleRegenerate function
    const handleRegenerateClick = async () => {
        if (!maskCanvasRef.current || !imageRef.current) return;
        
        // Get mask as data URL
        const maskDataURL = maskCanvasRef.current.toDataURL('image/png');
        
        // Call the regeneration callback
        onRegenerate(imageSrc, maskDataURL, prompt);
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <Card
                className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                style={{
                    width: "90vw",
                    height: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader>
                    <CardTitle>Segment & Regenerate Panel</CardTitle>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{status}</p>
                        {!isEncoded && (
                            <>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                                {loadingDetails && (
                                    <p className="text-xs text-muted-foreground">{loadingDetails}</p>
                                )}
                            </>
                        )}
                    </div>
                </CardHeader>
                
                <CardContent style={{ flex: 1, display: "flex", gap: "20px", overflow: "hidden" }}>
                    <div
                        ref={imageContainerRef}
                        style={{
                            flex: 2,
                            position: "relative",
                            overflow: "hidden",
                            cursor: isEncoded ? "crosshair" : "wait",
                            opacity: isEncoded ? 1 : 0.5,
                        }}
                        onMouseDown={isEncoded ? handleImageClick : undefined}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Panel"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                        />
                        {!isEncoded && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    textAlign: "center",
                                }}
                            >
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                                <p className="font-semibold">{status}</p>
                            </div>
                        )}
                        <canvas
                            ref={maskCanvasRef}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                            }}
                        />
                        {points.map((point, idx) => (
                            <div
                                key={idx}
                                style={{
                                    position: "absolute",
                                    left: `${point.point[0] * 100}%`,
                                    top: `${point.point[1] * 100}%`,
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: point.label === 1 ? "#00ff00" : "#ff0000",
                                    transform: "translate(-50%, -50%)",
                                    pointerEvents: "none",
                                }}
                            />
                        ))}
                    </div>
                    
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
                        <h3 className="text-lg font-bold">Instructions</h3>
                        <p className="text-sm">• Left click to include areas</p>
                        <p className="text-sm">• Right click to exclude areas</p>
                        
                        <div style={{ marginTop: "20px" }}>
                            <label className="block text-sm font-medium mb-2">Edit Prompt:</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe how you want to edit the selected area..."
                                className="w-full p-2 border-2 border-foreground rounded"
                                rows={4}
                            />
                        </div>
                        
                        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button
                                onClick={handleClearPoints}
                                disabled={!isEncoded}
                                className="washi-tape-mint w-full backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                                style={{ 
                                    padding: "10px", 
                                    borderRadius: "5px",
                                    opacity: isEncoded ? 1 : 0.5,
                                    cursor: isEncoded ? "pointer" : "not-allowed"
                                }}
                            >
                                Clear Points
                            </button>
                            <button
                                onClick={handleRegenerateClick}
                                disabled={points.length === 0 || !prompt || !isEncoded}
                                className="washi-tape-pink w-full backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                                style={{ 
                                    padding: "10px", 
                                    borderRadius: "5px",
                                    opacity: (points.length > 0 && prompt && isEncoded) ? 1 : 0.5,
                                    cursor: (points.length > 0 && prompt && isEncoded) ? "pointer" : "not-allowed"
                                }}
                            >
                                Regenerate with AI
                            </button>
                        </div>
                    </div>
                </CardContent>
                
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        cursor: "pointer",
                    }}
                >
                    Close
                </button>
            </Card>
        </div>
    );
};

interface StoryboardData {
    panels: string[];
    coordinates: number[][];
    total_size: number[];
    panel_count: number;
    n8n_data?: any;
    final_image: string;
    original_prompt?: string;
    style?: string;
    panels_requested?: string;
}

function FrameWithPanels() {
    const router = useRouter();
    const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null);
    const [initialPositions, setInitialPositions] = useState<number[][]>([]);
    const [positions, setPositions] = useState<number[][]>([]);
    const [selectedPanel, setSelectedPanel] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [popupImage, setPopupImage] = useState<string | null>(null);
    const [popupData, setPopupData] = useState<{ prompt: string; characters: string[] }>({ prompt: '', characters: [] });
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Load data from sessionStorage on mount
    useEffect(() => {
        const storedData = sessionStorage.getItem('storyboardData');
        if (storedData) {
            try {
                const data: StoryboardData = JSON.parse(storedData);
                console.log("📦 Loaded storyboard data");
                setStoryboardData(data);
                setInitialPositions(data.coordinates);
                setPositions(data.coordinates);
            } catch (error) {
                console.error("Failed to parse storyboard data:", error);
                router.push("/create");
            }
        } else {
            console.warn("No storyboard data found, redirecting to create page");
            router.push("/create");
        }
    }, [router]);

    const handleResetLayout = () => {
        setPositions(initialPositions);
        setSelectedPanel(null);
    };

    const handleSelect = (index: number) => {
        setSelectedPanel(selectedPanel === index ? null : index);
    };

    const handleDragStart = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
        if (isResizing) return;
        event.stopPropagation();

        const container = containerRef.current;
        if (!container) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentContainerRect = container.getBoundingClientRect();
            const newX = moveEvent.clientX - currentContainerRect.left - offsetX;
            const newY = moveEvent.clientY - currentContainerRect.top - offsetY;

            setPositions(prevPositions => {
                const updatedPositions = [...prevPositions];
                updatedPositions[index] = [newX, newY, updatedPositions[index][2], updatedPositions[index][3]];
                return updatedPositions;
            });
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const handleResize = (index: number, event: React.MouseEvent<HTMLDivElement>, direction: string) => {
        event.stopPropagation();
        setIsResizing(true);

        const container = containerRef.current;
        if (!container) return;

        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = positions[index][2];
        const startHeight = positions[index][3];

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            setPositions(prevPositions => {
                const updatedPositions = [...prevPositions];
                if (direction === "bottom-right") {
                    updatedPositions[index] = [
                        updatedPositions[index][0],
                        updatedPositions[index][1],
                        Math.max(50, startWidth + deltaX),
                        Math.max(50, startHeight + deltaY),
                    ];
                }
                return updatedPositions;
            });
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const [showSegmentPopup, setShowSegmentPopup] = useState(false);
    const [segmentImageSrc, setSegmentImageSrc] = useState<string>("");

    const handleSegmentLayersClick = (imageSrc: string) => {
        setSegmentImageSrc(imageSrc);
        setShowSegmentPopup(true);
    };

    const handleRegenerate = async (originalImage: string, maskImage: string, prompt: string) => {
        try {
            // Call your image generation API
            const response = await fetch('/api/regenerate-panel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalImage,
                    maskImage,
                    prompt,
                    panelIndex: selectedPanel,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                // Update the panel with the new image
                // You'll need to implement this based on your state management
                alert('Panel regenerated successfully!');
                setShowSegmentPopup(false);
            }
        } catch (error) {
            console.error('Error regenerating panel:', error);
            alert('Failed to regenerate panel');
        }
    };

    const closePopup = () => {
        setPopupImage(null);
    };

    // Show loading state while data is loading
    if (!storyboardData) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading storyboard...</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <Card className="max-w-6xl bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1" style={{
                backgroundImage: "linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                width: `${storyboardData.total_size[0] * 1.1}px`,
                height: `${storyboardData.total_size[1] * 1.1}px`,
            }}>
                <CardHeader>
                </CardHeader>
                <CardContent>
                    <div
                        ref={containerRef}
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                        }}
                        onClick={() => setSelectedPanel(null)}
                    >
                        {positions.map(([x, y, width, height], index) => (
                            <DraggablePanel
                                key={index}
                                index={index}
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                imageSrc={storyboardData.panels[index]}
                                alt={`Panel ${index + 1}`}
                                isSelected={selectedPanel === index}
                                handleSelect={handleSelect}
                                handleDragStart={handleDragStart}
                                handleResize={handleResize}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="max-w-sm bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1" style={{
                width: "500px",
                height: "450px",
                padding: "20px",
                overflowY: "auto",
            }}>
                <CardHeader className="relative">
                    <div className="absolute inset-0 items-center justify-center w-70 h-10 -rotate-5">
                        <img
                            src="/highlight_orange.png"
                            alt="Background"
                            className="w-full h-full object-cover pointer-events-none"
                        />
                    </div>
                    <CardTitle className="text-2xl font-black text-foreground relative">
                        {selectedPanel !== null ? `Panel ${selectedPanel + 1} Info` : "Overall Info"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedPanel !== null ? (
                        <div className="space-y-4 tp-24">
                            <div className="grid flex gap-4 mt-20">
                                <button
                                    className="washi-tape-pink w-60 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleSegmentLayersClick(storyboardData.panels[selectedPanel])}
                                >
                                    Regenerate this panel
                                </button>
                                <button
                                    className="washi-tape-blue w-60 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = storyboardData.panels[selectedPanel];
                                        link.download = `panel-${selectedPanel + 1}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                >
                                    Save My File
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: "14px", color: "#555" }}>Select a panel to see details and actions.</p>
                            <div className="flex gap-2 mt-35">
                                <button
                                    className="washi-tape-mint w-30 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleResetLayout()}
                                >
                                    Reset Layout
                                </button>
                                <button
                                    className="washi-tape-pink w-30 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        if (storyboardData?.final_image) {
                                            console.log(`📥 Downloading final image ${storyboardData.final_image}`);
                                            const link = document.createElement('a');
                                            link.href = `${storyboardData.final_image}`;
                                            link.download = 'original_image.png';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        } else {
                                            alert("No final image available to download.");
                                        }
                                    }}
                                >
                                    Save Original PNG
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {popupImage && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={closePopup}
                >
                    <Card
                        className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform"
                        style={{
                            width: "80vw",
                            height: "80vh",
                            display: "flex",
                            flexDirection: "row",
                            overflow: "hidden",
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
                    >
                        <div style={{ flex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img
                                src={popupImage}
                                alt="Panel Popup"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                flex: 1,
                                backgroundColor: "#f9f9f9",
                                padding: "20px",
                                overflowY: "auto",
                                borderLeft: "2px solid var(--foreground-color)",
                            }}
                        >
                            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>{"Information"}</h2>
                            <p style={{ fontSize: "14px", color: "#555" }}><strong>Prompt:</strong> {popupData.prompt}</p>
                            <ul style={{ fontSize: "14px", color: "#555" }}>
                                {popupData.characters.map((character, index) => (
                                    <li key={index}>{character}</li>
                                ))}
                            </ul>
                            
                        </div>
                        <button
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                                cursor: "pointer",
                            }}
                            onClick={closePopup}
                        >
                            Close
                        </button>
                    </Card>
                </div>
            )}

            {showSegmentPopup && (
                <SegmentationPopup
                    imageSrc={segmentImageSrc}
                    onClose={() => setShowSegmentPopup(false)}
                    onRegenerate={handleRegenerate}
                />
            )}
        </div>
    );
}

// --- ResultsPage (Main Component) ---
export default function ResultsPage() {

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#F2C6DE] via-[#DBCDF0] to-[#C6DEF1] -z-10" />

            {/* Decoration Panels */}
            <div className="fixed inset-0 -z-5 opacity-20 pointer-events-none">
                {/* ... (omitted decoration panels for brevity) */}
            </div>

            {/* Header */}
            <header className="border-b-2 border-transparent bg-transparent backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <Card className="max-w-6xl mx-auto mb-8 bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1">
                    <CardHeader>
                        <div className="inline-block mb-2">
                            <div className="washi-tape washi-tape-lavender text-sm font-medium text-foreground w-40">✨ Generated</div>
                        </div>

                        <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">Your Storyboard Creation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground italic">
                            Review your generated panels below. You can drag the panels, and click to highlight their borders.
                        </p>
                    </CardContent>
                </Card>
                <FrameWithPanels />
            </div>
        </div>
    )
}

