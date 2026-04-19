import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (code: string) => void;
}

const QrScanner = ({ onScan }: QrScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  const checkTorchSupport = () => {
    try {
      const scanner = scannerRef.current as any;
      const caps = scanner?.getRunningTrackCameraCapabilities?.();
      // html5-qrcode exposes torch via track capabilities
      const track = scanner?.getRunningTrackSettings ? scanner : null;
      const videoTrack: MediaStreamTrack | undefined =
        scanner?._localMediaStream?.getVideoTracks?.()[0] ??
        (caps && (caps as any)._mediaTrack);
      const trackCaps = videoTrack?.getCapabilities?.() as any;
      setTorchSupported(!!trackCaps?.torch);
    } catch {
      setTorchSupported(false);
    }
  };

  const startScanner = async () => {
    setError("");
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );
      setScanning(true);
      // Defer to allow track to initialize
      setTimeout(checkTorchSupport, 300);
    } catch (err: any) {
      setError("Camera access denied or not available. Try entering the code manually.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScanning(false);
    setTorchOn(false);
    setTorchSupported(false);
  };

  const toggleTorch = async () => {
    try {
      const scanner = scannerRef.current as any;
      const videoTrack: MediaStreamTrack | undefined =
        scanner?._localMediaStream?.getVideoTracks?.()[0];
      if (!videoTrack) return;
      const next = !torchOn;
      await videoTrack.applyConstraints({ advanced: [{ torch: next } as any] });
      setTorchOn(next);
    } catch {
      setTorchSupported(false);
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-md mx-auto mb-6">
      <div className="naija-card p-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="font-body text-sm font-semibold text-foreground flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> QR Scanner
          </span>
          <div className="flex items-center gap-2">
            {scanning && torchSupported && (
              <Button
                variant={torchOn ? "default" : "outline"}
                size="sm"
                onClick={toggleTorch}
                className="font-body gap-1.5 text-xs"
                title={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
              >
                {torchOn ? <ZapOff className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                {torchOn ? "Off" : "Torch"}
              </Button>
            )}
            <Button
              variant={scanning ? "destructive" : "outline"}
              size="sm"
              onClick={scanning ? stopScanner : startScanner}
              className="font-body gap-1.5 text-xs"
            >
              {scanning ? <><CameraOff className="w-3.5 h-3.5" /> Stop</> : <><Camera className="w-3.5 h-3.5" /> Scan QR</>}
            </Button>
          </div>
        </div>

        <div
          id={containerId}
          className={`rounded-lg overflow-hidden bg-muted ${scanning ? "min-h-[280px]" : "h-0"}`}
        />

        {error && (
          <p className="font-body text-xs text-destructive mt-2 text-center">{error}</p>
        )}

        {!scanning && !error && (
          <p className="font-body text-xs text-muted-foreground text-center">
            Tap "Scan QR" to open your camera and scan the product's QR code
          </p>
        )}
        {scanning && !torchSupported && (
          <p className="font-body text-[11px] text-muted-foreground text-center mt-2">
            Flashlight not supported on this device/browser
          </p>
        )}
      </div>
    </div>
  );
};

export default QrScanner;
