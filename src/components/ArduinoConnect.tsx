import React, { useState, useEffect } from 'react';
import { Usb, Check, X, AlertCircle, Volume2 } from 'lucide-react';

interface ArduinoConnectProps {
  onConnectionChange: (isConnected: boolean, port: any | null) => void;
}

const ArduinoConnect: React.FC<ArduinoConnectProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [port, setPort] = useState<any | null>(null);
  const [availablePorts, setAvailablePorts] = useState<any[]>([]);

  // Check if Web Serial API is supported
  const isWebSerialSupported = 'serial' in navigator;

  useEffect(() => {
    if (isWebSerialSupported) {
      // Get already granted ports
      navigator.serial.getPorts().then(ports => {
        setAvailablePorts(ports);
      });
    }
  }, []);

  const connectToArduino = async () => {
    if (!isWebSerialSupported) {
      setError('Web Serial API no es compatible con este navegador. Usa Chrome o Edge.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request a port
      const selectedPort = await navigator.serial.requestPort();
      
      // Open the port
      await selectedPort.open({ 
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      setPort(selectedPort);
      setIsConnected(true);
      onConnectionChange(true, selectedPort);

      // Start reading from the port
      startReading(selectedPort);

    } catch (err: any) {
      setError(`Error al conectar: ${err.message}`);
      onConnectionChange(false, null);
    } finally {
      setIsConnecting(false);
    }
  };

  const startReading = async (serialPort: any) => {
    const reader = serialPort.readable.getReader();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Convert Uint8Array to string
        const text = new TextDecoder().decode(value);
        buffer += text;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            // Dispatch custom event with Arduino data
            window.dispatchEvent(new CustomEvent('arduinoData', { 
              detail: { pin: parseInt(trimmedLine) } 
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error reading from Arduino:', err);
    } finally {
      reader.releaseLock();
    }
  };

  const disconnect = async () => {
    if (port) {
      try {
        await port.close();
        setPort(null);
        setIsConnected(false);
        onConnectionChange(false, null);
      } catch (err: any) {
        setError(`Error al desconectar: ${err.message}`);
      }
    }
  };

  if (!isWebSerialSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="text-yellow-600 mr-2\" size={20} />
          <div>
            <p className="text-yellow-800 font-medium">Web Serial API no compatible</p>
            <p className="text-yellow-700 text-sm">
              Para usar Arduino, necesitas Chrome o Edge. El juego funcionará con clics normales.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Usb className="text-indigo-600 mr-2" size={20} />
          <div>
            <h3 className="font-medium text-gray-900">Conexión Arduino</h3>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Arduino conectado' : 'Conecta tu Arduino para usar botones físicos'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected && (
            <div className="flex items-center text-green-600">
              <Check size={16} className="mr-1" />
              <span className="text-sm">Conectado</span>
            </div>
          )}
          
          <button
            onClick={isConnected ? disconnect : connectToArduino}
            disabled={isConnecting}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isConnected
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isConnecting ? 'Conectando...' : isConnected ? 'Desconectar' : 'Conectar Arduino'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center text-red-600">
          <X size={16} className="mr-1" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {isConnected && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Volume2 size={16} className="text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              ¡Botones con sonido activados!
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Cada botón reproduce su nota al presionarlo:
          </p>
          <div className="grid grid-cols-7 gap-1 text-xs">
            <div className="bg-red-100 text-red-700 p-1 rounded text-center">
              <div>Pin 2</div>
              <div>Do</div>
            </div>
            <div className="bg-orange-100 text-orange-700 p-1 rounded text-center">
              <div>Pin 3</div>
              <div>Re</div>
            </div>
            <div className="bg-yellow-100 text-yellow-700 p-1 rounded text-center">
              <div>Pin 4</div>
              <div>Mi</div>
            </div>
            <div className="bg-green-100 text-green-700 p-1 rounded text-center">
              <div>Pin 5</div>
              <div>Fa</div>
            </div>
            <div className="bg-teal-100 text-teal-700 p-1 rounded text-center">
              <div>Pin 6</div>
              <div>Sol</div>
            </div>
            <div className="bg-blue-100 text-blue-700 p-1 rounded text-center">
              <div>Pin 7</div>
              <div>La</div>
            </div>
            <div className="bg-indigo-100 text-indigo-700 p-1 rounded text-center">
              <div>Pin 8</div>
              <div>Si</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArduinoConnect;