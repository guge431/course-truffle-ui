
// components/WalletConnect.jsx - 钱包连接组件
import React from 'react';
import { styles } from '../styles/index.js';

export default function WalletConnect({ onConnect }) {
  return (
    <div style={styles.card}>
      <button 
        style={{...styles.button, ...styles.connectButton, width: '100%'}}
        onClick={onConnect}
        className="button-hover"
      >
        🦊 连接 MetaMask 钱包
      </button>
    </div>
  );
}