// AI Scanner Screen - Asosiy funksiya
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SCREENS } from '../utils/constants';
import { scannerApi, ScanResult } from '../services/api';
import { formatPrice, calculateSuggestedPrice } from '../utils/helpers';

type ScannerStep = 'camera' | 'preview' | 'analyzing' | 'result';

export default function ScannerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  
  // State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [step, setStep] = useState<ScannerStep>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult['product'] | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  
  // Kamera ruxsati
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Rasm olish
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
        });
        
        if (photo) {
          setCapturedImage(photo.uri);
          setStep('preview');
        }
      } catch (error) {
        console.error('Rasm olishda xato:', error);
        Alert.alert(t('common.error'), t('scanner.scanFailed'));
      }
    }
  };
  
  // Galereyadan tanlash
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setStep('preview');
    }
  };
  
  // AI Tahlil
  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setStep('analyzing');
    
    try {
      // Base64 ga o'girish (agar URI bo'lsa)
      let base64Image = '';
      
      if (capturedImage.startsWith('data:')) {
        base64Image = capturedImage.split(',')[1];
      } else {
        // URI dan base64 olish
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      }
      
      const result = await scannerApi.analyzeImage(base64Image);
      
      if (result.success && result.product) {
        setScanResult(result.product);
        setStep('result');
      } else {
        Alert.alert(t('common.error'), result.error || t('scanner.scanFailed'));
        setStep('preview');
      }
    } catch (error: any) {
      console.error('AI tahlilda xato:', error);
      Alert.alert(t('common.error'), error.message || t('scanner.scanFailed'));
      setStep('preview');
    }
  };
  
  // Qayta boshlash
  const resetScanner = () => {
    setCapturedImage(null);
    setScanResult(null);
    setStep('camera');
  };
  
  // Natijani ishlatish - Upload sahifasiga o'tish
  const useResult = () => {
    if (scanResult && capturedImage) {
      navigation.navigate(SCREENS.UPLOAD_PRODUCT, {
        scanResult,
        imageUri: capturedImage,
      });
    }
  };
  
  // Ruxsat yo'q
  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.permissionText}>{t('scanner.cameraPermission')}</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>{t('scanner.grantPermission')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* KAMERA */}
      {step === 'camera' && (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            flash={isFlashOn ? 'on' : 'off'}
          >
            {/* Overlay frame */}
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.scanHint}>Mahsulotni ramkaga joylashtiring</Text>
            </View>
          </CameraView>
          
          {/* Bottom controls */}
          <View style={styles.cameraControls}>
            {/* Gallery button */}
            <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
              <Ionicons name="images" size={28} color={COLORS.white} />
            </TouchableOpacity>
            
            {/* Capture button */}
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            {/* Flash button */}
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => setIsFlashOn(!isFlashOn)}
            >
              <Ionicons
                name={isFlashOn ? 'flash' : 'flash-off'}
                size={28}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* PREVIEW */}
      {step === 'preview' && capturedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.previewButton} onPress={resetScanner}>
              <Ionicons name="refresh" size={24} color={COLORS.white} />
              <Text style={styles.previewButtonText}>{t('scanner.retake')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.previewButton, styles.analyzeButton]}
              onPress={analyzeImage}
            >
              <Ionicons name="scan" size={24} color={COLORS.white} />
              <Text style={styles.previewButtonText}>AI Tahlil</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* ANALYZING */}
      {step === 'analyzing' && (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.analyzingText}>{t('scanner.analyzing')}</Text>
          <Text style={styles.analyzingHint}>Gemini AI mahsulotni aniqlayapti...</Text>
        </View>
      )}
      
      {/* RESULT */}
      {step === 'result' && scanResult && (
        <ScrollView style={styles.resultContainer}>
          {/* Image */}
          <Image source={{ uri: capturedImage! }} style={styles.resultImage} />
          
          {/* Success badge */}
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
            <Text style={styles.successText}>{t('scanner.scanSuccess')}</Text>
          </View>
          
          {/* Product info */}
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('product.brand')}</Text>
              <Text style={styles.resultValue}>{scanResult.brand}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('product.model')}</Text>
              <Text style={styles.resultValue}>{scanResult.model}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('product.category')}</Text>
              <Text style={styles.resultValue}>{scanResult.categoryRu || scanResult.category}</Text>
            </View>
            
            {scanResult.suggestedPrice && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tavsiya etilgan narx</Text>
                <Text style={[styles.resultValue, styles.priceValue]}>
                  {formatPrice(scanResult.suggestedPrice)}
                </Text>
              </View>
            )}
            
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>AI ishonchi</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${scanResult.confidence}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceValue}>{scanResult.confidence}%</Text>
            </View>
          </View>
          
          {/* Features */}
          {scanResult.features && scanResult.features.length > 0 && (
            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Xususiyatlar</Text>
              {scanResult.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={16} color={COLORS.secondary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Actions */}
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={resetScanner}>
              <Ionicons name="camera" size={20} color={COLORS.primary} />
              <Text style={styles.retakeButtonText}>{t('scanner.retake')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.useButton} onPress={useResult}>
              <Text style={styles.useButtonText}>{t('scanner.useResult')}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Camera
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanHint: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: COLORS.primary,
  },
  
  // Preview
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
  },
  previewButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Analyzing
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
  },
  analyzingHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  
  // Result
  resultContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  resultImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary + '20',
    paddingVertical: 10,
  },
  successText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceValue: {
    color: COLORS.primary,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    width: 80,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    width: 40,
    textAlign: 'right',
  },
  
  // Features
  featuresCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  
  // Actions
  resultActions: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
  },
  retakeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  useButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  useButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
