// Splash Screen - SellerCloudX Fintech Animation
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Marketplace icons animation
  const icon1Anim = useRef(new Animated.Value(0)).current;
  const icon2Anim = useRef(new Animated.Value(0)).current;
  const icon3Anim = useRef(new Animated.Value(0)).current;
  const icon4Anim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Logo animation
    Animated.sequence([
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
      // Icons appear one by one
      Animated.stagger(150, [
        Animated.timing(icon1Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(icon2Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(icon3Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(icon4Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // Progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(onFinish, 300);
    });
  }, []);
  
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Background Pattern */}
      <View style={styles.patternContainer}>
        {[...Array(12)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.patternLine,
              { top: i * 80, opacity: 0.03 + (i * 0.01) }
            ]} 
          />
        ))}
      </View>
      
      {/* Logo */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>📊</Text>
          <View style={styles.logoGlow} />
        </View>
        <Text style={styles.logoText}>SellerCloud</Text>
        <Text style={styles.logoTextAccent}>X</Text>
      </Animated.View>
      
      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={styles.tagline}>Marketplace Avtomatizatsiya</Text>
        <Text style={styles.taglineSmall}>AI-Powered E-Commerce Platform</Text>
      </Animated.View>
      
      {/* Marketplace Icons */}
      <View style={styles.marketplaceRow}>
        <Animated.View style={[styles.mpIcon, { opacity: icon1Anim }]}>
          <Text style={styles.mpEmoji}>🟡</Text>
          <Text style={styles.mpName}>Yandex</Text>
        </Animated.View>
        
        <Animated.View style={[styles.mpIcon, { opacity: icon2Anim }]}>
          <Text style={styles.mpEmoji}>🟣</Text>
          <Text style={styles.mpName}>Uzum</Text>
        </Animated.View>
        
        <Animated.View style={[styles.mpIcon, { opacity: icon3Anim }]}>
          <Text style={styles.mpEmoji}>🔴</Text>
          <Text style={styles.mpName}>Wildberries</Text>
        </Animated.View>
        
        <Animated.View style={[styles.mpIcon, { opacity: icon4Anim }]}>
          <Text style={styles.mpEmoji}>🔵</Text>
          <Text style={styles.mpName}>Ozon</Text>
        </Animated.View>
      </View>
      
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
        <Text style={styles.footerText}>E-Commerce • Fintech • AI</Text>
        <Text style={styles.versionText}>v1.0.4</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#3B82F6',
  },
  
  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    opacity: 0.3,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  logoTextAccent: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: -1,
  },
  
  // Tagline
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 6,
  },
  taglineSmall: {
    fontSize: 13,
    color: '#64748B',
    letterSpacing: 1,
  },
  
  // Marketplace Icons
  marketplaceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 60,
  },
  mpIcon: {
    alignItems: 'center',
  },
  mpEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  mpName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
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
    color: '#64748B',
    marginTop: 12,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
    letterSpacing: 2,
    marginBottom: 6,
  },
  versionText: {
    fontSize: 11,
    color: '#334155',
  },
});
