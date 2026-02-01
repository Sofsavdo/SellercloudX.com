// Splash Screen - Professional Fintech Animation
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Real marketplace logos
const LOGOS = {
  sellercloudx: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/4ztx60fi_-76rizc_edit_75534802065091.jpg',
  yandex: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/fn5a7tjm_images.png',
  uzum: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/s5t4wghe_market.png',
  wildberries: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/5bdfsh1w_6f50bf7b-9f31-41a5-b13b-332697a792c1.jpg',
  ozon: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/rttfl7ms_ozon-icon-logo.png',
};

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Main logo animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  
  // Brand text
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(20)).current;
  
  // Individual marketplace logo animations
  const mp1Opacity = useRef(new Animated.Value(0)).current;
  const mp1Scale = useRef(new Animated.Value(0.5)).current;
  const mp2Opacity = useRef(new Animated.Value(0)).current;
  const mp2Scale = useRef(new Animated.Value(0.5)).current;
  const mp3Opacity = useRef(new Animated.Value(0)).current;
  const mp3Scale = useRef(new Animated.Value(0.5)).current;
  const mp4Opacity = useRef(new Animated.Value(0)).current;
  const mp4Scale = useRef(new Animated.Value(0.5)).current;
  
  // Progress bar
  const progressWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    startAnimation();
  }, []);
  
  const startAnimation = () => {
    Animated.sequence([
      // 1. Main logo appears
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Brand name appears
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(brandTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Marketplace logos appear one by one
      Animated.parallel([
        Animated.timing(mp1Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(mp1Scale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(mp2Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(mp2Scale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(mp3Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(mp3Scale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(mp4Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(mp4Scale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      
      // 4. Progress bar fills
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(onFinish, 300);
    });
  };
  
  const progressInterpolated = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Background grid */}
      <View style={styles.gridContainer}>
        {[...Array(10)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: (height / 10) * i }]} />
        ))}
      </View>
      
      {/* Main Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={{ uri: LOGOS.sellercloudx }}
            style={styles.mainLogo}
            resizeMode="cover"
          />
        </View>
        <View style={styles.logoGlow} />
      </Animated.View>
      
      {/* Brand Name */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslateY }],
          },
        ]}
      >
        <Text style={styles.brandName}>
          SellerCloud<Text style={styles.brandAccent}>X</Text>
        </Text>
        <Text style={styles.tagline}>AI bilan savdoni avtomatlashtiring</Text>
      </Animated.View>
      
      {/* Marketplace Logos - Sequential */}
      <View style={styles.marketplaceContainer}>
        <Text style={styles.supportText}>4 ta marketplace - 1 ta AI Manager</Text>
        <View style={styles.logosRow}>
          {/* Yandex */}
          <Animated.View style={[styles.mpLogoBox, { opacity: mp1Opacity, transform: [{ scale: mp1Scale }] }]}>
            <Image source={{ uri: LOGOS.yandex }} style={styles.mpLogo} resizeMode="cover" />
          </Animated.View>
          
          {/* Uzum */}
          <Animated.View style={[styles.mpLogoBox, { opacity: mp2Opacity, transform: [{ scale: mp2Scale }] }]}>
            <Image source={{ uri: LOGOS.uzum }} style={styles.mpLogo} resizeMode="cover" />
          </Animated.View>
          
          {/* Wildberries */}
          <Animated.View style={[styles.mpLogoBox, { opacity: mp3Opacity, transform: [{ scale: mp3Scale }] }]}>
            <Image source={{ uri: LOGOS.wildberries }} style={styles.mpLogo} resizeMode="cover" />
          </Animated.View>
          
          {/* Ozon */}
          <Animated.View style={[styles.mpLogoBox, { opacity: mp4Opacity, transform: [{ scale: mp4Scale }] }]}>
            <Image source={{ uri: LOGOS.ozon }} style={styles.mpLogo} resizeMode="cover" />
          </Animated.View>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: progressInterpolated }]} />
        </View>
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>3-4 hodim o'rniga • 1 AI Manager</Text>
        <Text style={styles.versionText}>v1.1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Grid
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#1E293B',
    opacity: 0.4,
  },
  
  // Main Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainLogo: {
    width: 120,
    height: 120,
    borderRadius: 32,
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#3B82F6',
    opacity: 0.15,
    zIndex: -1,
  },
  
  // Brand
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#3B82F6',
  },
  tagline: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
  },
  
  // Marketplace
  marketplaceContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  supportText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  logosRow: {
    flexDirection: 'row',
    gap: 16,
  },
  mpLogoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  mpLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  
  // Progress
  progressContainer: {
    width: width * 0.55,
    alignItems: 'center',
  },
  progressBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 12,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#334155',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  versionText: {
    fontSize: 11,
    color: '#1E293B',
  },
});
