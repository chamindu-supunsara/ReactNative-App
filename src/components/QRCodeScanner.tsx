import React, { useCallback, useState, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface QRCodeScannerProps {
  onQRCodeScanned: (data: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onQRCodeScanned, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isActive) {
      setIsActive(false);
      onQRCodeScanned(data);
    }
  };

  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleClose = useCallback(() => {
    setIsActive(false);
    onClose();
  }, [onClose]);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={isActive ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13'],
        }}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Scanning Area */}
        <View style={styles.scanningArea}>
          <View style={styles.scanningFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Position the QR code within the frame to scan
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
const scanningFrameSize = Math.min(width * 0.7, height * 0.4);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningFrame: {
    width: scanningFrameSize,
    height: scanningFrameSize,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#6A5AE0',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionsContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRCodeScanner;
