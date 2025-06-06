// components/BackgroundEffects.jsx - 背景效果组件
import React from 'react';
import { styles } from '../styles/index.js';

export default function BackgroundEffects() {
  return (
    <>
      <div style={styles.breathingLight}></div>
      <div style={{...styles.floatingOrbs, top: '10%', left: '10%', animationDelay: '0s'}}></div>
      <div style={{...styles.floatingOrbs, top: '20%', right: '10%', animationDelay: '2s'}}></div>
      <div style={{...styles.floatingOrbs, bottom: '10%', left: '20%', animationDelay: '4s'}}></div>
    </>
  );
}