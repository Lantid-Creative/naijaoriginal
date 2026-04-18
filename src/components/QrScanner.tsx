import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (code: string) => void;
}

const QrScanner = ({ onScan }: QrScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  const startScanner = async () => {
    setError("");
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );
      setScanning(true);
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
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-sm font-semibold text-foreground flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> QR Scanner
          </span>
          <Button
            variant={scanning ? "destructive" : "outline"}
            size="sm"
            onClick={scanning ? stopScanner : startScanner}
            className="font-body gap-1.5 text-xs"
          >
            {scanning ? <><CameraOff className="w-3.5 h-3.5" /> Stop</> : <><Camera className="w-3.5 h-3.5" /> Scan QR</>}
          </Button>
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
      </div>
    </div>
  );
};

export default QrScanner;
