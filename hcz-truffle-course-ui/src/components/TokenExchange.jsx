// components/TokenExchange.jsx - 代币兑换组件
import React from 'react';
import { styles } from '../styles/index.js';

export default function TokenExchange({ 
  ethAmount, 
  setEthAmount, 
  onExchange, 
  loading 
}) {
  return (
    <div style={styles.card}>
      <h3 style={{color: 'white', textAlign: 'center', marginBottom: '20px'}}>
        💰 ETH 兑换 HCZ 代币
      </h3>
      <p style={{color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '20px'}}>
        兑换比例: 1 ETH = 100 HCZ
      </p>
      <input
        type="number"
        placeholder="输入 ETH 数量"
        value={ethAmount}
        onChange={(e) => setEthAmount(e.target.value)}
        style={styles.input}
      />
      <button
        onClick={onExchange}
        disabled={loading || !ethAmount}
        style={{
          ...styles.button,
          width: '100%',
          opacity: loading || !ethAmount ? 0.6 : 1
        }}
        className="button-hover"
      >
        {loading ? '兑换中...' : '🔄 开始兑换'}
      </button>
    </div>
  );
}