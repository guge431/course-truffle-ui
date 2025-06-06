// components/StatusMessage.jsx - 状态消息组件
import React from 'react';
import { styles } from '../styles/index.js';

export default function StatusMessage({ status, error }) {
  if (!status && !error) return null;

  return (
    <>
      {status && <div style={styles.statusText}>{status}</div>}
      {error && <div style={styles.errorText}>{error}</div>}
    </>
  );
}