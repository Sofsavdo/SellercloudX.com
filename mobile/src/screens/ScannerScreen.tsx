// AI Scanner Screen - Raqobatchi Tahlili bilan
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
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SCREENS } from '../utils/constants';
import { scannerApi, ScanResult } from '../services/api';
import { formatPrice } from '../utils/helpers';

type ScannerStep = 'camera' | 'preview' | 'analyzing' | 'result';

export default function ScannerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [step, setStep] = useState<ScannerStep>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult['product'] | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
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
        Alert.alert('Xato', 'Rasm olishda muammo');
      }
    }
  };
  
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
  
  const analyzeImage = async () => {
    if (!capturedImage) return;
    setStep('analyzing');
    
    try {
      let base64Image = '';
      if (capturedImage.startsWith('data:')) {
        base64Image = capturedImage.split(',')[1];
      } else {
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
        Alert.alert('Xato', result.error || 'Mahsulot aniqlanmadi');
        setStep('preview');
      }
    } catch (error: any) {
      Alert.alert('Xato', error.message || 'AI tahlilda xatolik');
      setStep('preview');
    }
  };
  
  const resetScanner = () => {
    setCapturedImage(null);
    setScanResult(null);
    setStep('camera');
  };
  
  const useResult = () => {
    if (scanResult && capturedImage) {
      navigation.navigate(SCREENS.UPLOAD_PRODUCT, {
        scanResult,
        imageUri: capturedImage,
      });
    }
  };
  
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
        <Ionicons name="camera-outline" size={56} color={COLORS.textLight} />
        <Text style={styles.permissionText}>Kamera ruxsati kerak</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Ruxsat berish</Text>
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
          
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
              <Ionicons name="images" size={26} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => setIsFlashOn(!isFlashOn)}
            >
              <Ionicons
                name={isFlashOn ? 'flash' : 'flash-off'}
                size={26}
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
            <TouchableOpacity style={styles.previewBtn} onPress={resetScanner}>
              <Ionicons name="refresh" size={22} color={COLORS.white} />
              <Text style={styles.previewBtnText}>Qayta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.previewBtn, styles.analyzeBtn]}
              onPress={analyzeImage}
            >
              <Ionicons name="scan" size={22} color={COLORS.white} />
              <Text style={styles.previewBtnText}>AI Tahlil</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* ANALYZING */}
      {step === 'analyzing' && (
        <View style={styles.analyzingContainer}>
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.analyzingTitle}>AI tahlil qilmoqda...</Text>
            <Text style={styles.analyzingHint}>Gemini mahsulotni aniqlayapti</Text>
          </View>
        </View>
      )}
      
      {/* RESULT */}
      {step === 'result' && scanResult && (
        <ScrollView style={styles.resultContainer}>
          <Image source={{ uri: capturedImage! }} style={styles.resultImage} />
          
          {/* Success */}
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
            <Text style={styles.successText}>Mahsulot aniqlandi!</Text>
          </View>
          
          {/* Product Info */}
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Brend</Text>
              <Text style={styles.resultValue}>{scanResult.brand || '-'}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Model</Text>
              <Text style={styles.resultValue}>{scanResult.model || '-'}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Kategoriya</Text>
              <Text style={styles.resultValue}>{scanResult.categoryRu || scanResult.category || '-'}</Text>
            </View>
          </View>
          
          {/* Price Analysis - Raqobatchi Narxlar */}
          <View style={styles.priceCard}>
            <Text style={styles.priceCardTitle}>💰 Narx Tahlili</Text>
            
            {/* Competitor Prices */}
            <View style={styles.competitorSection}>
              <Text style={styles.competitorTitle}>Boshqa platformalarda:</Text>
              
              <View style={styles.competitorRow}>
                <Text style={styles.competitorName}>🟡 Yandex Market</Text>
                <Text style={styles.competitorPrice}>
                  {scanResult.competitorPrices?.yandex 
                    ? formatPrice(scanResult.competitorPrices.yandex) 
                    : 'Ma\'lumot yo\'q'}
                </Text>
              </View>
              
              <View style={styles.competitorRow}>
                <Text style={styles.competitorName}>🟣 Uzum Market</Text>
                <Text style={styles.competitorPrice}>
                  {scanResult.competitorPrices?.uzum 
                    ? formatPrice(scanResult.competitorPrices.uzum) 
                    : 'Ma\'lumot yo\'q'}
                </Text>
              </View>
              
              <View style={styles.competitorRow}>
                <Text style={styles.competitorName}>🔵 Ozon</Text>
                <Text style={styles.competitorPrice}>
                  {scanResult.competitorPrices?.ozon 
                    ? formatPrice(scanResult.competitorPrices.ozon) 
                    : 'Ma\'lumot yo\'q'}
                </Text>
              </View>
            </View>
            
            {/* Suggested Price */}
            <View style={styles.suggestedPriceBox}>
              <Text style={styles.suggestedLabel}>Tavsiya etilgan narx:</Text>
              <Text style={styles.suggestedPrice}>
                {scanResult.suggestedPrice 
                  ? formatPrice(scanResult.suggestedPrice) 
                  : 'Hisoblanmadi'}
              </Text>
              {scanResult.priceReason && (
                <Text style={styles.priceReason}>{scanResult.priceReason}</Text>
              )}
            </View>
          </View>
          
          {/* Confidence */}
          <View style={styles.confidenceCard}>
            <Text style={styles.confidenceLabel}>AI ishonchi</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[styles.confidenceFill, { width: `${scanResult.confidence || 0}%` }]}
              />
            </View>
            <Text style={styles.confidenceValue}>{scanResult.confidence || 0}%</Text>
          </View>
          
          {/* Features */}
          {scanResult.features && scanResult.features.length > 0 && (
            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Xususiyatlar</Text>
              {scanResult.features.slice(0, 5).map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={16} color={COLORS.secondary} />
                  <Text style={styles.featureText} numberOfLines={1}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Actions */}
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.retakeBtn} onPress={resetScanner}>
              <Ionicons name="camera" size={18} color={COLORS.primary} />
              <Text style={styles.retakeBtnText}>Qayta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.useBtn} onPress={useResult}>
              <Text style={styles.useBtnText}>Davom etish</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 40 }} />
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
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 15,
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
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  scanHint: {
    color: COLORS.white,
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
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
    justifyContent: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  analyzeBtn: {
    backgroundColor: COLORS.primary,
  },
  previewBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Analyzing
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  analyzingBox: {
    alignItems: 'center',
    padding: 32,
  },
  analyzingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
  },
  analyzingHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  
  // Result
  resultContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  resultImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary + '15',
    paddingVertical: 10,
    gap: 6,
  },
  successText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Result Card
  resultCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 14,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  
  // Price Card
  priceCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 14,
  },
  priceCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  competitorSection: {
    marginBottom: 14,
  },
  competitorTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  competitorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  competitorName: {
    fontSize: 13,
    color: COLORS.text,
  },
  competitorPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  suggestedPriceBox: {
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 10,
  },
  suggestedLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  suggestedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  priceReason: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  
  // Confidence
  confidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
  },
  confidenceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 80,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    marginHorizontal: 10,
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
    padding: 14,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  
  // Actions
  resultActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 6,
  },
  retakeBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  useBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    gap: 6,
  },
  useBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
