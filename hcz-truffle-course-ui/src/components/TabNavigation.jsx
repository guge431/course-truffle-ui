// components/TabNavigation.jsx - 标签导航组件
import React from 'react';
import { styles } from '../styles/index.js';

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { key: 'exchange', label: '💱 代币兑换' },
    { key: 'courses', label: '📚 课程商城' }
  ];

  return (
    <div style={styles.tabContainer}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          style={{
            ...styles.tab,
            ...(activeTab === tab.key ? styles.activeTab : {})
          }}
          onClick={() => onTabChange(tab.key)}
          className="button-hover"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}