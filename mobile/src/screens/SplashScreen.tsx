// Splash Screen - SellerCloudX with Real Logos
import React, { useEffect, useRef, useState } from 'react';
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
  yandex: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/s5t4wghe_market.png',
  uzum: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/fn5a7tjm_images.png',
  wildberries: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/5bdfsh1w_6f50bf7b-9f31-41a5-b13b-332697a792c1.jpg',
  ozon: 'https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/rttfl7ms_ozon-icon-logo.png',
};

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Marketplace icons animation
  const marketplaceOpacity = useRef(new Animated.Value(0)).current;
  
  // Count loaded images
  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };
  
  useEffect(() => {
    // Start animation after a short delay
    const timer = setTimeout(() => {
      startAnimation();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const startAnimation = () => {
    Animated.sequence([
      // Logo fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Tagline slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Marketplace logos fade in
      Animated.timing(marketplaceOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Finish after animation
      setTimeout(onFinish, 200);
    });
  };
  
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Background */}
      <View style={styles.background}>
        {/* Subtle grid pattern */}
        {[...Array(8)].map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLine, { top: i * (height / 8) }]} />
        ))}
        {[...Array(6)].map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * (width / 6) }]} />
        ))}
      </View>
      
      {/* Main Logo */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={{ uri: LOGOS.sellercloudx }}
            style={styles.mainLogo}
            resizeMode="contain"
            onLoad={handleImageLoad}
          />
        </View>
      </Animated.View>
      
      {/* Brand Name */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={styles.brandName}>SellerCloud<Text style={styles.brandAccent}>X</Text></Text>
        <Text style={styles.tagline}>Marketplace Avtomatizatsiya</Text>
      </Animated.View>
      
      {/* Marketplace Logos */}
      <Animated.View style={[styles.marketplaceContainer, { opacity: marketplaceOpacity }]}>
        <Text style={styles.supportText}>Qo'llab-quvvatlanadigan marketplacelar</Text>
        <View style={styles.logosRow}>
          <View style={styles.logoBox}>
            <Image
              source={{ uri: LOGOS.yandex }}
              style={styles.mpLogo}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />
          </View>
          <View style={styles.logoBox}>
            <Image
              source={{ uri: LOGOS.uzum }}
              style={styles.mpLogo}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />
          </View>
          <View style={styles.logoBox}>
            <Image
              source={{ uri: LOGOS.wildberries }}
              style={styles.mpLogo}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />
          </View>
          <View style={styles.logoBox}>
            <Image
              source={{ uri: LOGOS.ozon }}
              style={styles.mpLogo}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />
          </View>
        </View>
      </Animated.View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: progressWidth }
            ]} 
          />
        </View>
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AI-Powered E-Commerce Platform</Text>
        <Text style={styles.versionText}>v1.0.4</Text>
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
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#1E293B',
    opacity: 0.5,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#1E293B',
    opacity: 0.5,
  },
  
  // Main Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  mainLogo: {
    width: 120,
    height: 120,
  },
  
  // Brand
  brandContainer: {
    alignItems: 'center',
    marginBottom: 50,
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
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  
  // Marketplace Logos
  marketplaceContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  supportText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  logosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mpLogo: {
    width: 44,
    height: 44,
  },
  
  // Progress
  progressContainer: {
    width: width * 0.6,
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
    letterSpacing: 1,
    marginBottom: 6,
  },
  versionText: {
    fontSize: 11,
    color: '#1E293B',
  },
});
